"""Layout-aware, multi-column capable in-memory PDF resume parser with 5-way classification and optional OCR."""

import io
import re
from typing import Any, Dict, List, Optional, Tuple
import pdfplumber
from pypdf import PdfReader
from pypdf.errors import PdfReadError

from app.config import Settings, get_settings
from app.services.ocr_service import get_ocr_runtime_status, run_in_memory_ocr_for_pages
from app.utils.text_normalizer import (
    ParsedResumeDocument,
    ResumeParseError,
    _is_known_vocab_word,
    build_parsed_resume_document,
)


def _group_words_into_lines(words: List[Dict[str, Any]], y_tolerance: float = 3.2) -> List[str]:
    """
    Group spatially positioned word dictionaries ({'text', 'x0', 'x1', 'top', 'bottom'})
    into ordered text lines, inserting spaces when x0 > prev_x1 - 1.5.
    """
    if not words:
        return []

    sorted_words = sorted(words, key=lambda w: (round(w["top"] / y_tolerance), w["x0"]))
    lines: List[List[Dict[str, Any]]] = []
    current_line: List[Dict[str, Any]] = []
    current_top: float | None = None

    for w in sorted_words:
        if current_top is None or abs(w["top"] - current_top) <= y_tolerance:
            current_line.append(w)
            if current_top is None:
                current_top = w["top"]
        else:
            current_line.sort(key=lambda item: item["x0"])
            lines.append(current_line)
            current_line = [w]
            current_top = w["top"]

    if current_line:
        current_line.sort(key=lambda item: item["x0"])
        lines.append(current_line)

    text_lines: List[str] = []
    for line_words in lines:
        parts: List[str] = []
        prev_x1: float | None = None
        for w in line_words:
            txt = w["text"].strip()
            if not txt:
                continue
            if prev_x1 is not None and (w["x0"] - prev_x1) < -1.0:
                if parts and parts[-1] == txt:
                    continue
            parts.append(txt)
            prev_x1 = w["x1"]
        if parts:
            text_lines.append(" ".join(parts))

    return text_lines


def _extract_page_with_column_awareness(plumber_page: Any) -> str:
    """
    Extract text from a pdfplumber page while detecting two-column layouts.
    Separates full-width top header rows from two-column body rows so left-column
    and right-column sections are read top-to-bottom per column rather than interleaved horizontally.
    """
    words = plumber_page.extract_words(
        x_tolerance=1.5,
        y_tolerance=3.0,
        keep_blank_chars=False,
        use_text_flow=False,
    )
    if not words:
        return plumber_page.extract_text(x_tolerance=1.5, y_tolerance=3.0) or ""

    page_width = float(plumber_page.width or 612.0)

    for split_ratio in (0.34, 0.38, 0.42, 0.50):
        gutter_x = page_width * split_ratio
        margin = 6.0

        sorted_by_top = sorted(words, key=lambda w: (round(w["top"] / 3.2), w["x0"]))
        rows: List[List[Dict[str, Any]]] = []
        cur_row: List[Dict[str, Any]] = []
        cur_top: float | None = None
        for w in sorted_by_top:
            if cur_top is None or abs(w["top"] - cur_top) <= 3.2:
                cur_row.append(w)
                if cur_top is None:
                    cur_top = w["top"]
            else:
                rows.append(cur_row)
                cur_row = [w]
                cur_top = w["top"]
        if cur_row:
            rows.append(cur_row)

        first_two_col_row_idx: int | None = None
        for r_idx, r_words in enumerate(rows):
            has_left = any(w["x1"] <= gutter_x + margin for w in r_words)
            has_right = any(w["x0"] >= gutter_x - margin for w in r_words)
            has_crossing = any(
                w["x0"] < (gutter_x - margin) and w["x1"] > (gutter_x + margin)
                for w in r_words
            )
            if has_left and has_right and not has_crossing:
                first_two_col_row_idx = r_idx
                break

        if first_two_col_row_idx is None:
            continue

        header_words = [w for r in rows[:first_two_col_row_idx] for w in r]
        body_words = [w for r in rows[first_two_col_row_idx:] for w in r]

        left_col = [w for w in body_words if w["x1"] <= gutter_x + margin]
        right_col = [w for w in body_words if w["x0"] >= gutter_x - margin]
        crossing = [
            w
            for w in body_words
            if w["x0"] < (gutter_x - margin) and w["x1"] > (gutter_x + margin)
        ]

        if (
            len(left_col) >= 4
            and len(right_col) >= 4
            and len(crossing) <= max(1, int(0.05 * len(body_words)))
        ):
            header_lines = _group_words_into_lines(header_words)
            left_lines = _group_words_into_lines(left_col)
            right_lines = _group_words_into_lines(right_col)
            return "\n".join(header_lines + left_lines + right_lines)

    return "\n".join(_group_words_into_lines(words))


