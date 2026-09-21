#!/usr/bin/env python3
"""
Module 03 Lab — Stage 2 of the Flagship Project: Live Multimodal Copilot + Tool Agent
=====================================================================================
Demonstrates an asynchronous Python agent built on the Gemini Live API
(`client.aio.live.connect(model="gemini-3.8-live", config=...)`) featuring:
  - Real-time bidirectional streaming (text / PCM audio ready)
  - Live Function Calling / Tool Execution (`calculate_unit_economics`,
    `check_inventory_status`, `generate_marketing_asset`)
  - Graceful barge-in interruption handling (`server_content.interrupted`)

Usage:
    export GEMINI_API_KEY="your-api-key"
    python live_copilot_agent.py
"""

import asyncio
from typing import Any, Dict

from google import genai
from google.genai import types


# ---------------------------------------------------------------------------
# 1. Domain Tools Exposed to the Live Copilot
# ---------------------------------------------------------------------------
def calculate_unit_economics(
    unit_cost_usd: float,
    retail_price_usd: float,
    customer_acquisition_cost_usd: float,
    monthly_fixed_overhead_usd: float = 5000.0,
) -> Dict[str, Any]:
    """Calculates gross margin, contribution margin, and break-even unit volume."""
    gross_margin_usd = retail_price_usd - unit_cost_usd
    gross_margin_pct = round((gross_margin_usd / retail_price_usd) * 100, 2) if retail_price_usd > 0 else 0.0
    contribution_margin_usd = round(gross_margin_usd - customer_acquisition_cost_usd, 2)
    break_even_units = (
        int((monthly_fixed_overhead_usd / contribution_margin_usd) + 0.999)
        if contribution_margin_usd > 0
        else -1
    )
    return {
        "retail_price_usd": retail_price_usd,
        "unit_cost_usd": unit_cost_usd,
        "gross_margin_pct": gross_margin_pct,
        "contribution_margin_usd": contribution_margin_usd,
        "break_even_monthly_units": break_even_units,
        "verdict": "HEALTHY" if contribution_margin_usd >= 15.0 else "TIGHT_MARGIN",
    }


def check_inventory_status(sku_code: str, warehouse_region: str = "NA-EAST") -> Dict[str, Any]:
    """Queries live warehouse stock levels, lead time, and reorder status for a SKU."""
    catalog = {
        "AEROBREW-NANO-BLK": {"available_units": 1420, "lead_time_days": 5, "status": "IN_STOCK"},
        "AEROBREW-NANO-SLV": {"available_units": 180, "lead_time_days": 14, "status": "LOW_STOCK"},
        "LUMENPULSE-PRO-01": {"available_units": 3100, "lead_time_days": 3, "status": "IN_STOCK"},
    }
    entry = catalog.get(
        sku_code.upper(),
        {"available_units": 450, "lead_time_days": 7, "status": "IN_STOCK"},
    )
    return {"sku_code": sku_code.upper(), "warehouse_region": warehouse_region, **entry}


def generate_marketing_asset(product_name: str, asset_type: str, visual_style: str) -> Dict[str, Any]:
    """Queues an Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2) / Gemini Omni 1.1 Flash (`gemini-omni-1.1-flash`) studio asset generation job and returns its job manifest."""
    job_id = f"studio-{abs(hash((product_name, asset_type, visual_style))) % 100000:05d}"
    return {
        "job_id": job_id,
        "product_name": product_name,
        "asset_type": asset_type,
        "visual_style": visual_style,
        "status": "QUEUED_IN_STUDIO_PIPELINE",
        "preview_url": f"https://storage.googleapis.com/demo-product-studio-assets/{job_id}.jpg",
    }


TOOL_DISPATCH = {
    "calculate_unit_economics": calculate_unit_economics,
    "check_inventory_status": check_inventory_status,
    "generate_marketing_asset": generate_marketing_asset,
}


# ---------------------------------------------------------------------------
# 2. Gemini Live API Session Configuration
# ---------------------------------------------------------------------------
LIVE_CONFIG = types.LiveConnectConfig(
    response_modalities=["TEXT"],
    system_instruction=types.Content(
        parts=[
            types.Part.from_text(
                text=(
                    "You are the Live Multimodal Copilot for AI Product Studio. "
                    "Use your tools whenever the user asks about pricing/unit economics, "
                    "warehouse SKU inventory, or generating new marketing visuals. "
                    "Answer concisely in English or Spanish matching the user's language."
                )
            )
        ]
    ),
    tools=[calculate_unit_economics, check_inventory_status, generate_marketing_asset],
)


async def handle_tool_calls(session: Any, tool_call: types.LiveServerToolCall) -> None:
    """Executes requested tool calls locally and streams FunctionResponses back to Gemini Live."""
    function_responses = []
    for fc in tool_call.function_calls:
        fn = TOOL_DISPATCH.get(fc.name)
        print(f"\n  [Tool Call] -> {fc.name}({fc.args})")
        if fn is None:
            result = {"error": f"Unknown tool: {fc.name}"}
        else:
            result = fn(**fc.args)
        print(f"  [Tool Result] <- {result}")
        function_responses.append(
            types.FunctionResponse(
                id=fc.id,
                name=fc.name,
                response=result,
            )
        )
    await session.send_tool_response(function_responses=function_responses)


async def run_live_session() -> None:
    """Runs an interactive multi-turn Gemini Live API session with tool use and barge-in handling."""
    client = genai.Client()
    model_id = "gemini-3.8-live"

    scripted_turns = [
        "Hi Copilot! Can you calculate the unit economics for AeroBrew Nano if our unit cost is $28, retail price is $99, and CAC is $24?",
        "Great! Also check warehouse inventory for SKU AEROBREW-NANO-BLK in NA-EAST and queue a hero banner asset in minimalist brushed-titanium style.",
    ]

    print(f"Connecting to Gemini Live API ({model_id})...")
    async with client.aio.live.connect(model=model_id, config=LIVE_CONFIG) as session:
        for turn_idx, user_message in enumerate(scripted_turns, start=1):
            print(f"\n[User Turn {turn_idx}]: {user_message}")
            await session.send_client_content(
                turns=types.Content(role="user", parts=[types.Part.from_text(text=user_message)]),
                turn_complete=True,
            )

            print("[Copilot]: ", end="", flush=True)
            async for response in session.receive():
                server_content = response.server_content
                if server_content is not None:
                    if server_content.interrupted:
                        print("\n  [Barge-in Detected] Generation interrupted by user stream.")
                        break
                    if server_content.model_turn:
                        for part in server_content.model_turn.parts:
                            if part.text:
                                print(part.text, end="", flush=True)
                    if server_content.turn_complete:
                        print()
                        break

                if response.tool_call is not None:
                    await handle_tool_calls(session, response.tool_call)


if __name__ == "__main__":
    asyncio.run(run_live_session())
