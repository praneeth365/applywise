import { callGeminiWithFallback, stripJsonFences } from './gemini';

export { RateLimitError } from './gemini';

export interface AnswerEvaluation {
  /** 0-10 score for the candidate's answer. */
  score: number;
  feedback: string;
  strengths: string[];
  tips: string[];
}

const SYSTEM_PROMPT = `You are an expert interview coach. Score the candidate's answer to an interview question.

Return ONLY strict JSON matching this TypeScript type:
{
  score: number (integer 0-10),
  feedback: string (2-3 sentences: what was strong and what was weak),
  strengths: string[] (2-3 concrete bullets the candidate did well),
  tips: string[] (2-3 actionable bullets to improve the answer)
}

Rules:
- Score strictly. 8+ only for structured, specific answers with concrete results (ideally STAR-shaped for behavioral questions).
- Generic, vague, or very short answers score 3-5. Empty, off-topic, or irrelevant answers score 0-2.
- feedback must be exactly 2-3 sentences.
- Do not include markdown fences, comments, or any text outside the JSON.`;

function buildPrompt(input: {
  question: string;
  answer: string;
  category: string;
  role: string;
  company: string;
}): string {
  return `${SYSTEM_PROMPT}

=== QUESTION (category: ${input.category || 'General'}) ===
${input.question}

=== ROLE ===
${input.role || 'General'}

=== COMPANY ===
${input.company || 'N/A'}

=== CANDIDATE ANSWER ===
${input.answer}`;
}

export async function evaluateAnswer(input: {
  question: string;
  answer: string;
  category: string;
  role: string;
  company: string;
}): Promise<AnswerEvaluation> {
  const prompt = buildPrompt(input);
  const jsonText = await callGeminiWithFallback(prompt);

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripJsonFences(jsonText));
  } catch {
    throw new Error('Invalid JSON from Gemini');
  }

  const r = parsed as Record<string, unknown>;
  const score = Math.max(0, Math.min(10, Math.round(Number(r.score) || 0)));
  const feedback = String(r.feedback ?? '').trim();
  const strengths = (Array.isArray(r.strengths) ? r.strengths : []).map(String).slice(0, 3);
  const tips = (Array.isArray(r.tips) ? r.tips : []).map(String).slice(0, 3);

  return { score, feedback, strengths, tips };
}