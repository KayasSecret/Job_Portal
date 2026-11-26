"""Optional in-memory OCR service using pypdfium2 rasterization and pytesseract with strict resource safeguards."""

import os
import shutil
from dataclasses import dataclass, field
from typing import Dict, List, Optional
import pypdfium2 as pdfium
from PIL import Image
import pytesseract

from app.config import Settings, get_settings

WINDOWS_TESSERACT_CANDIDATES = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    os.path.expandvars(r"%LOCALAPPDATA%\Programs\Tesseract-OCR\tesseract.exe"),
]


@dataclass
class OCRRuntimeStatus:
    """Represents whether OCR is enabled and whether the Tesseract binary is actually installed."""

    enabled_in_config: bool
    binary_available: bool
    binary_path: Optional[str] = None
    reason: str = ""

    @property
    def can_run_ocr(self) -> bool:
        return self.enabled_in_config and self.binary_available


@dataclass
class OCRBatchResult:
    """Result of running in-memory OCR across selected PDF pages."""

    attempted: bool = False
    succeeded_pages: Dict[int, str] = field(default_factory=dict)
    skipped_pages: List[int] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)


def get_ocr_runtime_status(settings: Optional[Settings] = None) -> OCRRuntimeStatus:
    """
    Check if OCR is enabled in settings and verify whether a working Tesseract binary exists on the host.
    Never claims OCR is available if the binary is missing.
    """
    cfg = settings or get_settings()
    if not cfg.ENABLE_OCR:
        return OCRRuntimeStatus(
            enabled_in_config=False,
            binary_available=False,
            binary_path=None,
            reason="OCR is disabled by configuration (ENABLE_OCR=false).",
        )

    candidates: List[str] = []
    if cfg.TESSERACT_CMD:
        candidates.append(cfg.TESSERACT_CMD)

    which_path = shutil.which("tesseract")
    if which_path:
        candidates.append(which_path)

    candidates.extend(WINDOWS_TESSERACT_CANDIDATES)

    for candidate in candidates:
        if candidate and os.path.isfile(candidate):
            pytesseract.pytesseract.tesseract_cmd = candidate
            return OCRRuntimeStatus(
                enabled_in_config=True,
                binary_available=True,
                binary_path=candidate,
                reason="Tesseract OCR binary verified.",
            )

    return OCRRuntimeStatus(
        enabled_in_config=True,
        binary_available=False,
        binary_path=None,
        reason="Tesseract OCR engine is not installed on this server.",
    )


def render_pdf_page_to_pil_in_memory(
    raw_bytes: bytes,
    page_index: int,
    dpi: int = 200,
    max_dimension: int = 2400,
) -> Image.Image:
    """
    Render a single 0-indexed PDF page to an in-memory PIL Image using pypdfium2,
    enforcing DPI and maximum pixel dimension safeguards.
    """
    scale = max(1.0, min(4.17, dpi / 72.0))
    pdf_doc = pdfium.PdfDocument(raw_bytes)
    try:
        page = pdf_doc[page_index]
        try:
            bitmap = page.render(scale=scale)
            pil_image = bitmap.to_pil()
        finally:
            page.close()
    finally:
        pdf_doc.close()

    if pil_image.width > max_dimension or pil_image.height > max_dimension:
        pil_image.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)

    # Convert to grayscale for faster, cleaner OCR without temporary disk writes
    return pil_image.convert("L")


def run_in_memory_ocr_for_pages(
    raw_bytes: bytes,
    page_indices: List[int],
    settings: Optional[Settings] = None,
) -> OCRBatchResult:
    """
    Perform bounded in-memory OCR on the specified 0-indexed PDF pages.
    Enforces OCR_MAX_PAGES, OCR_RENDER_DPI, OCR_MAX_IMAGE_DIMENSION, and OCR_TIMEOUT_SECONDS.
    """
    cfg = settings or get_settings()
    status = get_ocr_runtime_status(cfg)

    if not status.can_run_ocr or not page_indices:
        return OCRBatchResult(
            attempted=False,
            skipped_pages=list(page_indices),
            warnings=[status.reason] if status.reason else [],
        )

    target_pages = page_indices[: cfg.OCR_MAX_PAGES]
    overflow_pages = page_indices[cfg.OCR_MAX_PAGES :]

    result = OCRBatchResult(attempted=True)
    if overflow_pages:
        human_overflow = ", ".join(str(idx + 1) for idx in overflow_pages)
        result.skipped_pages.extend(overflow_pages)
        result.warnings.append(
            f"OCR page limit ({cfg.OCR_MAX_PAGES} pages) reached; skipped OCR on page(s) {human_overflow}."
        )

    for page_idx in target_pages:
        try:
            pil_img = render_pdf_page_to_pil_in_memory(
                raw_bytes=raw_bytes,
                page_index=page_idx,
                dpi=cfg.OCR_RENDER_DPI,
                max_dimension=cfg.OCR_MAX_IMAGE_DIMENSION,
            )
            extracted = pytesseract.image_to_string(
                pil_img,
                timeout=cfg.OCR_TIMEOUT_SECONDS,
            )
            cleaned = (extracted or "").strip()
            if cleaned:
                result.succeeded_pages[page_idx] = cleaned
            else:
                result.skipped_pages.append(page_idx)
        except RuntimeError as exc:
            result.skipped_pages.append(page_idx)
            result.warnings.append(
                f"OCR timed out on page {page_idx + 1} after {cfg.OCR_TIMEOUT_SECONDS}s."
            )
        except Exception:
            result.skipped_pages.append(page_idx)
            result.warnings.append(
                f"OCR could not extract readable text from page {page_idx + 1}."
            )

    return result
