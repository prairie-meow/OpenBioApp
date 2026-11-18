"""Scientific input sanitizers for messy instrument & spreadsheet files."""
from __future__ import annotations

import io
import re
from typing import Any

import numpy as np
import pandas as pd

# Canonical Excel auto-date -> HGNC gene symbol restoration table
EXCEL_DATE_GENE_MAP: dict[str, str] = {
    **{f"{i}-mar": f"MARCHF{i}" for i in range(1, 12)},
    **{f"mar-{i}": f"MARCHF{i}" for i in range(1, 12)},
    **{f"0{i}-mar": f"MARCHF{i}" for i in range(1, 10)},
    **{f"mar-0{i}": f"MARCHF{i}" for i in range(1, 10)},
    **{f"{i}-sep": f"SEPTIN{i}" for i in range(1, 15)},
    **{f"sep-{i}": f"SEPTIN{i}" for i in range(1, 15)},
    **{f"0{i}-sep": f"SEPTIN{i}" for i in range(1, 10)},
    **{f"sep-0{i}": f"SEPTIN{i}" for i in range(1, 10)},
    "1-dec": "DELEC1",
    "dec-1": "DELEC1",
    "01-dec": "DELEC1",
    "dec-01": "DELEC1",
    "oct-4": "POU5F1",
    "4-oct": "POU5F1",
}


def restore_excel_gene_symbol(raw_gene: Any) -> tuple[str, bool]:
    """Restore Excel-corrupted gene symbols and strip Ensembl version suffixes."""
    s = str(raw_gene).strip()
    if not s:
        return s, False

    lower = s.lower()
    if lower in EXCEL_DATE_GENE_MAP:
        return EXCEL_DATE_GENE_MAP[lower], True

    # Handle ISO dates that Excel converted from e.g. Mar-1 -> 2026-03-01 00:00:00
    m_iso = re.match(r"^\d{4}-(03|09|12)-0?(\d{1,2})(?:\s.*)?$", s)
    if m_iso:
        month, day = m_iso.group(1), int(m_iso.group(2))
        if month == "03" and 1 <= day <= 11:
            return f"MARCHF{day}", True
        if month == "09" and 1 <= day <= 14:
            return f"SEPTIN{day}", True
        if month == "12" and day == 1:
            return "DELEC1", True

    # Strip Ensembl version suffix (ENSG00000141510.15 -> ENSG00000141510)
    m_ens = re.match(r"^(ENS[A-Z]*G\d{11})\.\d+$", s, re.IGNORECASE)
    if m_ens:
        return m_ens.group(1).upper(), True

    return s, False


