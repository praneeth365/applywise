import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/ai/gemini', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/ai/gemini')>();
  return { ...actual, callGeminiWithFallback: vi.fn() };
});

import { generateInterviewQuestions } from '@/lib/ai/interview';
import { callGeminiWithFallback } from '@/lib/ai/gemini';

const mockCall = vi.mocked(callGeminiWithFallback);

function q(question: string, category: string) {
  return {
    question,
    category,
    whatTheInterviewerIsLookingFor: ' looking-for ',
    sampleGoodAnswer: { framework: ' framework ', keyPoints: ['a', 'b', 'c', 'd', 'e', 'f'] },
  };
}

beforeEach(() => {
  mockCall.mockReset();
});

describe('generateInterviewQuestions', () => {
  it('normalizes markdown-fenced JSON into the 5-question structure', async () => {
    mockCall.mockResolvedValueOnce(`\`\`\`json
{
  "company": "  Acme Corp ",
  "role": " frontend engineer ",
  "questions": [
    ${JSON.stringify(q('  Q1  ', 'technical'))},
    ${JSON.stringify(q('Q2', 'TECHNICAL'))},
    ${JSON.stringify(q('Q3', 'behavioral'))},
    ${JSON.stringify(q('Q4', 'behavior'))},
    ${JSON.stringify(q('Q5', 'culture'))},
    ${JSON.stringify(q('Q6 extra', 'culture'))},
    ${JSON.stringify(q('   ', 'technical'))}
  ]
}
\`\`\``);

    const result = await generateInterviewQuestions({
      company: 'Acme Corp',
      role: 'Frontend Engineer',
      jobDescription: 'Build things.',
    });

    expect(mockCall).toHaveBeenCalledTimes(1);
    expect(mockCall.mock.calls[0][0]).toContain('Acme Corp');
    expect(mockCall.mock.calls[0][0]).toContain('Frontend Engineer');

    expect(result.company).toBe('Acme Corp');
    expect(result.role).toBe('frontend engineer');
    expect(result.questions).toHaveLength(5);

    expect(result.questions.map((x) => x.category)).toEqual([
      'Technical',
      'Technical',
      'Behavioral',
      'Behavioral',
      'Culture',
    ]);
    expect(result.questions.map((x) => x.question)).toEqual(['Q1', 'Q2', 'Q3', 'Q4', 'Q5']);
    expect(result.questions[0].whatTheInterviewerIsLookingFor).toBe('looking-for');
    expect(result.questions[0].sampleGoodAnswer.framework).toBe('framework');
    expect(result.questions[0].sampleGoodAnswer.keyPoints).toHaveLength(5);
  });

  it('falls back to the input company/role when the response omits them', async () => {
    mockCall.mockResolvedValueOnce(
      JSON.stringify({
        questions: [
          q('Only one?', 'technical'),
          q('Two', 'behavioral'),
          q('Three', 'culture'),
          q('Four', 'technical'),
          q('Five', 'behavioral'),
        ],
      }),
    );

    const result = await generateInterviewQuestions({
      company: 'Input Co',
      role: 'Input Role',
      jobDescription: '',
    });

    expect(result.company).toBe('Input Co');
    expect(result.role).toBe('Input Role');
    expect(result.questions).toHaveLength(5);
  });

  it("throws 'Invalid JSON from Gemini' on unparseable output", async () => {
    mockCall.mockResolvedValueOnce('not json at all {{{');

    await expect(
      generateInterviewQuestions({ company: 'A', role: 'R', jobDescription: 'J' }),
    ).rejects.toThrow('Invalid JSON from Gemini');
  });

  it("throws 'Gemini returned no interview questions' on an empty list", async () => {
    mockCall.mockResolvedValueOnce(JSON.stringify({ company: 'A', role: 'R', questions: [] }));

    await expect(
      generateInterviewQuestions({ company: 'A', role: 'R', jobDescription: 'J' }),
    ).rejects.toThrow('Gemini returned no interview questions');
  });
});
