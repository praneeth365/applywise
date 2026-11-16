import { callGeminiWithFallback, stripJsonFences } from './gemini';

export { RateLimitError } from './gemini';

export type InterviewQuestionCategory = 'Technical' | 'Behavioral' | 'Culture';

export interface InterviewQuestionSampleGoodAnswer {
  framework: string;
  keyPoints: string[];
}

export interface InterviewQuestion {
  question: string;
  category: InterviewQuestionCategory;
  whatTheInterviewerIsLookingFor: string;
  sampleGoodAnswer: InterviewQuestionSampleGoodAnswer;
}

export interface InterviewSessionQuestions {
  company: string;
  role: string;
  questions: InterviewQuestion[];
}

const SYSTEM_PROMPT = `You are an expert technical recruiter and interview coach.
Given a COMPANY, ROLE, and JOB DESCRIPTION, generate exactly 5 tailored interview questions for that specific opportunity.

Return ONLY strict JSON matching this TypeScript type:
{
  company: string,
  role: string,
  questions: [
    {
      question: string,
      category: 'Technical' | 'Behavioral' | 'Culture',
      whatTheInterviewerIsLookingFor: string,
      sampleGoodAnswer: {
        framework: string,
        keyPoints: string[]
      }
    }
  ]
}

Rules:
- Exactly 5 questions in total.
- Questions 1-2 must be category 'Technical': role-specific, grounded in the actual skills, tools, and responsibilities from the job description.
- Questions 3-4 must be category 'Behavioral': STAR-method (Situation, Task, Action, Result) prompts.
- Question 5 must be category 'Culture': company-specific, referencing the company's mission, values, products, or work style.
- whatTheInterviewerIsLookingFor: 1-2 sentences on what a strong answer demonstrates.
- sampleGoodAnswer.framework: a concise structured outline (3-5 sentences) of what a strong answer looks like.
- sampleGoodAnswer.keyPoints: 3-5 bullet strings a strong answer must touch on.
- Do not include markdown fences, comments, or any text outside the JSON.`;

function buildPrompt(company: string, role: string, jobDescription: string): string {
  return `${SYSTEM_PROMPT}

=== COMPANY ===
${company}

=== ROLE ===
${role}

=== JOB DESCRIPTION ===
${jobDescription || '(No job description provided. Ask general but role-appropriate questions for a ' + role + ' at ' + company + '.)'}`;
}

function normalizeCategory(raw: unknown): InterviewQuestionCategory {
  const s = String(raw ?? '').toLowerCase();
  if (s.includes('behavior')) return 'Behavioral';
  if (s.includes('culture') || s.includes('company')) return 'Culture';
  return 'Technical';
}

function normalizeQuestions(raw: unknown): InterviewQuestion[] {
  const arr = Array.isArray(raw) ? raw : [];
  return arr
    .map((item) => {
      const q = (item ?? {}) as Record<string, unknown>;
      const sample = (q.sampleGoodAnswer ?? {}) as Record<string, unknown>;
      return {
        question: String(q.question ?? '').trim(),
        category: normalizeCategory(q.category),
        whatTheInterviewerIsLookingFor: String(q.whatTheInterviewerIsLookingFor ?? '').trim(),
        sampleGoodAnswer: {
          framework: String(sample.framework ?? '').trim(),
          keyPoints: (Array.isArray(sample.keyPoints) ? sample.keyPoints : [])
            .map(String)
            .slice(0, 5),
        },
      };
    })
    .filter((q) => q.question.length > 0);
}

export async function generateInterviewQuestions(input: {
  company: string;
  role: string;
  jobDescription: string;
}): Promise<InterviewSessionQuestions> {
  const prompt = buildPrompt(input.company, input.role, input.jobDescription);

  const jsonText = await callGeminiWithFallback(prompt);

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripJsonFences(jsonText));
  } catch {
    throw new Error('Invalid JSON from Gemini');
  }

  const r = parsed as Record<string, unknown>;
  const questions = normalizeQuestions(r.questions).slice(0, 5);
  if (questions.length === 0) {
    throw new Error('Gemini returned no interview questions');
  }

  return {
    company: String(r.company ?? input.company).trim(),
    role: String(r.role ?? input.role).trim(),
    questions,
  };
}