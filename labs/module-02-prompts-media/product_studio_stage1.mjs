/**
 * Module 02 Lab — Stage 1 of the Flagship Project: AI Product Studio Creative Engine (ESM)
 * ========================================================================================
 * Node.js equivalent, built entirely on the Interactions API:
 *   1. System instructions + reasoning control via `thinking_level`
 *   2. Strict JSON schema structured output via `response_format`
 *   3. Photorealistic hero image generation with Nano Banana (`gemini-3.1-flash-image`)
 *   4. Cinematic promo clip generation with Gemini Omni Flash (`gemini-omni-1.1-flash`)
 *   5. Conversational editing by chaining `previous_interaction_id`
 *
 * Usage:
 *   npm install @google/genai
 *   export GEMINI_API_KEY="your-api-key"
 *   node product_studio_stage1.mjs
 *
 * Docs:
 *   https://ai.google.dev/gemini-api/docs/interactions-overview
 *   https://ai.google.dev/gemini-api/docs/image-generation
 *   https://ai.google.dev/gemini-api/docs/omni
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { GoogleGenAI } from '@google/genai';

const TEXT_MODEL = 'gemini-3.8-flash';

// Nano Banana 2 is the production default. Upgrade to Nano Banana Pro
// ('gemini-3-pro-image') for 4K output or precise in-image text rendering;
// the request shape is identical, only the model ID changes.
const IMAGE_MODEL = 'gemini-3.1-flash-image';
const IMAGE_MODEL_PRO = 'gemini-3-pro-image';

const VIDEO_MODEL = 'gemini-omni-1.1-flash';

const PRODUCT_LAUNCH_SCHEMA = {
  type: 'object',
  properties: {
    productName: { type: 'string', description: 'Brandable product name.' },
    taglineEn: { type: 'string', description: 'Punchy 6-10 word tagline in English.' },
    taglineEs: { type: 'string', description: 'Punchy 6-10 word tagline in Spanish.' },
    positioningStatement: {
      type: 'string',
      description: 'Clear value proposition and differentiation.',
    },
    heroImagePrompt: {
      type: 'string',
      description: 'Detailed studio photography prompt including lighting, lens, and materials.',
    },
    promoVideoPrompt: {
      type: 'string',
      description: 'Cinematic 5-second motion shot prompt describing camera movement and lighting.',
    },
    channels: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          channel: { type: 'string' },
          headlineEn: { type: 'string' },
          headlineEs: { type: 'string' },
          bodyEn: { type: 'string' },
          bodyEs: { type: 'string' },
        },
        required: ['channel', 'headlineEn', 'headlineEs', 'bodyEn', 'bodyEs'],
      },
    },
  },
  required: [
    'productName',
    'taglineEn',
    'taglineEs',
    'positioningStatement',
    'heroImagePrompt',
    'promoVideoPrompt',
    'channels',
  ],
};

const SYSTEM_INSTRUCTION =
  'You are the Executive Creative Director & Chief Product Strategist at an AI Product Studio. ' +
  'Given a raw product concept, craft a complete bilingual (English + Spanish) launch kit with ' +
  'studio-grade visual prompts engineered for high-fidelity image and video generation.';

async function main() {
  const concept =
    process.argv[2] ||
    'AeroBrew Nano: Pocket-sized ultrasonic cold-brew espresso maker for travelers';
  const outDir = path.resolve('./output_stage1_node');
  await fs.mkdir(outDir, { recursive: true });

  const ai = new GoogleGenAI({});

  // --- 1. Structured bilingual brief -------------------------------------
  console.log(`\n[1/4] Generating Bilingual Launch Kit for: ${concept}`);
  const briefInteraction = await ai.interactions.create({
    model: TEXT_MODEL,
    input: `Create a complete bilingual launch kit for this product concept:\n\n${concept}`,
    system_instruction: SYSTEM_INSTRUCTION,
    response_format: {
      type: 'text',
      mime_type: 'application/json',
      schema: PRODUCT_LAUNCH_SCHEMA,
    },
    generation_config: { thinking_level: 'medium' },
  });

  const kit = JSON.parse(briefInteraction.output_text);
  const kitPath = path.join(outDir, 'launch_kit.json');
  await fs.writeFile(kitPath, JSON.stringify(kit, null, 2), 'utf8');
  console.log(`  -> Saved launch kit to ${kitPath}`);
  console.log(`  -> EN Tagline: ${kit.taglineEn}`);
  console.log(`  -> ES Tagline: ${kit.taglineEs}`);

  // --- 2. Hero image via Nano Banana -------------------------------------
  console.log(`\n[2/4] Rendering Studio Hero Image with Nano Banana (${IMAGE_MODEL})...`);
  const heroInteraction = await ai.interactions.create({
    model: IMAGE_MODEL,
    input: kit.heroImagePrompt,
    response_format: {
      type: 'image',
      mime_type: 'image/png',
      aspect_ratio: '16:9',
      image_size: '2K',
    },
  });

  const heroPath = path.join(outDir, 'hero_shot.png');
  await fs.writeFile(heroPath, Buffer.from(heroInteraction.output_image.data, 'base64'));
  console.log(`  -> Saved hero shot to ${heroPath}`);
  console.log(`  -> Need 4K or crisp in-image text? Swap the model to ${IMAGE_MODEL_PRO}.`);

  // --- 3. Conversational edit of that same render ------------------------
  // Chaining `previous_interaction_id` keeps the subject and framing consistent.
  // `system_instruction`, `tools`, and `generation_config` are interaction-scoped,
  // so re-specify them on every turn.
  console.log('\n[3/4] Conversationally editing that same render...');
  const refinedInteraction = await ai.interactions.create({
    model: IMAGE_MODEL,
    input:
      'Keep the product and composition identical, but swap the background for ' +
      'brushed concrete and warm the key light by 300K.',
    previous_interaction_id: heroInteraction.id,
    response_format: {
      type: 'image',
      mime_type: 'image/png',
      aspect_ratio: '16:9',
      image_size: '2K',
    },
  });

  const refinedPath = path.join(outDir, 'hero_shot_refined.png');
  await fs.writeFile(refinedPath, Buffer.from(refinedInteraction.output_image.data, 'base64'));
  console.log(`  -> Saved conversational edit to ${refinedPath}`);

  // --- 4. Promo video via Gemini Omni Flash ------------------------------
  if (process.env.SKIP_VIDEO === 'true') {
    console.log('\n[4/4] Skipped promo video generation (SKIP_VIDEO=true).');
    return;
  }

  // Video comes back inline as base64 - there is no operation to poll.
  console.log(`\n[4/4] Rendering Cinematic Promo Clip with Gemini Omni Flash (${VIDEO_MODEL})...`);
  const videoInteraction = await ai.interactions.create({
    model: VIDEO_MODEL,
    input: kit.promoVideoPrompt,
    response_format: { type: 'video', aspect_ratio: '16:9' },
  });

  const videoPath = path.join(outDir, 'promo_teaser.mp4');
  await fs.writeFile(videoPath, Buffer.from(videoInteraction.output_video.data, 'base64'));
  console.log(`  -> Saved promo teaser to ${videoPath}`);
}

main().catch((err) => {
  console.error('[FATAL] Stage 1 pipeline failed:', err);
  process.exit(1);
});
