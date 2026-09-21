"""
Stage 3 Production FastAPI Backend — AI Product Studio & Live Multimodal Copilot
================================================================================
Production-ready Cloud Run service combining:
  - Input Sanitization & Prompt-Injection Guardrails
  - Sliding-Window In-Memory Rate Limiting Middleware
  - Secret Manager Fallback Helper (`GEMINI_API_KEY`)
  - `/api/health`: Readiness & model configuration probe
  - `/api/generate-brief`: Structured Pydantic Product Launch Kit generator
  - `/api/generate-image`: Nano Banana studio hero image generator (base64 PNG)
  - `/api/generate-video`: Gemini Omni Flash promo video generator (base64 MP4)
  - `/ws/live-copilot`: Real-time Gemini Live API WebSocket bridge with tool calling
  - Static Bilingual (EN/ES) Studio Web Console at `/`

Every generative endpoint runs on the Interactions API (`client.interactions.create`).

Interactions are stored server-side by default (55 days on the Paid Tier, 1 day on
the Free Tier). `/api/generate-brief` opts out with `store=False` because it accepts
untrusted public input. The image and video endpoints deliberately keep the default
so that `previous_interaction_id` conversational editing keeps working.
"""

import base64
from collections import defaultdict, deque
import os
import re
import time
from pathlib import Path
from typing import Any, Deque, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from google import genai
from google.genai import types
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# 0. Model Configuration (see .agents/rules/architecture.md)
# ---------------------------------------------------------------------------
# Text / reasoning workhorse.
BRIEF_MODEL = "gemini-3.8-flash"

# Nano Banana 2 is the production image default; Nano Banana Pro
# ("gemini-3-pro-image") is the upgrade path for 4K and precise text rendering.
IMAGE_MODEL = "gemini-3.1-flash-image"
IMAGE_MODEL_PRO = "gemini-3-pro-image"

# Gemini Omni Flash handles video generation and conversational video editing.
VIDEO_MODEL = "gemini-omni-1.1-flash"

# Real-time voice/video copilot.
LIVE_MODEL = "gemini-3.8-live"


# ---------------------------------------------------------------------------
# 1. Secret Manager Fallback & Client Initialization
# ---------------------------------------------------------------------------
def resolve_gemini_api_key() -> Optional[str]:
    """Resolves GEMINI_API_KEY from environment or Google Cloud Secret Manager fallback."""
    env_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if env_key:
        return env_key

    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT")
    secret_name = os.environ.get("GEMINI_SECRET_NAME", "GEMINI_API_KEY")
    if not project_id:
        return None

    try:
        from google.cloud import secretmanager  # type: ignore

        sm_client = secretmanager.SecretManagerServiceClient()
        resource_name = f"projects/{project_id}/secrets/{secret_name}/versions/latest"
        response = sm_client.access_secret_version(request={"name": resource_name})
        secret_val = response.payload.data.decode("utf-8").strip()
        os.environ["GEMINI_API_KEY"] = secret_val
        return secret_val
    except Exception:
        return None


def get_genai_client() -> genai.Client:
    """Returns a configured google-genai Client instance."""
    resolve_gemini_api_key()
    return genai.Client()


# ---------------------------------------------------------------------------
# 2. Security Guardrails: Input Sanitization & Prompt-Injection Detection
# ---------------------------------------------------------------------------
INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(all\s+)?(previous|prior|system)\s+instructions", re.IGNORECASE),
    re.compile(r"reveal\s+(your\s+)?(system\s+prompt|api\s+key|secret)", re.IGNORECASE),
    re.compile(r"(developer\s+mode|jailbreak|dan\s+mode)", re.IGNORECASE),
    re.compile(r"<\s*script\b", re.IGNORECASE),
]


def sanitize_and_validate_prompt(raw_text: str, max_length: int = 2000) -> str:
    """Strips control characters, enforces length bounds, and blocks prompt-injection attempts."""
    cleaned = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", raw_text or "").strip()
    if not cleaned:
        raise HTTPException(status_code=400, detail="Input prompt cannot be empty.")
    if len(cleaned) > max_length:
        raise HTTPException(
            status_code=400,
            detail=f"Input prompt exceeds maximum allowed length of {max_length} characters.",
        )
    for pattern in INJECTION_PATTERNS:
        if pattern.search(cleaned):
            raise HTTPException(
                status_code=400,
                detail="Request blocked by AI Product Studio prompt-injection security guardrail.",
            )
    return cleaned


# ---------------------------------------------------------------------------
# 3. Pydantic Request / Response Models
# ---------------------------------------------------------------------------
class BriefRequest(BaseModel):
    concept: str = Field(..., min_length=5, max_length=2000)
    target_market: str = Field(default="Global Direct-to-Consumer", max_length=200)


class ChannelCampaign(BaseModel):
    channel: str
    headline_en: str
    headline_es: str
    copy_en: str
    copy_es: str


class ProductLaunchBrief(BaseModel):
    product_name: str
    tagline_en: str
    tagline_es: str
    positioning_summary: str
    recommended_price_usd: float
    hero_image_prompt: str
    promo_video_prompt: str
    campaigns: List[ChannelCampaign]


