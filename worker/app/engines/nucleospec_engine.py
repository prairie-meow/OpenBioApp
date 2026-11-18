"""Headless wrapper around Copp Lab's NucleoSpec (DNASilverAnalyzer + Senko/spacing charge detection)."""
from __future__ import annotations

import hashlib
import os
import sys
from typing import Any

import numpy as np

VENDOR_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "vendor", "nucleospec"))
VENDOR_LIB = os.path.join(VENDOR_DIR, "lib")
for _p in (VENDOR_DIR, VENDOR_LIB):
    if _p not in sys.path:
        sys.path.insert(0, _p)

from core.analyzer import DNASilverAnalyzer  # noqa: E402
from pythoms.senko_charge_assignment import detect_all_peaks_with_charge  # noqa: E402

from app.sanitizers import sanitize_ms_spectrum  # noqa: E402

SAMPLE_SPECTRUM_PATH = os.path.join(VENDOR_DIR, "sample_data", "GG208.txt")
SAMPLE_DNA_SEQUENCE = "ATCCCCTGTC"

_RUN_CACHE: dict[str, dict[str, Any]] = {}


def _confidence_badge(sim: float) -> str:
    if sim >= 0.8:
        return "▲ High"
    if sim >= 0.5:
        return "○ Moderate"
    return "▽ Low"


