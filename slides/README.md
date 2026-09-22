# Google AI Studio: Zero to Hero → Antigravity — Course Presentation & Live Testing Playbook

[![Open Google Slides Presentation](https://img.shields.io/badge/Google_Slides-Open_20--Slide_Deck-f59e0b?style=for-the-badge)](https://docs.google.com/presentation/d/1mYxjBzqB56KKXE7WrFRqiRQJo3K9mvRZ9iKYGdgGJ3M/edit)
[![GitHub Course Repository](https://img.shields.io/badge/GitHub-AllInVaders%2Faistudio--full--course-2563eb?style=for-the-badge)](https://github.com/AllInVaders/aistudio-full-course)

- **Live Editable Google Slides Deck (20 Slides + Speaker Notes)**: [https://docs.google.com/presentation/d/1mYxjBzqB56KKXE7WrFRqiRQJo3K9mvRZ9iKYGdgGJ3M/edit](https://docs.google.com/presentation/d/1mYxjBzqB56KKXE7WrFRqiRQJo3K9mvRZ9iKYGdgGJ3M/edit)
- **Interactive Course Web Portal (`EN` / `ES`)**: [https://allinvaders.github.io/aistudio-full-course/](https://allinvaders.github.io/aistudio-full-course/)

---

## Step-by-Step Instructions: How to Get & Secure Your Google AI Studio API Key (`Slide 02`)

1. **Open the API Key Console**: Visit [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey) and sign in with your Google account.
2. **Create Your API Key**: Click **"Create API key"** and select **"Create API key in new project"** (or link an existing Google Cloud project).
3. **Choose Your Billing & Privacy Tier**:
   - **Free Tier**: Instant testing and prototyping with zero upfront billing.
   - **Paid Tier (Recommended for Production)**: Link a Google Cloud Billing account so your prompts and outputs are **never** used to train models and higher RPM/TPM quotas unlock automatically.
4. **Configure Locally via `.env` (Never Commit Keys to Git!)**:
   ```bash
   git clone https://github.com/AllInVaders/aistudio-full-course.git
   cd aistudio-full-course
   cp .env.example .env
   # Paste GEMINI_API_KEY=AIzaSy... inside .env
   ```
5. **Verify Your Setup with Our Diagnostic Lab**:
   ```bash
   pip install -U "google-genai>=2.3.0"
   python3 labs/module-01-setup-verify/verify_setup.py
   ```

---

## Complete 20-Slide Index & Copy-Paste Prompts

| Slide | Title | Feature Tested & GitHub Link |
| :-: | :--- | :--- |
| **01** | **Course Roadmap: Zero to Hero → Antigravity** | [Master Course Index](../README.md) |
| **02** | **How to Get, Configure & Secure Your `GEMINI_API_KEY`** | [Get API Key](https://aistudio.google.com/apikey) · [`verify_setup.py`](../labs/module-01-setup-verify/verify_setup.py) |
| **03** | **Visual Map of the Google AI Studio Workspace** | [Module 01 Guide](../en/module-01-setup-iam-billing/README.md) |
| **04** | **Live Test #1: `gemini-3.8-flash` & Thinking Levels (`Low` vs `High`)** | [Notebook 01](../notebooks/01_Setup_Models_and_Token_Economics.ipynb) |
| **05** | **The 5-Pillar Formula for Production System Instructions** | [Module 02 Guide](../en/module-02-basics-prompts-media-llms/README.md) |
| **06** | **Live Test #2: 3 System Instruction Personas to Test** | [`product_studio_stage1.py`](../labs/module-02-prompts-media/product_studio_stage1.py) |
| **07** | **Live Test #3: Deterministic Structured JSON Outputs (`Pydantic`)** | [`product_studio_stage1.py`](../labs/module-02-prompts-media/product_studio_stage1.py) |
| **08** | **Mastering `gemini-3.1-flash-image` (Nano Banana 2 Family)** | [Notebook 02](../notebooks/02_Prompts_Structured_Outputs_Gemini_Image_and_Omni_Video.ipynb) |
| **09** | **Live Test #4: 3 Image Prompts & Multi-Turn Edits to Test** | [`product_studio_stage1.py`](../labs/module-02-prompts-media/product_studio_stage1.py) |
| **10** | **Mastering `gemini-omni-1.1-flash` Video Generation & Editing** | [Notebook 02](../notebooks/02_Prompts_Structured_Outputs_Gemini_Image_and_Omni_Video.ipynb) |
| **11** | **Live Test #5: 3 Video Prompts & Conversational Scene Edits** | [`product_studio_stage1.py`](../labs/module-02-prompts-media/product_studio_stage1.py) |
| **12** | **Stage 1 Capstone Pipeline: Brief → Image → Omni Video** | [`product_studio_stage1.mjs`](../labs/module-02-prompts-media/product_studio_stage1.mjs) |
| **13** | **Building Tool-Using Agents (`Function Calling`, `Search`, `Code Exec`)** | [Module 03 Guide](../en/module-03-live-agents-antigravity-sdk/README.md) |
| **14** | **Live Test #6: 3 Agent Blueprints & Function Declarations** | [`antigravity_agent_demo.py`](../labs/module-03-live-agents/antigravity_agent_demo.py) |
| **15** | **Real-Time Voice & Vision with `gemini-3.8-live` & `extended-thinking`** | [`live_copilot_agent.py`](../labs/module-03-live-agents/live_copilot_agent.py) |
| **16** | **Live Test #7: 3 Webcam, Screen-Share & Barge-In Live Agents** | [Notebook 03](../notebooks/03_Gemini_Live_API_Tool_Agents_and_Antigravity_SDK.ipynb) |
| **17** | **Programmatic `client.aio.live.connect` + Python Tool Bridge** | [`milestone-project/app/main.py`](../milestone-project/app/main.py) |
| **18** | **Module 04: Cloud Run Deployment, Keyless GitHub CI/CD & Security** | [`.github/workflows/deploy-cloudrun.yml`](../.github/workflows/deploy-cloudrun.yml) |
| **19** | **Surprise Finisher: Graduating to Google Antigravity (`antigravity.google`)** | [`.agents/skills/product-studio-ops/SKILL.md`](../milestone-project/.agents/skills/product-studio-ops/SKILL.md) |
| **20** | **Master AI Studio Feature Testing Checklist & Public Links** | [English Refs](../en/REFERENCES.md) · [Referencias ES](../es/REFERENCES.md) |