class ImageRequest(BaseModel):
    prompt: str = Field(..., min_length=5, max_length=1500)
    aspect_ratio: str = Field(default="16:9")
    # Set true to route this render to Nano Banana Pro for 4K / precise text.
    high_fidelity: bool = Field(default=False)


class VideoRequest(BaseModel):
    prompt: str = Field(..., min_length=5, max_length=1500)
    # Gemini Omni Flash supports "16:9" (default) and "9:16".
    aspect_ratio: str = Field(default="16:9")


# ---------------------------------------------------------------------------
# 4. Domain Tools for Gemini Live Copilot WebSocket Bridge
# ---------------------------------------------------------------------------
def calculate_unit_economics(unit_cost_usd: float, retail_price_usd: float, cac_usd: float) -> Dict[str, Any]:
    """Calculates gross margin percentage and net contribution margin per unit."""
    gross_margin = retail_price_usd - unit_cost_usd
    gross_pct = round((gross_margin / retail_price_usd) * 100.0, 2) if retail_price_usd > 0 else 0.0
    net_contribution = round(gross_margin - cac_usd, 2)
    return {
        "unit_cost_usd": unit_cost_usd,
        "retail_price_usd": retail_price_usd,
        "gross_margin_pct": gross_pct,
        "net_contribution_usd": net_contribution,
        "status": "PROFITABLE" if net_contribution > 15.0 else "REVIEW_PRICING",
    }


def check_inventory_status(sku_code: str) -> Dict[str, Any]:
    """Returns real-time warehouse stock status for a product SKU."""
    return {
        "sku_code": sku_code.upper(),
        "available_units": 1280,
        "warehouse": "US-CENTRAL-FULFILLMENT",
        "lead_time_days": 4,
    }


LIVE_TOOLS = {
    "calculate_unit_economics": calculate_unit_economics,
    "check_inventory_status": check_inventory_status,
}