def _downsample_spectrum(
    mz_arr: np.ndarray,
    int_arr: np.ndarray,
    max_points: int = 2400,
) -> list[dict[str, float]]:
    """Peak-preserving max-pool downsampling of dense 150k-point ESI-MS spectra for fast interactive plotting."""
    n = len(mz_arr)
    if n <= max_points:
        return [{"x": round(float(m), 4), "y": round(float(v), 2)} for m, v in zip(mz_arr, int_arr)]

    bucket_size = max(1, n // (max_points // 2))
    pts: list[dict[str, float]] = []
    for start in range(0, n, bucket_size):
        end = min(n, start + bucket_size)
        seg_mz = mz_arr[start:end]
        seg_int = int_arr[start:end]
        min_idx = int(np.argmin(seg_int))
        max_idx = int(np.argmax(seg_int))
        first, second = (min_idx, max_idx) if min_idx <= max_idx else (max_idx, min_idx)
        pts.append({"x": round(float(seg_mz[first]), 4), "y": round(float(seg_int[first]), 2)})
        if second != first:
            pts.append({"x": round(float(seg_mz[second]), 4), "y": round(float(seg_int[second]), 2)})
    return pts


def _select_best_candidate(refined: list[dict[str, Any]]) -> dict[str, Any]:
    """Select best stoichiometry candidate favoring even N0 magic-number clusters and lowest |ΔX0|."""
    def sort_key(c: dict[str, Any]) -> tuple:
        n0 = int(c.get("n0", 0) or 0)
        n_ag = int(c.get("num_silver", 0) or 0)
        even_n0_bonus = 0 if (n_ag == 0 or n0 % 2 == 0) else 1
        sim = float(c.get("pattern_similarity") or c.get("pattern_score") or 0.0)
        x0_err = float(c.get("abs_x0_error") if c.get("abs_x0_error") is not None else abs(float(c.get("x0_error", 99.0))))
        return (even_n0_bonus, round(x0_err, 3), -sim)

    ranked = sorted(refined, key=sort_key)
    return ranked[0]


def run_nucleospec_auto_assign(
    raw_files: list[tuple[str, bytes]] | None = None,
    analysis_mode: str = "dna_agn",
    sequence_or_formula: str = SAMPLE_DNA_SEQUENCE,
    strand2_sequence: str = "",
    max_peaks_to_assign: int = 5,
    similarity_cutoff: float = 0.45,
) -> dict[str, Any]:
    """
    One-click automated ESI-MS peak detection, charge state determination,
    smart adduct stoichiometry assignment, and theoretical isotope envelope overlay.
    """
    seq_clean = (sequence_or_formula or SAMPLE_DNA_SEQUENCE).strip().upper().replace(" ", "")
    s2_clean = (strand2_sequence or "").strip().upper().replace(" ", "")

    if not raw_files:
        with open(SAMPLE_SPECTRUM_PATH, "rb") as fh:
            raw_files = [("GG208_sample.txt", fh.read())]
        if not sequence_or_formula:
            seq_clean = SAMPLE_DNA_SEQUENCE

    hasher = hashlib.sha256()
    hasher.update(f"{analysis_mode}|{seq_clean}|{s2_clean}|{max_peaks_to_assign}|{similarity_cutoff}".encode())
    for fname, b in raw_files:
        hasher.update(fname.encode())
        hasher.update(hashlib.sha256(b).digest())
    cache_key = hasher.hexdigest()
    if cache_key in _RUN_CACHE:
        return _RUN_CACHE[cache_key]

    analyzer = DNASilverAnalyzer()
    all_assignments: list[dict[str, Any]] = []
    sanitizer_reports: list[dict[str, Any]] = []
    primary_plot_series: list[dict[str, Any]] = []

    custom_xna: dict[str, Any] | None = None
    dna_seq_arg = seq_clean
    if analysis_mode == "xna_agn":
        ok, calc_mass, err = analyzer.calculate_mass_from_formula_with_validation(seq_clean)
        if not ok or calc_mass is None:
            raise ValueError(err or f"Invalid XNA chemical formula: {seq_clean}")
        custom_xna = {"name": "CustomXNA", "formula": seq_clean, "molecular_weight": float(calc_mass)}
        dna_seq_arg = ""
    elif analysis_mode == "agi_complex":
        combined = seq_clean + s2_clean if s2_clean else seq_clean
        dna_seq_arg = combined
        custom_xna = {"is_complex": True}

    for file_idx, (fname, fbytes) in enumerate(raw_files):
        mz_values, intensity_values, san_rep = sanitize_ms_spectrum(fbytes, fname)
        sanitizer_reports.append(san_rep)

        resolution = analyzer.estimate_resolution(mz_values, intensity_values)
        detected_peaks = detect_all_peaks_with_charge(
            mz_values,
            intensity_values,
            prominence=0.025,
            charge_range=(1, 10),
            method="combination",
            merge_gap=1.5,
        )
        top_peaks = sorted(detected_peaks, key=lambda p: float(p.get("intensity", 0.0)), reverse=True)[
            : max(1, min(max_peaks_to_assign, 8))
        ]

        if file_idx == 0:
            primary_plot_series.append(
                {
                    "name": f"Experimental Spectrum ({fname})",
                    "color": "#1D1D1F",
                    "lineWidth": 1.3,
                    "points": _downsample_spectrum(mz_values, intensity_values),
                }
            )

        overlay_colors = ["#007AFF", "#FF2D55", "#34C759", "#AF52DE", "#FF9500"]
        for p_idx, pk in enumerate(top_peaks):
            peak_mz = float(pk["mz"])
            charge = int(pk["charge"]) if pk.get("charge") is not None else 4
            peak_int = float(pk["intensity"])

            # Fit local Gaussian centroid X0 around peak_mz
            win_mask = (mz_values >= peak_mz - 3.0) & (mz_values <= peak_mz + 3.0)
            exp_x0 = peak_mz
            if int(np.sum(win_mask)) > 5:
                g_mz, g_int = analyzer.generate_experimental_gaussian_envelope(
                    mz_values[win_mask], intensity_values[win_mask], resolution
                )
                if g_mz is not None and g_int is not None and len(g_mz) > 3:
                    fit = analyzer.gaussian_fit_centroid(g_mz, g_int)
                    if fit and fit[0] is not None:
                        exp_x0 = float(fit[0])

            comps = analyzer.analyze_peak_with_smart_adduct_search(
                peak_mz,
                charge,
                dna_seq_arg,
                exp_x0,
                resolution=resolution,
                mz_values=mz_values,
                intensity_values=intensity_values,
                custom_xna=custom_xna,
            )
            if not comps:
                continue

            refined_tuple = analyzer.refine_compositions_with_isotope_matching(
                comps,
                mz_values,
                intensity_values,
                peak_mz,
                resolution=resolution,
                detected_centroid=exp_x0,
            )
            refined_list = [c for c in refined_tuple[0] if isinstance(c, dict)]
            if not refined_list:
                continue

            best = _select_best_candidate(refined_list)
            sim = float(best.get("pattern_similarity") or best.get("pattern_score") or 0.0)
            if sim < similarity_cutoff:
                continue

            n_strands = int(best.get("num_strands", 1) or 1)
            n_ag = int(best.get("num_silver", 0) or 0)
            n0 = int(best.get("n0", 0) or 0)
            qcl = int(best.get("displayed_qcl", best.get("qcl", 0)) or 0)
            z_val = int(best.get("z", charge) or charge)
            adduct_str = str(best.get("adduct") or "None")
            delta_x0 = float(
                best.get("abs_x0_error")
                if best.get("abs_x0_error") is not None
                else abs(float(best.get("x0_error", 0.0)))
            )

            species_label = (
                f"(DNA){n_strands}Ag{n_ag} (z={z_val}-)"
                if n_ag > 0
                else f"(DNA){n_strands}" + (f"+{adduct_str}" if adduct_str and adduct_str != "None" else "")
            )

            all_assignments.append(
                {
                    "sample": fname,
                    "peak_mz": round(peak_mz, 4),
                    "rel_intensity_pct": round(peak_int / float(np.max(intensity_values)) * 100.0, 1),
                    "species": species_label,
                    "strands": n_strands,
                    "n_Ag": n_ag,
                    "N0_electrons": n0,
                    "Qcl": qcl,
                    "charge_z": z_val,
                    "adduct": adduct_str if adduct_str else "None",
                    "delta_X0_mz": round(delta_x0, 4),
                    "pattern_similarity": round(sim, 3),
                    "confidence": _confidence_badge(sim),
                    "ion_formula": str(best.get("ion_formula") or best.get("formula") or ""),
                    "neutral_formula": str(best.get("neutral_formula") or best.get("formula") or ""),
                }
            )

            # Build theoretical isotope envelope overlay trace for primary file
            if file_idx == 0 and p_idx < 3:
                theo_mz = best.get("theo_mz")
                theo_int = best.get("theo_intensity")
                if theo_mz is not None and theo_int is not None and len(theo_mz) > 0:
                    t_mz_arr = np.asarray(theo_mz, dtype=np.float64)
                    t_int_arr = np.asarray(theo_int, dtype=np.float64)
                    max_t = float(np.max(t_int_arr)) if len(t_int_arr) else 0.0
                    if max_t > 0:
                        scaled_int = t_int_arr / max_t * peak_int
                        primary_plot_series.append(
                            {
                                "name": f"Theoretical: {species_label} (N₀={n0}, sim={sim:.2f})",
                                "color": overlay_colors[p_idx % len(overlay_colors)],
                                "lineWidth": 2.2,
                                "points": [
                                    {"x": round(float(mx), 4), "y": round(float(iy), 2)}
                                    for mx, iy in zip(t_mz_arr, scaled_int)
                                ],
                            }
                        )

    all_assignments.sort(key=lambda r: (-r["rel_intensity_pct"], r["delta_X0_mz"]))
    best_cluster = next((r for r in all_assignments if r["n_Ag"] > 0), all_assignments[0] if all_assignments else None)

    headline = (
        f"Dominant Cluster: {best_cluster['species']} · N₀ = {best_cluster['N0_electrons']}e⁻ · "
        f"Pattern Similarity {best_cluster['pattern_similarity']:.1%} ({best_cluster['confidence']})"
        if best_cluster
        else "No high-confidence DNA–Ag compositions matched above cutoff."
    )

    response = {
        "summary": {
            "headline": headline,
            "files_processed": len(raw_files),
            "peaks_assigned": len(all_assignments),
            "dominant_species": best_cluster["species"] if best_cluster else "None",
            "dominant_n_Ag": best_cluster["n_Ag"] if best_cluster else 0,
            "dominant_N0": best_cluster["N0_electrons"] if best_cluster else 0,
            "dominant_similarity": best_cluster["pattern_similarity"] if best_cluster else 0.0,
            "input_sequence": seq_clean,
            "sanitizer_reports": sanitizer_reports,
            "license_notice": "CC BY-NC 4.0 (Academic & Non-Commercial Research Only — Lin & Copp, ACS Meas. Sci. Au 2026)",
        },
        "table": all_assignments,
        "plot": {
            "kind": "spectrum_overlay",
            "title": f"ESI-MS Experimental Spectrum & Theoretical Isotope Envelope Overlay ({seq_clean})",
            "xLabel": "m/z",
            "yLabel": "Signal Intensity (counts)",
            "series": primary_plot_series,
        },
        "chained_outputs": {
            "NanoclusterStoichiometryTable": all_assignments,
            "NucleicAcidSequenceList": [seq_clean],
        },
    }
    if len(_RUN_CACHE) < 64:
        _RUN_CACHE[cache_key] = response
    return response
