# 🚀 Google AI Studio & Gemini Full Course: Zero to Hero (English Edition)

Welcome to the **Google AI Studio, Gemini 3.8, Interactions API, Nano Banana, Gemini Omni Flash, Live API, Cloud Run & Google Antigravity** complete developer curriculum!

This open-source, hands-on engineering course takes you from your very first API call in **Google AI Studio** all the way to architecting, securing, deploying, and autonomously evolving a production-grade **AI Product Studio & Live Multimodal Copilot** on **Google Cloud Run** and **Google Antigravity** (`https://antigravity.google`).

> **Language / Idioma:** **English** | [Español (`../es/README.md`)](../es/README.md) | [Repository Root (`../README.md`)](../README.md)

---

## 🍌 Model Cheat Sheet (Latest as of 2026)

New to Gemini? Start here. These are the models you will actually use in this course — copy the **Model ID** column verbatim into your code.

| What you want to do | Model ID to use | Friendly name | Why this one |
| :--- | :--- | :--- | :--- |
| **Everyday text, chat, JSON, agents** | `gemini-3.8-flash` | Gemini 3.8 Flash | The default workhorse: fast, cheap, multimodal, great at structured output. |
| **Hardest reasoning & multi-file coding** | `gemini-3.1-pro-preview` | Gemini 3.1 Pro (Preview) | Frontier reasoning for architecture, deep synthesis, and tricky refactors. |
| **Huge-volume, ultra-cheap classification** | `gemini-3.5-flash-lite` | Gemini 3.5 Flash Lite | Routing, tagging, and filtering at the lowest cost per call. |
| **Generate or edit images** | `gemini-3.1-flash-image` | **Nano Banana 2** (default) | Production-scale generalist image model. |
| **Studio-quality hero renders & crisp text in images** | `gemini-3-pro-image` | **Nano Banana Pro** | Highest fidelity, precise text rendering, up to 4K. |
| **High-volume, low-latency images** | `gemini-3.1-flash-lite-image` | **Nano Banana 2 Lite** | Fastest, cheapest image tier. |
| **Generate or edit video (with audio!)** | `gemini-omni-1.1-flash` | **Gemini Omni Flash** | Conversational video generation + editing with native synced audio. |
| **Real-time voice & video agents** | `gemini-3.8-live` | Gemini 3.8 Live | Full-duplex streaming over WebSockets. |
| **Real-time voice that reasons in the background** | `gemini-3.8-live-extended-thinking` | Gemini 3.8 Live Extended Thinking | Live voice plus deeper background reasoning. |

> [!TIP]
> **One API to remember:** `client.interactions.create(...)`.
> Text, JSON, images, and video all flow through the same **Interactions API** call — you just change the `model` and the `response_format`. Learn it once, use it everywhere.
>
> It is also **stateful**: every call returns an `interaction.id`, and passing it back as `previous_interaction_id` lets you continue a conversation — or edit an image or video you just generated — without re-sending anything.

### 🔁 Legacy → Current Migration

Found an older blog post or YouTube tutorial? Here is how to translate it to what this course teaches.

| If the old tutorial says… | Use this instead | Why |
| :--- | :--- | :--- |
| `imagen-3.0-generate-002`, "Imagen 3", "Imagen 4" | `gemini-3.1-flash-image` (Nano Banana 2) | The Imagen line has been retired for the Gemini API. |
| `client.models.generate_images(...)` | `client.interactions.create(..., response_format={"type": "image", ...})` | Image generation now lives on the Interactions API. |
| "Veo", `veo-3.1-generate-preview`, `client.models.generate_videos(...)` | `gemini-omni-1.1-flash` via `client.interactions.create(..., response_format={"type": "video", ...})` | Video generation moved to Gemini Omni Flash. |
| `gemini-2.0-flash-live-001` | `gemini-3.8-live` | The 2.0 Live preview model is legacy. |
| `gemini-2.5-flash` as the default | `gemini-3.8-flash` | Gemini 3.x is the current generation. |
| `gemini-2.5-pro` as the frontier model | `gemini-3.1-pro-preview` | Gemini 3.x is the current generation. |
| `thinking_budget=1024` / `ThinkingConfig(...)` | `generation_config={"thinking_level": "low" \| "medium" \| "high"}` | Gemini 3 replaced numeric budgets with simple levels. |
| `response_mime_type` + `response_schema` | `response_format={"type": "text", "mime_type": "application/json", "schema": MyModel.model_json_schema()}` | Structured output is now expressed through `response_format`. |

