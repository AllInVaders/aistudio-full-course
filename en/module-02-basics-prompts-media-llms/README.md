# Module 02: Basics, Prompts, System Instructions, Media Generation & Language Models

> **Navigation:** [← Module 01: Setup, IAM & Billing](../module-01-setup-iam-billing/README.md) | [Course Home (`../README.md`)](../README.md) | **Next:** [Module 03: Live Models, Agents, Antigravity SDK & Apps →](../module-03-live-agents-antigravity-sdk/README.md)

Welcome to **Module 02**! Now that your Google AI Studio environment, IAM permissions, and billing guardrails are in place, it is time to master the core generative engines of the Gemini ecosystem: **Gemini 2.5 Pro & Flash reasoning models, System Instructions, strict Pydantic Structured Outputs, Imagen 3 high-resolution image synthesis, and Veo video generation.**

In this module, we build **Stage 1 of our Flagship Milestone Project: The AI Product Studio Creative Engine**—a complete multimodal pipeline that transforms a single founder/product idea into a validated technical specification, structured marketing campaign JSON, photorealistic product hero images, and a cinematic product reveal video reel.

---

## 🎯 Learning Objectives

By the end of this module, you will be able to:
1. Choose strategically between **Gemini 2.5 Flash** (high-speed, cost-efficient workhorse) and **Gemini 2.5 Pro** (deep complex reasoning & coding flagship) based on latency, task complexity, and token economics.
2. Control internal chain-of-thought reasoning depth and latency dynamically using **`thinking_config` (`ThinkingConfig(thinking_budget=...)`)**.
3. Craft deterministic, production-grade **System Instructions** using persona anchoring, XML/Markdown structural delimiters, and few-shot exemplars.
4. Guarantee 100% schema-compliant JSON outputs using **Pydantic models** in Python (`response_schema=ProductLaunchPlan`) and **TypeScript JSON Schemas**.
5. Generate high-resolution visual assets with **Imagen 3** (`client.models.generate_images`) and asynchronous HD video reels with **Veo** (`client.models.generate_videos`).
6. Assemble and run **Stage 1 of the Flagship Project**: the **AI Product Studio Creative Engine**.

---

## 🏗️ Architecture Diagram: Stage 1 AI Product Studio Creative Engine

```mermaid
flowchart LR
    UserPrompt["💡 Raw Product Brief\n(Text / Sketch / Audio)"] --> Router{"Model Selection &\nThinking Budget"}

    Router -->|"Deep Strategy & Architecture\nthinking_budget=2048"| Pro["Gemini 2.5 Pro\n(Complex Reasoning)"]
    Router -->|"Fast Copy & Iteration\nthinking_budget=0 or 512"| Flash["Gemini 2.5 Flash\n(Low-Latency Workhorse)"]

    Pro --> Schema["Pydantic Structured Output\nresponse_mime_type='application/json'\nresponse_schema=ProductStudioBundle"]
    Flash --> Schema

    Schema --> SpecJSON["📦 Validated JSON Spec\n• Product Name & Tagline\n• Target Personas\n• Hero Image Prompt\n• Veo Video Storyboard"]

    SpecJSON -->|"client.models.generate_images()"| Imagen["🎨 Imagen 3\n(imagen-3.0-generate-002)\nPhotorealistic Product Shots"]
    SpecJSON -->|"client.models.generate_videos()"| Veo["🎬 Veo Video Engine\n(veo-2.0-generate-001)\nCinematic Product Reveal MP4"]

    Imagen --> Bundle["✨ Complete Product Studio Asset Bundle"]
    Veo --> Bundle
```

---

## 1. Deep Conceptual Walkthrough: Gemini 2.5 Model Family & Thinking Budgets

The Gemini 2.5 generation introduces **native hybrid thinking models** capable of reasoning through multi-step problems before emitting their final answer.

### Gemini 2.5 Flash vs. Gemini 2.5 Pro Decision Matrix

| Model ID | Sweet Spot | Context Window | Speed & Cost | When to Use in Your App |
| :--- | :--- | :--- | :--- | :--- |
| **`gemini-2.5-flash`** | High-frequency, low-latency multimodal tasks | Up to **1,048,576 tokens** (1M+) | **Ultra-fast** & lowest cost per token | Real-time UI copilots, classification, summarization, extraction, and high-QPS API endpoints. |
| **`gemini-2.5-pro`** | Deep reasoning, complex coding, architecture & STEM | Up to **1,048,576+ tokens** (1M–2M) | Moderate latency, higher reasoning density | Complex product strategy, multi-file code synthesis, legal/financial analysis, and intricate agent planning. |

