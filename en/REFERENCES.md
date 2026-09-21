# 📚 Master Directory of Verified Public References & Official Documentation

> **Navigation:** [← Course Home (`./README.md`)](./README.md) | [Module 01](./module-01-setup-iam-billing/README.md) | [Module 02](./module-02-basics-prompts-media-llms/README.md) | [Module 03](./module-03-live-agents-antigravity-sdk/README.md) | [Module 04](./module-04-deploy-github-cloudrun-security/README.md) | [Surprise Finisher](./surprise-finisher-graduate-to-antigravity/README.md)

This master reference directory compiles every **verified public URL, official SDK repository, documentation portal, cloud security standard, and CI/CD integration guide** referenced across the **Google AI Studio & Gemini Full Course**.

---

## 1. Core Platforms & Developer Portals

| Resource | Verified Public URL | Description |
| :--- | :--- | :--- |
| **Google AI Studio** | [https://aistudio.google.com](https://aistudio.google.com) | Primary web workbench for prototyping prompts, testing Gemini 3.x / Gemini Image / Gemini Omni models, streaming live audio/video, and managing API keys. |
| **Gemini API Official Documentation** | [https://ai.google.dev/gemini-api/docs](https://ai.google.dev/gemini-api/docs) | Complete technical documentation for all Gemini Developer API models, endpoints, parameters, and capabilities. |
| **Google Antigravity** | [https://antigravity.google](https://antigravity.google) | Google's agent-first software development platform and autonomous multi-agent orchestration environment. |
| **Google Antigravity Docs** | [https://antigravity.google/docs](https://antigravity.google/docs) | Official documentation for Antigravity workspace rules, custom skills (`SKILL.md`), subagents, and MCP servers. |
| **Google Cloud Vertex AI** | [https://cloud.google.com/vertex-ai](https://cloud.google.com/vertex-ai) | Enterprise MLOps and generative AI platform on Google Cloud with VPC-SC, CMEK, and regional compliance controls. |

---

## 2. Official Unified Google Gen AI SDK Repositories

> [!IMPORTANT]
> Always use the modern unified SDKs listed below (`google-genai` for Python and `@google/genai` for TypeScript/JS). Never use the legacy deprecated `google-generativeai` package.

| SDK / Language | Official Repository & Package URL | Installation Command |
| :--- | :--- | :--- |
| **Python SDK (`google-genai`)** | [https://github.com/googleapis/python-genai](https://github.com/googleapis/python-genai) | `pip install google-genai` |
| **TypeScript / JS SDK (`@google/genai`)** | [https://github.com/googleapis/js-genai](https://github.com/googleapis/js-genai) | `npm install @google/genai` |
| **Go SDK (`google.golang.org/genai`)** | [https://github.com/googleapis/go-genai](https://github.com/googleapis/go-genai) | `go get google.golang.org/genai` |
| **Gemini API Cookbook & Examples** | [https://github.com/google-gemini/cookbook](https://github.com/google-gemini/cookbook) | Official collection of notebooks and end-to-end multimodal guides. |

---

## 3. Model Capabilities, Prompting & Multimodal Generation Guides

| Topic | Verified Public URL | Covered In |
| :--- | :--- | :--- |
| **Gemini Model Catalog & Token Limits** | [https://ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models) | Module 01, Module 02 |
| **Gemini 3.7 / 3.1 Thinking & Reasoning Budgets** | [https://ai.google.dev/gemini-api/docs/thinking](https://ai.google.dev/gemini-api/docs/thinking) | Module 02 |
| **Structured Outputs (JSON Schema & Pydantic)** | [https://ai.google.dev/gemini-api/docs/structured-output](https://ai.google.dev/gemini-api/docs/structured-output) | Module 02, Module 04 |
| **Prompt Design & System Instructions** | [https://ai.google.dev/gemini-api/docs/prompting-strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies) | Module 02 |
| **Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2) Image Generation** | [https://ai.google.dev/gemini-api/docs/image-generation](https://ai.google.dev/gemini-api/docs/image-generation) | Module 02 |
| **Gemini Omni 1.1 Flash Video Generation** | [https://ai.google.dev/gemini-api/docs/video](https://ai.google.dev/gemini-api/docs/video) | Module 02 |
| **Gemini Live API (Bidirectional Streaming)** | [https://ai.google.dev/gemini-api/docs/live](https://ai.google.dev/gemini-api/docs/live) | Module 03, Module 04 |
| **Function Calling & Tool Use** | [https://ai.google.dev/gemini-api/docs/function-calling](https://ai.google.dev/gemini-api/docs/function-calling) | Module 03 |
| **Context Caching Guide** | [https://ai.google.dev/gemini-api/docs/caching](https://ai.google.dev/gemini-api/docs/caching) | Module 01, Surprise Finisher |

---

## 4. IAM, Billing, Quotas, Data Privacy & Security

| Topic | Verified Public URL | Covered In |
| :--- | :--- | :--- |
| **Gemini API Pricing (Free vs. Paid Tiers)** | [https://ai.google.dev/pricing](https://ai.google.dev/pricing) | Module 01 |
| **Gemini API Rate Limits & Quotas** | [https://ai.google.dev/gemini-api/docs/rate-limits](https://ai.google.dev/gemini-api/docs/rate-limits) | Module 01 |
| **Gemini API Terms of Service & Privacy** | [https://ai.google.dev/gemini-api/terms](https://ai.google.dev/gemini-api/terms) | Module 01 |
| **Gemini API Safety Settings & Thresholds** | [https://ai.google.dev/gemini-api/docs/safety-settings](https://ai.google.dev/gemini-api/docs/safety-settings) | Module 04 |
| **Google Cloud IAM Least-Privilege Guide** | [https://cloud.google.com/iam/docs/best-practices-service-accounts](https://cloud.google.com/iam/docs/best-practices-service-accounts) | Module 01, Module 04 |
| **Google Cloud Billing Budgets & Alerts** | [https://cloud.google.com/billing/docs/how-to/budgets](https://cloud.google.com/billing/docs/how-to/budgets) | Module 01 |
| **Google Cloud Secret Manager** | [https://cloud.google.com/secret-manager/docs](https://cloud.google.com/secret-manager/docs) | Module 01, Module 04 |

---

## 5. Cloud Run, Containers, GitHub Actions CI/CD & Agent Standards

| Topic | Verified Public URL | Covered In |
| :--- | :--- | :--- |
| **Google Cloud Run Documentation** | [https://cloud.google.com/run/docs](https://cloud.google.com/run/docs) | Module 04 |
| **Cloud Run WebSockets & Session Affinity** | [https://cloud.google.com/run/docs/triggering/websockets](https://cloud.google.com/run/docs/triggering/websockets) | Module 04 |
| **GitHub Actions `google-github-actions/auth`** | [https://github.com/google-github-actions/auth](https://github.com/google-github-actions/auth) | Module 04 |
| **GitHub Actions `deploy-cloudrun`** | [https://github.com/google-github-actions/deploy-cloudrun](https://github.com/google-github-actions/deploy-cloudrun) | Module 04 |
| **GitHub Actions OIDC Security Hardening** | [https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect) | Module 04 |
| **Model Context Protocol (MCP) Specification** | [https://modelcontextprotocol.io](https://modelcontextprotocol.io) | Module 03, Surprise Finisher |
