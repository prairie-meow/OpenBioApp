"""Automated test suite for OpenBioApp's 7-Subagent Nightly Repo-to-App Factory."""
from __future__ import annotations

import math
import os
import tempfile

from factory.agents import (
    ChiefEditorAgent,
    CoreExtractorPorterAgent,
    FeedbackHealerAgent,
    ScientificQAValidatorAgent,
    ScoutLicenseAuditorAgent,
)
from factory.daemon import NightlyRepoToAppFactory


def test_chief_editor_prioritizes_user_queue() -> None:
    editor = ChiefEditorAgent()
    queued = [{"repoUrl": "https://github.com/user/requested-tool"}]
    scout = [
        {"repoUrl": "https://github.com/user/requested-tool"},
        {"repoUrl": "https://github.com/org/discovered-tool"},
    ]
    backlog = editor.prioritize_backlog(queued, scout, nightly_quota=5)
    assert len(backlog) == 2
    assert backlog[0]["priority_source"] == "user_or_autoresearch_queue"
    assert backlog[1]["priority_source"] == "autonomous_nightly_scout"


def test_license_auditor_distinguishes_commercial_academic_and_proprietary() -> None:
    scout = ScoutLicenseAuditorAgent()

    mit_res = scout.audit_license("MIT License\nPermission is hereby granted, free of charge...")
    assert mit_res.eligible is True
    assert mit_res.commercial_safe is True
    assert mit_res.spdx == "MIT"

    cc_nc = scout.audit_license("Licensed under CC BY-NC 4.0 Attribution-NonCommercial")
    assert cc_nc.eligible is True
    assert cc_nc.commercial_safe is False
    assert cc_nc.spdx == "CC-BY-NC-4.0"

    prop = scout.audit_license("Copyright 2026 Acme Pharma. All rights reserved.")
    assert prop.eligible is False

    unlic = scout.audit_license("Just some README text without any license mention")
    assert unlic.eligible is False


def test_porter_patches_hardcoded_cuda_and_selects_sanitizers() -> None:
    porter = CoreExtractorPorterAgent()
    messy_gpu_code = """
import torch
model = MyBioNet().cuda()
x = tensor.to(torch.device('cuda:0'))
cfg = {'device': 'cuda'}
# m/z intensity mass spectrum parser
"""
    art = porter.port_source_code("demo-ms-tool", messy_gpu_code, "numpy==1.26.4\nscipy==1.14.1")
    assert art.cuda_calls_patched == 3
    assert ".cuda()" not in art.patched_code
    assert "strip_ms_vendor_headers" in art.auto_sanitizers


def test_qa_validator_vetoes_nan_and_empty_tables() -> None:
    qa = ScientificQAValidatorAgent()
    valid_manifest = {
        "id": "demo-app",
        "version": "0.1.0",
        "status_badge": "experimental",
        "title": "Demo",
        "source": {"repo_url": "https://github.com/org/demo"},
        "license": {"spdx": "MIT", "commercial_safe": True},
        "runtime": {"tier": "cloud-run-cpu-worker"},
        "io_contract": {"input_bio_types": ["AnyDataTable"], "output_bio_types": ["AnyDataTable"]},
    }
    bad_nan = qa.validate_candidate(valid_manifest, {"table": [{"gene": "TP53", "pval": math.nan}]})
    assert bad_nan.passed is False
    assert "NaN" in (bad_nan.veto_reason or "")

    bad_empty = qa.validate_candidate(valid_manifest, {"table": []})
    assert bad_empty.passed is False

    good = qa.validate_candidate(valid_manifest, {"table": [{"gene": "TP53", "pval": 0.0012}]})
    assert good.passed is True
    assert good.rows_verified == 1


def test_end_to_end_repo_conversion_and_healer() -> None:
    with tempfile.TemporaryDirectory() as tmpdir:
        factory = NightlyRepoToAppFactory(repo_root=tmpdir)
        manifest, qa, yaml_path = factory.convert_repository_candidate(
            app_id="scanpy-marker-demo",
            title="Scanpy Marker Finder",
            repo_url="https://github.com/scverse/scanpy",
            license_text="BSD 3-Clause License",
            raw_code="model = net.cuda()\n# gene expression count matrix",
            sample_output={"table": [{"gene": "CD3D", "score": 14.2}]},
            doi="10.1186/s13059-017-1382-0",
        )
        assert qa.passed is True
        assert yaml_path is not None and os.path.exists(yaml_path)
        assert manifest["license"]["spdx"] == "BSD-3-Clause"

        healer = FeedbackHealerAgent()
        patches = healer.diagnose_and_recommend_sanitizer(
            [{"appId": "pydeseq2-deg", "errorSummary": "Gene symbol 1-Mar converted to date"}]
        )
        assert patches[0]["recommendedSanitizer"] == "restore_excel_date_genes"