### Controlling Reasoning with `thinking_config`
With Gemini 2.5 models, you do not have to choose between a "non-thinking" model and a "slow thinking" model—you control the exact **Thinking Token Budget** per API call!

- **`thinking_budget = 0`**: Disables internal thinking tokens for minimum time-to-first-token (ideal for instant chat replies or simple classification).
- **`thinking_budget = 1024` to `4096`**: Allocates a dedicated scratchpad of reasoning tokens so the model can plan edge cases, check constraints, and self-correct before generating output.
- **`include_thoughts = True`**: Returns the model's internal thought summary alongside the final answer so you can inspect or display a "Thinking..." accordion in your UI!

```python
from google import genai
from google.genai import types

client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Design a pricing strategy for an AI hardware wearable with a $78 BOM cost.",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
            thinking_budget=1024,
            include_thoughts=True,
        ),
        temperature=0.2,
    ),
)

for part in response.candidates[0].content.parts:
    if part.thought:
        print(f"🧠 [INTERNAL THOUGHT SUMMARY]:\n{part.text}\n")
    else:
        print(f"✅ [FINAL ANSWER]:\n{part.text}")
```

---

## 2. System Instructions & Structured Outputs (Guaranteed JSON)

In production software engineering, **regex-parsing markdown code blocks (` ```json ... ``` `) out of LLM responses is an anti-pattern.**

When you combine **System Instructions** with **Structured Outputs (`response_schema`)**, the Gemini decoding engine constrains token sampling at the grammar level—guaranteeing that every single response conforms 100% to your Pydantic schema.

### Best Practices for System Instructions
1. **Define Role & Domain Authority:** State clearly who the model is and what standards it enforces.
2. **Separate Instructions from Untrusted User Data:** Use explicit XML tags (e.g., `<user_brief>...</user_brief>`) so user input cannot override system directives.
3. **Pair with `response_schema`:** Let Pydantic enforce field types, enums, descriptions, and nested arrays rather than wasting prompt tokens explaining JSON syntax.

---

## 3. Multimodal Media Synthesis: Imagen 3 & Veo

Our **AI Product Studio** doesn't just write text specs—it generates studio-grade visual and video assets using the exact same `genai.Client()`!

### Photorealistic Image Generation with Imagen 3 (`client.models.generate_images`)
- **Model:** `imagen-3.0-generate-002`
- **Capabilities:** Crisp typography rendering, studio lighting control, aspect ratio selection (`1:1`, `16:9`, `9:16`, `4:3`, `3:4`), and person-generation safety controls.

### Cinematic Video Generation with Veo (`client.models.generate_videos`)
- **Model:** `veo-2.0-generate-001`
- **Asynchronous Operation Pattern:** Because rendering high-definition physics-accurate video takes ~30–90 seconds, `client.models.generate_videos(...)` returns a long-running `operation` object that you poll cleanly with `client.operations.get(operation)`.

---

## 🛠️ Hands-On Build: Stage 1 of the Flagship Project (`Product Studio Creative Engine`)

Let's build the complete, copy-pasteable **Stage 1 Creative Engine** in both **Python** and **TypeScript**. Given any product concept, this engine:
1. Uses **Gemini 2.5 Flash/Pro** with a `thinking_budget` and **Pydantic Structured Outputs** to generate a complete `ProductLaunchBundle`.
2. Feeds the generated `imagen_prompt` directly into **Imagen 3** to render a high-resolution product hero image (`product_hero.png`).
3. Feeds the generated `veo_video_prompt` directly into **Veo** to render a cinematic product launch video (`product_reveal.mp4`).

### Complete Python Implementation (`stage1_creative_engine.py`)

