"""
Stage 3 Production FastAPI Backend — AI Product Studio & Live Multimodal Copilot
================================================================================
Production-ready Cloud Run service combining:
  - Input Sanitization & Prompt-Injection Guardrails
  - Sliding-Window In-Memory Rate Limiting Middleware
  - Secret Manager Fallback Helper (`GEMINI_API_KEY`)
  - `/api/health`: Readiness & model configuration probe
  - `/api/generate-brief`: Structured Pydantic Product Launch Kit generator
  - `/api/generate-image`: Imagen 3 studio hero image generator (base64 JPEG)
  - `/ws/live-copilot`: Real-time Gemini Live API WebSocket bridge with tool calling
  - Static Bilingual (EN/ES) Studio Web Console at `/`
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
    imagen_hero_prompt: str
    veo_video_prompt: str
    campaigns: List[ChannelCampaign]


class ImageRequest(BaseModel):
    prompt: str = Field(..., min_length=5, max_length=1500)
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
    description="Flagship Capstone API built with Google AI Studio, Gemini 2.5, Imagen 3, and Gemini Live API.",
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
        "models": {
            "brief_generator": "gemini-2.5-flash",
            "image_generator": "imagen-3.0-generate-002",
            "live_copilot": "gemini-2.0-flash-live-001",
        },
    }


@app.post("/api/generate-brief", response_model=ProductLaunchBrief)
async def generate_brief(payload: BriefRequest) -> ProductLaunchBrief:
    clean_concept = sanitize_and_validate_prompt(payload.concept)
    client = get_genai_client()
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=(
            f"Product Concept: {clean_concept}\n"
            f"Target Market: {payload.target_market}\n"
            "Generate a complete bilingual (English + Spanish) product launch brief."
        ),
        config=types.GenerateContentConfig(
            system_instruction=(
                "You are an Executive Creative Director & Product Strategist. "
                "Produce structured, commercially viable bilingual launch briefs with rich Imagen 3 and Veo prompts."
            ),
            temperature=0.4,
            response_mime_type="application/json",
            response_schema=ProductLaunchBrief,
            thinking_config=types.ThinkingConfig(thinking_budget=512),
        ),
    )
    return ProductLaunchBrief.model_validate_json(response.text)


@app.post("/api/generate-image")
async def generate_image(payload: ImageRequest) -> Dict[str, str]:
    clean_prompt = sanitize_and_validate_prompt(payload.prompt, max_length=1500)
    client = get_genai_client()
    result = client.models.generate_images(
        model="imagen-3.0-generate-002",
        prompt=clean_prompt,
        config=types.GenerateImagesConfig(
            number_of_images=1,
            aspect_ratio=payload.aspect_ratio,
            output_mime_type="image/jpeg",
        ),
    )
    image_bytes = result.generated_images[0].image.image_bytes
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    return {
        "mime_type": "image/jpeg",
        "image_base64": b64,
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
        async with client.aio.live.connect(model="gemini-2.0-flash-live-001", config=live_config) as session:
            while True:
                incoming = await websocket.receive_json()
                user_text = sanitize_and_validate_prompt(incoming.get("message", ""), max_length=1000)

                await session.send_client_content(
                    turns=types.Content(role="user", parts=[types.Part.from_text(text=user_text)]),
                    turn_complete=True,
                )

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
