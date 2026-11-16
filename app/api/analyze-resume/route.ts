import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPdf, analyzeResume, RateLimitError, ResumeAnalysisResult } from '@/lib/ai/resume-analysis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const resumeFile = formData.get('resumeFile') as File | null;
    const resumeText = formData.get('resumeText') as string | null;
    const jobDescription = (formData.get('jobDescription') as string | null)?.trim();
    const applicationId = formData.get('applicationId') as string | null;

    if (!jobDescription) {
      return NextResponse.json({ error: 'jobDescription is required' }, { status: 400 });
    }
    if (!resumeFile && !resumeText) {
      return NextResponse.json({ error: 'Provide either resumeFile or resumeText' }, { status: 400 });
    }

    let resumeContent = '';
    if (resumeFile) {
      if (resumeFile.type !== 'application/pdf') {
        return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
      }
      const arrayBuffer = await resumeFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      if (buffer.length > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'PDF too large (max 10MB)' }, { status: 413 });
      }
      try {
        resumeContent = await extractTextFromPdf(buffer);
      } catch (e) {
        console.error('[analyze-resume] PDF extraction failed:', e);
        return NextResponse.json(
          { error: e instanceof Error ? e.message : 'Failed to parse PDF' },
          { status: 400 },
        );
      }
    } else {
      resumeContent = resumeText!.trim();
    }

    const result: ResumeAnalysisResult = await analyzeResume(resumeContent, jobDescription);

    if (applicationId) {
      await supabase
        .from('applications')
        .update({ match_score: result.matchScore })
        .eq('id', applicationId)
        .eq('user_id', user.id);
    }

    return NextResponse.json(result);
  } catch (e) {
    console.error('[analyze-resume]', e);
    if (e instanceof RateLimitError) {
      return NextResponse.json(
        { error: 'AI service is busy. Please wait ~30 seconds and try again.' },
        { status: 429 },
      );
    }
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 });
  }
}