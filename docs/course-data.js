// ============================================================================
// Google AI Studio: Zero to Hero — Bilingual Interactive Course Dataset
// Public-only verified sources | EN & ES side-by-side
// ============================================================================

window.COURSE_DATA = {
  en: {
    ui: {
      courseTitle: "Google AI Studio: Zero to Hero",
      courseSubtitle: "From First Prompt to Cloud Run Production & Graduating to Google Antigravity",
      progressLabel: "Course Progress",
      curriculumHeader: "Curriculum Modules",
      resourcesHeader: "Public References & Repo",
      repoLinkText: "GitHub Repository",
      colabLinkText: "Colab Notebooks",
      markComplete: "Mark Module as Completed",
      completedBadge: "Completed ✓",
      nextModule: "Next Module →",
      prevModule: "← Previous Module",
      quizHeader: "Interactive Knowledge Check",
      refsHeader: "Verified Public References & Official Documentation",
      copyCode: "Copy Code",
      copied: "Copied!"
    },
    modules: [
      {
        id: "module-01",
        tag: "Module 01",
        title: "Setup & Intro, IAM Permissions, Billing, Users & Dashboard",
        eyebrow: "Module 01 · Foundations & Governance",
        summary: "Master the Google AI Studio environment, understand Free vs. Paid billing tiers and data privacy guarantees, configure least-privilege Google Cloud IAM roles, manage team users, and navigate every panel of the AI Studio Dashboard.",
        readTime: "35 min",
        labPath: "labs/module-01-setup-verify/",
        notebookPath: "notebooks/01_Setup_Models_and_Token_Economics.ipynb",
        mdPath: "en/module-01-setup-iam-billing/README.md",
        archFlow: [
          { num: "Step 01", title: "Google AI Studio", desc: "Rapid prototyping UI, Prompt Gallery & API Key creation at aistudio.google.com" },
          { num: "Step 02", title: "Google Cloud Project", desc: "Underlying GCP project governing billing tiers, quotas (RPM/TPM/RPD) & audit logs" },
          { num: "Step 03", title: "Least-Privilege IAM", desc: "Service Accounts & roles (aiplatform.user, secretmanager.secretAccessor, run.invoker)" },
          { num: "Step 04", title: "Unified SDK Client", desc: "Connect via google-genai SDK (Python & JS/TS) using API Key or ADC" }
        ],
        sections: [
          {
            heading: "1. Google AI Studio vs. Vertex AI: When to Use Which",
            body: [
              "Google AI Studio (aistudio.google.com) is the fastest developer on-ramp to Gemini 3.x, Gemini 3.1 Flash Image (Nano Banana 2), and Gemini Omni 1.1 Flash models. You can generate an API key in seconds and start building immediately with the unified Google Gen AI SDK (`google-genai`).",
              "Because the `google-genai` SDK uses the exact same code surface for both Google AI Studio API keys and Google Cloud Vertex AI credentials, you never have to rewrite your application code when scaling from prototype to enterprise production."
            ],
            bullets: [
              "<strong>Google AI Studio (Gemini Developer API):</strong> Best for rapid prototyping, solo builders, startups, and zero-config API key access.",
              "<strong>Free Tier vs. Paid Tier Privacy:</strong> On the Paid Tier (when Cloud Billing is enabled on your linked GCP project), Google does NOT use your prompts or responses to train models.",
              "<strong>Rate Limits (RPM / TPM / RPD):</strong> Quotas scale automatically across Usage Tiers (Free, Tier 1, Tier 2, Tier 3) based on your project billing history."
            ]
          },
          {
            heading: "2. IAM Permissions, Team Users & Least-Privilege Roles",
            body: [
              "Never share a personal API key across your engineering team or commit `.env` files to GitHub. Instead, link your Google AI Studio project to a dedicated Google Cloud project and assign role-based IAM permissions."
            ],
            bullets: [
              "<strong>roles/serviceusage.apiKeysAdmin:</strong> Allows designated leads to create, rotate, and restrict API keys.",
              "<strong>roles/aiplatform.user:</strong> Grants runtime access to invoke generative models via Application Default Credentials (ADC).",
              "<strong>roles/secretmanager.secretAccessor:</strong> Allows your Cloud Run service account to read API keys securely from Secret Manager.",
              "<strong>roles/billing.viewer:</strong> Allows finance or engineering leads to monitor token spend and budget alerts."
            ]
          },
          {
            heading: "3. Hands-On Code: Verifying Your Setup & Token Economics",
            body: [
              "Always use the modern unified `google-genai` SDK (`pip install google-genai`). Below is the complete setup verification script from Lab 01:"
            ],
            codeTitle: "labs/module-01-setup-verify/verify_setup.py",
            code: `import os
from google import genai

# Initialize unified client (automatically reads GEMINI_API_KEY from environment)
client = genai.Client()

prompt = "Explain the difference between RPM, TPM, and RPD in 3 bullet points."

# 1. Pre-flight token count check (crucial for FinOps & quota budgeting)
token_info = client.models.count_tokens(
    model="gemini-3.7-flash",
    contents=prompt,
)
print(f"Input Token Count: {token_info.total_tokens}")

# 2. Generate content and inspect usage metadata
response = client.models.generate_content(
    model="gemini-3.7-flash",
    contents=prompt,
)
print(response.text)
print("Usage Metadata:", response.usage_metadata)`
          }
        ],
        quiz: {
          question: "Which statement accurately describes data privacy and SDK compatibility when upgrading from Google AI Studio Free Tier to Paid Tier?",
          options: [
            "You must rewrite all Python code to use a different SDK package when enabling Cloud Billing.",
            "On the Paid Tier, prompts and responses are NOT used to train Google models, and the exact same google-genai SDK code works without changes.",
            "API keys stop working as soon as a Google Cloud Billing account is linked.",
            "IAM roles can only be configured on the Free Tier."
          ],
          correctIndex: 1,
          explanation: "Correct! Enabling Cloud Billing upgrades your project to the Paid Tier where your data is not used for model training, higher RPM/TPM rate limits apply, and the unified `google-genai` SDK continues working seamlessly."
        },
        references: [
          { title: "Google AI Studio Portal", desc: "Official web console for prompts, API keys & usage dashboards", url: "https://aistudio.google.com" },
          { title: "Gemini API Billing & Privacy Tiers", desc: "Official Free vs. Paid tier terms, pricing, and data governance", url: "https://ai.google.dev/gemini-api/docs/billing" },
          { title: "Gemini API Rate Limits & Quotas", desc: "RPM, TPM, and RPD limits across usage tiers", url: "https://ai.google.dev/gemini-api/docs/rate-limits" },
          { title: "Google Gen AI Python SDK (google-genai)", desc: "Official unified Python SDK repository and documentation", url: "https://github.com/googleapis/python-genai" }
        ]
      },
      {
        id: "module-02",
        tag: "Module 02",
        title: "Basics, Prompts, System Instructions, Media Generation & Language Models",
        eyebrow: "Module 02 · Multimodal & Structured Generation",
        summary: "Choose between Gemini 3.7 Flash and Gemini 3.1 Pro, control reasoning depth with Thinking Budgets, enforce deterministic JSON schemas with Pydantic, generate images with Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2) and videos with Gemini Omni 1.1 Flash (`gemini-omni-1.1-flash`), and build Stage 1 of the AI Product Studio.",
        readTime: "50 min",
        labPath: "labs/module-02-prompts-media/",
        notebookPath: "notebooks/02_Prompts_Structured_Outputs_Gemini_Image_and_Omni_Video.ipynb",
        mdPath: "en/module-02-basics-prompts-media-llms/README.md",
        archFlow: [
          { num: "Stage 1A", title: "System Instructions", desc: "Set persistent role, tone, constraints & safety boundaries" },
          { num: "Stage 1B", title: "Thinking & JSON Schema", desc: "Gemini 3.7 / 3.1 reasoning + Pydantic structured output validation" },
          { num: "Stage 1C", title: "Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2) Studio", desc: "Photorealistic hero product renders via client.models.generate_content" },
          { num: "Stage 1D", title: "Gemini Omni 1.1 Flash Video Engine", desc: "Cinematic product promo clips via client.interactions.create" }
        ],
        sections: [
          {
            heading: "1. Language Models, System Instructions & Thinking Budgets",
            body: [
              "Gemini 3.x models (`gemini-3.7-flash`, `gemini-3.1-flash-lite`, `gemini-3.1-pro`) feature built-in reasoning ('Thinking'). You can explicitly tune `thinking_config` to trade latency/cost for deeper analytical reasoning.",
              "Always separate persistent behavioral instructions (`system_instruction`) from per-request user inputs (`contents`). This improves adherence and strengthens prompt injection defenses."
            ],
            bullets: [
              "<strong>gemini-3.7-flash:</strong> Default workhorse for high-throughput, low-latency multimodal tasks, structured extraction, and real-time agents.",
              "<strong>gemini-3.1-pro:</strong> Best for complex coding, deep architectural synthesis, and multi-document reasoning.",
              "<strong>Structured Outputs:</strong> Pass a Pydantic class to `response_schema` with `response_mime_type='application/json'` to guarantee 100% schema-compliant JSON."
            ]
          },
          {
            heading: "2. Multimodal Media Generation: Gemini 3.1 Flash Image (Nano Banana 2) & Gemini Omni 1.1 Flash",
            body: [
              "With the unified `google-genai` client, generating high-resolution product images (Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2)) and cinematic video clips (Gemini Omni 1.1 Flash (`gemini-omni-1.1-flash`)) uses the exact same SDK client as text generation."
            ],
            codeTitle: "labs/module-02-prompts-media/product_studio_stage1.py",
            code: `from pydantic import BaseModel, Field
from google import genai
from google.genai import types

client = genai.Client()

class ProductLaunchKit(BaseModel):
    product_name: str
    tagline: str
    target_audience: str
    key_features: list[str]
    image_prompt: str = Field(description="Detailed visual prompt for Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2)")
    omni_video_prompt: str = Field(description="Cinematic motion prompt for Gemini Omni 1.1 Flash (`gemini-omni-1.1-flash`)")

# 1. Generate Structured Product Brief with System Instructions & Thinking
brief_resp = client.models.generate_content(
    model="gemini-3.7-flash",
    contents="Create a launch kit for a solar-powered smart espresso mug.",
    config=types.GenerateContentConfig(
        system_instruction="You are an expert industrial designer and brand director.",
        response_mime_type="application/json",
        response_schema=ProductLaunchKit,
        thinking_config=types.ThinkingConfig(thinking_budget=1024),
    ),
)
kit = ProductLaunchKit.model_validate_json(brief_resp.text)
print("Generated Launch Kit:", kit.model_dump_json(indent=2))

# 2. Generate Product Hero Image with Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2)
img_resp = client.models.generate_content(
    model="gemini-3.1-flash-image",
    contents=kit.image_prompt,
    config=types.GenerateContentConfig(
        response_modalities=["IMAGE"],
        image_config=types.ImageConfig(aspect_ratio="16:9"),
    ),
)`
          }
        ],
        quiz: {
          question: "How do you guarantee that Gemini returns valid JSON matching your exact application data structure?",
          options: [
            "Write 'PLEASE ONLY RETURN JSON' in all caps inside the user prompt.",
            "Set response_mime_type='application/json' and pass a Pydantic model or JSON Schema to response_schema in GenerateContentConfig.",
            "Use temperature=2.0 so the model explores more formatting styles.",
            "JSON output is only supported in Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2)."
          ],
          correctIndex: 1,
          explanation: "Correct! Setting `response_mime_type='application/json'` together with `response_schema=YourPydanticModel` enforces constrained decoding so the output always conforms to your schema."
        },
        references: [
          { title: "Structured Outputs Guide", desc: "Enforcing JSON schemas and Pydantic models in Gemini API", url: "https://ai.google.dev/gemini-api/docs/structured-output" },
          { title: "Gemini Thinking Models Guide", desc: "Configuring thinking budgets and reasoning tokens", url: "https://ai.google.dev/gemini-api/docs/thinking" },
          { title: "Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2) Image Generation", desc: "Generating and customizing images with google-genai", url: "https://ai.google.dev/gemini-api/docs/image-generation" },
          { title: "Gemini Omni 1.1 Flash Video Generation Guide", desc: "Generating high-definition video clips from text and images", url: "https://ai.google.dev/gemini-api/docs/video" }
        ]
      },
      {
        id: "module-03",
        tag: "Module 03",
        title: "Live Models, Agents, Antigravity SDK & Apps",
        eyebrow: "Module 03 · Real-Time Multimodal & Autonomous Agents",
        summary: "Build low-latency bidirectional voice/video experiences with the Gemini Live API, wire up real-time Tool Calling, and harness the public Google Antigravity SDK (antigravity.google) to orchestrate stateful autonomous agents.",
        readTime: "60 min",
        labPath: "labs/module-03-live-agents/",
        notebookPath: "notebooks/03_Gemini_Live_API_Tool_Agents_and_Antigravity_SDK.ipynb",
        mdPath: "en/module-03-live-agents-antigravity-sdk/README.md",
        archFlow: [
          { num: "Layer 01", title: "Gemini Live WebSocket", desc: "Bidirectional low-latency audio/video stream via client.aio.live.connect" },
          { num: "Layer 02", title: "Server VAD & Barge-In", desc: "Natural human interruption detection & instant audio buffer flush" },
          { num: "Layer 03", title: "Live Tool Execution", desc: "Real-time function calls (pricing, inventory, media generation)" },
          { num: "Layer 04", title: "Antigravity SDK Harness", desc: "Stateful multi-step agent planning, context management & tool runtime" }
        ],
        sections: [
          {
            heading: "1. Real-Time Multimodal Streaming with Gemini Live API",
            body: [
              "Unlike traditional request/response REST calls, the Gemini Live API (`client.aio.live.connect`) opens a persistent, full-duplex WebSocket session. Your app streams raw PCM audio chunks, video frames, or text in real time, and Gemini responds with ultra-low-latency synthesized voice and tool calls.",
              "Built-in Voice Activity Detection (VAD) automatically detects when the user interrupts ('barges in') and halts ongoing audio generation so conversations feel completely natural."
            ]
          },
          {
            heading: "2. The Google Antigravity SDK: Agentic Harness for Builders",
            body: [
              "Google Antigravity (antigravity.google) is Google's agent-first development platform. The Antigravity SDK provides programmatic access to the same agentic harness—managing tool execution loops, context compaction, subagent delegation, and workspace state—configured directly with your Google AI Studio API key."
            ],
            codeTitle: "labs/module-03-live-agents/live_copilot_agent.py",
            code: `import asyncio
from google import genai
from google.genai import types

client = genai.Client()

def calculate_unit_economics(unit_cost_usd: float, retail_price_usd: float, volume: int) -> dict:
    """Calculates gross margin percentage and total profit for a product SKU."""
    margin_pct = round(((retail_price_usd - unit_cost_usd) / retail_price_usd) * 100, 2)
    total_profit = round((retail_price_usd - unit_cost_usd) * volume, 2)
    return {"gross_margin_pct": margin_pct, "total_profit_usd": total_profit}

async def run_live_copilot_session():
    config = types.LiveConnectConfig(
        response_modalities=["TEXT"],
        system_instruction="You are the Live Product Studio Copilot. Use tools whenever pricing is discussed.",
        tools=[calculate_unit_economics],
    )
    async with client.aio.live.connect(model="gemini-3.8-live", config=config) as session:
        await session.send(
            input="If our solar mug costs $18 to manufacture and sells for $65 across 5,000 units, what is our margin?",
            end_of_turn=True,
        )
        async for message in session.receive():
            if message.text:
                print(message.text, end="")

if __name__ == "__main__":
    asyncio.run(run_live_copilot_session())`
          }
        ],
        quiz: {
          question: "What makes the Gemini Live API fundamentally different from standard generate_content calls?",
          options: [
            "It only supports batch CSV file uploads.",
            "It maintains a stateful, bidirectional full-duplex WebSocket session supporting real-time audio/video streaming, server-side VAD, barge-in interruption, and live tool calls.",
            "It cannot invoke tools or functions.",
            "It requires writing custom C++ kernel drivers."
          ],
          correctIndex: 1,
          explanation: "Correct! The Gemini Live API uses persistent asynchronous WebSockets (`client.aio.live.connect`) for real-time multimodal conversation with native barge-in and live tool execution."
        },
        references: [
          { title: "Gemini Live API Documentation", desc: "Real-time bidirectional audio, video, and tool streaming guide", url: "https://ai.google.dev/gemini-api/docs/live-api" },
          { title: "Function Calling / Tool Use Guide", desc: "Connecting Gemini models to external tools and APIs", url: "https://ai.google.dev/gemini-api/docs/function-calling" },
          { title: "Google Antigravity Official Portal", desc: "Agent-first development platform, CLI, and Antigravity SDK", url: "https://antigravity.google" },
          { title: "Google Gen AI Async Live Client Reference", desc: "Python SDK reference for client.aio.live", url: "https://googleapis.github.io/python-genai/" }
        ]
      },
      {
        id: "module-04",
        tag: "Module 04",
        title: "Deploy to Production, GitHub Integration, Cloud Run, Security & Milestone Project",
        eyebrow: "Module 04 · Production Engineering & Capstone Ship",
        summary: "Containerize the full-stack AI Product Studio & Live Copilot, automate CI/CD with keyless GitHub Actions (Workload Identity Federation), store secrets in Secret Manager, harden against prompt injection, and ship your Milestone Project to Google Cloud Run.",
        readTime: "65 min",
        labPath: "milestone-project/",
        notebookPath: "notebooks/04_Security_Evals_and_Graduation_to_Antigravity.ipynb",
        mdPath: "en/module-04-deploy-github-cloudrun-security/README.md",
        archFlow: [
          { num: "Deploy 01", title: "GitHub Push to main", desc: "Triggers GitHub Actions CI/CD workflow automatically" },
          { num: "Deploy 02", title: "Workload Identity Fed.", desc: "Keyless OIDC auth to GCP (zero static JSON service account keys)" },
          { num: "Deploy 03", title: "Secret Manager", desc: "Injects GEMINI_API_KEY at runtime via least-privilege IAM" },
          { num: "Deploy 04", title: "Google Cloud Run", desc: "Autoscaling HTTPS & WebSocket container with session affinity" }
        ],
        sections: [
          {
            heading: "1. Defense-in-Depth AI Security Checklist",
            body: [
              "Shipping an LLM app to production requires protecting both your cloud infrastructure and the model interaction layer:"
            ],
            bullets: [
              "<strong>Zero Hardcoded Secrets:</strong> Mount `GEMINI_API_KEY` from Google Cloud Secret Manager (`--set-secrets=GEMINI_API_KEY=gemini-api-key:latest`).",
              "<strong>Keyless GitHub CI/CD:</strong> Use `google-github-actions/auth@v2` with Workload Identity Federation instead of long-lived JSON keys.",
              "<strong>Prompt Injection & Input Guardrails:</strong> Validate length, strip control tokens, isolate user input from `system_instruction`, and enforce output schemas.",
              "<strong>Rate Limiting & Cost Guardrails:</strong> Apply per-IP/per-user sliding-window rate limits and set Cloud Run `--max-instances` caps."
            ]
          },
          {
            heading: "2. Keyless GitHub Actions to Cloud Run Workflow",
            body: [
              "Below is the production CI/CD workflow included in `.github/workflows/deploy-cloudrun.yml`:"
            ],
            codeTitle: ".github/workflows/deploy-cloudrun.yml",
            code: `name: Deploy AI Product Studio to Cloud Run
on:
  push:
    branches: [ "main" ]
    paths: [ "milestone-project/**" ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: "read"
      id-token: "write" # Required for keyless Workload Identity Federation
    steps:
      - uses: actions/checkout@v4
      - id: auth
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: \${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: \${{ secrets.GCP_SERVICE_ACCOUNT }}
      - id: deploy
        uses: google-github-actions/deploy-cloudrun@v2
        with:
          service: ai-product-studio
          region: us-central1
          source: ./milestone-project
          flags: "--allow-unauthenticated --session-affinity --set-secrets=GEMINI_API_KEY=gemini-api-key:latest"`
          }
        ],
        quiz: {
          question: "Why should production GitHub Actions workflows use Workload Identity Federation (google-github-actions/auth@v2) instead of exported JSON service account keys?",
          options: [
            "Workload Identity Federation uses short-lived OIDC tokens so there are zero static JSON credentials that can be leaked or stolen.",
            "JSON keys only work on Windows runners.",
            "Cloud Run does not support Docker containers without JSON keys.",
            "Workload Identity Federation disables HTTPS."
          ],
          correctIndex: 0,
          explanation: "Correct! Workload Identity Federation exchanges GitHub's short-lived OIDC token for temporary GCP credentials, eliminating the security risk of long-lived static service account keys."
        },
        references: [
          { title: "Google Cloud Run Documentation", desc: "Deploying containerized web apps and WebSockets on Cloud Run", url: "https://cloud.google.com/run/docs" },
          { title: "GitHub Actions: deploy-cloudrun", desc: "Official GitHub Action for deploying to Cloud Run", url: "https://github.com/google-github-actions/deploy-cloudrun" },
          { title: "Google Cloud Secret Manager", desc: "Storing and mounting API keys securely in Cloud Run", url: "https://cloud.google.com/secret-manager/docs" },
          { title: "Gemini API Safety Settings", desc: "Configuring content filters and safety thresholds", url: "https://ai.google.dev/gemini-api/docs/safety-settings" }
        ]
      },
      {
        id: "surprise-finisher",
        tag: "Surprise Finisher 🎓",
        title: "I Want to Graduate to Use Google Antigravity",
        eyebrow: "Surprise Finisher · Graduation to Agent-First Engineering",
        summary: "You built and shipped a full-stack multimodal AI app. Now take the ultimate leap: graduate from writing individual API calls to orchestrating autonomous multi-agent engineering workflows inside Google Antigravity (antigravity.google).",
        readTime: "45 min",
        labPath: "milestone-project/.agents/",
        notebookPath: "notebooks/04_Security_Evals_and_Graduation_to_Antigravity.ipynb",
        mdPath: "en/surprise-finisher-graduate-to-antigravity/README.md",
        archFlow: [
          { num: "Grad 01", title: "Antigravity Workspace", desc: "Open your Milestone Project repo inside Google Antigravity (antigravity.google)" },
          { num: "Grad 02", title: ".agents/rules/", desc: "Codify architectural guardrails, security rules & SDK conventions" },
          { num: "Grad 03", title: ".agents/skills/", desc: "Author reusable SKILL.md playbooks for testing, evals & Cloud Run ops" },
          { num: "Grad 04", title: "Parallel Subagents & MCP", desc: "Spawn autonomous agents to build, verify & ship features in parallel" }
        ],
        sections: [
          {
            heading: "1. The Graduation Paradigm Shift: From API Caller to Agent Orchestrator",
            body: [
              "In Modules 1–4, you learned how to embed Gemini, Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2), Gemini Omni 1.1 Flash (`gemini-omni-1.1-flash`), and the Live API inside your application code. In the Surprise Finisher, you flip the perspective: you graduate to Google Antigravity (antigravity.google), where autonomous AI agents pair-program with you across your entire repository, terminal, browser, and cloud infrastructure.",
              "Because Antigravity connects directly to your Google AI Studio API keys and Google Cloud projects, everything you configured in Modules 1–4 carries over immediately."
            ],
            bullets: [
              "<strong>Workspace Rules (.agents/rules/):</strong> Persistent architectural instructions that every agent in your repo obeys automatically (already scaffolded in `milestone-project/.agents/rules/architecture.md`).",
              "<strong>Custom Skills (.agents/skills/<name>/SKILL.md):</strong> Modular, reusable operational playbooks that teach your agents how to run evals, deploy to Cloud Run, or audit security.",
              "<strong>Model Context Protocol (MCP):</strong> Connect live tools, databases, and documentation servers directly into your Antigravity agent harness.",
              "<strong>Subagent Orchestration:</strong> Delegate parallel research, implementation, testing, and code review tasks using the Antigravity SDK."
            ]
          },
          {
            heading: "2. Graduation Artifact: Your First Antigravity Skill",
            body: [
              "Inspect the ready-to-run Antigravity skill included inside `milestone-project/.agents/skills/product-studio-ops/SKILL.md`:"
            ],
            codeTitle: "milestone-project/.agents/skills/product-studio-ops/SKILL.md",
            code: `---
name: product-studio-ops
description: Run automated health checks, schema verification, and Cloud Run deployments for the AI Product Studio milestone application.
---

# AI Product Studio Operations Skill

1. **Pre-Flight Check**: Verify that all endpoints use the unified \`google-genai\` SDK and that no secrets are hardcoded.
2. **Smoke Test**: Run \`pytest\` and verify \`/api/health\` returns HTTP 200.
3. **Deploy**: Execute \`./deploy-cloudrun.sh\` to deploy with Secret Manager bindings.`
          }
        ],
        quiz: {
          question: "How do `.agents/rules/` and `.agents/skills/` supercharge your repository when you graduate to Google Antigravity?",
          options: [
            "They turn your codebase into an agent-ready workspace where autonomous Antigravity agents automatically follow your architectural guardrails and execute reusable multi-step engineering workflows.",
            "They delete your Dockerfile.",
            "They replace HTML with assembly code.",
            "They disable Git version control."
          ],
          correctIndex: 0,
          explanation: "Congratulations, Graduate! By equipping your repo with `.agents/rules/` and `.agents/skills/`, your project is now a first-class autonomous engineering workspace in Google Antigravity (`antigravity.google`)."
        },
        references: [
          { title: "Google Antigravity Official Platform", desc: "Download Google Antigravity IDE, CLI, and Antigravity SDK", url: "https://antigravity.google" },
          { title: "Google AI Studio Portal", desc: "Manage Gemini API keys and usage telemetry for your agents", url: "https://aistudio.google.com" },
          { title: "Model Context Protocol (MCP) Specification", desc: "Open standard for connecting AI agents to tools and data sources", url: "https://modelcontextprotocol.io" },
          { title: "Course Master Bibliography (EN)", desc: "Complete list of verified public references across all modules", url: "https://github.com/AllInVaders/aistudio-full-course/blob/main/en/REFERENCES.md" }
        ]
      }
    ]
  },

  // ==========================================================================
  // EDICIÓN EN ESPAÑOL (ES)
  // ==========================================================================
  es: {
    ui: {
      courseTitle: "Google AI Studio: De Cero a Experto",
      courseSubtitle: "Desde tu Primer Prompt hasta Producción en Cloud Run y Graduación en Google Antigravity",
      progressLabel: "Progreso del Curso",
      curriculumHeader: "Módulos del Curso",
      resourcesHeader: "Referencias Públicas y Repo",
      repoLinkText: "Repositorio en GitHub",
      colabLinkText: "Notebooks en Colab",
      markComplete: "Marcar Módulo como Completado",
      completedBadge: "Completado ✓",
      nextModule: "Siguiente Módulo →",
      prevModule: "← Módulo Anterior",
      quizHeader: "Autoevaluación Interactiva",
      refsHeader: "Referencias Públicas Verificadas y Documentación Oficial",
      copyCode: "Copiar Código",
      copied: "¡Copiado!"
    },
    modules: [
      {
        id: "module-01",
        tag: "Módulo 01",
        title: "Configuración e Introducción, Permisos IAM, Facturación, Usuarios y Panel",
        eyebrow: "Módulo 01 · Fundamentos y Gobernanza",
        summary: "Domina el entorno de Google AI Studio, comprende los niveles de facturación Gratuito vs. Pago y las garantías de privacidad de datos, configura roles IAM de mínimo privilegio en Google Cloud, gestiona usuarios y recorre el Panel de Control.",
        readTime: "35 min",
        labPath: "labs/module-01-setup-verify/",
        notebookPath: "notebooks/01_Setup_Models_and_Token_Economics.ipynb",
        mdPath: "es/module-01-setup-iam-billing/README.md",
        archFlow: [
          { num: "Paso 01", title: "Google AI Studio", desc: "Prototipado rápido, Galería de Prompts y creación de API Keys en aistudio.google.com" },
          { num: "Paso 02", title: "Proyecto Google Cloud", desc: "Proyecto GCP subyacente que gobierna facturación, cuotas (RPM/TPM/RPD) y logs" },
          { num: "Paso 03", title: "IAM Mínimo Privilegio", desc: "Cuentas de servicio y roles (aiplatform.user, secretmanager.secretAccessor, run.invoker)" },
          { num: "Paso 04", title: "Cliente SDK Unificado", desc: "Conexión vía google-genai SDK (Python y JS/TS) usando API Key o ADC" }
        ],
        sections: [
          {
            heading: "1. Google AI Studio vs. Vertex AI: Cuándo Usar Cada Uno",
            body: [
              "Google AI Studio (aistudio.google.com) es la vía más rápida para que desarrolladores construyan con modelos Gemini 3.x, Gemini 3.1 Flash Image (Nano Banana 2) y Gemini Omni 1.1 Flash. Puedes generar una API Key en segundos y programar de inmediato con el SDK oficial unificado (`google-genai`).",
              "Dado que el SDK `google-genai` utiliza exactamente la misma interfaz de código tanto para API Keys de Google AI Studio como para credenciales empresariales de Vertex AI, nunca tendrás que reescribir tu aplicación al escalar a producción."
            ],
            bullets: [
              "<strong>Google AI Studio (Gemini Developer API):</strong> Ideal para prototipado ágil, desarrolladores independientes, startups y acceso inmediato con API Key.",
              "<strong>Privacidad en Nivel Gratuito vs. Nivel de Pago:</strong> En el Nivel de Pago (con facturación de Cloud vinculada), Google NO utiliza tus prompts ni respuestas para entrenar modelos.",
              "<strong>Límites de Tasa (RPM / TPM / RPD):</strong> Las cuotas escalan automáticamente por niveles de uso según el historial de tu proyecto."
            ]
          },
          {
            heading: "2. Permisos IAM, Gestión de Usuarios y Roles de Mínimo Privilegio",
            body: [
              "Nunca compartas una API Key personal por chat ni subas archivos `.env` a GitHub. Vincula tu proyecto de Google AI Studio a un proyecto de Google Cloud y asigna roles IAM granulares."
            ],
            bullets: [
              "<strong>roles/serviceusage.apiKeysAdmin:</strong> Permite a los líderes técnicos crear, rotar y restringir API keys.",
              "<strong>roles/aiplatform.user:</strong> Otorga acceso en tiempo de ejecución para invocar modelos mediante Application Default Credentials (ADC).",
              "<strong>roles/secretmanager.secretAccessor:</strong> Permite que la cuenta de servicio de Cloud Run lea llaves de API desde Secret Manager.",
              "<strong>roles/billing.viewer:</strong> Permite monitorear el consumo de tokens y las alertas de presupuesto."
            ]
          },
          {
            heading: "3. Práctica: Verificación de Entorno y Economía de Tokens",
            body: [
              "Utiliza siempre el SDK oficial unificado `google-genai` (`pip install google-genai`). Este es el script de verificación del Laboratorio 01:"
            ],
            codeTitle: "labs/module-01-setup-verify/verify_setup.py",
            code: `import os
from google import genai

# Inicializa el cliente unificado (lee GEMINI_API_KEY automáticamente del entorno)
client = genai.Client()

prompt = "Explica la diferencia entre RPM, TPM y RPD en 3 viñetas claras."

# 1. Conteo previo de tokens (esencial para FinOps y control de cuotas)
token_info = client.models.count_tokens(
    model="gemini-3.7-flash",
    contents=prompt,
)
print(f"Tokens de entrada: {token_info.total_tokens}")

# 2. Generación de contenido e inspección de metadatos de uso
response = client.models.generate_content(
    model="gemini-3.7-flash",
    contents=prompt,
)
print(response.text)
print("Metadatos de uso:", response.usage_metadata)`
          }
        ],
        quiz: {
          question: "¿Qué ocurre con la privacidad de tus datos y tu código al pasar del Nivel Gratuito al Nivel de Pago en Google AI Studio?",
          options: [
            "Debes reescribir todo tu código Python con otra librería.",
            "En el Nivel de Pago, tus prompts y respuestas NO se usan para entrenar modelos de Google, y el mismo código del SDK google-genai sigue funcionando sin cambios.",
            "Las API keys dejan de funcionar al activar la facturación.",
            "Los roles IAM solo existen en el Nivel Gratuito."
          ],
          correctIndex: 1,
          explanation: "¡Correcto! Al activar la facturación en tu proyecto de Google Cloud pasas al Nivel de Pago, donde tus datos no se usan para entrenamiento, obtienes mayores cuotas RPM/TPM y tu código con `google-genai` se mantiene intacto."
        },
        references: [
          { title: "Portal de Google AI Studio", desc: "Consola web oficial para prompts, API keys y panel de uso", url: "https://aistudio.google.com" },
          { title: "Facturación y Privacidad de Gemini API", desc: "Términos oficiales del Nivel Gratuito vs. Pago y privacidad de datos", url: "https://ai.google.dev/gemini-api/docs/billing" },
          { title: "Límites de Tasa y Cuotas (Rate Limits)", desc: "Detalle de cuotas RPM, TPM y RPD por nivel de uso", url: "https://ai.google.dev/gemini-api/docs/rate-limits" },
          { title: "SDK Oficial Google Gen AI para Python", desc: "Repositorio y documentación de google-genai", url: "https://github.com/googleapis/python-genai" }
        ]
      },
      {
        id: "module-02",
        tag: "Módulo 02",
        title: "Fundamentos, Prompts, Instrucciones del Sistema, Generación Multimedia y LLMs",
        eyebrow: "Módulo 02 · Generación Multimodal y Salidas Estructuradas",
        summary: "Elige entre Gemini 3.7 Flash y Gemini 3.1 Pro, controla la profundidad de razonamiento con Thinking Budgets, garantiza esquemas JSON deterministas con Pydantic, genera imágenes con Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2) y videos con Gemini Omni 1.1 Flash (`gemini-omni-1.1-flash`), y construye la Etapa 1 del Proyecto Hito.",
        readTime: "50 min",
        labPath: "labs/module-02-prompts-media/",
        notebookPath: "notebooks/02_Prompts_Structured_Outputs_Gemini_Image_and_Omni_Video.ipynb",
        mdPath: "es/module-02-basics-prompts-media-llms/README.md",
        archFlow: [
          { num: "Etapa 1A", title: "System Instructions", desc: "Define rol persistente, tono, reglas y límites de seguridad" },
          { num: "Etapa 1B", title: "Thinking y Esquema JSON", desc: "Razonamiento Gemini 3.7 / 3.1 + validación estricta con Pydantic" },
          { num: "Etapa 1C", title: "Estudio Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2)", desc: "Renders fotorrealistas de producto vía client.models.generate_content" },
          { num: "Etapa 1D", title: "Motor de Video Gemini Omni 1.1 Flash", desc: "Clips promocionales cinematográficos vía client.interactions.create" }
        ],
        sections: [
          {
            heading: "1. Modelos de Lenguaje, System Instructions y Presupuesto de Razonamiento",
            body: [
              "Los modelos Gemini 3.x (`gemini-3.7-flash`, `gemini-3.1-flash-lite`, `gemini-3.1-pro`) incorporan razonamiento nativo ('Thinking'). Puedes ajustar `thinking_config` para equilibrar latencia/costo frente a profundidad analítica.",
              "Separa siempre las instrucciones de comportamiento (`system_instruction`) de los datos del usuario (`contents`). Esto eleva la precisión y protege contra inyecciones de prompt."
            ],
            bullets: [
              "<strong>gemini-3.7-flash:</strong> Modelo principal de baja latencia y alta eficiencia para tareas multimodales, extracción estructurada y agentes en tiempo real.",
              "<strong>gemini-3.1-pro:</strong> Ideal para programación compleja, diseño arquitectónico y análisis profundo.",
              "<strong>Salidas Estructuradas:</strong> Pasa una clase Pydantic a `response_schema` con `response_mime_type='application/json'` para garantizar JSON 100% válido."
            ]
          },
          {
            heading: "2. Generación Multimedia con Gemini 3.1 Flash Image (Nano Banana 2) y Gemini Omni 1.1 Flash",
            body: [
              "Con el cliente unificado `google-genai`, generar imágenes de alta resolución (Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2)) y clips de video (Gemini Omni 1.1 Flash (`gemini-omni-1.1-flash`)) utiliza exactamente el mismo cliente que el texto."
            ],
            codeTitle: "labs/module-02-prompts-media/product_studio_stage1.py",
            code: `from pydantic import BaseModel, Field
from google import genai
from google.genai import types

client = genai.Client()

class ProductLaunchKit(BaseModel):
    product_name: str
    tagline: str
    target_audience: str
    key_features: list[str]
    image_prompt: str = Field(description="Prompt visual detallado para Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2)")
    omni_video_prompt: str = Field(description="Prompt cinematográfico para Gemini Omni 1.1 Flash (`gemini-omni-1.1-flash`)")

# 1. Generar Brief de Producto Estructurado con System Instructions y Thinking
brief_resp = client.models.generate_content(
    model="gemini-3.7-flash",
    contents="Crea un kit de lanzamiento para una taza inteligente de espresso solar.",
    config=types.GenerateContentConfig(
        system_instruction="Eres un director creativo y diseñador industrial experto.",
        response_mime_type="application/json",
        response_schema=ProductLaunchKit,
        thinking_config=types.ThinkingConfig(thinking_budget=1024),
    ),
)
kit = ProductLaunchKit.model_validate_json(brief_resp.text)
print("Kit de Lanzamiento Generado:", kit.model_dump_json(indent=2))

# 2. Generar Imagen Principal del Producto con Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2)
img_resp = client.models.generate_content(
    model="gemini-3.1-flash-image",
    contents=kit.image_prompt,
    config=types.GenerateContentConfig(
        response_modalities=["IMAGE"],
        image_config=types.ImageConfig(aspect_ratio="16:9"),
    ),
)`
          }
        ],
        quiz: {
          question: "¿Cómo garantizas que Gemini devuelva siempre un JSON válido que cumpla exactamente con la estructura de datos de tu aplicación?",
          options: [
            "Escribiendo 'DEVUELVE SOLO JSON' en mayúsculas en el prompt.",
            "Configurando response_mime_type='application/json' y pasando un modelo Pydantic o JSON Schema en response_schema dentro de GenerateContentConfig.",
            "Subiendo temperature=2.0.",
            "Solo Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2) soporta JSON."
          ],
          correctIndex: 1,
          explanation: "¡Exacto! Usar `response_mime_type='application/json'` junto con `response_schema=TuModeloPydantic` activa la decodificación restringida para que la salida siempre respete tu esquema."
        },
        references: [
          { title: "Guía de Salidas Estructuradas (JSON)", desc: "Uso de esquemas JSON y modelos Pydantic en Gemini API", url: "https://ai.google.dev/gemini-api/docs/structured-output" },
          { title: "Modelos de Razonamiento (Thinking)", desc: "Configuración de thinking_budget y tokens de razonamiento", url: "https://ai.google.dev/gemini-api/docs/thinking" },
          { title: "Generación de Imágenes con Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2)", desc: "Guía oficial de Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2) con el SDK google-genai", url: "https://ai.google.dev/gemini-api/docs/image-generation" },
          { title: "Generación de Video con Gemini Omni 1.1 Flash (`gemini-omni-1.1-flash`)", desc: "Creación de videos de alta definición desde texto e imágenes", url: "https://ai.google.dev/gemini-api/docs/video" }
        ]
      },
      {
        id: "module-03",
        tag: "Módulo 03",
        title: "Modelos en Vivo (Live API), Agentes, Antigravity SDK y Aplicaciones",
        eyebrow: "Módulo 03 · Multimodalidad en Tiempo Real y Agentes Autónomos",
        summary: "Construye experiencias conversacionales de voz y video de baja latencia con Gemini Live API, conecta Tool Calling en tiempo real y aprovecha el SDK público de Google Antigravity (antigravity.google) para orquestar agentes autónomos.",
        readTime: "60 min",
        labPath: "labs/module-03-live-agents/",
        notebookPath: "notebooks/03_Gemini_Live_API_Tool_Agents_and_Antigravity_SDK.ipynb",
        mdPath: "es/module-03-live-agents-antigravity-sdk/README.md",
        archFlow: [
          { num: "Capa 01", title: "WebSocket Gemini Live", desc: "Streaming bidireccional de audio/video vía client.aio.live.connect" },
          { num: "Capa 02", title: "VAD e Interrupciones", desc: "Detección de voz (VAD) y corte natural ante interrupciones ('barge-in')" },
          { num: "Capa 03", title: "Herramientas en Vivo", desc: "Ejecución en tiempo real de funciones (costos, inventario, multimedia)" },
          { num: "Capa 04", title: "Arnés Antigravity SDK", desc: "Planificación multi-paso, gestión de contexto y ejecución de agentes" }
        ],
        sections: [
          {
            heading: "1. Streaming Multimodal Bidireccional con Gemini Live API",
            body: [
              "A diferencia de las peticiones HTTP tradicionales, Gemini Live API (`client.aio.live.connect`) abre una sesión WebSocket persistente y full-duplex. Tu aplicación envía audio PCM, video o texto en tiempo real y recibe voz sintetizada y llamadas a herramientas con latencia ultrabaja.",
              "La Detección de Actividad de Voz (VAD) en el servidor detecta automáticamente cuando el usuario interrumpe ('barge-in') y detiene la locución en curso para una conversación fluida."
            ]
          },
          {
            heading: "2. El SDK de Google Antigravity: Arnés Agéntico para Desarrolladores",
            body: [
              "Google Antigravity (antigravity.google) es la plataforma de desarrollo agent-first de Google. El SDK de Antigravity brinda acceso programático al mismo arnés agéntico—gestionando bucles de herramientas, memoria de contexto, delegación a subagentes y estado del espacio de trabajo—usando tu API Key de Google AI Studio."
            ],
            codeTitle: "labs/module-03-live-agents/live_copilot_agent.py",
            code: `import asyncio
from google import genai
from google.genai import types

client = genai.Client()

def calculate_unit_economics(unit_cost_usd: float, retail_price_usd: float, volume: int) -> dict:
    """Calcula el margen bruto porcentual y la ganancia total para un SKU."""
    margin_pct = round(((retail_price_usd - unit_cost_usd) / retail_price_usd) * 100, 2)
    total_profit = round((retail_price_usd - unit_cost_usd) * volume, 2)
    return {"gross_margin_pct": margin_pct, "total_profit_usd": total_profit}

async def run_live_copilot_session():
    config = types.LiveConnectConfig(
        response_modalities=["TEXT"],
        system_instruction="Eres el Copiloto en Vivo de Product Studio. Usa herramientas para cálculos financieros.",
        tools=[calculate_unit_economics],
    )
    async with client.aio.live.connect(model="gemini-3.8-live", config=config) as session:
        await session.send(
            input="Si nuestra taza solar cuesta $18 de fabricar y se vende a $65 para 5,000 unidades, ¿cuál es el margen?",
            end_of_turn=True,
        )
        async for message in session.receive():
            if message.text:
                print(message.text, end="")

if __name__ == "__main__":
    asyncio.run(run_live_copilot_session())`
          }
        ],
        quiz: {
          question: "¿Qué diferencia fundamentalmente a Gemini Live API frente a las llamadas estándar generate_content?",
          options: [
            "Solo procesa archivos CSV por lotes.",
            "Mantiene una sesión WebSocket bidireccional con estado que soporta audio/video en tiempo real, VAD, interrupción natural (barge-in) y ejecución de herramientas en vivo.",
            "No permite invocar funciones.",
            "Requiere compilar drivers en C++."
          ],
          correctIndex: 1,
          explanation: "¡Correcto! Gemini Live API mantiene una conexión WebSocket asíncrona (`client.aio.live.connect`) para interacciones multimodales en tiempo real con soporte nativo de interrupciones y herramientas."
        },
        references: [
          { title: "Documentación Oficial de Gemini Live API", desc: "Guía de streaming bidireccional de audio, video y herramientas", url: "https://ai.google.dev/gemini-api/docs/live-api" },
          { title: "Guía de Function Calling / Tool Use", desc: "Cómo conectar modelos Gemini con herramientas y APIs externas", url: "https://ai.google.dev/gemini-api/docs/function-calling" },
          { title: "Portal Oficial de Google Antigravity", desc: "Plataforma agent-first, CLI y documentación del SDK de Antigravity", url: "https://antigravity.google" },
          { title: "Referencia del Cliente Asíncrono Live", desc: "Documentación técnica de client.aio.live en Python", url: "https://googleapis.github.io/python-genai/" }
        ]
      },
      {
        id: "module-04",
        tag: "Módulo 04",
        title: "Despliegue a Producción, Integración con GitHub, Cloud Run, Seguridad y Proyecto Hito",
        eyebrow: "Módulo 04 · Ingeniería de Producción y Proyecto Hito",
        summary: "Contenedoriza la app full-stack AI Product Studio & Live Copilot, automatiza CI/CD con GitHub Actions sin llaves estáticas (Workload Identity Federation), protege secretos en Secret Manager, blinda contra inyección de prompts y despliega en Google Cloud Run.",
        readTime: "65 min",
        labPath: "milestone-project/",
        notebookPath: "notebooks/04_Security_Evals_and_Graduation_to_Antigravity.ipynb",
        mdPath: "es/module-04-deploy-github-cloudrun-security/README.md",
        archFlow: [
          { num: "Despliegue 01", title: "Git Push a main", desc: "Dispara automáticamente el pipeline CI/CD en GitHub Actions" },
          { num: "Despliegue 02", title: "Workload Identity Fed.", desc: "Autenticación OIDC sin llaves JSON estáticas hacia GCP" },
          { num: "Despliegue 03", title: "Secret Manager", desc: "Inyecta GEMINI_API_KEY en tiempo de ejecución con mínimo privilegio" },
          { num: "Despliegue 04", title: "Google Cloud Run", desc: "Contenedor HTTPS y WebSocket autoescalable con afinidad de sesión" }
        ],
        sections: [
          {
            heading: "1. Lista de Verificación de Seguridad en Profundidad para Apps de IA",
            body: [
              "Llevar una aplicación de IA generativa a producción exige proteger tanto la infraestructura cloud como la capa de interacción con el modelo:"
            ],
            bullets: [
              "<strong>Cero Secretos en Código:</strong> Monta `GEMINI_API_KEY` desde Google Cloud Secret Manager (`--set-secrets=GEMINI_API_KEY=gemini-api-key:latest`).",
              "<strong>CI/CD Sin Llaves Estáticas:</strong> Usa `google-github-actions/auth@v2` con Workload Identity Federation en lugar de exportar archivos JSON.",
              "<strong>Defensa contra Prompt Injection:</strong> Valida longitud, sanea entradas, separa datos del usuario de `system_instruction` y exige esquemas JSON.",
              "<strong>Rate Limiting y Control de Costos:</strong> Aplica límites de peticiones por IP/usuario y define topes `--max-instances` en Cloud Run."
            ]
          },
          {
            heading: "2. Pipeline CI/CD en GitHub Actions hacia Cloud Run",
            body: [
              "Este es el flujo de trabajo de producción incluido en `.github/workflows/deploy-cloudrun.yml`:"
            ],
            codeTitle: ".github/workflows/deploy-cloudrun.yml",
            code: `name: Deploy AI Product Studio to Cloud Run
on:
  push:
    branches: [ "main" ]
    paths: [ "milestone-project/**" ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: "read"
      id-token: "write" # Requerido para Workload Identity Federation sin llaves
    steps:
      - uses: actions/checkout@v4
      - id: auth
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: \${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: \${{ secrets.GCP_SERVICE_ACCOUNT }}
      - id: deploy
        uses: google-github-actions/deploy-cloudrun@v2
        with:
          service: ai-product-studio
          region: us-central1
          source: ./milestone-project
          flags: "--allow-unauthenticated --session-affinity --set-secrets=GEMINI_API_KEY=gemini-api-key:latest"`
          }
        ],
        quiz: {
          question: "¿Por qué se recomienda usar Workload Identity Federation (google-github-actions/auth@v2) en GitHub Actions en lugar de llaves JSON de cuentas de servicio?",
          options: [
            "Porque utiliza tokens OIDC efímeros de corta duración y elimina el riesgo de filtración de llaves JSON estáticas.",
            "Porque las llaves JSON solo funcionan en Windows.",
            "Porque Cloud Run no soporta Docker sin llaves JSON.",
            "Porque desactiva HTTPS."
          ],
          correctIndex: 0,
          explanation: "¡Correcto! Workload Identity Federation intercambia tokens OIDC efímeros de GitHub por credenciales temporales de GCP, eliminando por completo las llaves estáticas de larga duración."
        },
        references: [
          { title: "Documentación de Google Cloud Run", desc: "Despliegue de contenedores web y WebSockets en Cloud Run", url: "https://cloud.google.com/run/docs" },
          { title: "GitHub Action: deploy-cloudrun", desc: "Acción oficial de GitHub para desplegar en Cloud Run", url: "https://github.com/google-github-actions/deploy-cloudrun" },
          { title: "Google Cloud Secret Manager", desc: "Gestión segura de API keys y secretos en Cloud Run", url: "https://cloud.google.com/secret-manager/docs" },
          { title: "Configuración de Seguridad en Gemini API", desc: "Umbrales y filtros de seguridad de contenido", url: "https://ai.google.dev/gemini-api/docs/safety-settings" }
        ]
      },
      {
        id: "surprise-finisher",
        tag: "Cierre Sorpresa 🎓",
        title: "Quiero Graduarme para Usar Google Antigravity",
        eyebrow: "Cierre Sorpresa · Graduación hacia Ingeniería Agent-First",
        summary: "Construiste y desplegaste una app multimodal completa en producción. Ahora da el gran salto: gradúate de escribir llamadas individuales a la API para orquestar flujos de ingeniería autónomos multi-agente dentro de Google Antigravity (antigravity.google).",
        readTime: "45 min",
        labPath: "milestone-project/.agents/",
        notebookPath: "notebooks/04_Security_Evals_and_Graduation_to_Antigravity.ipynb",
        mdPath: "es/surprise-finisher-graduate-to-antigravity/README.md",
        archFlow: [
          { num: "Grad 01", title: "Espacio Antigravity", desc: "Abre tu repositorio del Proyecto Hito en Google Antigravity (antigravity.google)" },
          { num: "Grad 02", title: ".agents/rules/", desc: "Codifica reglas de arquitectura, seguridad y estándares del SDK" },
          { num: "Grad 03", title: ".agents/skills/", desc: "Crea playbooks SKILL.md reutilizables para tests, evals y despliegue" },
          { num: "Grad 04", title: "Subagentes y MCP", desc: "Lanza agentes autónomos en paralelo para desarrollar y verificar código" }
        ],
        sections: [
          {
            heading: "1. El Salto de Graduación: De Consumidor de APIs a Orquestador de Agentes",
            body: [
              "En los Módulos 1 al 4 aprendiste a integrar Gemini, Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2), Gemini Omni 1.1 Flash (`gemini-omni-1.1-flash`) y Live API dentro de tu código. En el Cierre Sorpresa inviertes la perspectiva: te gradúas hacia Google Antigravity (antigravity.google), donde agentes autónomos de ingeniería colaboran contigo en todo tu repositorio, terminal, navegador e infraestructura cloud.",
              "Dado que Antigravity se conecta directamente con tus API Keys de Google AI Studio y proyectos de Google Cloud, todo lo que configuraste en los Módulos 1–4 funciona de inmediato."
            ],
            bullets: [
              "<strong>Reglas del Repositorio (.agents/rules/):</strong> Instrucciones persistentes de arquitectura y seguridad que todo agente respeta automáticamente (incluidas en `milestone-project/.agents/rules/architecture.md`).",
              "<strong>Skills Personalizados (.agents/skills/<nombre>/SKILL.md):</strong> Playbooks modulares que enseñan a tus agentes cómo ejecutar evaluaciones, desplegar en Cloud Run o auditar seguridad.",
              "<strong>Model Context Protocol (MCP):</strong> Conecta herramientas en vivo, bases de datos y documentación directamente al arnés de Antigravity.",
              "<strong>Subagentes en Paralelo:</strong> Delega investigación, implementación, pruebas y revisión de código en paralelo con el SDK de Antigravity."
            ]
          },
          {
            heading: "2. Artefacto de Graduación: Tu Primer Skill de Antigravity",
            body: [
              "Explora el Skill de Antigravity listo para usar incluido en `milestone-project/.agents/skills/product-studio-ops/SKILL.md`:"
            ],
            codeTitle: "milestone-project/.agents/skills/product-studio-ops/SKILL.md",
            code: `---
name: product-studio-ops
description: Ejecuta verificaciones de salud, validación de esquemas y despliegues a Cloud Run para la aplicación AI Product Studio.
---

# Skill de Operaciones: AI Product Studio

1. **Verificación Previa**: Comprueba que todos los endpoints usen el SDK unificado \`google-genai\` y que no existan secretos en código.
2. **Pruebas de Humo**: Ejecuta \`pytest\` y valida que \`/api/health\` responda HTTP 200.
3. **Despliegue**: Ejecuta \`./deploy-cloudrun.sh\` para desplegar con Secret Manager.`
          }
        ],
        quiz: {
          question: "¿Cómo transforman `.agents/rules/` y `.agents/skills/` tu repositorio al graduarte hacia Google Antigravity?",
          options: [
            "Convierten tu proyecto en un espacio de trabajo agent-ready donde los agentes autónomos de Antigravity respetan tus reglas arquitectónicas y ejecutan flujos de ingeniería reutilizables.",
            "Borran tu archivo Dockerfile.",
            "Reemplazan Python por ensamblador.",
            "Desactivan Git."
          ],
          correctIndex: 0,
          explanation: "¡Felicidades, Graduado/a! Al incorporar `.agents/rules/` y `.agents/skills/`, tu proyecto es ahora un entorno de ingeniería autónoma de primer nivel en Google Antigravity (`antigravity.google`)."
        },
        references: [
          { title: "Plataforma Oficial Google Antigravity", desc: "Descarga Google Antigravity IDE, CLI y el SDK de Antigravity", url: "https://antigravity.google" },
          { title: "Portal de Google AI Studio", desc: "Administra tus llaves de API y telemetría de Gemini para tus agentes", url: "https://aistudio.google.com" },
          { title: "Especificación Model Context Protocol (MCP)", desc: "Estándar abierto para conectar agentes de IA con herramientas y datos", url: "https://modelcontextprotocol.io" },
          { title: "Bibliografía Maestra del Curso (ES)", desc: "Directorio completo de referencias públicas verificadas", url: "https://github.com/AllInVaders/aistudio-full-course/blob/main/es/REFERENCES.md" }
        ]
      }
    ]
  }
};
