import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { evaluateAnswer, RateLimitError } from '@/lib/ai/evaluate-answer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const question = typeof body.question === 'string' ? body.question.trim() : '';
  const answer = typeof body.answer === 'string' ? body.answer.trim() : '';
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const role = typeof body.role === 'string' ? body.role.trim() : '';
  const company = typeof body.company === 'string' ? body.company.trim() : '';

  if (!question || !answer) {
    return NextResponse.json(
      { error: 'question and answer are required' },
      { status: 400 },
    );
  }

  try {
    const result = await evaluateAnswer({ question, answer, category, role, company });
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof RateLimitError) {
      return NextResponse.json(
        { error: 'AI service is busy. Please wait ~30 seconds and try again.' },
        { status: 429 },
      );
    }
    console.error('evaluate-answer error:', e);
    return NextResponse.json(
      { error: 'Failed to evaluate answer. Please try again.' },
      { status: 500 },
    );
  }
}