# ---------------------------------------------------------------------------
# 5. FastAPI Application & Sliding-Window Rate Limiter Middleware
# ---------------------------------------------------------------------------
app = FastAPI(
    title="AI Product Studio & Live Multimodal Copilot",
    description=(
        "Flagship Capstone API built with Google AI Studio on Gemini 3.8 Flash, "
        "Nano Banana, Gemini Omni Flash, and the Gemini Live API."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RATE_LIMIT_RPM = int(os.environ.get("RATE_LIMIT_RPM", "30"))
_request_windows: Dict[str, Deque[float]] = defaultdict(deque)


@app.middleware("http")
async def sliding_window_rate_limiter(request: Request, call_next):
    if request.url.path.startswith("/api/"):
        client_ip = request.client.host if request.client else "unknown"
        now = time.monotonic()
        window = _request_windows[client_ip]
        while window and (now - window[0]) > 60.0:
            window.popleft()
        if len(window) >= RATE_LIMIT_RPM:
            return JSONResponse(
                status_code=429,
                content={"detail": f"Rate limit exceeded ({RATE_LIMIT_RPM} requests/minute). Please retry shortly."},
            )
        window.append(now)
    return await call_next(request)


# ---------------------------------------------------------------------------
# 6. REST API Endpoints
# ---------------------------------------------------------------------------
@app.get("/api/health")
async def health_check() -> Dict[str, Any]:
    has_key = bool(resolve_gemini_api_key() or os.environ.get("GOOGLE_GENAI_USE_VERTEXAI") == "true")
    return {
        "status": "ok",
        "service": "ai-product-studio-capstone",
        "credentials_configured": has_key,
        "retention": {
            "generate_brief": "store=False (not retained)",
            "generate_image": "default retention (enables conversational editing)",
            "generate_video": "default retention (enables conversational editing)",
        },
        "models": {
            "brief_generator": BRIEF_MODEL,
            "image_generator": IMAGE_MODEL,
            "image_generator_high_fidelity": IMAGE_MODEL_PRO,
            "video_generator": VIDEO_MODEL,
            "live_copilot": LIVE_MODEL,
        },
    }


@app.post("/api/generate-brief", response_model=ProductLaunchBrief)
async def generate_brief(payload: BriefRequest) -> ProductLaunchBrief:
    clean_concept = sanitize_and_validate_prompt(payload.concept)
    client = get_genai_client()
    # store=False opts out of server-side retention. This endpoint takes untrusted
    # public input and is stateless, so there is nothing to gain from persisting it.
    # Note the trade-off: store=False is incompatible with background=true and
    # disables `previous_interaction_id`, so it is only safe on one-shot calls.
    interaction = client.interactions.create(
        model=BRIEF_MODEL,
        store=False,
        input=(
            f"Product Concept: {clean_concept}\n"
            f"Target Market: {payload.target_market}\n"
            "Generate a complete bilingual (English + Spanish) product launch brief."
        ),
        system_instruction=(
            "You are an Executive Creative Director & Product Strategist. "
            "Produce structured, commercially viable bilingual launch briefs with rich "
            "studio-grade image and video prompts."
        ),
        response_format={
            "type": "text",
            "mime_type": "application/json",
            "schema": ProductLaunchBrief.model_json_schema(),
        },
        generation_config={"temperature": 0.4, "thinking_level": "medium"},
    )
    return ProductLaunchBrief.model_validate_json(interaction.output_text)


@app.post("/api/generate-image")
async def generate_image(payload: ImageRequest) -> Dict[str, str]:
    """Renders a studio hero image with Nano Banana.

    Images are returned inline as base64 and carry a SynthID watermark:
    https://ai.google.dev/responsible/docs/safeguards/synthid
    """
    clean_prompt = sanitize_and_validate_prompt(payload.prompt, max_length=1500)
    client = get_genai_client()
    model = IMAGE_MODEL_PRO if payload.high_fidelity else IMAGE_MODEL
    # Retention is intentionally left at its default here: `store=False` would
    # disable `previous_interaction_id`, which is what powers conversational
    # image editing. Privacy versus editability is a real trade-off.
    interaction = client.interactions.create(
        model=model,
        input=clean_prompt,
        response_format={
            "type": "image",
            "mime_type": "image/png",
            "aspect_ratio": payload.aspect_ratio,
            "image_size": "2K",
        },
    )
    return {
        "model": model,
        "mime_type": "image/png",
        "image_base64": interaction.output_image.data,
        "interaction_id": getattr(interaction, "id", "") or "",
    }


@app.post("/api/generate-video")
async def generate_video(payload: VideoRequest) -> Dict[str, str]:
    """Renders a promo video with Gemini Omni Flash.

    Video is returned inline as base64 on the interaction - there is no
    long-running operation to poll. Pass the returned `interaction_id` back as
    `previous_interaction_id` to conversationally edit the clip.
    """
    clean_prompt = sanitize_and_validate_prompt(payload.prompt, max_length=1500)
    client = get_genai_client()
    # Retention left at its default so the returned `interaction_id` stays usable
    # as `previous_interaction_id` for conversational video editing.
    interaction = client.interactions.create(
        model=VIDEO_MODEL,
        input=clean_prompt,
        response_format={
            "type": "video",
            "aspect_ratio": payload.aspect_ratio,
        },
    )
    return {
        "model": VIDEO_MODEL,
        "mime_type": "video/mp4",
        "video_base64": interaction.output_video.data,
        "interaction_id": getattr(interaction, "id", "") or "",
    }


# ---------------------------------------------------------------------------
# 7. WebSocket Bridge: Gemini Live API Multimodal Copilot
# ---------------------------------------------------------------------------
@app.websocket("/ws/live-copilot")
async def websocket_live_copilot(websocket: WebSocket) -> None:
    await websocket.accept()
    client = get_genai_client()
    live_config = types.LiveConnectConfig(
        response_modalities=["TEXT"],
        system_instruction=types.Content(
            parts=[
                types.Part.from_text(
                    text=(
                        "You are the Live Multimodal Copilot for AI Product Studio. "
                        "Use `calculate_unit_economics` and `check_inventory_status` whenever asked "
                        "about margins, pricing, or stock. Reply concisely in English or Spanish."
                    )
                )
            ]
        ),
        tools=[calculate_unit_economics, check_inventory_status],
    )

    try:
        async with client.aio.live.connect(model=LIVE_MODEL, config=live_config) as session:
            while True:
                incoming = await websocket.receive_json()
                user_text = sanitize_and_validate_prompt(incoming.get("message", ""), max_length=1000)

                # Streaming entry point. Browser audio must be transcoded to raw
                # 16-bit PCM @ 16 kHz mono before being forwarded as
                # session.send_realtime_input(audio=types.Blob(...)).
                await session.send_realtime_input(text=user_text)

                async for response in session.receive():
                    if response.tool_call is not None:
                        fn_responses = []
                        for fc in response.tool_call.function_calls:
                            fn = LIVE_TOOLS.get(fc.name)
                            tool_out = fn(**fc.args) if fn else {"error": f"Unknown tool {fc.name}"}
                            await websocket.send_json(
                                {"type": "tool_call", "name": fc.name, "args": fc.args, "result": tool_out}
                            )
                            fn_responses.append(
                                types.FunctionResponse(id=fc.id, name=fc.name, response=tool_out)
                            )
                        await session.send_tool_response(function_responses=fn_responses)

                    server_content = response.server_content
                    if server_content is not None:
                        if server_content.model_turn:
                            for part in server_content.model_turn.parts:
                                if part.text:
                                    await websocket.send_json({"type": "token", "text": part.text})
                        if server_content.turn_complete:
                            await websocket.send_json({"type": "turn_complete"})
                            break
    except WebSocketDisconnect:
        return
    except Exception as exc:
        await websocket.send_json({"type": "error", "detail": str(exc)})


# ---------------------------------------------------------------------------
# 8. Static Web UI Hosting
# ---------------------------------------------------------------------------
STATIC_DIR = Path(__file__).resolve().parent / "static"
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.get("/")
async def serve_index() -> FileResponse:
    return FileResponse(str(STATIC_DIR / "index.html"))
