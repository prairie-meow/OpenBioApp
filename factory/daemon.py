"""Nightly Background Daemon & Firestore 'openbioapp' Catalog Sync CLI for OpenBioApp."""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import subprocess
from typing import Any

import httpx
import yaml

from factory.agents import (
    BioUIArchitectAgent,
    CatalogPublisherAgent,
    ChiefEditorAgent,
    CoreExtractorPorterAgent,
    FeedbackHealerAgent,
    QAValidationReport,
    ScientificQAValidatorAgent,
    ScoutLicenseAuditorAgent,
)

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FIRESTORE_PROJECT = "openbioapp"
FIRESTORE_DB = "openbioapp"
FIRESTORE_BASE_URL = (
    f"https://firestore.googleapis.com/v1/projects/{FIRESTORE_PROJECT}/databases/{FIRESTORE_DB}/documents"
)

STARTER_MANIFESTS: list[dict[str, Any]] = [
    {
        "id": "nucleospec-dna-agnc",
        "version": "1.0.0",
        "status_badge": "verified",
        "title": "NucleoSpec: DNA–Ag Nanocluster ESI-MS Analyzer",
        "category": "metabolomics",
        "source": {
            "repo_url": "https://github.com/copplab/NucleoSpec",
            "doi": "10.1021/acsmeasuresciau.6c00178",
            "citation": "Lin, I.-H.; Copp, S. M. ACS Meas. Sci. Au 2026.",
        },
        "license": {"spdx": "CC-BY-NC-4.0", "commercial_safe": False, "badge_label": "Academic & Non-Commercial (CC BY-NC 4.0)"},
        "runtime": {"tier": "cloud-run-cpu-worker", "entrypoint": "app.engines.nucleospec_engine:run_nucleospec_auto_assign"},
        "io_contract": {
            "input_bio_types": ["MassSpectrumPeakList", "NucleicAcidSequence"],
            "output_bio_types": ["NanoclusterStoichiometryTable", "NucleicAcidSequence"],
            "auto_sanitizers": ["strip_ms_vendor_headers", "extract_mz_intensity_columns"],
        },
    },
    {
        "id": "pydeseq2-deg",
        "version": "1.4.2",
        "status_badge": "verified",
        "title": "PyDESeq2 Differential Expression Studio",
        "category": "genomics",
        "source": {
            "repo_url": "https://github.com/owkin/PyDESeq2",
            "doi": "10.1093/bioinformatics/btad547",
            "citation": "Muzellec, B. et al. Bioinformatics 2023.",
        },
        "license": {"spdx": "MIT", "commercial_safe": True, "badge_label": "Commercial Safe (MIT)"},
        "runtime": {"tier": "cloud-run-cpu-worker", "entrypoint": "app.engines.deg_engine:run_deseq2_deg"},
        "io_contract": {
            "input_bio_types": ["GeneCountMatrix"],
            "output_bio_types": ["DifferentialExpressionTable", "GeneSymbolList"],
            "auto_sanitizers": ["restore_excel_date_genes", "strip_ensembl_version"],
        },
    },
    {
        "id": "opentargets-explorer",
        "version": "24.09",
        "status_badge": "verified",
        "title": "OpenTargets Disease–Target Evidence Explorer",
        "category": "clinical",
        "source": {
            "repo_url": "https://github.com/opentargets/platform-app",
            "doi": "10.1093/nar/gkac1046",
            "citation": "Ochoa, D. et al. Nucleic Acids Res. 2023.",
        },
        "license": {"spdx": "Apache-2.0", "commercial_safe": True, "badge_label": "Commercial Safe (Apache-2.0)"},
        "runtime": {"tier": "public-bio-api", "endpoint": "https://api.platform.opentargets.org/api/v4/graphql"},
        "io_contract": {
            "input_bio_types": ["DiseaseQuery"],
            "output_bio_types": ["TargetAssociationTable", "GeneSymbolList"],
        },
    },
    {
        "id": "alphafold-pdb-studio",
        "version": "4.1.0",
        "status_badge": "verified",
        "title": "AlphaFold DB & RCSB 3D Structure Inspector",
        "category": "structural-bio",
        "source": {
            "repo_url": "https://github.com/google-deepmind/alphafold",
            "doi": "10.1093/nar/gkad1011",
            "citation": "Varadi, M. et al. Nucleic Acids Res. 2024.",
        },
        "license": {"spdx": "CC-BY-4.0", "commercial_safe": True, "badge_label": "Commercial Safe (CC-BY 4.0)"},
        "runtime": {"tier": "public-bio-api", "endpoint": "https://alphafold.ebi.ac.uk/api/prediction"},
        "io_contract": {
            "input_bio_types": ["ProteinAccession", "GeneSymbolList"],
            "output_bio_types": ["ProteinStructure3D"],
        },
    },
    {
        "id": "rdkit-molecular-profiler",
        "version": "2026.09",
        "status_badge": "verified",
        "title": "RDKit MedChem & PAINS Profiler",
        "category": "drug-discovery",
        "source": {
            "repo_url": "https://github.com/rdkit/rdkit",
            "doi": "10.5281/zenodo.591637",
            "citation": "Landrum, G. et al. RDKit Open-Source Cheminformatics.",
        },
        "license": {"spdx": "BSD-3-Clause", "commercial_safe": True, "badge_label": "Commercial Safe (BSD-3)"},
        "runtime": {"tier": "cloud-run-cpu-worker", "entrypoint": "app.engines.rdkit_engine:run_rdkit_profiler"},
        "io_contract": {
            "input_bio_types": ["SMILESList", "SMILESTable"],
            "output_bio_types": ["SMILESTable"],
        },
    },
    {
        "id": "chembl-drug-finder",
        "version": "34.0",
        "status_badge": "verified",
        "title": "ChEMBL Clinical Drug Repurposer",
        "category": "drug-discovery",
        "source": {
            "repo_url": "https://github.com/chembl/chembl_webresource_client",
            "doi": "10.1093/nar/gkad1004",
            "citation": "Zdrazil, B. et al. Nucleic Acids Res. 2024.",
        },
        "license": {"spdx": "CC-BY-SA-3.0", "commercial_safe": True, "badge_label": "Open Data (CC BY-SA 3.0)"},
        "runtime": {"tier": "public-bio-api", "endpoint": "https://www.ebi.ac.uk/chembl/api/data"},
        "io_contract": {
            "input_bio_types": ["GeneSymbolList", "TargetAssociationTable"],
            "output_bio_types": ["SMILESTable", "SMILESList"],
        },
    },
    {
        "id": "gseapy-enrichr",
        "version": "1.1.4",
        "status_badge": "verified",
        "title": "GSEApy & Enrichr Pathway Enrichment Explorer",
        "category": "pipelines",
        "source": {
            "repo_url": "https://github.com/zqfang/GSEApy",
            "doi": "10.1093/bioinformatics/btac757",
            "citation": "Fang, Z. et al. Bioinformatics 2023.",
        },
        "license": {"spdx": "MIT", "commercial_safe": True, "badge_label": "Commercial Safe (MIT)"},
        "runtime": {"tier": "public-bio-api", "endpoint": "https://maayanlab.cloud/Enrichr"},
        "io_contract": {
            "input_bio_types": ["GeneSymbolList"],
            "output_bio_types": ["PathwayEnrichmentTable"],
        },
    },
    {
        "id": "clinvar-variant-annotator",
        "version": "3.2.0",
        "status_badge": "verified",
        "title": "ClinVar & MyVariant Pathogenicity Annotator",
        "category": "clinical",
        "source": {
            "repo_url": "https://github.com/biothings/myvariant.info",
            "doi": "10.1186/s13059-016-0953-9",
            "citation": "Xin, J. et al. Genome Biol. 2016.",
        },
        "license": {"spdx": "Apache-2.0", "commercial_safe": True, "badge_label": "Commercial Safe (Apache-2.0)"},
        "runtime": {"tier": "public-bio-api", "endpoint": "https://myvariant.info/v1/query"},
        "io_contract": {
            "input_bio_types": ["VariantList", "GeneSymbolList"],
            "output_bio_types": ["VariantAnnotationTable"],
        },
    },
    {
        "id": "primer3-biopython",
        "version": "2.6.1",
        "status_badge": "verified",
        "title": "Primer3 & Biopython Oligo Design Suite",
        "category": "synbio",
        "source": {
            "repo_url": "https://github.com/primer3-org/primer3",
            "doi": "10.1093/nar/gks596",
            "citation": "Untergasser, A. et al. Nucleic Acids Res. 2012.",
        },
        "license": {"spdx": "BSD-3-Clause", "commercial_safe": True, "badge_label": "Commercial Safe (BSD-3)"},
        "runtime": {"tier": "browser-wasm"},
        "io_contract": {
            "input_bio_types": ["NucleicAcidSequence"],
            "output_bio_types": ["PrimerDesignTable"],
        },
    },
    {
        "id": "crispr-guide-scorer",
        "version": "2.1.0",
        "status_badge": "verified",
        "title": "CRISPR–Cas9 & Cas12a Guide RNA Designer",
        "category": "crispr",
        "source": {
            "repo_url": "https://github.com/pinellolab/CRISPResso2",
            "doi": "10.1038/nbt.3437",
            "citation": "Doench, J. G. et al. Nat. Biotechnol. 2016.",
        },
        "license": {"spdx": "MIT", "commercial_safe": True, "badge_label": "Commercial Safe (MIT)"},
        "runtime": {"tier": "browser-wasm"},
        "io_contract": {
            "input_bio_types": ["NucleicAcidSequence"],
            "output_bio_types": ["CrisprGuideTable"],
        },
    },
    {
        "id": "lifelines-survival",
        "version": "0.30.0",
        "status_badge": "verified",
        "title": "Lifelines Clinical Kaplan–Meier & Biomarker Survival",
        "category": "biostats",
        "source": {
            "repo_url": "https://github.com/CamDavidsonPilon/lifelines",
            "doi": "10.21105/joss.01317",
            "citation": "Davidson-Pilon, C. JOSS 2019.",
        },
        "license": {"spdx": "MIT", "commercial_safe": True, "badge_label": "Commercial Safe (MIT)"},
        "runtime": {"tier": "cloud-run-cpu-worker", "entrypoint": "app.engines.survival_engine:run_lifelines_survival"},
        "io_contract": {
            "input_bio_types": ["ClinicalSurvivalCohort"],
            "output_bio_types": ["SurvivalSummaryTable"],
        },
    },
    {
        "id": "celltypist-annotator",
        "version": "1.6.3",
        "status_badge": "verified",
        "title": "CellTypist Immune & Tissue Single-Cell Classifier",
        "category": "single-cell",
        "source": {
            "repo_url": "https://github.com/Teichlab/celltypist",
            "doi": "10.1126/science.abl5197",
            "citation": "Domínguez Conde, C. et al. Science 2022.",
        },
        "license": {"spdx": "MIT", "commercial_safe": True, "badge_label": "Commercial Safe (MIT)"},
        "runtime": {"tier": "cloud-run-cpu-worker", "entrypoint": "app.engines.celltypist_engine:run_celltypist_annotator"},
        "io_contract": {
            "input_bio_types": ["SingleCellClusterMatrix"],
            "output_bio_types": ["CellTypeAnnotationTable"],
        },
    },
    {
        "id": "smart-table-filter",
        "version": "1.0.0",
        "status_badge": "utility-bridge",
        "title": "Smart Bio-Table Filter & Top-K Selector",
        "category": "pipelines",
        "source": {"repo_url": "https://github.com/prairie-meow/OpenBioApp", "citation": "OpenBioApp Bridge Block"},
        "license": {"spdx": "Apache-2.0", "commercial_safe": True, "badge_label": "OpenBioApp Bridge (Apache-2.0)"},
        "runtime": {"tier": "browser-wasm"},
        "io_contract": {
            "input_bio_types": ["AnyDataTable"],
            "output_bio_types": ["GeneSymbolList", "SMILESList", "AnyDataTable"],
        },
    },
    {
        "id": "bio-id-harmonizer",
        "version": "1.0.0",
        "status_badge": "utility-bridge",
        "title": "Universal Bio-ID Harmonizer",
        "category": "genomics",
        "source": {"repo_url": "https://github.com/biothings/mygene.info", "citation": "MyGene.info v3"},
        "license": {"spdx": "Apache-2.0", "commercial_safe": True, "badge_label": "OpenBioApp Bridge (Apache-2.0)"},
        "runtime": {"tier": "public-bio-api"},
        "io_contract": {
            "input_bio_types": ["BioIdentifierList", "GeneSymbolList"],
            "output_bio_types": ["GeneSymbolList", "ProteinAccession"],
        },
    },
    {
        "id": "batch-result-aggregator",
        "version": "1.0.0",
        "status_badge": "utility-bridge",
        "title": "Consensus Rank Aggregator",
        "category": "bio-agents",
        "source": {"repo_url": "https://github.com/prairie-meow/OpenBioApp", "citation": "OpenBioApp Bridge Block"},
        "license": {"spdx": "Apache-2.0", "commercial_safe": True, "badge_label": "OpenBioApp Bridge (Apache-2.0)"},
        "runtime": {"tier": "browser-wasm"},
        "io_contract": {
            "input_bio_types": ["AnyDataTable"],
            "output_bio_types": ["GeneSymbolList", "AnyDataTable"],
        },
    },
]


