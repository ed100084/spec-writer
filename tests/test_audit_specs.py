from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scripts import audit_specs


RULES = {
    "required_sections": [
        {"id": "overview", "label": "專案概述", "keywords": ["專案概述"]},
        {"id": "security", "label": "資訊安全", "keywords": ["資訊安全"]},
    ],
    "conditional_sections": [
        {
            "id": "ai",
            "label": "AI 模組規格",
            "trigger_keywords": ["AI"],
            "required_keywords": ["準確率", "覆核"],
        }
    ],
    "ambiguous_terms": ["依需求", "穩定"],
    "filename_pattern": r"^[A-Za-z0-9-]+_[^_]+_v[0-9]+(\.[0-9]+)?_[0-9]{8}\.docx$",
}


def finding_codes(result):
    return {item["code"] for item in result["findings"]}


def test_audit_file_scores_clean_document(monkeypatch, tmp_path):
    target = tmp_path / "EDAH-HTSP-115-001_規格書_v1.0_20260625.docx"
    target.write_bytes(b"fake docx")

    monkeypatch.setattr(
        audit_specs,
        "read_docx",
        lambda _path: ("專案概述\n資訊安全\nAI 準確率 覆核", ["專案概述", "資訊安全"]),
    )

    result = audit_specs.audit_file(target, tmp_path, RULES)

    assert result["score"] == 100
    assert result["headings"] == 2
    assert result["findings"] == []


def test_audit_file_flags_filename_headings_missing_sections_and_terms(monkeypatch, tmp_path):
    target = tmp_path / "草稿.docx"
    target.write_bytes(b"fake docx")

    monkeypatch.setattr(
        audit_specs,
        "read_docx",
        lambda _path: ("專案概述\n本案 AI 功能依需求保持穩定", []),
    )

    result = audit_specs.audit_file(target, tmp_path, RULES)

    assert result["score"] == 61
    assert finding_codes(result) == {
        "FILENAME",
        "NO_HEADINGS",
        "MISSING_SECURITY",
        "INCOMPLETE_AI",
        "AMBIGUOUS_TERMS",
    }


def test_audit_file_reports_read_failure(monkeypatch, tmp_path):
    target = tmp_path / "EDAH-HTSP-115-001_規格書_v1.0_20260625.docx"
    target.write_bytes(b"not a docx")

    def fail_read(_path):
        raise ValueError("bad document")

    monkeypatch.setattr(audit_specs, "read_docx", fail_read)

    result = audit_specs.audit_file(target, tmp_path, RULES)

    assert result["score"] == 0
    assert result["headings"] == 0
    assert result["findings"] == [
        {
            "severity": "HIGH",
            "code": "READ_FAILED",
            "message": "無法讀取 docx：bad document",
        }
    ]


def test_iter_targets_filters_procurement_docx_files(tmp_path):
    included = tmp_path / "EDAH-HTSP-115-001_規格說明書_v1.0_20260625.docx"
    excluded_report = tmp_path / "EDAH-HTSP-115-001_規格說明書_審查報告.docx"
    excluded_extension = tmp_path / "EDAH-HTSP-115-001_規格說明書.txt"
    included.write_bytes(b"")
    excluded_report.write_bytes(b"")
    excluded_extension.write_text("", encoding="utf-8")

    assert audit_specs.iter_targets(tmp_path) == [included]