```python
"""
Flagship Milestone Project — Stage 1: AI Product Studio Creative Engine
Generates Structured Product Specs (Gemini 2.5) + Hero Art (Imagen 3) + Video Reel (Veo).
"""

from io import BytesIO
import time
from typing import List
from google import genai
from google.genai import types
from PIL import Image
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# 1. Define Strict Pydantic Schemas for Guaranteed Structured Outputs
# ---------------------------------------------------------------------------
class TargetPersona(BaseModel):
    persona_name: str = Field(description="Name of the buyer persona")
    pain_point: str = Field(description="Primary problem this persona faces")
    value_hook: str = Field(description="One-sentence pitch tailored to this persona")


class ProductLaunchBundle(BaseModel):
    product_name: str = Field(description="Memorable, brandable product name")
    tagline: str = Field(description="Punchy 5-8 word hero tagline")
    elevator_pitch: str = Field(description="Compelling 2-sentence product summary")
    key_features: List[str] = Field(description="Top 4 technical differentiators")
    target_personas: List[TargetPersona] = Field(description="2 distinct target personas")
    imagen_prompt: str = Field(
        description="Highly detailed studio photography prompt for Imagen 3 (lighting, lens, materials, composition)"
    )
    veo_video_prompt: str = Field(
        description="Cinematic 6-second camera movement and lighting prompt for Veo video generation"
    )


# ---------------------------------------------------------------------------
# 2. Stage 1 Pipeline Orchestrator
# ---------------------------------------------------------------------------
def build_product_studio_assets(raw_idea: str, generate_video: bool = False) -> ProductLaunchBundle:
    client = genai.Client()

    print(f"🚀 Step 1/3: Synthesizing Structured Product Strategy for: '{raw_idea}'...")
    spec_response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"<user_product_brief>{raw_idea}</user_product_brief>",
        config=types.GenerateContentConfig(
            system_instruction=(
                "You are the Chief Product Officer and Creative Director at an elite industrial "
                "design and AI hardware studio. Transform the user brief inside <user_product_brief> "
                "into a complete, commercially viable product launch specification."
            ),
            thinking_config=types.ThinkingConfig(thinking_budget=1024),
            response_mime_type="application/json",
            response_schema=ProductLaunchBundle,
            temperature=0.3,
        ),
    )

    # Parse directly into our validated Pydantic model
    bundle: ProductLaunchBundle = spec_response.parsed
    print(f"✅ Generated Product: {bundle.product_name} — '{bundle.tagline}'")
    print(f"📸 Imagen 3 Prompt : {bundle.imagen_prompt}")
    print(f"🎬 Veo Video Prompt: {bundle.veo_video_prompt}")

    # -----------------------------------------------------------------------
    # 3. Generate Photorealistic Hero Image with Imagen 3
    # -----------------------------------------------------------------------
    print("\n🎨 Step 2/3: Rendering 16:9 Studio Hero Shot with Imagen 3...")
    image_result = client.models.generate_images(
        model="imagen-3.0-generate-002",
        prompt=bundle.imagen_prompt,
        config=types.GenerateImagesConfig(
            number_of_images=1,
            aspect_ratio="16:9",
            output_mime_type="image/png",
            person_generation="ALLOW_ADULT",
        ),
    )

    for generated_image in image_result.generated_images:
        img = Image.open(BytesIO(generated_image.image.image_bytes))
        img.save("product_hero.png")
        print("💾 Saved high-resolution hero image to ./product_hero.png")

    # -----------------------------------------------------------------------
    # 4. Generate Cinematic Product Reveal Video with Veo (Optional Flag)
    # -----------------------------------------------------------------------
    if generate_video:
        print("\n🎬 Step 3/3: Submitting Cinematic Video Generation Job to Veo...")
        operation = client.models.generate_videos(
            model="veo-2.0-generate-001",
            prompt=bundle.veo_video_prompt,
            config=types.GenerateVideosConfig(
                aspect_ratio="16:9",
                person_generation="allow_adult",
            ),
        )

        while not operation.done:
            print("⏳ Veo rendering in progress... checking again in 10 seconds...")
            time.sleep(10)
            operation = client.operations.get(operation)

        generated_video = operation.response.generated_videos[0]
        client.files.download(file=generated_video.video)
        generated_video.video.save("product_reveal.mp4")
        print("💾 Saved cinematic reveal video to ./product_reveal.mp4")

    return bundle


if __name__ == "__main__":
    sample_brief = (
        "A pocket-sized translucent anodized aluminum AI field recorder for journalists "
        "and researchers with instant tactile bookmarking and 48-hour battery life."
    )
    build_product_studio_assets(sample_brief, generate_video=False)
```

### Complete TypeScript Implementation (`stage1_creative_engine.ts`)