def _to_firestore_value(val: Any) -> dict[str, Any]:
    if val is None:
        return {"nullValue": None}
    if isinstance(val, bool):
        return {"booleanValue": val}
    if isinstance(val, int):
        return {"integerValue": str(val)}
    if isinstance(val, float):
        return {"doubleValue": val}
    if isinstance(val, str):
        return {"stringValue": val}
    if isinstance(val, list):
        return {"arrayValue": {"values": [_to_firestore_value(x) for x in val]}}
    if isinstance(val, dict):
        return {"mapValue": {"fields": {str(k): _to_firestore_value(v) for k, v in val.items()}}}
    return {"stringValue": str(val)}


def get_gcloud_access_token() -> str:
    proc = subprocess.run(
        ["gcloud", "auth", "print-access-token"],
        capture_output=True,
        text=True,
        check=True,
    )
    return proc.stdout.strip()


class NightlyRepoToAppFactory:
    """Orchestrates all 7 subagents across local apps/ manifests and Firestore ('openbioapp' DB)."""

    def __init__(self, repo_root: str = REPO_ROOT) -> None:
        self.repo_root = repo_root
        self.editor = ChiefEditorAgent()
        self.scout = ScoutLicenseAuditorAgent()
        self.porter = CoreExtractorPorterAgent()
        self.architect = BioUIArchitectAgent()
        self.validator = ScientificQAValidatorAgent()
        self.publisher = CatalogPublisherAgent()
        self.healer = FeedbackHealerAgent()

    def convert_repository_candidate(
        self,
        app_id: str,
        title: str,
        repo_url: str,
        license_text: str,
        raw_code: str,
        sample_output: dict[str, Any],
        doi: str | None = None,
        citation: str = "Open-source scientific repository",
        input_bio_types: list[str] | None = None,
        output_bio_types: list[str] | None = None,
    ) -> tuple[dict[str, Any], QAValidationReport, str | None]:
        lic = self.scout.audit_license(license_text)
        if not lic.eligible:
            return {}, QAValidationReport(False, 0.0, 0.0, 0, veto_reason=lic.reason), None

        ported = self.porter.port_source_code(app_id, raw_code, domain_hint=title)
        manifest = self.architect.build_manifest(
            app_id=app_id,
            title=title,
            repo_url=repo_url,
            doi=doi,
            citation=citation,
            license_audit=lic,
            porting=ported,
            input_bio_types=input_bio_types or ["AnyDataTable"],
            output_bio_types=output_bio_types or ["AnyDataTable"],
            description=title,
        )
        qa = self.validator.validate_candidate(manifest, sample_output)
        if not qa.passed:
            return manifest, qa, None

        yaml_path = self.publisher.write_local_app_bundle(self.repo_root, manifest, qa)
        return manifest, qa, yaml_path

    def write_all_starter_manifests(self) -> list[str]:
        written: list[str] = []
        for m in STARTER_MANIFESTS:
            app_dir = os.path.join(self.repo_root, "apps", m["id"])
            os.makedirs(app_dir, exist_ok=True)
            path = os.path.join(app_dir, "bioapp.yaml")
            with open(path, "w", encoding="utf-8") as fh:
                yaml.safe_dump(m, fh, sort_keys=False, allow_unicode=True)
            written.append(path)
        return written

    def sync_starter_catalog_to_firestore(self) -> int:
        token = get_gcloud_access_token()
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        now_iso = dt.datetime.now(dt.timezone.utc).isoformat()
        synced = 0

        with httpx.Client(timeout=20.0) as client:
            for m in STARTER_MANIFESTS:
                doc_id = m["id"]
                doc_fields = {
                    "id": m["id"],
                    "name": m["title"],
                    "version": m["version"],
                    "statusBadge": m["status_badge"],
                    "categoryId": m["category"],
                    "licenseSpdx": m["license"]["spdx"],
                    "commercialSafe": m["license"]["commercial_safe"],
                    "sourceRepo": m["source"]["repo_url"],
                    "updatedAtIso": now_iso,
                }
                resp = client.patch(
                    f"{FIRESTORE_BASE_URL}/apps/{doc_id}",
                    headers=headers,
                    json={"fields": {k: _to_firestore_value(v) for k, v in doc_fields.items()}},
                )
                resp.raise_for_status()
                synced += 1

            # Also publish Nightly Factory release feed document
            rel_fields = {
                "releaseId": "release-2026-11-17-v1",
                "title": "OpenBioApp Initial 15-Block Verified Catalog & NucleoSpec Studio",
                "appsPublished": len(STARTER_MANIFESTS),
                "publishedAtIso": now_iso,
                "notes": "Published 12 cross-domain zero-GPU open-source bio apps (led by Copp Lab NucleoSpec) + 3 deterministic data-bridge blocks.",
            }
            r_rel = client.patch(
                f"{FIRESTORE_BASE_URL}/releases/release-2026-11-17-v1",
                headers=headers,
                json={"fields": {k: _to_firestore_value(v) for k, v in rel_fields.items()}},
            )
            r_rel.raise_for_status()

        return synced


def main() -> None:
    parser = argparse.ArgumentParser(description="OpenBioApp 7-Subagent Nightly Factory CLI")
    parser.add_argument("--write-manifests", action="store_true", help="Write all starter bioapp.yaml files to apps/")
    parser.add_argument("--seed-firestore", action="store_true", help="Seed starter catalog into Firestore 'openbioapp' DB")
    args = parser.parse_args()

    factory = NightlyRepoToAppFactory()
    if args.write_manifests:
        paths = factory.write_all_starter_manifests()
        print(json.dumps({"written_manifests": len(paths)}))
    if args.seed_firestore:
        count = factory.sync_starter_catalog_to_firestore()
        print(json.dumps({"firestore_apps_synced": count, "database": FIRESTORE_DB}))


if __name__ == "__main__":
    main()