---

## 🎯 What You Will Build: The Flagship Milestone Project

Rather than disconnected toy scripts, every module in this course builds a concrete layer of a single cohesive, production-ready application: **AI Product Studio & Live Multimodal Copilot**.

```mermaid
flowchart TB
    subgraph Client["💻 Developer & End-User Interfaces"]
        WebUI["Web / Mobile Frontend\n(Audio, Video & Canvas Capture)"]
        CLI["Developer CLI & Local Runner"]
        AG["Google Antigravity IDE & Agent Harness\n(https://antigravity.google)"]
    end

    subgraph Edge["🛡️ Cloud Run Production Backend (FastAPI + WebSockets)"]
        Auth["Security & Guardrail Layer\n• Prompt Injection Filter\n• Rate Limiting & CORS\n• Pydantic Schema Validation"]
        CreativeEngine["Stage 1: Creative Engine\n• Gemini 3.8 Flash / 3.1 Pro\n• Structured JSON Specs\n• Nano Banana 2 & Gemini Omni Flash Media Gen"]
        LiveCopilot["Stage 2: Live Multimodal Copilot\n• Gemini 3.8 Live (WSS)\n• Real-time Audio/Video Stream\n• Barge-In & Tool Execution"]
    end

    subgraph Cloud["☁️ Google Cloud & AI Platform"]
        AIStudio["Google AI Studio & Gemini API\n(https://aistudio.google.com)"]
        SecretMgr["Secret Manager\n(Encrypted API Keys)"]
        IAM["Least-Privilege IAM & Billing Budgets"]
        CICD["GitHub Actions CI/CD\n(Workload Identity Federation)"]
    end

    WebUI <-->|"Bidirectional WSS / HTTPS"| Auth
    CLI <-->|"REST / WSS"| Auth
    Auth --> CreativeEngine
    Auth --> LiveCopilot
    CreativeEngine -->|"client.interactions.create()"| AIStudio
    LiveCopilot <-->|"client.aio.live.connect()"| AIStudio
    SecretMgr -.->|"Injects GEMINI_API_KEY"| Edge
    IAM -.->|"Governs Access & Quotas"| Edge
    CICD ==>|"Automated Zero-Key Deploy"| Edge
    AG ==>|"Surprise Finisher: Multi-Agent Evolution"| Edge
```

### How the Flagship Project Evolves Across Modules
1. **Module 1 (Foundation & Governance):** Configure your Google AI Studio workspace, API key security, Google Cloud project, least-privilege IAM roles, billing budget alerts, and an automated environment health verifier.
2. **Module 2 (Stage 1 — Creative Engine):** Build the multimodal product design engine using **Gemini 3.8 Flash** and **Gemini 3.1 Pro**, `thinking_level` reasoning control, **System Instructions**, strict **Pydantic Structured Outputs**, **Nano Banana 2 (`gemini-3.1-flash-image`)** image generation and editing, and **Gemini Omni Flash (`gemini-omni-1.1-flash`)** video generation — all through `client.interactions.create`.
3. **Module 3 (Stage 2 — Live Multimodal Copilot & Agents):** Upgrade the studio with real-time bidirectional voice/video streaming via **Gemini 3.8 Live** (`client.aio.live.connect`), Voice Activity Detection (VAD) barge-in handling, autonomous function-calling tool loops, and the **Google Antigravity SDK**.
4. **Module 4 (Stage 3 — Production Deployment & Security):** Containerize the FastAPI + WebSocket server with Docker, wire zero-secret CI/CD via **GitHub Actions + Workload Identity Federation**, mount secrets from **Secret Manager**, enforce defense-in-depth application security, and deploy live to **Google Cloud Run**.
5. **Surprise Finisher (Graduation to Google Antigravity):** Graduate from writing individual API calls to orchestrating autonomous multi-agent software engineering inside **Google Antigravity** (`https://antigravity.google`) using `.agents/rules/`, reusable `SKILL.md` skills, MCP servers, and parallel subagents.

---

## 🗺️ Complete Curriculum Roadmap

```mermaid
flowchart LR
    M1["Module 01\nSetup, IAM,\nBilling & Dashboard"] --> M2["Module 02\nPrompts, Interactions API\n& Media Generation"]
    M2 --> M3["Module 03\nLive API, Agents &\nAntigravity SDK"]
    M3 --> M4["Module 04\nGitHub CI/CD, Cloud Run\n& App Security"]
    M4 --> SF["🎓 Surprise Finisher\nGraduate to Google\nAntigravity"]
```