```typescript
/**
 * Flagship Milestone Project — Stage 1: AI Product Studio Creative Engine (TypeScript)
 * Uses the official unified TypeScript SDK (`@google/genai`).
 */

import { GoogleGenAI, Type } from "@google/genai";
import * as fs from "fs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function buildProductStudioAssets(rawIdea: string) {
  console.log(`🚀 Synthesizing Structured Product Strategy for: "${rawIdea}"...`);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `<user_product_brief>${rawIdea}</user_product_brief>`,
    config: {
      systemInstruction:
        "You are an elite Industrial Design & Product Marketing Director. Return a complete product launch specification.",
      thinkingConfig: { thinkingBudget: 1024 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING },
          tagline: { type: Type.STRING },
          keyFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
          imagenPrompt: { type: Type.STRING },
          veoVideoPrompt: { type: Type.STRING },
        },
        required: ["productName", "tagline", "keyFeatures", "imagenPrompt", "veoVideoPrompt"],
      },
    },
  });

  const bundle = JSON.parse(response.text!);
  console.log(`✅ Generated Product: ${bundle.productName} — "${bundle.tagline}"`);

  // Render Hero Image with Imagen 3
  const imgResponse = await ai.models.generateImages({
    model: "imagen-3.0-generate-002",
    prompt: bundle.imagenPrompt,
    config: {
      numberOfImages: 1,
      aspectRatio: "16:9",
      outputMimeType: "image/png",
    },
  });

  const base64ImageBytes = imgResponse.generatedImages?.[0]?.image?.imageBytes;
  if (base64ImageBytes) {
    fs.writeFileSync("product_hero.png", Buffer.from(base64ImageBytes, "base64"));
    console.log("💾 Saved high-resolution hero image to ./product_hero.png");
  }

  return bundle;
}

buildProductStudioAssets(
  "A minimalist matte-titanium smart desk lamp that adjusts color temperature based on circadian rhythm."
).catch(console.error);
```

---

## 🧩 Connection to the Flagship Milestone Project

With **Stage 1** complete, our **AI Product Studio** now possesses its core creative brain (`build_product_studio_assets`):
- In **Module 03**, we will expose these exact creative generation functions as **callable tools** inside a real-time **Gemini Live API** voice & video copilot so users can brainstorm live out loud and say *"Generate a new titanium hero shot for that concept right now!"*
- In **Module 04**, we will expose this pipeline behind authenticated REST and WebSocket endpoints on **Google Cloud Run**.

---

## 📝 Module 02 Self-Assessment Quiz

<details>
<summary><strong>Question 1: How do you guarantee that Gemini 2.5 always returns valid JSON matching your exact data model without markdown backticks?</strong></summary>

**Answer:**
Set `response_mime_type="application/json"` AND pass a Pydantic class (or JSON Schema) to `response_schema=...` inside `types.GenerateContentConfig(...)`. The SDK automatically parses the result into `response.parsed`.
</details>

<details>
<summary><strong>Question 2: When should you set `thinking_budget=0` vs. `thinking_budget=2048` on `gemini-2.5-flash`?</strong></summary>

**Answer:**
Use `thinking_budget=0` when you need ultra-low latency for straightforward tasks (like routing, classification, or instant chat acknowledgments). Use a positive budget like `thinking_budget=2048` when the task requires multi-step planning, constraint satisfaction, mathematical reasoning, or architectural synthesis.
</details>

<details>
<summary><strong>Question 3: Why does Veo video generation (`client.models.generate_videos`) return an operation object rather than immediate bytes?</strong></summary>

**Answer:**
High-definition temporal video synthesis is computationally intensive and typically takes tens of seconds to complete. Returning a long-running `operation` allows your server to poll asynchronously (`client.operations.get(operation)`) without holding open or timing out a synchronous HTTP connection.
</details>

---

## 🔗 Verified Public References & Official Documentation

- **Gemini Models Overview & Capabilities:** [https://ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models)
- **Gemini 2.5 Thinking & Reasoning Budgets Guide:** [https://ai.google.dev/gemini-api/docs/thinking](https://ai.google.dev/gemini-api/docs/thinking)
- **Structured Outputs (JSON Schema & Pydantic):** [https://ai.google.dev/gemini-api/docs/structured-output](https://ai.google.dev/gemini-api/docs/structured-output)
- **Imagen 3 Image Generation Guide:** [https://ai.google.dev/gemini-api/docs/imagen](https://ai.google.dev/gemini-api/docs/imagen)
- **Veo Video Generation Guide:** [https://ai.google.dev/gemini-api/docs/video](https://ai.google.dev/gemini-api/docs/video)
- **Prompt Engineering & System Instructions Best Practices:** [https://ai.google.dev/gemini-api/docs/prompting-strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)

---

👉 **Next Module: [Module 03: Live Models, Agents, Antigravity SDK & Apps →](../module-03-live-agents-antigravity-sdk/README.md)**
