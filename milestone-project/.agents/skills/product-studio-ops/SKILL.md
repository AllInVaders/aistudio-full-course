---
name: product-studio-ops
description: Operates, validates, tests, and deploys the AI Product Studio & Live Multimodal Copilot Cloud Run service. Use when adding new Live API tools, updating structured Pydantic launch schemas, running smoke tests, or deploying to Cloud Run.
---

# AI Product Studio Operations Skill (`product-studio-ops`)

This skill equips an autonomous Antigravity agent with standard operating procedures for extending and verifying the **AI Product Studio & Live Multimodal Copilot** application.

## 1. Local Verification & Health Check
1. Start the FastAPI server locally:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
   ```
2. Probe readiness and model bindings:
   ```bash
   curl -s http://localhost:8080/api/health | jq .
   ```

## 2. Adding a New Tool to the Gemini Live Copilot
1. Define a strongly-typed Python function with a clear docstring in `app/main.py`.
2. Register the function in `LIVE_TOOLS` and append it to `LiveConnectConfig(tools=[...])`.
3. Verify tool invocation over WebSocket at `/ws/live-copilot`.

## 3. Cloud Run Production Deployment
Execute the automated least-privilege deployment script:
```bash
export GOOGLE_CLOUD_PROJECT="your-gcp-project-id"
./deploy-cloudrun.sh
```
