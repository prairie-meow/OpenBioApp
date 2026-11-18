"""Authentic RDKit molecular profiling, Lipinski/Veber druglikeness, QED, and PAINS/Brenk alerts."""
from __future__ import annotations

from typing import Any

from rdkit import Chem
from rdkit.Chem import Crippen, Descriptors, FilterCatalog, Lipinski, QED, rdMolDescriptors

# Initialize PAINS & Brenk structural alert catalogs once at module load
_pains_params = FilterCatalog.FilterCatalogParams()
_pains_params.AddCatalog(FilterCatalog.FilterCatalogParams.FilterCatalogs.PAINS)
_PAINS_CATALOG = FilterCatalog.FilterCatalog(_pains_params)

_brenk_params = FilterCatalog.FilterCatalogParams()
_brenk_params.AddCatalog(FilterCatalog.FilterCatalogParams.FilterCatalogs.BRENK)
_BRENK_CATALOG = FilterCatalog.FilterCatalog(_brenk_params)

SAMPLE_DRUG_SMILES = [
    {"name": "Imatinib", "smiles": "Cc1ccc(NC(=O)c2ccc(CN3CCN(C)CC3)cc2)cc1Nc1nccc(-c2cccnc2)n1"},
    {"name": "Osimertinib", "smiles": "COc1cc(N(C)CCN(C)C)c(NC(=O)C=C)cc1Nc1nccc(-c2cn(C)c3ccccc23)n1"},
    {"name": "Gefitinib", "smiles": "COc1cc2ncnc(Nc3ccc(F)c(Cl)c3)c2cc1OCCCN1CCOCC1"},
    {"name": "Rhodanine-PAINS-Control", "smiles": "O=C1CSC(=S)N1Cc1ccc(O)cc1"},
    {"name": "Aspirin", "smiles": "CC(=O)Oc1ccccc1C(=O)O"},
    {"name": "Venetoclax", "smiles": "CC1(C)CCC(CN2CCN(c3ccc(C(=O)NS(=O)(=O)c4ccc(NCC5CCOCC5)c([N+](=O)[O-])c4)c(Oc4cnc5[nH]ccc5c4)c3)CC2)=C(c2ccc(Cl)cc2)C1"},
    {"name": "Atorvastatin", "smiles": "CC(C)c1c(C(=O)Nc2ccccc2)c(-c2ccccc2)c(-c2ccc(F)cc2)n1CC[C@@H](O)C[C@@H](O)CC(=O)O"},
    {"name": "Sotorasib", "smiles": "C=CC(=O)N1CCN(c2nc(=O)n(-c3c(C)ccnc3C(C)C)c3nc(F)c(-c4c(O)cccc4F)cc23)[C@@H](C)C1"},
]