def _score_extraction_quality(text: str) -> float:
    """
    Deterministic quality score for comparing candidate page extractions (pdfplumber vs pypdf).
    Higher score = cleaner word boundaries and fewer glued tokens.
    """
    if not text or not text.strip():
        return -1000.0

    tokens = re.findall(r"[A-Za-z]{2,}", text)
    if not tokens:
        return -500.0

    valid_vocab_hits = sum(1 for tok in tokens if _is_known_vocab_word(tok))
    glued_long_tokens = sum(1 for tok in tokens if len(tok) >= 18 and not _is_known_vocab_word(tok))

    vocab_ratio = valid_vocab_hits / len(tokens)
    score = (vocab_ratio * 100.0) + min(40.0, len(tokens) * 0.25) - (glued_long_tokens * 25.0)
    return score


def _page_has_embedded_raster_image(pypdf_page: Any) -> bool:
    """
    Check whether a pypdf PageObject contains one or more embedded /XObject /Image streams
    without decoding the full image bitmap unless needed.
    """
    try:
        resources = pypdf_page.get("/Resources")
        if not resources:
            return False
        if hasattr(resources, "get_object"):
            resources = resources.get_object()
        xobjects = resources.get("/XObject")
        if not xobjects:
            return False
        if hasattr(xobjects, "get_object"):
            xobjects = xobjects.get_object()
        for key in xobjects:
            obj = xobjects[key]
            if hasattr(obj, "get_object"):
                obj = obj.get_object()
            if obj.get("/Subtype") == "/Image":
                return True
    except Exception:
        pass
    return False


def classify_pdf_pages(
    page_texts: List[str],
    page_has_images: List[bool],
) -> Tuple[str, List[int], List[int]]:
    """
    Classify a valid, decrypted PDF into:
    - 'text_based_pdf': all pages (or all non-blank pages) have selectable text
    - 'scanned_image_pdf': no pages have selectable text (>= 25 chars)
    - 'hybrid_pdf': at least one page has selectable text (>= 25 chars) AND at least one page is an image-only page (< 25 chars with an embedded image)
    Returns (classification, text_page_indices, image_only_page_indices).
    """
    text_pages: List[int] = []
    image_only_pages: List[int] = []

    for idx, txt in enumerate(page_texts):
        alpha_num_chars = len(re.findall(r"[A-Za-z0-9]", txt or ""))
        has_img = page_has_images[idx] if idx < len(page_has_images) else False

        if alpha_num_chars >= 20:
            text_pages.append(idx)
        elif has_img or alpha_num_chars < 20:
            image_only_pages.append(idx)

    if len(text_pages) == 0:
        return "scanned_image_pdf", text_pages, image_only_pages

    # Hybrid PDF: has at least one text page AND at least one low-text page that actually has an embedded raster image
    true_scanned_subpages = [
        idx
        for idx in image_only_pages
        if (idx < len(page_has_images) and page_has_images[idx])
    ]
    if len(text_pages) > 0 and len(true_scanned_subpages) > 0:
        return "hybrid_pdf", text_pages, true_scanned_subpages

    return "text_based_pdf", text_pages, []


