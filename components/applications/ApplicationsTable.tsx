'use client';

import React, { useEffect, useRef, useState } from 'react';
import { APPLICATION_STATUSES, ApplicationStatus, JobApplication } from '@/lib/mock-data';
import {
  formatDate,
  getInitials,
  getMatchBadge,
  getStatusBadge,
  getStatusDot,
  getWorkMode,
} from '@/lib/application-utils';
import { useApplications } from '@/context/ApplicationsContext';
import {
  ChevronDown,
  Eye,
  MapPin,
  Pencil,
  Sparkles,
  Trash2,
  Laptop,
} from 'lucide-react';

interface ApplicationsTableProps {
  applications: JobApplication[];
  onView: (app: JobApplication) => void;
}

function StatusDropdown({
  value,
  onSelect,
}: {
  value: ApplicationStatus;
  onSelect: (status: ApplicationStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-colors ${getStatusBadge(value)}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(value)}`}></span>
        {value}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-44 rounded-xl bg-white border border-slate-200 shadow-lg z-30 py-1">
          {APPLICATION_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                onSelect(s);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors ${
                s === value ? 'text-indigo-600 bg-indigo-50/60' : 'text-slate-600'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(s)}`}></span>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ app, onView }: { app: JobApplication; onView: (app: JobApplication) => void }) {
  const { updateStatus, deleteApplication, openEditModal } = useApplications();
  const [confirming, setConfirming] = useState(false);

  return (
    <tr className="group hover:bg-slate-50/80 transition-colors">
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs shadow-sm">
            {getInitials(app.company)}
          </div>
          <div>
            <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {app.company}
            </div>
            <div className="text-xs text-slate-500 font-medium">{app.role}</div>
          </div>
        </div>
      </td>
      <td className="py-4 px-6 text-slate-600 text-xs font-medium">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>{app.location}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1 text-slate-400">
          <Laptop className="h-3.5 w-3.5 shrink-0" />
          <span>{getWorkMode(app)}</span>
        </div>
      </td>
      <td className="py-4 px-6">
        <StatusDropdown value={app.status} onSelect={(s) => updateStatus(app.id, s)} />
      </td>
      <td className="py-4 px-6 text-slate-500 text-xs font-medium whitespace-nowrap">
        {formatDate(app.dateApplied)}
      </td>
      <td className="py-4 px-6">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${getMatchBadge(app.matchScore)}`}
        >
          <Sparkles className="h-3 w-3" />
          {app.matchScore}%
        </span>
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onView(app)}
            title="View details"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => openEditModal(app)}
            title="Edit"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </button>
          {confirming ? (
            <div className="flex items-center gap-1 ml-1">
              <button
                onClick={() => deleteApplication(app.id)}
                className="rounded-lg bg-rose-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-rose-700 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              title="Delete"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function ApplicationsTable({ applications, onView }: ApplicationsTableProps) {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-slate-200/80 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-6">Company & Role</th>
              <th className="py-3.5 px-6">Location & Mode</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6">Date Applied</th>
              <th className="py-3.5 px-6">AI Match</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {applications.map((app) => (
              <Row key={app.id} app={app} onView={onView} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}