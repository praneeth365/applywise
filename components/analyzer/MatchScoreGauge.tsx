'use client';

import React from 'react';

interface Props {
  score: number;
}

export default function MatchScoreGauge({ score }: Props) {
  const clamped = Math.max(0, Math.min(100, score));
  const pct = (clamped / 100) * 360;
  const color = clamped >= 75 ? '#10b981' : clamped >= 50 ? '#f59e0b' : '#ef4444';
  const label = clamped >= 75 ? 'Strong Match' : clamped >= 50 ? 'Moderate Match' : 'Weak Match';

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative h-44 w-44">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="14" />
          <circle
            cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth="14"
            strokeDasharray="326.7" strokeDashoffset={326.7 - pct}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-slate-900">{clamped}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">/100</span>
        </div>
      </div>
      <p className="mt-3 text-xs font-bold" style={{ color }}>
        {label}
      </p>
    </div>
  );
}