def parse_pdf_resume(
    raw_bytes: bytes,
    file_name: str = "resume.pdf",
    settings: Optional[Settings] = None,
) -> ParsedResumeDocument:
    """
    Parse a PDF resume entirely in memory from raw_bytes:
    1. Detects encrypted_pdf and corrupted_pdf.
    2. Extracts selectable text via dual-engine pdfplumber (column-aware) + pypdf.
    3. Classifies into text_based_pdf, scanned_image_pdf, or hybrid_pdf.
    4. Runs bounded in-memory OCR on scanned/hybrid pages when OCR is enabled and available.
    """
    cfg = settings or get_settings()
    ocr_status = get_ocr_runtime_status(cfg)

    if not raw_bytes or not raw_bytes.startswith(b"%PDF-"):
        raise ResumeParseError(
            "Invalid PDF file header. Please upload a valid PDF resume.",
            status_code=400,
            document_classification="corrupted_pdf",
            ocr_available=ocr_status.can_run_ocr,
        )

    try:
        pdf_stream = io.BytesIO(raw_bytes)
        reader = PdfReader(pdf_stream, strict=False)

        if reader.is_encrypted:
            try:
                decrypt_result = reader.decrypt("")
                if decrypt_result == 0:
                    raise ResumeParseError(
                        "This PDF is password-protected (encrypted_pdf). Please upload an unencrypted PDF or DOCX resume.",
                        status_code=422,
                        document_classification="encrypted_pdf",
                        ocr_available=ocr_status.can_run_ocr,
                    )
            except ResumeParseError:
                raise
            except Exception as exc:
                raise ResumeParseError(
                    "This PDF is encrypted (encrypted_pdf) and cannot be read by an ATS. Please upload an unprotected PDF.",
                    status_code=422,
                    document_classification="encrypted_pdf",
                    ocr_available=ocr_status.can_run_ocr,
                ) from exc

        num_pages = len(reader.pages)
        if num_pages == 0:
            raise ResumeParseError(
                "The uploaded PDF has no pages.",
                status_code=422,
                document_classification="corrupted_pdf",
                ocr_available=ocr_status.can_run_ocr,
            )

        if num_pages > cfg.MAX_PDF_PAGES:
            raise ResumeParseError(
                f"The uploaded PDF has {num_pages} pages, exceeding the {cfg.MAX_PDF_PAGES}-page resume limit.",
                status_code=422,
                document_classification="text_based_pdf",
                ocr_available=ocr_status.can_run_ocr,
            )

        pypdf_pages: List[str] = []
        page_has_images: List[bool] = []
        for page in reader.pages:
            page_has_images.append(_page_has_embedded_raster_image(page))
            std_text = page.extract_text() or ""
            try:
                layout_text = page.extract_text(extraction_mode="layout") or ""
            except Exception:
                layout_text = ""

            best_pypdf = (
                layout_text
                if _score_extraction_quality(layout_text) > _score_extraction_quality(std_text)
                else std_text
            )
            pypdf_pages.append(best_pypdf)

        plumber_pages: List[str] = []
        try:
            with pdfplumber.open(io.BytesIO(raw_bytes)) as plumber_pdf:
                for p_page in plumber_pdf.pages:
                    plumber_pages.append(_extract_page_with_column_awareness(p_page))
        except Exception:
            plumber_pages = []

        selected_page_texts: List[str] = []
        extraction_engines_used = set()

        for idx in range(num_pages):
            py_txt = pypdf_pages[idx] if idx < len(pypdf_pages) else ""
            pl_txt = plumber_pages[idx] if idx < len(plumber_pages) else ""

            if _score_extraction_quality(pl_txt) >= _score_extraction_quality(py_txt) and pl_txt.strip():
                selected_page_texts.append(pl_txt)
                extraction_engines_used.add("pdfplumber_layout")
            elif py_txt.strip():
                selected_page_texts.append(py_txt)
                extraction_engines_used.add("pypdf")
            else:
                selected_page_texts.append("")

        classification, _, image_only_pages = classify_pdf_pages(
            selected_page_texts,
            page_has_images,
        )

        ocr_attempted = False
        extraction_warnings: List[str] = []
        extraction_method = (
            "pdfplumber_layout"
            if "pdfplumber_layout" in extraction_engines_used
            else "pypdf_native"
        )

        if classification == "scanned_image_pdf":
            if ocr_status.can_run_ocr:
                ocr_res = run_in_memory_ocr_for_pages(
                    raw_bytes=raw_bytes,
                    page_indices=list(range(num_pages)),
                    settings=cfg,
                )
                ocr_attempted = ocr_res.attempted
                extraction_warnings.extend(ocr_res.warnings)

                for p_idx, ocr_txt in ocr_res.succeeded_pages.items():
                    selected_page_texts[p_idx] = ocr_txt

                if ocr_res.succeeded_pages:
                    extraction_method = "ocr_tesseract"
                    extraction_warnings.append(
                        "This PDF was classified as a scanned image-only PDF and parsed via OCR. Many employer ATS systems cannot OCR scanned images—exporting a native selectable-text PDF or DOCX is strongly recommended."
                    )
            else:
                reason_suffix = (
                    f" ({ocr_status.reason})"
                    if ocr_status.reason
                    else ""
                )
                raise ResumeParseError(
                    f"No selectable text could be extracted from this PDF. It is classified as a scanned image-only PDF and OCR is currently unavailable{reason_suffix} Please export a text-based PDF or upload a DOCX resume.",
                    status_code=422,
                    document_classification="scanned_image_pdf",
                    ocr_available=False,
                )

        elif classification == "hybrid_pdf":
            if ocr_status.can_run_ocr and image_only_pages:
                ocr_res = run_in_memory_ocr_for_pages(
                    raw_bytes=raw_bytes,
                    page_indices=image_only_pages,
                    settings=cfg,
                )
                ocr_attempted = ocr_res.attempted
                extraction_warnings.extend(ocr_res.warnings)
                for p_idx, ocr_txt in ocr_res.succeeded_pages.items():
                    selected_page_texts[p_idx] = ocr_txt
                extraction_method = (
                    "hybrid_text_and_ocr"
                    if ocr_res.succeeded_pages
                    else "hybrid_partial_text"
                )
            else:
                extraction_method = "hybrid_partial_text"
                skipped_nums = ", ".join(str(idx + 1) for idx in image_only_pages)
                extraction_warnings.append(
                    f"Hybrid PDF detected: page(s) {skipped_nums} contain scanned images without a selectable text layer and were skipped because OCR is unavailable. Only selectable-text pages were analyzed."
                )

        raw_text = "\n".join(t for t in selected_page_texts if t and t.strip())
    except ResumeParseError:
        raise
    except PdfReadError as exc:
        raise ResumeParseError(
            "The uploaded PDF file appears to be corrupted or unreadable (corrupted_pdf). Please re-export your resume as a standard PDF or DOCX.",
            status_code=422,
            document_classification="corrupted_pdf",
            ocr_available=ocr_status.can_run_ocr,
        ) from exc
    except Exception as exc:
        raise ResumeParseError(
            "Unable to parse the uploaded PDF file (corrupted_pdf). Please verify the file is not damaged.",
            status_code=422,
            document_classification="corrupted_pdf",
            ocr_available=ocr_status.can_run_ocr,
        ) from exc

    return build_parsed_resume_document(
        file_name=file_name,
        file_type="PDF",
        file_size_bytes=len(raw_bytes),
        page_or_section_count=num_pages,
        raw_text=raw_text,
        extraction_method=extraction_method,
        document_classification=classification,
        ocr_attempted=ocr_attempted,
        ocr_available=ocr_status.can_run_ocr,
        extraction_warnings=extraction_warnings,
    )
