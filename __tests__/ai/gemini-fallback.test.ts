import { beforeEach, describe, expect, it, vi } from 'vitest';

const { generateContentMock } = vi.hoisted(() => ({
  generateContentMock: vi.fn(),
}));

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(function GoogleGenAI() {
    return { models: { generateContent: generateContentMock } };
  }),
}));

import {
  callGemini,
  callGeminiWithFallback,
  GEMINI_FALLBACK_MODEL,
  GEMINI_PRIMARY_MODEL,
  RateLimitError,
} from '@/lib/ai/gemini';

function rateLimitError(): Error & { status: number } {
  const e = new Error('Resource has been exhausted (e.g. check quota).') as Error & {
    status: number;
  };
  e.status = 429;
  return e;
}

const ok = (text: string) => ({ text });

beforeEach(() => {
  generateContentMock.mockReset();
});

describe('callGemini', () => {
  it('uses gemini-3.8-flash by default with JSON response mode', async () => {
    generateContentMock.mockResolvedValue(ok('{"ok":true}'));

    const text = await callGemini(GEMINI_PRIMARY_MODEL, 'hello');

    expect(text).toBe('{"ok":true}');
    expect(generateContentMock).toHaveBeenCalledTimes(1);
    const arg = generateContentMock.mock.calls[0][0];
    expect(arg.model).toBe('gemini-3.8-flash');
    expect(arg.config.responseMimeType).toBe('application/json');
    expect(arg.contents[0].role).toBe('user');
    expect(arg.contents[0].parts[0].text).toBe('hello');
  });
});

describe('callGeminiWithFallback', () => {
  it('returns the primary model response when no error occurs', async () => {
    generateContentMock.mockResolvedValue(ok('primary'));

    await expect(callGeminiWithFallback('hello')).resolves.toBe('primary');
    expect(generateContentMock).toHaveBeenCalledTimes(1);
    expect(generateContentMock.mock.calls[0][0].model).toBe(GEMINI_PRIMARY_MODEL);
  });

  it('falls back to gemini-3.5-flash-lite when the primary returns 429', async () => {
    generateContentMock
      .mockRejectedValueOnce(rateLimitError())
      .mockResolvedValueOnce(ok('fallback'));

    await expect(callGeminiWithFallback('hello')).resolves.toBe('fallback');
    expect(generateContentMock).toHaveBeenCalledTimes(2);
    expect(generateContentMock.mock.calls[0][0].model).toBe(GEMINI_PRIMARY_MODEL);
    expect(generateContentMock.mock.calls[1][0].model).toBe(GEMINI_FALLBACK_MODEL);
  });

  it('throws RateLimitError when both models fail with 429', async () => {
    generateContentMock.mockRejectedValue(rateLimitError());

    await expect(callGeminiWithFallback('hello')).rejects.toBeInstanceOf(RateLimitError);
    expect(generateContentMock).toHaveBeenCalledTimes(2);
  });

  it('propagates non-429 errors without falling back', async () => {
    generateContentMock.mockRejectedValue(new Error('boom'));

    await expect(callGeminiWithFallback('hello')).rejects.toThrow('boom');
    expect(generateContentMock).toHaveBeenCalledTimes(1);
  });
});
