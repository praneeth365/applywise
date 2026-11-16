import { PDFParse } from 'pdf-parse';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODEL = 'gemini-3.5-flash-lite';

export interface Improvement {
  section: string;
  suggestion: string;
  exampleBullet: string;
}

export interface ResumeAnalysisResult {
  matchScore: number;
  summary: string;
  matchedSkills: string[];
  missingKeywords: string[];
  strengths: string[];
  improvements: Improvement[];
}

export class RateLimitError extends Error {
  constructor(message: string, public readonly retryAfterSeconds = 30) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/** Extract plain text from a PDF Buffer. */
export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: pdfBuffer });
  try {
    // Guard against a hung pdfjs worker wedging the request forever.
    const result = await Promise.race([
      parser.getText(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('PDF extraction timed out after 30s')), 30000),
      ),
    ]);
    const text = result.text ?? '';
    if (!text.trim()) {
      throw new Error('No extractable text found in PDF (scanned/image-only resume?)');
    }
    return text;
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}

/** Call the Gemini API with JSON response mode and rate-limit fallback. */
async function callGemini(model: string, prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      }),
    }
  );

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const status = res.status;
    const msg = errBody?.error?.message ?? errBody?.message ?? 'Gemini API error';
    if (status === 429 || /quota|rate.?limit/i.test(msg)) {
      throw new RateLimitError('Rate limited', 30);
    }
    throw new Error(`Gemini ${status}: ${msg}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (!text) throw new Error('Empty Gemini response');
  return text;
}

const SYSTEM_PROMPT = `You are an expert ATS resume analyzer.
Return ONLY strict JSON matching this TypeScript type:
{
  matchScore: number (0-100),
  summary: string (exactly 2 sentences),
  matchedSkills: string[],
  missingKeywords: string[],
  strengths: string[] (exactly 3 items),
  improvements: { section: string, suggestion: string, exampleBullet: string }[] (up to 3 items)
}
Rules:
- summary must be exactly 2 sentences.
- strengths must be exactly 3 concrete strengths drawn from the resume.
- improvements: each exampleBullet must be a rewritten, impact-driven bullet grounded ONLY in the candidate's actual experience. Never invent employers, dates, or metrics.
- matchedSkills: keywords appearing in BOTH resume and job description.
- missingKeywords: critical ATS keywords from job description NOT found in resume.
- matchScore 0-100 integer.`;

function buildPrompt(resumeText: string, jobDescription: string): string {
  return `${SYSTEM_PROMPT}

=== RESUME ===
${resumeText}

=== JOB DESCRIPTION ===
${jobDescription}`;
}

export async function analyzeResume(
  resumeText: string,
  jobDescription: string
): Promise<ResumeAnalysisResult> {
  const prompt = buildPrompt(resumeText, jobDescription);

  let jsonText: string;
  try {
    jsonText = await callGemini(PRIMARY_MODEL, prompt);
  } catch (e) {
    if (e instanceof RateLimitError) {
      try {
        jsonText = await callGemini(FALLBACK_MODEL, prompt);
      } catch (e2) {
        if (e2 instanceof RateLimitError) throw e2;
        throw e;
      }
    } else {
      throw e;
    }
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('Invalid JSON from Gemini');
  }

  const r = parsed as Record<string, unknown>;
  const matchScore = Math.max(0, Math.min(100, Math.round(Number(r.matchScore) || 0)));
  const summary = String(r.summary || '').trim();
  const matchedSkills = (Array.isArray(r.matchedSkills) ? r.matchedSkills : []).map(String).slice(0, 30);
  const missingKeywords = (Array.isArray(r.missingKeywords) ? r.missingKeywords : []).map(String).slice(0, 30);
  const strengths = (Array.isArray(r.strengths) ? r.strengths : []).map(String).slice(0, 3);
  const improvementsRaw = Array.isArray(r.improvements) ? r.improvements : [];
  const improvements: Improvement[] = improvementsRaw
    .map((i: unknown) => i as Record<string, unknown>)
    .map((i) => ({
      section: String(i.section ?? ''),
      suggestion: String(i.suggestion ?? ''),
      exampleBullet: String(i.exampleBullet ?? ''),
    }))
    .slice(0, 3);

  return {
    matchScore,
    summary,
    matchedSkills,
    missingKeywords,
    strengths,
    improvements,
  };
}