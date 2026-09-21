#!/usr/bin/env python3
"""
Module 02 Lab — Stage 1 of the Flagship Project: AI Product Studio Creative Engine
==================================================================================
Everything here runs on the Interactions API (`client.interactions.create`),
the current standard surface. The lab demonstrates:

  1. System instructions + reasoning control via ``thinking_level``
  2. Strict Pydantic structured output via ``response_format``
  3. Photorealistic hero image generation with Nano Banana
     (``gemini-3.1-flash-image``, upgradable to ``gemini-3-pro-image``)
  4. Cinematic promo video generation with Gemini Omni Flash
     (``gemini-omni-1.1-flash``)
  5. Conversational editing by chaining ``previous_interaction_id``

Usage:
    export GEMINI_API_KEY="your-api-key"
    python product_studio_stage1.py --concept "LumenPulse: Smart Desk Lamp with Circadian AI"

Docs:
    https://ai.google.dev/gemini-api/docs/interactions-overview
    https://ai.google.dev/gemini-api/docs/structured-output
    https://ai.google.dev/gemini-api/docs/image-generation
    https://ai.google.dev/gemini-api/docs/omni
"""

import argparse
import base64
import json
from pathlib import Path
from typing import List

from google import genai
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Model selection
# ---------------------------------------------------------------------------
TEXT_MODEL = "gemini-3.8-flash"

# Nano Banana 2 is the production default. Upgrade to Nano Banana Pro
# ("gemini-3-pro-image") when you need 4K output or precise in-image text
# rendering; the request shape is identical, only the model ID changes.
IMAGE_MODEL = "gemini-3.1-flash-image"
IMAGE_MODEL_PRO = "gemini-3-pro-image"

VIDEO_MODEL = "gemini-omni-1.1-flash"


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
    hero_image_prompt: str = Field(
        description="Detailed studio photography prompt including lighting, lens, materials, and color palette."
    )
    promo_video_prompt: str = Field(
        description="Cinematic 5-second motion shot prompt describing camera movement, subject action, and lighting."
    )
    ad_campaigns: List[ChannelAdCopy] = Field(description="Bilingual campaign copy across 3 channels.")


SYSTEM_INSTRUCTION = """
You are the Executive Creative Director & Chief Product Strategist at an award-winning
AI Product Studio. Given a raw product concept, you craft complete, commercially grounded,
bilingual (English + Spanish) launch kits with studio-grade visual prompts engineered
for high-fidelity image and video generation.
""".strip()


# ---------------------------------------------------------------------------
# 2. Core Generation Pipeline
# ---------------------------------------------------------------------------
def generate_launch_kit(client: genai.Client, concept: str) -> ProductLaunchKit:
    """Generates a strictly typed bilingual ProductLaunchKit.

    ``response_format`` pins the output to the Pydantic JSON schema, and
    ``thinking_level`` controls how much internal reasoning the model spends
    before answering. It accepts "low", "medium", or "high".
    """
    interaction = client.interactions.create(
        model=TEXT_MODEL,
        input=f"Create a complete bilingual launch kit for this product concept:\n\n{concept}",
        system_instruction=SYSTEM_INSTRUCTION,
        response_format={
            "type": "text",
            "mime_type": "application/json",
            "schema": ProductLaunchKit.model_json_schema(),
        },
        generation_config={"thinking_level": "medium"},
    )
    return ProductLaunchKit.model_validate_json(interaction.output_text)


def generate_hero_image(client: genai.Client, prompt: str, output_path: Path):
    """Renders a studio product hero image with Nano Banana.

    Returns the interaction so the caller can chain a conversational edit off
    ``interaction.id``. Every generated image carries a SynthID watermark:
    https://ai.google.dev/responsible/docs/safeguards/synthid
    """
    interaction = client.interactions.create(
        model=IMAGE_MODEL,
        input=prompt,
        response_format={
            "type": "image",
            "mime_type": "image/png",
            "aspect_ratio": "16:9",
            "image_size": "2K",
        },
    )
    output_path.write_bytes(base64.b64decode(interaction.output_image.data))
    return interaction


def refine_hero_image(
    client: genai.Client,
    previous_interaction_id: str,
    edit_instruction: str,
    output_path: Path,
):
    """Conversationally edits the previous render instead of regenerating from scratch.

    Passing ``previous_interaction_id`` keeps the subject, framing, and lighting
    consistent across turns. Note that ``system_instruction``, ``tools``, and
    ``generation_config`` are interaction-scoped, so re-specify them each turn.
    """
    interaction = client.interactions.create(
        model=IMAGE_MODEL,
        input=edit_instruction,
        previous_interaction_id=previous_interaction_id,
        response_format={
            "type": "image",
            "mime_type": "image/png",
            "aspect_ratio": "16:9",
            "image_size": "2K",
        },
    )
    output_path.write_bytes(base64.b64decode(interaction.output_image.data))
    return interaction


def generate_promo_video(client: genai.Client, prompt: str, output_path: Path):
    """Renders a cinematic promo clip with Gemini Omni Flash.

    Video generation returns inline base64 on the interaction - there is no
    long-running operation to poll. Supported aspect ratios are "16:9" and "9:16".
    """
    interaction = client.interactions.create(
        model=VIDEO_MODEL,
        input=prompt,
        response_format={
            "type": "video",
            "aspect_ratio": "16:9",
        },
    )
    output_path.write_bytes(base64.b64decode(interaction.output_video.data))
    return interaction


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
        help="Directory to write the JSON launch kit, hero image, and promo video.",
    )
    parser.add_argument(
        "--skip-video",
        action="store_true",
        help="Skip promo video generation (useful for quick local smoke tests).",
    )
    args = parser.parse_args()

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    client = genai.Client()
    print(f"\n[1/4] Generating Bilingual Product Launch Kit for: {args.concept}")
    kit = generate_launch_kit(client, args.concept)

    kit_path = out_dir / "launch_kit.json"
    kit_path.write_text(json.dumps(kit.model_dump(), indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"  -> Saved structured launch kit to {kit_path}")
    print(f"  -> EN Tagline: {kit.tagline_en}")
    print(f"  -> ES Tagline: {kit.tagline_es}")

    print(f"\n[2/4] Rendering Studio Hero Image with Nano Banana ({IMAGE_MODEL})...")
    hero_path = out_dir / "hero_shot.png"
    hero = generate_hero_image(client, kit.hero_image_prompt, hero_path)
    print(f"  -> Saved hero shot to {hero_path}")
    print(f"  -> Need 4K or crisp in-image text? Swap the model to {IMAGE_MODEL_PRO}.")

    print("\n[3/4] Conversationally editing that same render...")
    refined_path = out_dir / "hero_shot_refined.png"
    refine_hero_image(
        client,
        previous_interaction_id=hero.id,
        edit_instruction=(
            "Keep the product and composition identical, but swap the background for "
            "brushed concrete and warm the key light by 300K."
        ),
        output_path=refined_path,
    )
    print(f"  -> Saved conversational edit to {refined_path}")

    if args.skip_video:
        print("\n[4/4] Skipped promo video generation (--skip-video enabled).")
    else:
        print(f"\n[4/4] Rendering Cinematic Promo Clip with Gemini Omni Flash ({VIDEO_MODEL})...")
        video_path = out_dir / "promo_teaser.mp4"
        generate_promo_video(client, kit.promo_video_prompt, video_path)
        print(f"  -> Saved promo teaser to {video_path}")


if __name__ == "__main__":
    main()
