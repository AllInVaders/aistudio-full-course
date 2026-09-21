#!/usr/bin/env python3
"""
Module 01 Lab: Environment Setup, Model Discovery & Token Economics Verification
================================================================================
Verifies authentication (GEMINI_API_KEY or Application Default Credentials),
discovers available Gemini, Imagen 3, and Veo models via the unified `google-genai`
SDK, runs a token accounting check (`client.models.count_tokens`), and prints a
diagnostic health report.

Usage:
    export GEMINI_API_KEY="your-api-key"
    python verify_setup.py
"""

import os
import sys
import time
from typing import Dict, List, Tuple

from google import genai
from google.genai import types


def check_auth_mode() -> Tuple[str, bool]:
    """Detects whether the environment is configured via API Key or Vertex AI ADC."""
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    use_vertex = os.environ.get("GOOGLE_GENAI_USE_VERTEXAI", "").lower() == "true"

    if use_vertex:
        project = os.environ.get("GOOGLE_CLOUD_PROJECT", "(default project)")
        location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")
        return f"Vertex AI ADC (project={project}, location={location})", True
    if api_key:
        masked = f"{api_key[:6]}...{api_key[-4:]}" if len(api_key) > 10 else "***"
        return f"Gemini Developer API Key ({masked})", True
    return "Missing Credentials (set GEMINI_API_KEY or GOOGLE_GENAI_USE_VERTEXAI=true)", False


def discover_models(client: genai.Client) -> Dict[str, List[str]]:
    """Lists available models grouped by modality family (Gemini, Imagen, Veo, Embeddings)."""
    families: Dict[str, List[str]] = {
        "Gemini (Text / Multimodal / Live)": [],
        "Imagen (Image Generation)": [],
        "Veo (Video Generation)": [],
        "Embeddings": [],
    }
    for model in client.models.list():
        name = (model.name or "").replace("models/", "")
        lowered = name.lower()
        if "imagen" in lowered:
            families["Imagen (Image Generation)"].append(name)
        elif "veo" in lowered:
            families["Veo (Video Generation)"].append(name)
        elif "embedding" in lowered:
            families["Embeddings"].append(name)
        elif "gemini" in lowered:
            families["Gemini (Text / Multimodal / Live)"].append(name)

    for key in families:
        families[key] = sorted(families[key])
    return families


def run_token_economics_check(client: genai.Client, model_id: str = "gemini-2.5-flash") -> Dict[str, int]:
    """Counts tokens on a sample prompt and estimates input/output cost per 1M tokens."""
    sample_prompt = (
        "You are an AI Product Studio strategist. Summarize the three pillars of a "
        "high-converting product launch brief (Positioning, Visual Identity, Unit Economics) "
        "in exactly 3 concise bullet points."
    )
    token_resp = client.models.count_tokens(
        model=model_id,
        contents=sample_prompt,
    )
    start = time.perf_counter()
    gen_resp = client.models.generate_content(
        model=model_id,
        contents=sample_prompt,
        config=types.GenerateContentConfig(
            temperature=0.2,
            max_output_tokens=256,
        ),
    )
    elapsed_ms = int((time.perf_counter() - start) * 1000)
    usage = gen_resp.usage_metadata
    return {
        "preflight_tokens": token_resp.total_tokens or 0,
        "prompt_tokens": (usage.prompt_token_count if usage else 0) or 0,
        "candidates_tokens": (usage.candidates_token_count if usage else 0) or 0,
        "total_tokens": (usage.total_token_count if usage else 0) or 0,
        "latency_ms": elapsed_ms,
    }


def print_health_table(auth_desc: str, families: Dict[str, List[str]], metrics: Dict[str, int]) -> None:
    """Renders a clean ASCII diagnostic health table to stdout."""
    line = "=" * 78
    print(f"\n{line}")
    print("  GOOGLE AI STUDIO & GEMINI SDK — DIAGNOSTIC HEALTH REPORT")
    print(line)
    print(f"  Auth Mode          : {auth_desc}")
    print(f"  Python Runtime     : {sys.version.split()[0]}")
    print(f"  google-genai SDK   : {getattr(genai, '__version__', 'installed')}")
    print("-" * 78)
    print("  MODEL FAMILY AVAILABILITY")
    for family, models in families.items():
        preview = ", ".join(models[:4]) if models else "None detected for this key/project"
        suffix = f" (+{len(models) - 4} more)" if len(models) > 4 else ""
        print(f"    - {family:<34}: {len(models):>2} models | {preview}{suffix}")
    print("-" * 78)
    print("  TOKEN ECONOMICS & LATENCY CHECK (gemini-2.5-flash)")
    print(f"    - Preflight count_tokens()   : {metrics['preflight_tokens']} tokens")
    print(f"    - Actual Prompt Tokens       : {metrics['prompt_tokens']} tokens")
    print(f"    - Output Candidate Tokens    : {metrics['candidates_tokens']} tokens")
    print(f"    - Total Billed Tokens        : {metrics['total_tokens']} tokens")
    print(f"    - Round-trip Latency         : {metrics['latency_ms']} ms")
    print(line)
    print("  STATUS: READY FOR MODULE 02 (PROMPTS, STRUCTURED OUTPUTS, IMAGEN 3 & VEO)")
    print(f"{line}\n")


def main() -> int:
    auth_desc, ok = check_auth_mode()
    if not ok:
        print(f"[ERROR] {auth_desc}", file=sys.stderr)
        print("Tip: Get a free API key at https://aistudio.google.com/apikey", file=sys.stderr)
        return 1

    client = genai.Client()
    families = discover_models(client)
    metrics = run_token_economics_check(client)
    print_health_table(auth_desc, families, metrics)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