| Module | Title & Core Topics | Hands-On Deliverable |
| :--- | :--- | :--- |
| **[Module 01](./module-01-setup-iam-billing/README.md)** | **Setup & Intro, IAM Permissions, Billing, Users & Dashboard**<br>• AI Studio vs. Vertex AI decision matrix<br>• API Keys vs. ADC & Service Accounts<br>• Free vs. Paid Tier quotas & data privacy guarantees<br>• Least-privilege IAM (`roles/aiplatform.user`, `roles/secretmanager.secretAccessor`, `roles/run.invoker`)<br>• Team governance, budget alerts & full AI Studio Dashboard tour | **Lab 01:** Automated Setup, IAM & Model Catalog Verifier (Python + TypeScript) |
| **[Module 02](./module-02-basics-prompts-media-llms/README.md)** | **Basics, Prompts, System Instructions, Media Generation & LLMs**<br>• The **Interactions API** (`client.interactions.create`) as the modern standard surface<br>• `gemini-3.8-flash` vs. `gemini-3.1-pro-preview` & token economics<br>• Controlling reasoning depth with `thinking_level`<br>• System Instructions, persona anchoring & few-shot prompting<br>• Guaranteed JSON with Pydantic & TypeScript schemas<br>• Image generation and conversational editing with **Nano Banana** & video with **Gemini Omni Flash** | **Stage 1 Flagship Build:** AI Product Studio Creative Engine (Specs + Hero Images + Video Reels) |
| **[Module 03](./module-03-live-agents-antigravity-sdk/README.md)** | **Live Models, Agents, Antigravity SDK & Apps**<br>• **Gemini 3.8 Live** (`client.aio.live.connect`) over WebSockets<br>• Real-time 16 kHz PCM audio, video frames, VAD & barge-in handling<br>• Tool use / function calling inside live & async agent loops<br>• Deep dive into the public **Google Antigravity SDK** & `antigravity.google` harness | **Stage 2 Flagship Build:** Live Multimodal Copilot + Autonomous Tool-Calling Agent |
| **[Module 04](./module-04-deploy-github-cloudrun-security/README.md)** | **Production Deployment, GitHub Integration, Cloud Run, App Security & Milestone Project**<br>• Production Dockerfile & FastAPI WebSocket server<br>• GitHub Actions CI/CD with Workload Identity Federation (`google-github-actions/auth@v2` & `deploy-cloudrun@v2`)<br>• App Security: Prompt injection defense, Gemini safety settings, rate limiting, CORS & IAM authentication | **Stage 3 Flagship Build:** Full Production Deployment of the Milestone Project to Cloud Run |
| **[Surprise Finisher](./surprise-finisher-graduate-to-antigravity/README.md)** | **🎓 I Want to Graduate to Use Antigravity (`antigravity.google`)**<br>• The shift from prompt engineering to agentic software engineering<br>• Connecting AI Studio API keys to **Google Antigravity**<br>• Authoring workspace rules (`.agents/rules/`), custom skills (`SKILL.md`), and MCP integrations<br>• Dispatching parallel subagents with the Antigravity SDK | **Graduation Capstone:** Transforming your Milestone Project into an autonomous, self-evolving codebase |
| **[Master References](./REFERENCES.md)** | **Verified Public References & Official Documentation Directory**<br>• Complete categorized directory of official docs, SDK repositories, Cloud guides, and security standards | Bookmarkable engineering reference index |

---

## 🛠️ Prerequisites & Local Development Setup

Everything in this course uses the **official unified Google Gen AI SDK** (`google-genai` for Python and `@google/genai` for TypeScript/JavaScript).

> [!WARNING]
> **Never use the legacy `google-generativeai` package!**
> The older `google-generativeai` package is deprecated and does not support the Interactions API, `thinking_level`, the Live API, Nano Banana image generation, Gemini Omni Flash video generation, or the unified client architecture. Always install `google-genai` (`from google import genai`).