def sanitize_ms_spectrum(
    raw_bytes: bytes,
    filename: str = "spectrum.txt",
) -> tuple[np.ndarray, np.ndarray, dict[str, Any]]:
    """
    Parse and sanitize dirty vendor ESI-MS spectrum files (.txt, .csv, .tsv, .xlsx).
    Automatically strips instrument metadata headers (Waters, Thermo, Agilent, Bruker),
    blank lines, comments, and invalid rows, returning sorted (mz, intensity) arrays.
    """
    fname_lower = (filename or "").lower()
    skipped_lines = 0
    mz_list: list[float] = []
    int_list: list[float] = []

    if fname_lower.endswith((".xlsx", ".xls")):
        df = pd.read_excel(io.BytesIO(raw_bytes))
        for _, row in df.iterrows():
            vals = [v for v in row.values if pd.notna(v)]
            if len(vals) < 2:
                skipped_lines += 1
                continue
            try:
                mz_val = float(vals[0])
                int_val = float(vals[1])
                if np.isfinite(mz_val) and np.isfinite(int_val) and mz_val > 0 and int_val >= 0:
                    mz_list.append(mz_val)
                    int_list.append(int_val)
                else:
                    skipped_lines += 1
            except (TypeError, ValueError):
                skipped_lines += 1
    else:
        text = raw_bytes.decode("utf-8", errors="ignore")
        for raw_line in text.replace("\r\n", "\n").replace("\r", "\n").split("\n"):
            line = raw_line.strip()
            if not line or line.startswith(("#", "//", ";", "[")):
                if line:
                    skipped_lines += 1
                continue

            if "\t" in line:
                parts = line.split("\t")
            elif "," in line:
                parts = line.split(",")
            elif ";" in line:
                parts = line.split(";")
            else:
                parts = line.split()

            if len(parts) < 2:
                skipped_lines += 1
                continue

            try:
                mz_val = float(parts[0].strip().strip('"').strip("'"))
                int_val = float(parts[1].strip().strip('"').strip("'"))
                if np.isfinite(mz_val) and np.isfinite(int_val) and mz_val > 0 and int_val >= 0:
                    mz_list.append(mz_val)
                    int_list.append(int_val)
                else:
                    skipped_lines += 1
            except ValueError:
                skipped_lines += 1

    if len(mz_list) < 5:
        raise ValueError(
            f"Could not extract enough valid (m/z, intensity) data points from '{filename}' "
            f"(found {len(mz_list)} valid rows, skipped {skipped_lines} header/non-numeric rows)."
        )

    mz_arr = np.asarray(mz_list, dtype=np.float64)
    int_arr = np.asarray(int_list, dtype=np.float64)

    # Sort ascending by m/z
    order = np.argsort(mz_arr)
    mz_arr = mz_arr[order]
    int_arr = int_arr[order]

    report = {
        "filename": filename,
        "valid_points": int(len(mz_arr)),
        "stripped_header_or_invalid_rows": int(skipped_lines),
        "mz_min": round(float(mz_arr[0]), 4),
        "mz_max": round(float(mz_arr[-1]), 4),
        "base_peak_mz": round(float(mz_arr[int(np.argmax(int_arr))]), 4),
        "base_peak_intensity": round(float(np.max(int_arr)), 2),
    }
    return mz_arr, int_arr, report


def sanitize_gene_count_matrix(
    raw_bytes: bytes,
    filename: str = "counts.csv",
) -> tuple[pd.DataFrame, dict[str, Any]]:
    """
    Parse gene expression matrix (.csv, .tsv, .xlsx), repair Excel date-corrupted
    gene symbols, deduplicate genes, and drop empty rows.
    """
    fname_lower = (filename or "").lower()
    if fname_lower.endswith((".xlsx", ".xls")):
        df = pd.read_excel(io.BytesIO(raw_bytes))
    else:
        text = raw_bytes.decode("utf-8", errors="ignore")
        first_line = text.splitlines()[0] if text.splitlines() else ""
        sep = "\t" if "\t" in first_line else (";" if ";" in first_line and "," not in first_line else ",")
        df = pd.read_csv(io.StringIO(text), sep=sep)

    if df.shape[1] < 3:
        raise ValueError("Expression table must have 1 gene column and at least 2 sample columns.")

    gene_col = df.columns[0]
    repaired_examples: list[str] = []
    cleaned_genes: list[str] = []
    for raw_g in df[gene_col]:
        fixed, changed = restore_excel_gene_symbol(raw_g)
        if changed and len(repaired_examples) < 10:
            repaired_examples.append(f"{raw_g} -> {fixed}")
        cleaned_genes.append(fixed)

    df = df.copy()
    df[gene_col] = cleaned_genes
    df = df[df[gene_col].astype(str).str.len() > 0]

    sample_cols = list(df.columns[1:])
    for col in sample_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)

    before_dedup = len(df)
    df = df.groupby(gene_col, as_index=True)[sample_cols].sum()
    non_zero_mask = df.sum(axis=1) > 0
    dropped_zero = int((~non_zero_mask).sum())
    df = df[non_zero_mask]

    report = {
        "filename": filename,
        "genes_retained": int(len(df)),
        "samples_count": int(len(sample_cols)),
        "sample_names": [str(c) for c in sample_cols],
        "excel_date_genes_repaired": len(repaired_examples),
        "repaired_examples": repaired_examples,
        "duplicate_genes_merged": int(before_dedup - len(df) - dropped_zero),
        "zero_expression_genes_dropped": dropped_zero,
    }
    return df, report
