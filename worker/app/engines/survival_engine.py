"""Authentic Lifelines Kaplan-Meier & Log-Rank Clinical Survival Analyzer."""
from __future__ import annotations

import io
from typing import Any

import numpy as np
import pandas as pd
from lifelines import KaplanMeierFitter
from lifelines.statistics import logrank_test


def _default_cohort_df() -> pd.DataFrame:
    """Realistic Lung Adenocarcinoma EGFR/KRAS biomarker cohort survival dataset (n=48)."""
    rng = np.random.default_rng(42)
    high_times = np.round(rng.weibull(1.35, 24) * 18.5 + 2.0, 1)
    high_events = rng.choice([1, 0], size=24, p=[0.78, 0.22])
    low_times = np.round(rng.weibull(1.65, 24) * 38.0 + 5.5, 1)
    low_events = rng.choice([1, 0], size=24, p=[0.42, 0.58])

    rows = []
    for i in range(24):
        rows.append(
            {
                "patient_id": f"LUAD-H{i+1:02d}",
                "time_months": float(high_times[i]),
                "event": int(high_events[i]),
                "group": "Biomarker-High",
            }
        )
    for i in range(24):
        rows.append(
            {
                "patient_id": f"LUAD-L{i+1:02d}",
                "time_months": float(low_times[i]),
                "event": int(low_events[i]),
                "group": "Biomarker-Low",
            }
        )
    return pd.DataFrame(rows)


def run_lifelines_survival(
    raw_bytes: bytes | None = None,
    filename: str = "cohort_survival.csv",
    time_col: str = "time_months",
    event_col: str = "event",
    group_col: str = "group",
) -> dict[str, Any]:
    """Fit Kaplan-Meier survival curves with 95% Greenwood confidence intervals and Log-Rank test."""
    if raw_bytes:
        if filename.lower().endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(raw_bytes))
        else:
            text = raw_bytes.decode("utf-8", errors="ignore")
            sep = "\t" if "\t" in text.splitlines()[0] else ","
            df = pd.read_csv(io.StringIO(text), sep=sep)
        cols_lower = {c.lower(): c for c in df.columns}
        t_c = df.columns[1] if time_col not in df.columns else time_col
        for cand in ("time_months", "time", "os_months", "days", "duration"):
            if cand in cols_lower:
                t_c = cols_lower[cand]
                break
        e_c = df.columns[2] if event_col not in df.columns else event_col
        for cand in ("event", "status", "vital_status", "deceased", "censored"):
            if cand in cols_lower:
                e_c = cols_lower[cand]
                break
        g_c = df.columns[-1] if group_col not in df.columns else group_col
        for cand in ("group", "arm", "stratum", "biomarker", "cohort"):
            if cand in cols_lower:
                g_c = cols_lower[cand]
                break
    else:
        df = _default_cohort_df()
        t_c, e_c, g_c = "time_months", "event", "group"

    df = df[[t_c, e_c, g_c]].dropna().copy()
    df[t_c] = pd.to_numeric(df[t_c], errors="coerce")
    df[e_c] = pd.to_numeric(df[e_c], errors="coerce")
    df = df.dropna()

    groups = sorted(df[g_c].astype(str).unique().tolist())[:4]
    if len(groups) < 2:
        raise ValueError("Survival table must contain at least 2 distinct cohort groups.")

    palette = ["#007AFF", "#FF3B30", "#34C759", "#AF52DE"]
    summary_rows: list[dict[str, Any]] = []
    series: list[dict[str, Any]] = []

    for idx, grp in enumerate(groups):
        sub = df[df[g_c].astype(str) == grp]
        kmf = KaplanMeierFitter()
        kmf.fit(durations=sub[t_c], event_observed=sub[e_c], label=grp)
        surv_df = kmf.survival_function_
        ci_df = kmf.confidence_interval_survival_function_
        median_surv = float(kmf.median_survival_time_) if np.isfinite(kmf.median_survival_time_) else None

        pts = []
        for timeline_val in surv_df.index:
            prob = float(surv_df.loc[timeline_val, grp])
            ci_low = float(ci_df.loc[timeline_val].iloc[0])
            ci_high = float(ci_df.loc[timeline_val].iloc[1])
            pts.append(
                {
                    "x": round(float(timeline_val), 2),
                    "y": round(prob, 4),
                    "ciLow": round(ci_low, 4),
                    "ciHigh": round(ci_high, 4),
                    "label": f"{grp}: t={timeline_val:.1f}, S(t)={prob:.2%}",
                }
            )

        series.append(
            {
                "name": f"{grp} (n={len(sub)})",
                "color": palette[idx % len(palette)],
                "step": True,
                "points": pts,
            }
        )
        summary_rows.append(
            {
                "cohort_group": grp,
                "patients_n": int(len(sub)),
                "events_n": int(sub[e_c].sum()),
                "censored_n": int(len(sub) - sub[e_c].sum()),
                "median_survival": round(median_surv, 2) if median_surv is not None else "Not Reached",
                "survival_12m_pct": round(float(kmf.predict(12.0)) * 100.0, 1),
                "survival_24m_pct": round(float(kmf.predict(24.0)) * 100.0, 1),
            }
        )

    g0 = df[df[g_c].astype(str) == groups[0]]
    g1 = df[df[g_c].astype(str) == groups[1]]
    lr = logrank_test(g0[t_c], g1[t_c], event_observed_A=g0[e_c], event_observed_B=g1[e_c])
    pval = float(lr.p_value)
    chisq = float(lr.test_statistic)

    return {
        "summary": {
            "headline": f"Log-Rank p = {pval:.4g} (χ² = {chisq:.2f}) comparing {groups[0]} vs {groups[1]}",
            "logrank_p_value": float(f"{pval:.4e}"),
            "logrank_chi2": round(chisq, 3),
            "significant": pval < 0.05,
            "total_patients": int(len(df)),
        },
        "table": summary_rows,
        "plot": {
            "kind": "line",
            "title": f"Kaplan–Meier Survival Curve (Log-Rank p = {pval:.4g})",
            "xLabel": f"Time ({t_c})",
            "yLabel": "Survival Probability S(t)",
            "yDomain": [0, 1.02],
            "series": series,
        },
        "chained_outputs": {
            "SurvivalSummaryTable": summary_rows,
        },
    }
