'use client';

import React from 'react';
import { Sparkles, Lightbulb, Target, AlertCircle, FileText } from 'lucide-react';
import MatchScoreGauge from '@/components/analyzer/MatchScoreGauge';
import SkillPills from '@/components/analyzer/SkillPills';
import ImprovementCard from '@/components/analyzer/ImprovementCard';
import type { ResumeAnalysisResult } from '@/lib/ai/resume-analysis';

interface Props {
  analysis: ResumeAnalysisResult | null;
  loading: boolean;
}

export default function ResultsDashboard({ analysis, loading }: Props) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Sparkles className="h-4 w-4" />
          </div>
          <h3 className="text-base font-bold text-slate-900">AI Results</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-slate-50 p-6 animate-pulse h-56" />
          <div className="space-y-4">
            <div className="h-12 w-full rounded-xl bg-slate-50 animate-pulse" />
            <div className="h-12 w-2/3 rounded-xl bg-slate-50 animate-pulse" />
            <div className="h-24 w-full rounded-xl bg-slate-50 animate-pulse" />
          </div>
        </div>
        <div className="h-20 w-full rounded-xl bg-slate-50 animate-pulse" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col items-center justify-center text-center py-16">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 mb-4">
          <FileText className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">AI Resume Match & Tailor</h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Upload your resume or paste your experience, add a target job description, and run the AI
          analyzer to get your ATS match score and tailored bullet rewrites.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
        <div className="flex items-center gap-2 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Sparkles className="h-4 w-4" />
          </div>
          <h3 className="text-base font-bold text-slate-900">AI Results</h3>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
          <MatchScoreGauge score={analysis.matchScore} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Executive Summary</p>
            <p className="text-sm text-slate-700 leading-relaxed">{analysis.summary}</p>
          </div>
        </div>
      </div>

      {analysis.strengths?.length ? (
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
          <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-4">
            <Target className="h-4 w-4 text-indigo-600" /> Strengths
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {analysis.strengths.map((s, i) => (
              <div key={i} className="rounded-xl bg-slate-50 border border-slate-200/80 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Strength {i + 1}</span>
                <p className="text-xs text-slate-700 mt-1">{s}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-4">
          <AlertCircle className="h-4 w-4 text-indigo-600" /> Skill Match Breakdown
        </h4>
        <SkillPills matched={analysis.matchedSkills ?? []} missing={analysis.missingKeywords ?? []} />
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-4">
          <Lightbulb className="h-4 w-4 text-indigo-600" /> AI Tailored Bullet Rewrites
        </h4>
        {analysis.improvements?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.improvements.map((imp, i) => (
              <ImprovementCard key={i} item={imp} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">No improvement suggestions available for this resume yet.</p>
        )}
      </div>
    </div>
  );
}