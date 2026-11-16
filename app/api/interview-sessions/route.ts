import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { toInterviewSessionRecord } from '@/lib/supabase/interview-sessions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** List the authenticated user's most recent mock interview sessions. */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('interview_sessions')
    .select('id, user_id, application_id, role, company, questions, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('interview-sessions GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load interview sessions' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    sessions: (data ?? []).map(toInterviewSessionRecord),
  });
}

/** Delete one of the user's own interview sessions. */
export async function DELETE(req: NextRequest) {
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

  const id = typeof body.id === 'string' ? body.id.trim() : '';
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('interview_sessions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('interview-sessions DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete interview session' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}