### 1. Required Tools
- **Google Account** with access to [Google AI Studio](https://aistudio.google.com) (Free Tier works immediately for Modules 1–3!).
- **Google Cloud Project** with Billing enabled (required for Nano Banana image and Gemini Omni Flash video paid quotas, plus Module 4 Cloud Run deployment).
- **Python 3.10+** (Python 3.11 or 3.12 recommended).
- **Node.js 20+ & npm** (for TypeScript/JavaScript examples).
- **Google Cloud CLI (`gcloud`)** ([Install Guide](https://cloud.google.com/sdk/docs/install)).
- **Docker Desktop or Docker Engine** (for Module 4 containerization).
- **Git & GitHub Account** (for Module 4 GitHub Actions CI/CD).

### 2. Clone & Configure Your Environment (60 Seconds)

```bash
# 1. Clone the public course repository
git clone https://github.com/AllInVaders/aistudio-full-course.git
cd aistudio-full-course

# 2. Create and activate a Python virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# 3. Install the official Google Gen AI SDK and course dependencies
pip install --upgrade google-genai pydantic fastapi uvicorn websockets pillow python-dotenv

# 4. (Optional) Install the official TypeScript/JS SDK
npm install @google/genai dotenv

# 5. Export your Google AI Studio API Key
export GEMINI_API_KEY="your-api-key-from-aistudio"
```

### 3. Your First Call (30 Seconds)

```python
from google import genai

client = genai.Client()

interaction = client.interactions.create(
    model="gemini-3.8-flash",
    input="Say hello and tell me one fun fact about bananas.",
    generation_config={"thinking_level": "low"},
)
print(interaction.output_text)
```

---

## 📖 How to Use This Repository

1. **Read sequentially or jump by role:**
   - **Application Developers:** Follow Modules 01 → 02 → 03 → 04 → Surprise Finisher in order.
   - **Cloud / DevSecOps Engineers:** Focus on **Module 01** (IAM, Billing, Quotas, Privacy) and **Module 04** (Workload Identity Federation, Cloud Run, Secret Manager, App Security).
   - **AI Agent Builders & Power Users:** Dive straight into **Module 03** (Gemini 3.8 Live & Tool Loops) and the **Surprise Finisher** (**Google Antigravity** multi-agent workflows).
2. **Run every code snippet:** Every module contains complete, copy-pasteable Python (`google-genai`) and TypeScript (`@google/genai`) implementations.
3. **Test your mastery:** Complete the self-assessment quiz at the bottom of each module before moving on.

---

## 🔗 Verified Public References & Official Documentation

- **Google AI Studio Workspace:** [https://aistudio.google.com](https://aistudio.google.com)
- **Gemini API Official Documentation:** [https://ai.google.dev/gemini-api/docs](https://ai.google.dev/gemini-api/docs)
- **Model Catalog:** [https://ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models)
- **Interactions API Overview:** [https://ai.google.dev/gemini-api/docs/interactions-overview](https://ai.google.dev/gemini-api/docs/interactions-overview)
- **Migrate to the Interactions API:** [https://ai.google.dev/gemini-api/docs/migrate-to-interactions](https://ai.google.dev/gemini-api/docs/migrate-to-interactions)
- **Image Generation (Nano Banana):** [https://ai.google.dev/gemini-api/docs/image-generation](https://ai.google.dev/gemini-api/docs/image-generation)
- **Video Generation (Gemini Omni Flash):** [https://ai.google.dev/gemini-api/docs/omni](https://ai.google.dev/gemini-api/docs/omni)
- **Live API SDK Quickstart:** [https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk)
- **Thinking & Reasoning (`thinking_level`):** [https://ai.google.dev/gemini-api/docs/thinking](https://ai.google.dev/gemini-api/docs/thinking)
- **Structured Output:** [https://ai.google.dev/gemini-api/docs/structured-output](https://ai.google.dev/gemini-api/docs/structured-output)
- **SynthID Watermarking:** [https://ai.google.dev/responsible/docs/safeguards/synthid](https://ai.google.dev/responsible/docs/safeguards/synthid)
- **Official Python SDK (`google-genai`):** [https://github.com/googleapis/python-genai](https://github.com/googleapis/python-genai)
- **Official TypeScript/JS SDK (`@google/genai`):** [https://github.com/googleapis/js-genai](https://github.com/googleapis/js-genai)
- **Google Antigravity Agentic Development Platform:** [https://antigravity.google](https://antigravity.google)
- **Google Antigravity Documentation:** [https://antigravity.google/docs](https://antigravity.google/docs)
- **Google Cloud Run Documentation:** [https://cloud.google.com/run/docs](https://cloud.google.com/run/docs)

---

👉 **Ready to begin? Head straight to [Module 01: Setup & Intro, IAM Permissions, Billing, Users & Dashboard](./module-01-setup-iam-billing/README.md)!**
