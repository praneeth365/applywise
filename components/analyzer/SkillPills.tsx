'use client';

import React from 'react';

interface Props {
  matched: string[];
  missing: string[];
}

export default function SkillPills({ matched, missing }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Matched Skills</span>
          <span className="ml-auto text-xs font-semibold text-slate-600">{matched.length}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {matched.map((s) => (
            <span key={s} className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-emerald-700 shadow-sm">
              {s}
            </span>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Missing Keywords</span>
          <span className="ml-auto text-xs font-semibold text-slate-600">{missing.length}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {missing.map((s) => (
            <span key={s} className="rounded-full border border-amber-300 bg-white px-2.5 py-1 text-[10px] font-semibold text-amber-700 shadow-sm">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}