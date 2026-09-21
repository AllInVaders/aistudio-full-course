/**
 * Module 01 Lab: Environment Setup, Model Discovery & Token Economics Verification (ESM)
 * ======================================================================================
 * Verifies GEMINI_API_KEY / Vertex AI credentials using the official `@google/genai` SDK,
 * probes the current Gemini model families, runs a `countTokens` preflight check,
 * exercises BOTH the modern Interactions API and the classic `generateContent` path,
 * and prints a diagnostic health table.
 *
 * Usage:
 *   npm install @google/genai
 *   export GEMINI_API_KEY="your-api-key"
 *   node verify_setup.mjs
 *
 * Docs:
 *   https://ai.google.dev/gemini-api/docs/models
 *   https://ai.google.dev/gemini-api/docs/interactions-overview
 */

import { GoogleGenAI } from '@google/genai';

// The default workhorse for every lab in this course.
const DEFAULT_MODEL = 'gemini-3.8-flash';

// The model families the course actually exercises.
const PROBE_TARGETS = [
  { id: DEFAULT_MODEL, label: 'Gemini 3.8 Flash', purpose: 'Text, reasoning, structured output, agents' },
  { id: 'gemini-3.1-flash-image', label: 'Nano Banana 2', purpose: 'Default production image generation' },
  { id: 'gemini-3-pro-image', label: 'Nano Banana Pro', purpose: '4K hero renders, precise text rendering' },
  { id: 'gemini-omni-1.1-flash', label: 'Gemini Omni Flash', purpose: 'Video generation and editing' },
  { id: 'gemini-3.8-live', label: 'Gemini 3.8 Live', purpose: 'Real-time voice and video agents' },
];

function detectAuthMode() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const useVertex = (process.env.GOOGLE_GENAI_USE_VERTEXAI || '').toLowerCase() === 'true';

  if (useVertex) {
    const project = process.env.GOOGLE_CLOUD_PROJECT || '(default project)';
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    return { ok: true, label: `Vertex AI ADC (project=${project}, location=${location})` };
  }
  if (apiKey) {
    const masked = apiKey.length > 10 ? `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}` : '***';
    return { ok: true, label: `Gemini Developer API Key (${masked})` };
  }
  return {
    ok: false,
    label: 'Missing Credentials (set GEMINI_API_KEY or GOOGLE_GENAI_USE_VERTEXAI=true)',
  };
}

/**
 * Checks each model family this course depends on against the live catalog.
 * Returns one row per probe target describing whether the current credentials
 * can actually see that model.
 */
async function probeModelFamilies(ai) {
  const available = new Set();
  try {
    const pager = await ai.models.list();
    for await (const model of pager) {
      available.add((model.name || '').replace(/^models\//, '').toLowerCase());
    }
  } catch (err) {
    console.error(`[WARN] Could not list models: ${err.message}`);
  }

  return PROBE_TARGETS.map((target) => {
    let status;
    if (available.has(target.id)) {
      status = 'AVAILABLE';
    } else if ([...available].some((name) => name.startsWith(target.id))) {
      // The catalog sometimes exposes a dated/suffixed alias of the same family.
      status = 'AVAILABLE (aliased)';
    } else if (available.size === 0) {
      status = 'UNKNOWN';
    } else {
      status = 'NOT VISIBLE';
    }
    return { ...target, status };
  });
}

/** Counts tokens on a sample prompt and measures classic generateContent latency. */
async function runTokenCheck(ai, model = DEFAULT_MODEL) {
  const samplePrompt =
    'You are an AI Product Studio strategist. Summarize the three pillars of a ' +
    'high-converting product launch brief (Positioning, Visual Identity, Unit Economics) ' +
    'in exactly 3 concise bullet points.';

  const tokenResp = await ai.models.countTokens({
    model,
    contents: samplePrompt,
  });

  const started = Date.now();
  const response = await ai.models.generateContent({
    model,
    contents: samplePrompt,
    config: {
      temperature: 0.2,
      maxOutputTokens: 256,
    },
  });
  const latencyMs = Date.now() - started;

  return {
    preflightTokens: tokenResp.totalTokens ?? 0,
    promptTokens: response.usageMetadata?.promptTokenCount ?? 0,
    outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
    totalTokens: response.usageMetadata?.totalTokenCount ?? 0,
    latencyMs,
  };
}

/**
 * Exercises the Interactions API, the surface the rest of this course teaches.
 * `thinking_level` replaces the old numeric reasoning budget and accepts
 * 'low', 'medium', or 'high'.
 */
async function runInteractionsSmokeTest(ai, model = DEFAULT_MODEL) {
  const started = Date.now();
  const interaction = await ai.interactions.create({
    model,
    input: 'Reply with exactly the word: READY',
    generation_config: { thinking_level: 'low' },
  });
  return {
    reply: (interaction.output_text || '').trim(),
    interactionId: interaction.id || '(not returned)',
    latencyMs: Date.now() - started,
  };
}

async function main() {
  const auth = detectAuthMode();
  if (!auth.ok) {
    console.error(`[ERROR] ${auth.label}`);
    console.error('Tip: Get a free API key at https://aistudio.google.com/apikey');
    process.exit(1);
  }

  const ai = new GoogleGenAI({});
  const familyRows = await probeModelFamilies(ai);
  const metrics = await runTokenCheck(ai);
  const interactions = await runInteractionsSmokeTest(ai);

  const line = '='.repeat(78);
  console.log(`\n${line}`);
  console.log('  GOOGLE AI STUDIO & @google/genai SDK — DIAGNOSTIC HEALTH REPORT (Node.js)');
  console.log(line);
  console.log(`  Auth Mode          : ${auth.label}`);
  console.log(`  Node.js Runtime    : ${process.version}`);
  console.log(`  Default Model      : ${DEFAULT_MODEL}`);
  console.log('-'.repeat(78));
  console.log('  MODEL FAMILY AVAILABILITY');
  for (const row of familyRows) {
    console.log(`    - ${row.id.padEnd(24)} ${row.status.padEnd(20)} ${row.label}`);
    console.log(`      ${''.padEnd(24)} ${''.padEnd(20)} ${row.purpose}`);
  }
  console.log('-'.repeat(78));
  console.log(`  TOKEN ECONOMICS & LATENCY — classic generateContent (${DEFAULT_MODEL})`);
  console.log(`    - Preflight countTokens()    : ${metrics.preflightTokens} tokens`);
  console.log(`    - Actual Prompt Tokens       : ${metrics.promptTokens} tokens`);
  console.log(`    - Output Candidate Tokens    : ${metrics.outputTokens} tokens`);
  console.log(`    - Total Billed Tokens        : ${metrics.totalTokens} tokens`);
  console.log(`    - Round-trip Latency         : ${metrics.latencyMs} ms`);
  console.log('-'.repeat(78));
  console.log(`  INTERACTIONS API SMOKE TEST (${DEFAULT_MODEL}, thinking_level=low)`);
  console.log(`    - Model Reply                : ${interactions.reply}`);
  console.log(`    - Interaction ID             : ${interactions.interactionId}`);
  console.log(`    - Round-trip Latency         : ${interactions.latencyMs} ms`);
  console.log(line);
  console.log('  STATUS: READY FOR MODULE 02 (PROMPTS, STRUCTURED OUTPUTS, NANO BANANA & OMNI)');
  console.log(`${line}\n`);
}

main().catch((err) => {
  console.error('[FATAL] Diagnostic check failed:', err);
  process.exit(1);
});
