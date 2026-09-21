#!/usr/bin/env python3
"""
Module 01 Lab: Environment Setup, Model Discovery & Token Economics Verification
================================================================================
Verifies authentication (GEMINI_API_KEY or Application Default Credentials),
probes the current Gemini model families via the unified `google-genai` SDK,
runs a token accounting check (`client.models.count_tokens`), exercises BOTH
the modern Interactions API and the classic `generate_content` path, and prints
a diagnostic health report.

Usage:
    export GEMINI_API_KEY="your-api-key"
    python verify_setup.py

Docs:
    https://ai.google.dev/gemini-api/docs/models
    https://ai.google.dev/gemini-api/docs/interactions-overview
"""

import os
import sys
import time
from typing import Dict, List, Tuple

from google import genai
from google.genai import types

# The default workhorse for every lab in this course.
DEFAULT_MODEL = "gemini-3.8-flash"

# The model families the course actually exercises. Each entry is
# (model_id, friendly_label, what_it_is_used_for).
PROBE_TARGETS: List[Tuple[str, str, str]] = [
    (DEFAULT_MODEL, "Gemini 3.8 Flash", "Text, reasoning, structured output, agents"),
    ("gemini-3.1-flash-image", "Nano Banana 2", "Default production image generation"),
    ("gemini-3-pro-image", "Nano Banana Pro", "4K hero renders, precise text rendering"),
    ("gemini-omni-1.1-flash", "Gemini Omni Flash", "Video generation and editing"),
    ("gemini-3.8-live", "Gemini 3.8 Live", "Real-time voice and video agents"),
]


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


def probe_model_families(client: genai.Client) -> List[Dict[str, str]]:
    """Checks each model family this course depends on against the live catalog.

    Returns one row per probe target describing whether the current credentials
    can actually see that model.
    """
    try:
        available = {
            (model.name or "").replace("models/", "").lower()
            for model in client.models.list()
        }
    except Exception as exc:  # noqa: BLE001 - surfaced in the health report, not fatal.
        available = set()
        print(f"[WARN] Could not list models: {exc}", file=sys.stderr)

    rows: List[Dict[str, str]] = []
    for model_id, label, purpose in PROBE_TARGETS:
        if model_id in available:
            status = "AVAILABLE"
        elif any(name.startswith(model_id) for name in available):
            # Catalog sometimes exposes a dated/suffixed alias of the same family.
            status = "AVAILABLE (aliased)"
        elif not available:
            status = "UNKNOWN"
        else:
            status = "NOT VISIBLE"
        rows.append(
            {
                "model_id": model_id,
                "label": label,
                "purpose": purpose,
                "status": status,
            }
        )
    return rows


def run_token_economics_check(
    client: genai.Client, model_id: str = DEFAULT_MODEL
) -> Dict[str, int]:
    """Counts tokens on a sample prompt and measures classic generate_content latency."""
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


def run_interactions_smoke_test(
    client: genai.Client, model_id: str = DEFAULT_MODEL
) -> Dict[str, str]:
    """Exercises the Interactions API, the surface the rest of this course teaches.

    `thinking_level` replaces the old numeric reasoning budget and accepts
    "low", "medium", or "high".
    """
    start = time.perf_counter()
    interaction = client.interactions.create(
        model=model_id,
        input="Reply with exactly the word: READY",
        generation_config={"thinking_level": "low"},
    )
    elapsed_ms = int((time.perf_counter() - start) * 1000)
    return {
        "reply": (interaction.output_text or "").strip(),
        "interaction_id": getattr(interaction, "id", "") or "(not returned)",
        "latency_ms": str(elapsed_ms),
    }


def print_health_table(
    auth_desc: str,
    family_rows: List[Dict[str, str]],
    metrics: Dict[str, int],
    interactions: Dict[str, str],
) -> None:
    """Renders a clean ASCII diagnostic health table to stdout."""
    line = "=" * 78
    print(f"\n{line}")
    print("  GOOGLE AI STUDIO & GEMINI SDK — DIAGNOSTIC HEALTH REPORT")
    print(line)
    print(f"  Auth Mode          : {auth_desc}")
    print(f"  Python Runtime     : {sys.version.split()[0]}")
    print(f"  google-genai SDK   : {getattr(genai, '__version__', 'installed')}")
    print(f"  Default Model      : {DEFAULT_MODEL}")
    print("-" * 78)
    print("  MODEL FAMILY AVAILABILITY")
    for row in family_rows:
        print(f"    - {row['model_id']:<24} {row['status']:<20} {row['label']}")
        print(f"      {'':<24} {'':<20} {row['purpose']}")
    print("-" * 78)
    print(f"  TOKEN ECONOMICS & LATENCY — classic generate_content ({DEFAULT_MODEL})")
    print(f"    - Preflight count_tokens()   : {metrics['preflight_tokens']} tokens")
    print(f"    - Actual Prompt Tokens       : {metrics['prompt_tokens']} tokens")
    print(f"    - Output Candidate Tokens    : {metrics['candidates_tokens']} tokens")
    print(f"    - Total Billed Tokens        : {metrics['total_tokens']} tokens")
    print(f"    - Round-trip Latency         : {metrics['latency_ms']} ms")
    print("-" * 78)
    print(f"  INTERACTIONS API SMOKE TEST ({DEFAULT_MODEL}, thinking_level=low)")
    print(f"    - Model Reply                : {interactions['reply']}")
    print(f"    - Interaction ID             : {interactions['interaction_id']}")
    print(f"    - Round-trip Latency         : {interactions['latency_ms']} ms")
    print(line)
    print("  STATUS: READY FOR MODULE 02 (PROMPTS, STRUCTURED OUTPUTS, NANO BANANA & OMNI)")
    print(f"{line}\n")


def main() -> int:
    auth_desc, ok = check_auth_mode()
    if not ok:
        print(f"[ERROR] {auth_desc}", file=sys.stderr)
        print("Tip: Get a free API key at https://aistudio.google.com/apikey", file=sys.stderr)
        return 1

    client = genai.Client()
    family_rows = probe_model_families(client)
    metrics = run_token_economics_check(client)
    interactions = run_interactions_smoke_test(client)
    print_health_table(auth_desc, family_rows, metrics, interactions)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
