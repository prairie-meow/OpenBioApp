"""OpenBioApp Unified Tier 2 Scientific Worker (FastAPI on Google Cloud Run)."""
from __future__ import annotations

import json
import time
from typing import Any

import httpx
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.engines.celltypist_engine import run_celltypist_annotator
from app.engines.deg_engine import run_deseq2_deg
from app.engines.nucleospec_engine import run_nucleospec_auto_assign
from app.engines.rdkit_engine import run_rdkit_profiler
from app.engines.survival_engine import run_lifelines_survival

app = FastAPI(
    title="OpenBioApp Scientific Worker",
    version="1.0.0",
    description="Stateless zero-retention CPU scientific execution engine for OpenBioApp.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPPORTED_WORKER_APPS = [
    "nucleospec-dna-agnc",
    "pydeseq2-deg",
    "rdkit-molecular-profiler",
    "lifelines-survival",
    "celltypist-annotator",
]


class JsonRunRequest(BaseModel):
    params: dict[str, Any] = {}
    chained_data: Any = None
    use_sample: bool = False


@app.get("/api/health")
def health_check() -> dict[str, Any]:
    return {
        "status": "healthy",
        "service": "openbioapp-worker",
        "version": "1.0.0",
        "zero_retention": True,
        "supported_apps": SUPPORTED_WORKER_APPS,
    }


def _dispatch_engine(
    app_id: str,
    params: dict[str, Any],
    uploaded: list[tuple[str, bytes]],
) -> dict[str, Any]:
    t0 = time.perf_counter()
    if app_id == "nucleospec-dna-agnc":
        res = run_nucleospec_auto_assign(
            raw_files=uploaded or None,
            analysis_mode=str(params.get("analysis_mode") or "dna_agn"),
            sequence_or_formula=str(params.get("sequence_or_formula") or "ATCCCCTGTC"),
            strand2_sequence=str(params.get("strand2_sequence") or ""),
            max_peaks_to_assign=int(params.get("max_peaks_to_assign") or 5),
            similarity_cutoff=float(params.get("similarity_cutoff") or 0.45),
        )
    elif app_id == "pydeseq2-deg":
        fbytes = uploaded[0][1] if uploaded else None
        fname = uploaded[0][0] if uploaded else "airway_dex_counts.csv"
        res = run_deseq2_deg(
            raw_bytes=fbytes,
            filename=fname,
            fdr_threshold=float(params.get("fdr_threshold") or 0.05),
            log2fc_threshold=float(params.get("log2fc_threshold") or 1.0),
        )
    elif app_id == "rdkit-molecular-profiler":
        raw_text = params.get("smiles_input")
        if uploaded:
            raw_text = uploaded[0][1].decode("utf-8", errors="ignore")
        smiles_items = params.get("smiles_items") if isinstance(params.get("smiles_items"), list) else None
        res = run_rdkit_profiler(
            smiles_items=smiles_items,
            raw_smiles_text=str(raw_text) if raw_text else None,
        )
    elif app_id == "lifelines-survival":
        fbytes = uploaded[0][1] if uploaded else None
        fname = uploaded[0][0] if uploaded else "cohort_survival.csv"
        res = run_lifelines_survival(
            raw_bytes=fbytes,
            filename=fname,
            time_col=str(params.get("time_col") or "time_months"),
            event_col=str(params.get("event_col") or "event"),
            group_col=str(params.get("group_col") or "group"),
        )
    elif app_id == "celltypist-annotator":
        fbytes = uploaded[0][1] if uploaded else None
        fname = uploaded[0][0] if uploaded else "pbmc_cluster_expression.csv"
        res = run_celltypist_annotator(raw_bytes=fbytes, filename=fname)
    else:
        raise HTTPException(status_code=404, detail=f"Unknown worker app_id: {app_id}")

    elapsed_ms = round((time.perf_counter() - t0) * 1000.0, 1)
    res["execution_meta"] = {
        "app_id": app_id,
        "runtime_tier": "cloud-run-cpu-worker",
        "elapsed_ms": elapsed_ms,
        "ephemeral_deleted": True,
    }
    return res


class EnrichrProxyRequest(BaseModel):
    genes: list[str]
    gene_set_library: str = "KEGG_2021_Human"


@app.post("/api/proxy/enrichr")
async def proxy_enrichr(body: EnrichrProxyRequest) -> dict[str, Any]:
    cleaned = [g.strip().upper() for g in body.genes if g and g.strip()]
    if not cleaned:
        raise HTTPException(status_code=400, detail="At least one gene symbol is required.")
    try:
        async with httpx.AsyncClient(timeout=18.0, follow_redirects=True) as client:
            r_add = await client.post(
                "https://maayanlab.cloud/Enrichr/addList",
                files={
                    "list": (None, "\n".join(cleaned)),
                    "description": (None, "OpenBioApp Pathway Query"),
                },
            )
            r_add.raise_for_status()
            user_list_id = r_add.json().get("userListId")
            r_en = await client.get(
                "https://maayanlab.cloud/Enrichr/enrich",
                params={"userListId": user_list_id, "backgroundType": body.gene_set_library},
            )
            r_en.raise_for_status()
            raw_rows = r_en.json().get(body.gene_set_library, [])
            return {"library": body.gene_set_library, "rows": raw_rows[:25], "input_count": len(cleaned)}
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Enrichr upstream error: {exc}") from exc


@app.post("/api/apps/{app_id}/run")
async def run_app_json(app_id: str, body: JsonRunRequest) -> dict[str, Any]:
    try:
        return _dispatch_engine(app_id, body.params, [])
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Execution failed: {exc}") from exc


@app.post("/api/apps/{app_id}/run-multipart")
async def run_app_multipart(
    app_id: str,
    params_json: str = Form("{}"),
    files: list[UploadFile] = File(default=[]),
) -> dict[str, Any]:
    try:
        params = json.loads(params_json) if params_json else {}
        uploaded: list[tuple[str, bytes]] = []
        for uf in files:
            content = await uf.read()
            if len(content) > 25 * 1024 * 1024:
                raise ValueError(f"File '{uf.filename}' exceeds 25 MB per-file limit.")
            uploaded.append((uf.filename or "uploaded.txt", content))
        return _dispatch_engine(app_id, params, uploaded)
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Execution failed: {exc}") from exc