def run_rdkit_profiler(
    smiles_items: list[dict[str, str]] | None = None,
    raw_smiles_text: str | None = None,
) -> dict[str, Any]:
    """Compute exact RDKit physicochemical properties, QED, Lipinski Ro5, and PAINS/Brenk alerts."""
    records: list[dict[str, str]] = []
    if smiles_items:
        records = smiles_items
    elif raw_smiles_text and raw_smiles_text.strip():
        for idx, line in enumerate(raw_smiles_text.strip().splitlines(), start=1):
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            parts = line.split("\t") if "\t" in line else (line.split(",") if "," in line else line.split())
            if len(parts) >= 2 and not parts[0].startswith(("C", "c", "N", "O", "S", "F", "Cl", "Br", "[")):
                records.append({"name": parts[0].strip(), "smiles": parts[1].strip()})
            elif len(parts) >= 2:
                records.append({"smiles": parts[0].strip(), "name": parts[1].strip()})
            else:
                records.append({"name": f"Compound-{idx}", "smiles": parts[0].strip()})
    else:
        records = SAMPLE_DRUG_SMILES

    rows: list[dict[str, Any]] = []
    invalid_smiles: list[str] = []

    for idx, rec in enumerate(records, start=1):
        smi = (rec.get("smiles") or "").strip()
        name = (rec.get("name") or f"Compound-{idx}").strip()
        if not smi:
            continue
        mol = Chem.MolFromSmiles(smi)
        if mol is None:
            invalid_smiles.append(smi)
            continue

        canon_smi = Chem.MolToSmiles(mol, canonical=True)
        formula = rdMolDescriptors.CalcMolFormula(mol)
        mw = float(Descriptors.MolWt(mol))
        clogp = float(Crippen.MolLogP(mol))
        tpsa = float(rdMolDescriptors.CalcTPSA(mol))
        hbd = int(Lipinski.NumHDonors(mol))
        hba = int(Lipinski.NumHAcceptors(mol))
        rot_bonds = int(Lipinski.NumRotatableBonds(mol))
        rings = int(rdMolDescriptors.CalcNumRings(mol))
        fsp3 = float(rdMolDescriptors.CalcFractionCSP3(mol))
        qed_score = float(QED.qed(mol))

        ro5_violations = int(mw > 500) + int(clogp > 5) + int(hbd > 5) + int(hba > 10)
        veber_pass = rot_bonds <= 10 and tpsa <= 140.0

        pains_matches = [m.GetDescription() for m in _PAINS_CATALOG.GetMatches(mol)]
        brenk_matches = [m.GetDescription() for m in _BRENK_CATALOG.GetMatches(mol)]

        bbb_penetrant = (tpsa < 90.0) and (mw < 450.0) and (1.0 <= clogp <= 4.5) and (hbd <= 3)
        gi_absorption = "High" if (tpsa <= 131.6 and -0.7 <= clogp <= 5.0) else "Low"

        status = (
            "Alert (PAINS)"
            if pains_matches
            else ("Lead-like / Clean" if ro5_violations <= 1 and qed_score >= 0.45 else "Beyond Ro5")
        )

        rows.append(
            {
                "compound": name,
                "canonical_smiles": canon_smi,
                "formula": formula,
                "mw_da": round(mw, 2),
                "clogp": round(clogp, 2),
                "tpsa_a2": round(tpsa, 2),
                "hbd": hbd,
                "hba": hba,
                "rotatable_bonds": rot_bonds,
                "rings": rings,
                "fsp3": round(fsp3, 3),
                "qed_score": round(qed_score, 3),
                "lipinski_violations": ro5_violations,
                "veber_oral_pass": veber_pass,
                "gi_absorption": gi_absorption,
                "bbb_permeant": bbb_penetrant,
                "pains_alerts": ", ".join(pains_matches) if pains_matches else "None",
                "brenk_alerts": ", ".join(brenk_matches[:2]) if brenk_matches else "None",
                "medchem_verdict": status,
            }
        )

    rows.sort(key=lambda r: (r["pains_alerts"] != "None", -r["qed_score"]))
    clean_count = sum(1 for r in rows if r["pains_alerts"] == "None" and r["lipinski_violations"] <= 1)

    return {
        "summary": {
            "headline": f"Profiled {len(rows)} molecules via RDKit ({clean_count} Ro5-compliant & PAINS-free)",
            "total_valid": len(rows),
            "invalid_dropped": len(invalid_smiles),
            "clean_druglike_count": clean_count,
            "top_qed_compound": rows[0]["compound"] if rows else "N/A",
            "top_qed_score": rows[0]["qed_score"] if rows else 0.0,
        },
        "table": rows,
        "plot": {
            "kind": "scatter",
            "title": "Chemical Space: Lipophilicity (cLogP) vs Topological Polar Surface Area (TPSA)",
            "xLabel": "Wildman-Crippen cLogP",
            "yLabel": "TPSA (Å²)",
            "series": [
                {
                    "name": "PAINS-Free Compounds",
                    "color": "#007AFF",
                    "points": [
                        {
                            "x": r["clogp"],
                            "y": r["tpsa_a2"],
                            "label": f"{r['compound']} (QED {r['qed_score']})",
                            "size": max(6, round(r["qed_score"] * 14)),
                        }
                        for r in rows
                        if r["pains_alerts"] == "None"
                    ],
                },
                {
                    "name": "PAINS Structural Alert",
                    "color": "#FF3B30",
                    "points": [
                        {
                            "x": r["clogp"],
                            "y": r["tpsa_a2"],
                            "label": f"{r['compound']} ({r['pains_alerts']})",
                            "size": 11,
                        }
                        for r in rows
                        if r["pains_alerts"] != "None"
                    ],
                },
            ],
        },
        "chained_outputs": {
            "SMILESTable": rows,
        },
    }
