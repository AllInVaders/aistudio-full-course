/**
 * Module 01 Lab: Environment Setup, Model Discovery & Token Economics Verification (ESM)
 * ======================================================================================
 * Verifies GEMINI_API_KEY / Vertex AI credentials using the official `@google/genai` SDK,
 * discovers available Gemini, Imagen 3, and Veo models, runs a `countTokens` preflight check,
 * and prints a diagnostic health table.
 *
 * Usage:
 *   npm install @google/genai
 *   export GEMINI_API_KEY="your-api-key"
 *   node verify_setup.mjs
 */

import { GoogleGenAI } from '@google/genai';

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

async function discoverModels(ai) {
  const families = {
    'Gemini (Text / Multimodal / Live)': [],
    'Imagen (Image Generation)': [],
    'Veo (Video Generation)': [],
    Embeddings: [],
  };

  const pager = await ai.models.list();
  for await (const model of pager) {
    const name = (model.name || '').replace(/^models\//, '');
    const lower = name.toLowerCase();
    if (lower.includes('imagen')) {
      families['Imagen (Image Generation)'].push(name);
    } else if (lower.includes('veo')) {
      families['Veo (Video Generation)'].push(name);
    } else if (lower.includes('embedding')) {
      families.Embeddings.push(name);
    } else if (lower.includes('gemini')) {
      families['Gemini (Text / Multimodal / Live)'].push(name);
    }
  }
  return families;
}

async function runTokenCheck(ai, model = 'gemini-2.5-flash') {
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

async function main() {
  const auth = detectAuthMode();
  if (!auth.ok) {
    console.error(`[ERROR] ${auth.label}`);
    console.error('Tip: Get a free API key at https://aistudio.google.com/apikey');
    process.exit(1);
  }

  const ai = new GoogleGenAI({});
  const families = await discoverModels(ai);
  const metrics = await runTokenCheck(ai);

  const line = '='.repeat(78);
  console.log(`\n${line}`);
  console.log('  GOOGLE AI STUDIO & @google/genai SDK — DIAGNOSTIC HEALTH REPORT (Node.js)');
  console.log(line);
  console.log(`  Auth Mode          : ${auth.label}`);
  console.log(`  Node.js Runtime    : ${process.version}`);
  console.log('-'.repeat(78));
  console.log('  MODEL FAMILY AVAILABILITY');
  for (const [family, models] of Object.entries(families)) {
    const sample = models.slice(0, 4).join(', ') || 'None detected for this key/project';
    const extra = models.length > 4 ? ` (+${models.length - 4} more)` : '';
    console.log(`    - ${family.padEnd(34)}: ${String(models.length).padStart(2)} models | ${sample}${extra}`);
  }
  console.log('-'.repeat(78));
  console.log('  TOKEN ECONOMICS & LATENCY CHECK (gemini-2.5-flash)');
  console.log(`    - Preflight countTokens()    : ${metrics.preflightTokens} tokens`);
  console.log(`    - Actual Prompt Tokens       : ${metrics.promptTokens} tokens`);
  console.log(`    - Output Candidate Tokens    : ${metrics.outputTokens} tokens`);
  console.log(`    - Total Billed Tokens        : ${metrics.totalTokens} tokens`);
  console.log(`    - Round-trip Latency         : ${metrics.latencyMs} ms`);
  console.log(line);
  console.log('  STATUS: READY FOR MODULE 02 (PROMPTS, STRUCTURED OUTPUTS, IMAGEN 3 & VEO)');
  console.log(`${line}\n`);
}

main().catch((err) => {
  console.error('[FATAL] Diagnostic check failed:', err);
  process.exit(1);
});
