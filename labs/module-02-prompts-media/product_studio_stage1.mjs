/**
 * Module 02 Lab — Stage 1 of the Flagship Project: AI Product Studio Creative Engine (ESM)
 * ========================================================================================
 * Node.js equivalent demonstrating:
 *   1. System Instructions + Thinking Config + Strict JSON Schema Structured Output
 *   2. Photorealistic Hero Image Generation with Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2) (`ai.models.generateContent`)
 *   3. Cinematic Promo Clip Generation with Gemini Omni 1.1 Flash (`gemini-omni-1.1-flash`) (`ai.interactions.create`)
 *
 * Usage:
 *   npm install @google/genai
 *   export GEMINI_API_KEY="your-api-key"
 *   node product_studio_stage1.mjs
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { GoogleGenAI, Type } from '@google/genai';

const PRODUCT_LAUNCH_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    productName: { type: Type.STRING, description: 'Brandable product name.' },
    taglineEn: { type: Type.STRING, description: 'Punchy 6-10 word tagline in English.' },
    taglineEs: { type: Type.STRING, description: 'Punchy 6-10 word tagline in Spanish.' },
    positioningStatement: { type: Type.STRING, description: 'Clear value proposition and differentiation.' },
    imagenHeroPrompt: {
      type: Type.STRING,
      description: 'Detailed studio photography prompt for Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2) including lighting, lens, and materials.',
    },
    veoTeaserPrompt: {
      type: Type.STRING,
      description: 'Cinematic 5-second motion shot prompt for Gemini Omni 1.1 Flash (`gemini-omni-1.1-flash`) describing camera movement and lighting.',
    },
    channels: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          channel: { type: Type.STRING },
          headlineEn: { type: Type.STRING },
          headlineEs: { type: Type.STRING },
          bodyEn: { type: Type.STRING },
          bodyEs: { type: Type.STRING },
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
    'imagenHeroPrompt',
    'veoTeaserPrompt',
    'channels',
  ],
};

const SYSTEM_INSTRUCTION =
  'You are the Executive Creative Director & Chief Product Strategist at an AI Product Studio. ' +
  'Given a raw product concept, craft a complete bilingual (English + Spanish) launch kit with ' +
  'studio-grade visual prompts engineered specifically for Gemini 3.1 Flash Image (Nano Banana 2) and Gemini Omni 1.1 Flash.';

async function main() {
  const concept =
    process.argv[2] ||
    'AeroBrew Nano: Pocket-sized ultrasonic cold-brew espresso maker for travelers';
  const outDir = path.resolve('./output_stage1_node');
  await fs.mkdir(outDir, { recursive: true });

  const ai = new GoogleGenAI({});

  console.log(`\n[1/3] Generating Bilingual Launch Kit for: ${concept}`);
  const response = await ai.models.generateContent({
    model: 'gemini-3.7-flash',
    contents: `Create a complete bilingual launch kit for this product concept:\n\n${concept}`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.4,
      responseMimeType: 'application/json',
      responseSchema: PRODUCT_LAUNCH_SCHEMA,
      thinkingConfig: { thinkingBudget: 1024 },
    },
  });

  const kit = JSON.parse(response.text);
  const kitPath = path.join(outDir, 'launch_kit.json');
  await fs.writeFile(kitPath, JSON.stringify(kit, null, 2), 'utf8');
  console.log(`  -> Saved launch kit to ${kitPath}`);
  console.log(`  -> EN Tagline: ${kit.taglineEn}`);
  console.log(`  -> ES Tagline: ${kit.taglineEs}`);

  console.log('\n[2/3] Generating Studio Hero Image with Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2)...');
  const imgResp = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image',
    prompt: kit.imagenHeroPrompt,
    config: {
      numberOfImages: 1,
      aspectRatio: '16:9',
      outputMimeType: 'image/jpeg',
    },
  });

  const base64Image = imgResp.generatedImages[0].image.imageBytes;
  const heroPath = path.join(outDir, 'hero_shot.jpg');
  await fs.writeFile(heroPath, Buffer.from(base64Image, 'base64'));
  console.log(`  -> Saved Gemini 3.1 Flash Image (`gemini-3.1-flash-image` / Nano Banana 2) hero shot to ${heroPath}`);

  if (process.env.SKIP_VIDEO === 'true') {
    console.log('\n[3/3] Skipped Gemini Omni 1.1 Flash (`gemini-omni-1.1-flash`) generation (SKIP_VIDEO=true).');
    return;
  }

  console.log('\n[3/3] Submitting Gemini Omni 1.1 Flash (`gemini-omni-1.1-flash`) Cinematic Promo Video Job...');
  let operation = await ai.interactions.create({
    model: 'gemini-omni-1.1-flash',
    prompt: kit.veoTeaserPrompt,
    config: { aspectRatio: '16:9' },
  });

  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation });
    console.log('  [Gemini Omni 1.1 Flash (`gemini-omni-1.1-flash`)] Still rendering frames...');
  }
  console.log('  -> Gemini Omni 1.1 Flash (`gemini-omni-1.1-flash`) render completed:', operation.response?.generatedVideos?.[0]?.video?.uri);
}

main().catch((err) => {
  console.error('[FATAL] Stage 1 pipeline failed:', err);
  process.exit(1);
});
