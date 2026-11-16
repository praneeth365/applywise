'use client';

import React, { useEffect, useState } from 'react';
import { JobApplication } from '@/lib/mock-data';
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
  Calendar,
  DollarSign,
  ExternalLink,
  Laptop,
  MapPin,
  Pencil,
  Sparkles,
  StickyNote,
  Trash2,
  X,
} from 'lucide-react';

interface ApplicationDrawerProps {
  application: JobApplication | null;
  onClose: () => void;
}

export default function ApplicationDrawer({ application, onClose }: ApplicationDrawerProps) {
  const { updateApplication, deleteApplication, openEditModal } = useApplications();
  const [notes, setNotes] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setNotes(application?.notes ?? '');
    setConfirmDelete(false);
  }, [application]);

  useEffect(() => {
    if (!application) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [application, onClose]);

  if (!application) return null;
  const app = application;

  const saveNotes = () => {
    updateApplication(app.id, { notes: notes.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Application Details</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white font-bold text-base shadow-sm">
              {getInitials(app.company)}
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 leading-snug">{app.role}</h4>
              <p className="text-sm font-semibold text-slate-500">{app.company}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(app.status)}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(app.status)}`}></span>
                  {app.status}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${getMatchBadge(app.matchScore)}`}>
                  <Sparkles className="h-3 w-3" />
                  {app.matchScore}% match
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Location</p>
              <p className="flex items-center gap-1.5 text-slate-700 font-medium text-xs">
                <MapPin className="h-3.5 w-3.5 text-slate-400" /> {app.location}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Work Mode</p>
              <p className="flex items-center gap-1.5 text-slate-700 font-medium text-xs">
                <Laptop className="h-3.5 w-3.5 text-slate-400" /> {getWorkMode(app)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Date Applied</p>
              <p className="flex items-center gap-1.5 text-slate-700 font-medium text-xs">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> {formatDate(app.dateApplied)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Salary Range</p>
              <p className="flex items-center gap-1.5 text-slate-700 font-medium text-xs">
                <DollarSign className="h-3.5 w-3.5 text-slate-400" /> {app.salaryRange ?? '—'}
              </p>
            </div>
          </div>

          {app.jobUrl && (
            <a
              href={app.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View Job Posting
            </a>
          )}

          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              <StickyNote className="h-3.5 w-3.5" /> Notes
            </label>
            <textarea
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes, referral contacts, follow-up reminders..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all placeholder:text-slate-400"
            />
            <button
              onClick={saveNotes}
              className="mt-2 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
            >
              Save Notes
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex items-center gap-3">
          {confirmDelete ? (
            <>
              <button
                onClick={() => {
                  deleteApplication(app.id);
                  onClose();
                }}
                className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 transition-all"
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => openEditModal(app)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-100 transition-all"
              >
                <Pencil className="h-4 w-4" /> Edit
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-100 transition-all"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}