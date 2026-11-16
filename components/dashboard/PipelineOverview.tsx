'use client';

import React from 'react';
import { useApplications } from '@/context/ApplicationsContext';
import { Sparkles, Layers } from 'lucide-react';

export default function PipelineOverview() {
  const { applications } = useApplications();
  const stages = [
    { name: 'Wishlist', color: 'bg-slate-400', badgeColor: 'bg-slate-100 text-slate-700 border-slate-200' },
    { name: 'Applied', color: 'bg-blue-500', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
    { name: 'Interviewing', color: 'bg-indigo-600', badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { name: 'Offer', color: 'bg-emerald-500', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { name: 'Rejected', color: 'bg-rose-500', badgeColor: 'bg-rose-50 text-rose-700 border-rose-200' },
  ];

  const total = applications.length;

  const stageCounts = stages.reduce((acc, stage) => {
    acc[stage.name] = applications.filter((app) => app.status === stage.name).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Application Pipeline Overview</h2>
            <p className="text-xs text-slate-500">Distribution across your active job search stages.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          <span>{total} Total tracked positions</span>
        </div>
      </div>

      {/* Visual Multi-color Progress Breakdown Bar */}
      <div className="mb-6">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100 gap-1 p-0.5">
          {stages.map((stage) => {
            const count = stageCounts[stage.name] || 0;
            const percentage = total > 0 ? (count / total) * 100 : 0;
            if (percentage === 0) return null;
            return (
              <div
                key={stage.name}
                style={{ width: `${Math.max(percentage, 5)}%` }}
                className={`h-full rounded-full ${stage.color} transition-all hover:opacity-90`}
                title={`${stage.name}: ${count} (${Math.round(percentage)}%)`}
              />
            );
          })}
        </div>
      </div>

      {/* Stage Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {stages.map((stage) => {
          const count = stageCounts[stage.name] || 0;
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <div
              key={stage.name}
              className="flex flex-col rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-sm hover:border-indigo-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">{stage.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stage.badgeColor}`}>
                  {percentage}%
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-extrabold text-slate-900">{count}</span>
                <span className="text-[11px] text-slate-400">jobs</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
