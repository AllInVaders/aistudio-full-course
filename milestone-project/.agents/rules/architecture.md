# Antigravity Workspace Architecture Rules — AI Product Studio

> **Workspace Graduation Rule**: This file configures autonomous coding agents (such as Google Antigravity) with architectural guardrails for maintaining and extending the **AI Product Studio & Live Multimodal Copilot** service.

## 1. SDK & Model Mandates
- **Unified SDK Only**: All Python code must use `google-genai` (`from google import genai`, `from google.genai import types`). Never import legacy `google-generativeai` or `vertexai.preview` modules.
- **Model Selection**:
  - Fast structured reasoning & JSON schema generation: `gemini-2.5-flash`
  - Complex multi-step architectural reasoning: `gemini-2.5-pro`
  - Photorealistic product imagery: `imagen-3.0-generate-002`
  - Cinematic product motion teasers: `veo-2.0-generate-001`
  - Low-latency bidirectional voice/text + tool calling: `gemini-2.0-flash-live-001`

## 2. Security & Reliability Guardrails
- Every user-supplied text input MUST pass through `sanitize_and_validate_prompt()` before being sent to any model endpoint.
- API keys must never be hardcoded or logged; always resolve credentials via `GEMINI_API_KEY` environment injection from Google Cloud Secret Manager or Vertex AI Application Default Credentials (ADC).
- All structured endpoints must enforce Pydantic schemas via `response_mime_type="application/json"` and `response_schema=...`.
