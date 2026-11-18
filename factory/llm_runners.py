"""Pluggable LLM Runner supporting local CLI coding agents (Gemini/Claude CLI) and HTTP APIs."""
from __future__ import annotations

import json
import os
import shutil
import subprocess
from typing import Any

import httpx


class PluggableLLMRunner:
    """Executes structured JSON reasoning via Gemini API, OpenAI API, local CLI, or deterministic analyzer."""

    def __init__(self, preferred_backend: str = "auto") -> None:
        self.preferred_backend = preferred_backend

    def generate_json(self, system_prompt: str, user_prompt: str, fallback: dict[str, Any]) -> dict[str, Any]:
        gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()
        openai_key = os.environ.get("OPENAI_API_KEY", "").strip()

        if gemini_key and self.preferred_backend in ("auto", "gemini-api"):
            try:
                with httpx.Client(timeout=25.0) as client:
                    resp = client.post(
                        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_key}",
                        json={
                            "systemInstruction": {"parts": [{"text": system_prompt}]},
                            "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
                            "generationConfig": {"temperature": 0.1, "responseMimeType": "application/json"},
                        },
                    )
                    resp.raise_for_status()
                    txt = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
                    return json.loads(txt)
            except Exception:
                pass

        if openai_key and self.preferred_backend in ("auto", "openai-api"):
            try:
                with httpx.Client(timeout=25.0) as client:
                    resp = client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={"Authorization": f"Bearer {openai_key}"},
                        json={
                            "model": "gpt-4o-mini",
                            "temperature": 0.1,
                            "response_format": {"type": "json_object"},
                            "messages": [
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": user_prompt},
                            ],
                        },
                    )
                    resp.raise_for_status()
                    return json.loads(resp.json()["choices"][0]["message"]["content"])
            except Exception:
                pass

        if self.preferred_backend == "gemini-cli" and shutil.which("gemini"):
            try:
                proc = subprocess.run(
                    ["gemini", "-p", f"{system_prompt}\n\nReturn ONLY raw JSON:\n{user_prompt}"],
                    capture_output=True,
                    text=True,
                    timeout=40,
                    check=False,
                )
                raw = proc.stdout.strip()
                start = raw.find("{")
                end = raw.rfind("}")
                if start != -1 and end != -1:
                    return json.loads(raw[start : end + 1])
            except Exception:
                pass

        return fallback
