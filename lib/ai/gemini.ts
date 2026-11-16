import { GoogleGenAI } from '@google/genai';

/**
 * Shared Gemini integration helpers (Phase 5).
 * Mirrors the model + JSON-mode + 429-fallback conventions used by
 * lib/ai/resume-analysis.ts, but built on the official @google/genai SDK.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

export const GEMINI_PRIMARY_MODEL = 'gemini-3.8-flash';
export const GEMINI_FALLBACK_MODEL = 'gemini-3.5-flash-lite';

export class RateLimitError extends Error {
  constructor(message: string, public readonly retryAfterSeconds = 30) {
    super(message);
    this.name = 'RateLimitError';
  }
}

let aiClient: GoogleGenAI | null = null;

function getAi(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return aiClient;
}

/** True when the Gemini API rejected the call with HTTP 429 / quota exhaustion. */
export function isRateLimitError(e: unknown): boolean {
  if (e && typeof e === 'object' && 'status' in e) {
    const status = (e as { status?: unknown }).status;
    if (status === 429) return true;
  }
  const message = e instanceof Error ? e.message : String(e);
  return /429|rate.?limit|quota|resource exhausted/i.test(message);
}

/** Call the Gemini API with JSON response mode. */
export async function callGemini(model: string, prompt: string): Promise<string> {
  const response = await getAi().models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  });
  const text = response.text;
  if (!text) throw new Error('Empty Gemini response');
  return text;
}

/** Primary model first; fall back to the lite model on 429. */
export async function callGeminiWithFallback(prompt: string): Promise<string> {
  try {
    return await callGemini(GEMINI_PRIMARY_MODEL, prompt);
  } catch (e) {
    if (isRateLimitError(e)) {
      try {
        return await callGemini(GEMINI_FALLBACK_MODEL, prompt);
      } catch (e2) {
        if (isRateLimitError(e2)) throw new RateLimitError('Rate limited', 30);
        throw e;
      }
    }
    throw e;
  }
}

/** Remove markdown fences if the model wrapped its JSON anyway. */
export function stripJsonFences(text: string): string {
  const t = text.trim();
  return t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
}