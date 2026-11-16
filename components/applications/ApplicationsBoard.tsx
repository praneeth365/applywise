'use client';

import React from 'react';
import { ApplicationStatus, JobApplication } from '@/lib/mock-data';
import {
  getInitials,
  getMatchBadge,
  getStatusBadge,
  getStatusDot,
  getWorkMode,
  STATUS_ORDER,
} from '@/lib/application-utils';
import { useApplications } from '@/context/ApplicationsContext';
import { ChevronLeft, ChevronRight, DollarSign, Laptop, MapPin, Sparkles } from 'lucide-react';

interface ApplicationsBoardProps {
  applications: JobApplication[];
  onView: (app: JobApplication) => void;
}

function BoardCard({
  app,
  onView,
}: {
  app: JobApplication;
  onView: (app: JobApplication) => void;
}) {
  const { updateStatus } = useApplications();
  const idx = STATUS_ORDER.indexOf(app.status);
  const prev = idx > 0 ? STATUS_ORDER[idx - 1] : null;
  const next = idx < STATUS_ORDER.length - 1 ? STATUS_ORDER[idx + 1] : null;

  const move = (status: ApplicationStatus) => updateStatus(app.id, status);

  return (
    <div
      onClick={() => onView(app)}
      className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-4 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs shadow-sm">
          {getInitials(app.company)}
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getMatchBadge(app.matchScore)}`}>
          <Sparkles className="h-3 w-3" />
          {app.matchScore}%
        </span>
      </div>
      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
        {app.role}
      </h4>
      <p className="text-xs font-semibold text-slate-500 mt-0.5">{app.company}</p>

      <div className="flex flex-wrap items-center gap-1.5 mt-3 text-[11px] text-slate-500 font-medium">
        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 border border-slate-200">
          <Laptop className="h-3 w-3 text-slate-400" />
          {getWorkMode(app)}
        </span>
        {app.salaryRange && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 border border-slate-200">
            <DollarSign className="h-3 w-3 text-slate-400" />
            {app.salaryRange}
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 border border-slate-200">
          <MapPin className="h-3 w-3 text-slate-400" />
          {app.location}
        </span>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadge(app.status)}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(app.status)}`}></span>
          {app.status}
        </span>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            disabled={!prev}
            onClick={() => prev && move(prev)}
            title={prev ? `Move to ${prev}` : 'No earlier stage'}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            disabled={!next}
            onClick={() => next && move(next)}
            title={next ? `Move to ${next}` : 'No later stage'}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ApplicationsBoard({ applications, onView }: ApplicationsBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-start">
      {STATUS_ORDER.map((stage) => {
        const cards = applications.filter((a) => a.status === stage);
        return (
          <div
            key={stage}
            className="rounded-2xl bg-slate-50/80 border border-slate-200/80 p-3 space-y-3 min-h-[120px]"
          >
            <div className="flex items-center justify-between px-1">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                <span className={`h-2 w-2 rounded-full ${getStatusDot(stage)}`}></span>
                {stage}
              </span>
              <span className="text-[11px] font-bold text-slate-400 bg-white border border-slate-200 rounded-full px-2 py-0.5">
                {cards.length}
              </span>
            </div>
            {cards.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 p-4 text-center text-[11px] font-medium text-slate-400">
                No applications
              </div>
            ) : (
              cards.map((app) => <BoardCard key={app.id} app={app} onView={onView} />)
            )}
          </div>
        );
      })}
    </div>
  );
}