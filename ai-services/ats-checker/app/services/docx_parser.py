"""In-memory DOCX resume parser with OOXML structure, header/footer, XML bullet, and ZIP-bomb hardening."""

import io
import zipfile
from typing import List, Set
from docx import Document

from app.utils.text_normalizer import (
    ParsedResumeDocument,
    ResumeParseError,
    build_parsed_resume_document,
    match_section_heading,
)

REQUIRED_OOXML_ENTRIES = {"[Content_Types].xml", "word/document.xml"}
FORBIDDEN_ARCHIVE_SUFFIXES = (".exe", ".bat", ".cmd", ".ps1", ".vbs", ".js", ".dll", "vbaproject.bin")
MAX_UNCOMPRESSED_BYTES = 25 * 1024 * 1024  # 25 MB uncompressed cap against ZIP bombs
MAX_ZIP_ENTRIES = 500


def validate_docx_zip_container(raw_bytes: bytes) -> None:
    """
    Validate that the byte buffer is a genuine OOXML .docx container,
    free of ZIP-bomb expansion or embedded macros/executables.
    """
    if not raw_bytes or not raw_bytes.startswith(b"PK\x03\x04"):
        raise ResumeParseError(
            "Invalid DOCX file header. Please upload a valid .docx Word document.",
            status_code=400,
        )

    try:
        with zipfile.ZipFile(io.BytesIO(raw_bytes)) as archive:
            infos = archive.infolist()
            if len(infos) == 0 or len(infos) > MAX_ZIP_ENTRIES:
                raise ResumeParseError(
                    "Invalid DOCX archive structure: abnormal internal entry count.",
                    status_code=422,
                )

            entry_names: Set[str] = set()
            total_uncompressed = 0

            for info in infos:
                entry_names.add(info.filename)
                total_uncompressed += info.file_size
                lower_name = info.filename.lower()

                if lower_name.endswith(FORBIDDEN_ARCHIVE_SUFFIXES):
                    raise ResumeParseError(
                        "Macro-enabled or executable content inside DOCX files is not permitted for security reasons.",
                        status_code=400,
                    )

            if total_uncompressed > MAX_UNCOMPRESSED_BYTES:
                raise ResumeParseError(
                    "DOCX uncompressed content exceeds safety limits.",
                    status_code=413,
                )

            if not REQUIRED_OOXML_ENTRIES.issubset(entry_names):
                raise ResumeParseError(
                    "The uploaded file is a ZIP archive rather than a valid Word (.docx) document.",
                    status_code=400,
                )
    except ResumeParseError:
        raise
    except zipfile.BadZipFile as exc:
        raise ResumeParseError(
            "The uploaded DOCX file is corrupted or is not a valid Word document.",
            status_code=422,
        ) from exc


def _paragraph_is_xml_list_item(paragraph) -> bool:
    """
    Check if a Word paragraph is formatted as a bulleted/numbered list item
    either via its style name ('List Bullet', 'List Paragraph') OR via OOXML <w:numPr>.
    """
    style_name = (paragraph.style.name if paragraph.style else "").lower()
    if "bullet" in style_name or "list" in style_name:
        return True

    try:
        pPr = paragraph._p.pPr
        if pPr is not None and pPr.numPr is not None:
            return True
    except Exception:
        pass

    return False


def parse_docx_resume(raw_bytes: bytes, file_name: str = "resume.docx") -> ParsedResumeDocument:
    """
    Parse a DOCX resume entirely in memory from raw_bytes, extracting headers,
    paragraphs (including ribbon XML <w:numPr> bullets), tables, and footers.
    """
    validate_docx_zip_container(raw_bytes)

    try:
        doc = Document(io.BytesIO(raw_bytes))
        extracted_chunks: List[str] = []
        seen_header_lines: Set[str] = set()

        # 1. Extract unique header lines (often used for Name, Email, Phone, LinkedIn)
        for section in doc.sections:
            try:
                for hp in section.header.paragraphs:
                    h_text = (hp.text or "").strip()
                    if h_text and h_text not in seen_header_lines:
                        seen_header_lines.add(h_text)
                        extracted_chunks.append(h_text)
            except Exception:
                pass

        # 2. Extract main body paragraphs and tables in reading order
        def _extract_cell_text(cell) -> str:
            cell_lines: List[str] = []
            for p in cell.paragraphs:
                p_text = (p.text or "").strip()
                if not p_text:
                    continue
                if _paragraph_is_xml_list_item(p) and not p_text.startswith(("•", "-", "*")):
                    cell_lines.append(f"• {p_text}")
                else:
                    cell_lines.append(p_text)
            return "\n".join(cell_lines)

        def _extract_table_chunks(table, seen_cells: set) -> List[str]:
            chunks: List[str] = []
            if not table.rows:
                return chunks

            # Check if Row 0 contains multiple section headings across columns (2-column layout table)
            first_row_headings = sum(
                1
                for c in table.rows[0].cells
                if match_section_heading((c.text or "").strip().splitlines()[0] if (c.text or "").strip() else "")
            )
            if first_row_headings >= 2 and len(table.columns) >= 2:
                for col in table.columns:
                    for cell in col.cells:
                        cell_id = id(cell._tc)
                        if cell_id in seen_cells:
                            continue
                        seen_cells.add(cell_id)
                        c_txt = _extract_cell_text(cell)
                        if c_txt:
                            chunks.append(c_txt)
                return chunks

            for row in table.rows:
                row_parts: List[str] = []
                for cell in row.cells:
                    cell_id = id(cell._tc)
                    if cell_id in seen_cells:
                        continue
                    seen_cells.add(cell_id)
                    c_txt = _extract_cell_text(cell)
                    if c_txt:
                        row_parts.append(c_txt)
                if row_parts:
                    chunks.append("\n".join(row_parts))
            return chunks

        seen_cells = set()
        if hasattr(doc, "iter_inner_content"):
            for item in doc.iter_inner_content():
                if hasattr(item, "rows"):  # Table
                    extracted_chunks.extend(_extract_table_chunks(item, seen_cells))
                else:  # Paragraph
                    text = (item.text or "").strip()
                    if not text:
                        continue
                    if _paragraph_is_xml_list_item(item) and not text.startswith(("•", "-", "*")):
                        extracted_chunks.append(f"• {text}")
                    else:
                        extracted_chunks.append(text)
        else:
            for paragraph in doc.paragraphs:
                text = (paragraph.text or "").strip()
                if not text:
                    continue
                if _paragraph_is_xml_list_item(paragraph) and not text.startswith(("•", "-", "*")):
                    extracted_chunks.append(f"• {text}")
                else:
                    extracted_chunks.append(text)
            for table in doc.tables:
                extracted_chunks.extend(_extract_table_chunks(table, seen_cells))

        raw_text = "\n".join(extracted_chunks)
        section_count = max(1, len(doc.sections))
    except ResumeParseError:
        raise
    except Exception as exc:
        raise ResumeParseError(
            "Unable to read the uploaded DOCX document. Please save your resume as a standard .docx or PDF file.",
            status_code=422,
        ) from exc

    return build_parsed_resume_document(
        file_name=file_name,
        file_type="DOCX",
        file_size_bytes=len(raw_bytes),
        page_or_section_count=section_count,
        raw_text=raw_text,
        extraction_method="python_docx_ooxml",
        document_classification="word_docx",
    )
