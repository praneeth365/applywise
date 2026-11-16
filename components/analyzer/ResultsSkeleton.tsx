'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
  loading: boolean;
}

export default function ResultsSkeleton({ loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider bg-slate-50 rounded-xl p-3">
          Loading AI analysis…
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 space-y-3">
            <h3 className="text-base font-bold text-slate-900">Summary</h3>
            <p className="text-[11px] text-slate-500">{loading ? 'Analyzing…' : ''}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 space-y-3">
            <h3 className="text-base font-bold text-slate-900">Skills</h3>
            <p className="text-[11px] text-slate-500">{loading ? 'Analyzing…' : ''}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 space-y-3">
            <h3 className="text-base font-bold text-slate-900">Strengths</h3>
            <p className="text-[11px] text-slate-500">{loading ? 'Analyzing…' : ''}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 space-y-3">
            <h3 className="text-base font-bold text-slate-900">Improvements</h3>
            <p className="text-[11px] text-slate-500">{loading ? 'Analyzing…' : ''}</p>
          </div>
        </div>
      </div>
    );
  }
  return null;
}