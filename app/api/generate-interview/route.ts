import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import {
  generateInterviewQuestions,
  RateLimitError,
} from '@/lib/ai/interview';

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

  const applicationId = typeof body.applicationId === 'string' ? body.applicationId.trim() : '';
  let company = typeof body.company === 'string' ? body.company.trim() : '';
  let role = typeof body.role === 'string' ? body.role.trim() : '';
  let jobDescription = typeof body.jobDescription === 'string' ? body.jobDescription.trim() : '';

  if (applicationId) {
    const { data: app, error } = await supabase
      .from('applications')
      .select('id, company, role, notes')
      .eq('id', applicationId)
      .eq('user_id', user.id)
      .single();

    if (error || !app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Auto-fill from the saved application unless the caller overrode fields.
    if (!company) company = app.company;
    if (!role) role = app.role;
    if (!jobDescription && app.notes) jobDescription = app.notes;
  } else {
    if (!company || !role || !jobDescription) {
      return NextResponse.json(
        { error: 'company, role, and jobDescription are required when no applicationId is provided' },
        { status: 400 },
      );
    }
  }

  if (!company || !role) {
    return NextResponse.json(
      { error: 'company and role are required' },
      { status: 400 },
    );
  }

  try {
    const session = await generateInterviewQuestions({ company, role, jobDescription });

    const { data: inserted, error } = await supabase
      .from('interview_sessions')
      .insert({
        user_id: user.id,
        application_id: applicationId || null,
        company: session.company,
        role: session.role,
        questions: session.questions,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      sessionId: inserted.id,
      company: inserted.company,
      role: inserted.role,
      questions: inserted.questions,
      createdAt: inserted.created_at,
    });
  } catch (e) {
    if (e instanceof RateLimitError) {
      return NextResponse.json(
        { error: 'AI service is busy. Please wait ~30 seconds and try again.' },
        { status: 429 },
      );
    }
    console.error('generate-interview error:', e);
    return NextResponse.json(
      { error: 'Failed to generate interview questions. Please try again.' },
      { status: 500 },
    );
  }
}