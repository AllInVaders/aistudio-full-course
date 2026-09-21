---
name: product-studio-ops
description: Operates, validates, tests, and deploys the AI Product Studio & Live Multimodal Copilot Cloud Run service. Use when adding new Live API tools, updating structured Pydantic launch schemas, adding image or video generation endpoints, running smoke tests, or deploying to Cloud Run.
---

# AI Product Studio Operations Skill (`product-studio-ops`)

This skill equips an autonomous Antigravity agent with standard operating procedures for extending and verifying the **AI Product Studio & Live Multimodal Copilot** application.

## 0. Enforced Model Standard

Model IDs are declared once as constants at the top of `app/main.py`. Always
reference the constant, never a literal. See `.agents/rules/architecture.md`
for the full table and the required API shapes.

| Constant | Model ID | Role |
| :--- | :--- | :--- |
| `BRIEF_MODEL` | `gemini-3.8-flash` | Structured bilingual launch briefs |
| `IMAGE_MODEL` | `gemini-3.1-flash-image` | Nano Banana 2 — default hero renders |
| `IMAGE_MODEL_PRO` | `gemini-3-pro-image` | Nano Banana Pro — 4K / precise in-image text |
| `VIDEO_MODEL` | `gemini-omni-1.1-flash` | Gemini Omni Flash — promo clips |
| `LIVE_MODEL` | `gemini-3.8-live` | Real-time copilot |

Every generative call uses `client.interactions.create(...)`. Reasoning depth is
`generation_config={"thinking_level": ...}`. Introducing a model ID not listed
above, or reintroducing `thinking_budget`, `generate_images`, or
`generate_videos`, is a build-breaking regression.

## 1. Local Verification & Health Check

1. Start the FastAPI server locally:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
   ```
2. Probe readiness and model bindings:
   ```bash
   curl -s http://localhost:8080/api/health | jq .
   ```
   The `models` block must report `gemini-3.8-flash`, `gemini-3.1-flash-image`,
   `gemini-3-pro-image`, `gemini-omni-1.1-flash`, and `gemini-3.8-live`.

## 2. Smoke-Testing the Generative Endpoints

```bash
# Structured brief (gemini-3.8-flash + thinking_level)
curl -s -X POST http://localhost:8080/api/generate-brief \
  -H 'Content-Type: application/json' \
  -d '{"concept":"AeroBrew Nano: pocket ultrasonic cold-brew espresso maker"}' | jq .

# Hero image (Nano Banana). Add "high_fidelity": true to route to Nano Banana Pro.
curl -s -X POST http://localhost:8080/api/generate-image \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"matte black espresso maker on travertine, 85mm macro, warm rim light"}' \
  | jq -r .image_base64 | base64 -d > /tmp/hero.png

# Promo video (Gemini Omni Flash)
curl -s -X POST http://localhost:8080/api/generate-video \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"slow cinematic dolly-in, steam rising, shallow depth of field"}' \
  | jq -r .video_base64 | base64 -d > /tmp/promo.mp4
```

Each generative response also returns an `interaction_id`. Pass it back as
`previous_interaction_id` to conversationally edit the asset instead of
regenerating it from scratch.

## 3. Adding a New Tool to the Live Copilot

1. Define a strongly-typed Python function with a clear docstring in `app/main.py`.
2. Register the function in `LIVE_TOOLS` and append it to `LiveConnectConfig(tools=[...])`.
3. Verify tool invocation over WebSocket at `/ws/live-copilot`. Turns are sent with
   `await session.send_realtime_input(...)`; audio must be raw 16-bit PCM at 16 kHz.

## 4. Adding a New Generative Endpoint

1. Add a Pydantic request model with `min_length` / `max_length` bounds.
2. Call `sanitize_and_validate_prompt()` on every user-supplied string first — this is non-negotiable.
3. Use `client.interactions.create(...)` with the appropriate `response_format`.
4. Keep the route under the `/api/` prefix so it inherits the sliding-window rate limiter and CORS policy.
5. Extend `/api/health` so the new model binding is observable.

## 5. Cloud Run Production Deployment

Execute the automated least-privilege deployment script:
```bash
export GOOGLE_CLOUD_PROJECT="your-gcp-project-id"
./deploy-cloudrun.sh
```

## References

- Interactions API: https://ai.google.dev/gemini-api/docs/interactions-overview
- Image generation: https://ai.google.dev/gemini-api/docs/image-generation
- Video generation: https://ai.google.dev/gemini-api/docs/omni
- Live API: https://ai.google.dev/gemini-api/docs/live-api
- Cloud Run: https://cloud.google.com/run/docs
