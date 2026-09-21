# Antigravity Workspace Architecture Rules — AI Product Studio

> **Workspace Graduation Rule**: This file configures autonomous coding agents (such as Google Antigravity) with architectural guardrails for maintaining and extending the **AI Product Studio & Live Multimodal Copilot** service.

## 1. SDK & Model Mandates

- **Unified SDK Only**: All Python code must use `google-genai` (`from google import genai`). Never import legacy `google-generativeai` or `vertexai.preview` modules.
- **Interactions API is the standard surface**: every generative call must go through `client.interactions.create(...)`. `client.models.generate_content` is permitted only for token-accounting demos and explicitly labelled "classic path" teaching examples.

### Enforced model IDs

These are the only model IDs allowed in this workspace. Verified against
https://ai.google.dev/gemini-api/docs/models.

| Role | Model ID | Notes |
| :--- | :--- | :--- |
| Structured reasoning & JSON schema generation (default) | `gemini-3.8-flash` | Bound to `BRIEF_MODEL` in `app/main.py` |
| Complex multi-step architectural reasoning | `gemini-3.1-pro-preview` | Preview tier; use sparingly |
| High-volume classification / routing | `gemini-3.5-flash-lite` | Cheapest tier |
| Photorealistic product imagery (default) | `gemini-3.1-flash-image` | Nano Banana 2, bound to `IMAGE_MODEL` |
| 4K hero renders / precise in-image text | `gemini-3-pro-image` | Nano Banana Pro, bound to `IMAGE_MODEL_PRO` |
| Cinematic product motion teasers | `gemini-omni-1.1-flash` | Gemini Omni Flash, bound to `VIDEO_MODEL` |
| Low-latency bidirectional voice/text + tool calling | `gemini-3.8-live` | Bound to `LIVE_MODEL` |
| Background reasoning during live voice | `gemini-3.8-live-extended-thinking` | Opt-in upgrade for `LIVE_MODEL` |
| Agentic coding | `antigravity-preview-05-2026` | Antigravity IDE |

Agents MUST NOT introduce a model ID that is absent from this table. Model IDs
are defined once as module constants at the top of `app/main.py`; reference the
constant, never a string literal.

### Required API shapes

- **Reasoning control** is `generation_config={"thinking_level": "low"|"medium"|"high"}`. The numeric `thinking_budget` parameter no longer exists.
- **Structured output** is `response_format={"type": "text", "mime_type": "application/json", "schema": Model.model_json_schema()}`.
- **Images** are `response_format={"type": "image", "mime_type": "image/png", "aspect_ratio": ..., "image_size": ...}`, read back from `interaction.output_image.data` (base64).
- **Video** is `response_format={"type": "video", "aspect_ratio": "16:9"|"9:16"}`, read back from `interaction.output_video.data` (base64). Video generation is synchronous — do not add operation-polling loops.
- **Multi-turn / conversational editing** uses `previous_interaction_id=interaction.id`. Remember that `tools`, `system_instruction`, and `generation_config` are interaction-scoped and must be re-specified on every turn.
- **Live sessions** stream via `await session.send_realtime_input(...)`. Audio input must be raw 16-bit PCM, 16 kHz, little-endian, mono.
- **Retention** is controlled by `store`. Interactions are stored by default (55 days Paid Tier, 1 day Free Tier). Pass `store=False` on stateless endpoints that accept untrusted public input. `store=False` is incompatible with `background=true` and disables `previous_interaction_id`, so never set it on a call whose id is later chained for conversational editing.
- **Safety settings** belong on the classic `client.models.generate_content` path via `types.GenerateContentConfig(safety_settings=[...])`. The Interactions API spelling is not documented — do not invent one.

> **Legacy migration note.** Imagen and Veo are retired. `client.models.generate_images()`
> and `client.models.generate_videos()` no longer represent the current surface — use
> `client.interactions.create()` with `response_format` instead. Likewise `thinking_budget`
> was replaced by `thinking_level`, and `gemini-3.8-live` is superseded by
> `gemini-3.8-live`. See https://ai.google.dev/gemini-api/docs/migrate-to-interactions

## 2. Security & Reliability Guardrails

- Every user-supplied text input MUST pass through `sanitize_and_validate_prompt()` before being sent to any model endpoint. This applies to `/api/generate-brief`, `/api/generate-image`, `/api/generate-video`, and `/ws/live-copilot`.
- API keys must never be hardcoded or logged; always resolve credentials via `GEMINI_API_KEY` environment injection from Google Cloud Secret Manager or Vertex AI Application Default Credentials (ADC).
- All structured endpoints must enforce Pydantic schemas by passing `Model.model_json_schema()` through `response_format`, and must validate the reply with `Model.model_validate_json(interaction.output_text)`.
- The sliding-window rate limiter and CORS middleware apply to every `/api/` route. New endpoints inherit them automatically — do not bypass the middleware chain.
- Generated images carry a SynthID watermark. Do not strip or misrepresent it: https://ai.google.dev/responsible/docs/safeguards/synthid
- `/api/generate-brief` MUST keep `store=False`. It accepts untrusted public input and has no multi-turn requirement, so retaining it server-side buys nothing and adds exposure.
