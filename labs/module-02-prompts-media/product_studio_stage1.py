#!/usr/bin/env python3
"""
Module 02 Lab — Stage 1 of the Flagship Project: AI Product Studio Creative Engine
==================================================================================
Demonstrates how to combine:
  1. System Instructions + Thinking Budget (`types.ThinkingConfig`)
  2. Strict Pydantic Structured Outputs (`response_schema=ProductLaunchKit`)
  3. Photorealistic Product Hero Generation with Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2) (`client.models.generate_content`)
  4. Cinematic Motion Teaser Generation with Gemini Omni 1.1 Flash (`gemini-omni-1.1-flash`) (`client.interactions.create`)

Usage:
    export GEMINI_API_KEY="your-api-key"
    python product_studio_stage1.py --concept "LumenPulse: Smart Desk Lamp with Circadian AI"
"""

import argparse
import json
import os
import time
from pathlib import Path
from typing import List

from google import genai
from google.genai import types
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# 1. Pydantic Structured Output Schemas
# ---------------------------------------------------------------------------
class PersonaProfile(BaseModel):
    persona_name: str = Field(description="Memorable archetype name for the target buyer.")
    pain_points: List[str] = Field(description="Top 3 daily frustrations solved by this product.")
    willingness_to_pay_usd: float = Field(description="Target retail price point in USD.")


class ChannelAdCopy(BaseModel):
    channel: str = Field(description="Marketing channel name (e.g., Instagram Reels, LinkedIn, Landing Page).")
    headline_en: str = Field(description="High-converting headline in English.")
    headline_es: str = Field(description="High-converting headline in Spanish.")
    body_copy_en: str = Field(description="Persuasive body copy in English (40-70 words).")
    body_copy_es: str = Field(description="Persuasive body copy in Spanish (40-70 words).")


class ProductLaunchKit(BaseModel):
    product_name: str = Field(description="Brandable product name.")
    tagline_en: str = Field(description="Punchy 6-10 word tagline in English.")
    tagline_es: str = Field(description="Punchy 6-10 word tagline in Spanish.")
    positioning_statement: str = Field(description="Clear value proposition and category differentiation.")
    target_persona: PersonaProfile
    imagen_hero_prompt: str = Field(
        description="Detailed studio photography prompt for Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2) including lighting, lens, materials, and color palette."
    )
    veo_teaser_prompt: str = Field(
        description="Cinematic 5-second motion shot prompt for Gemini Omni 1.1 Flash (`gemini-omni-1.1-flash`) describing camera movement, subject action, and lighting."
    )
    ad_campaigns: List[ChannelAdCopy] = Field(description="Bilingual campaign copy across 3 channels.")


SYSTEM_INSTRUCTION = """
You are the Executive Creative Director & Chief Product Strategist at an award-winning
AI Product Studio. Given a raw product concept, you craft complete, commercially grounded,
bilingual (English + Spanish) launch kits with studio-grade visual prompts engineered
specifically for Gemini 3.1 Flash Image (Nano Banana 2) and Gemini Omni 1.1 Flash.
""".strip()


# ---------------------------------------------------------------------------
# 2. Core Generation Pipeline
# ---------------------------------------------------------------------------
def generate_launch_kit(client: genai.Client, concept: str) -> ProductLaunchKit:
    """Generates a strictly typed bilingual ProductLaunchKit JSON object using Gemini 3.7 Flash."""
    response = client.models.generate_content(
        model="gemini-3.7-flash",
        contents=f"Create a complete bilingual launch kit for this product concept:\n\n{concept}",
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            temperature=0.4,
            response_mime_type="application/json",
            response_schema=ProductLaunchKit,
            thinking_config=types.ThinkingConfig(thinking_budget=1024),
        ),
    )
    return ProductLaunchKit.model_validate_json(response.text)


def generate_hero_image(client: genai.Client, prompt: str, output_path: Path) -> Path:
    """Generates a high-resolution studio product hero image with Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2)."""
    result = client.models.generate_content(
        model="gemini-3.1-flash-image",
        prompt=prompt,
        config=types.GenerateImagesConfig(
            number_of_images=1,
            aspect_ratio="16:9",
            output_mime_type="image/jpeg",
            person_generation="ALLOW_ADULT",
        ),
    )
    generated_image = result.generated_images[0]
    output_path.write_bytes(generated_image.image.image_bytes)
    return output_path


def generate_veo_teaser(client: genai.Client, prompt: str, output_path: Path) -> Path:
    """Starts an asynchronous Gemini Omni 1.1 Flash (`gemini-omni-1.1-flash`) video generation job and polls until completion."""
    operation = client.interactions.create(
        model="gemini-omni-1.1-flash",
        prompt=prompt,
        config=types.GenerateVideosConfig(
            aspect_ratio="16:9",
            person_generation="allow_adult",
        ),
    )
    print("  [Gemini Omni 1.1 Flash (`gemini-omni-1.1-flash`)] Video generation operation submitted. Polling status...")
    while not operation.done:
        time.sleep(10)
        operation = client.operations.get(operation)
        print("  [Gemini Omni 1.1 Flash (`gemini-omni-1.1-flash`)] Still rendering frames...")

    generated_video = operation.response.generated_videos[0]
    client.files.download(file=generated_video.video)
    generated_video.video.save(str(output_path))
    return output_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Stage 1: AI Product Studio Creative Engine")
    parser.add_argument(
        "--concept",
        default="AeroBrew Nano: Pocket-sized ultrasonic cold-brew espresso maker for travelers",
        help="Product concept to transform into a full launch kit.",
    )
    parser.add_argument(
        "--out-dir",
        default="./output_stage1",
        help="Directory to write JSON launch kit, Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2) hero image, and Gemini Omni 1.1 Flash (`gemini-omni-1.1-flash`) video.",
    )
    parser.add_argument(
        "--skip-video",
        action="store_true",
        help="Skip Gemini Omni 1.1 Flash (`gemini-omni-1.1-flash`) video generation (useful for quick local smoke tests).",
    )
    args = parser.parse_args()

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    client = genai.Client()
    print(f"\n[1/3] Generating Bilingual Product Launch Kit for: {args.concept}")
    kit = generate_launch_kit(client, args.concept)

    kit_path = out_dir / "launch_kit.json"
    kit_path.write_text(json.dumps(kit.model_dump(), indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"  -> Saved structured launch kit to {kit_path}")
    print(f"  -> EN Tagline: {kit.tagline_en}")
    print(f"  -> ES Tagline: {kit.tagline_es}")

    print("\n[2/3] Generating Studio Hero Image with Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2)...")
    hero_path = generate_hero_image(client, kit.imagen_hero_prompt, out_dir / "hero_shot.jpg")
    print(f"  -> Saved Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2) hero shot to {hero_path}")

    if args.skip_video:
        print("\n[3/3] Skipped Gemini Omni 1.1 Flash (`gemini-omni-1.1-flash`) video generation (--skip-video enabled).")
    else:
        print("\n[3/3] Generating Cinematic Promo Clip with Gemini Omni 1.1 Flash (`gemini-omni-1.1-flash`)...")
        video_path = generate_veo_teaser(client, kit.veo_teaser_prompt, out_dir / "promo_teaser.mp4")
        print(f"  -> Saved Gemini Omni 1.1 Flash (`gemini-omni-1.1-flash`) promo teaser to {video_path}")


if __name__ == "__main__":
    main()
