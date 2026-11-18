"""Comprehensive unit & integration tests for OpenBioApp Scientific Worker."""
from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app
from app.sanitizers import restore_excel_gene_symbol, sanitize_gene_count_matrix, sanitize_ms_spectrum

client = TestClient(app)


def test_health_endpoint() -> None:
    resp = client.get("/api/health")
    assert resp.status_code == 200
    payload = resp.json()
    assert payload["status"] == "healthy"
    assert "nucleospec-dna-agnc" in payload["supported_apps"]


def test_ms_spectrum_sanitizer_strips_vendor_headers() -> None:
    dirty_vendor_export = b"""Waters MassLynx 4.2 Spectrum Export
Acquired: 2026-11-17 14:22:01
Instrument: Synapt G2-Si ESI-TOF Negative Mode
m/z\tIntensity
# Calibration verified
1538.50\t12400.5
1538.70\t48200.0
1538.90\t112500.0
1539.10\t163600.0
1539.30\t98400.0
1539.50\t31200.0
Footer checksum: OK
"""
    mz, inten, rep = sanitize_ms_spectrum(dirty_vendor_export, "dirty_waters.txt")
    assert len(mz) == 6
    assert rep["stripped_header_or_invalid_rows"] >= 5
    assert rep["base_peak_mz"] == 1539.1


def test_excel_date_gene_symbol_restoration() -> None:
    assert restore_excel_gene_symbol("1-Mar") == ("MARCHF1", True)
    assert restore_excel_gene_symbol("Sep-2") == ("SEPTIN2", True)
    assert restore_excel_gene_symbol("2026-09-02 00:00:00") == ("SEPTIN2", True)
    assert restore_excel_gene_symbol("ENSG00000141510.17") == ("ENSG00000141510", True)

    csv_bytes = b"Gene,Ctrl_1,Ctrl_2,Treat_1,Treat_2\n1-Mar,100,110,450,480\nSep-2,300,310,290,305\nTP53,50,55,250,270\n"
    df, rep = sanitize_gene_count_matrix(csv_bytes, "messy.csv")
    assert "MARCHF1" in df.index
    assert "SEPTIN2" in df.index
    assert rep["excel_date_genes_repaired"] == 2


def test_nucleospec_sample_auto_assign() -> None:
    resp = client.post(
        "/api/apps/nucleospec-dna-agnc/run",
        json={"params": {"sequence_or_formula": "ATCCCCTGTC", "max_peaks_to_assign": 3}, "use_sample": True},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["summary"]["peaks_assigned"] >= 2
    assert data["summary"]["dominant_n_Ag"] == 17
    assert data["summary"]["dominant_N0"] == 6
    assert len(data["plot"]["series"]) >= 2


def test_pydeseq2_deg_and_rdkit_and_survival_and_celltypist() -> None:
    deg = client.post("/api/apps/pydeseq2-deg/run", json={"use_sample": True}).json()
    assert deg["summary"]["up_regulated_count"] >= 8
    assert deg["summary"]["top_up_gene"] in {"DUSP1", "ZBTB16", "KLF15", "TSC22D3", "FKBP5"}

    rdk = client.post("/api/apps/rdkit-molecular-profiler/run", json={"use_sample": True}).json()
    assert rdk["summary"]["total_valid"] == 8
    pains_rows = [r for r in rdk["table"] if "Rhodanine" in r["compound"]]
    assert pains_rows and pains_rows[0]["pains_alerts"] != "None"

    surv = client.post("/api/apps/lifelines-survival/run", json={"use_sample": True}).json()
    assert surv["summary"]["significant"] is True
    assert len(surv["table"]) == 2

    ct = client.post("/api/apps/celltypist-annotator/run", json={"use_sample": True}).json()
    assert ct["summary"]["clusters_annotated"] == 8
