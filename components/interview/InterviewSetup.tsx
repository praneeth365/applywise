'use client';

import React, { useState } from 'react';
import { useApplications } from '@/context/ApplicationsContext';
import type { InterviewSessionRecord } from '@/lib/supabase/interview-sessions';
import {
  Building2,
  Briefcase,
  FileText,
  Loader2,
  MessageSquareCode,
  Wand2,
} from 'lucide-react';

interface Props {
  onSessionReady: (session: InterviewSessionRecord) => void;
}

export default function InterviewSetup({ onSessionReady }: Props) {
  const { applications, hydrated, user, showToast } = useApplications();
  const [applicationId, setApplicationId] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const selectApplication = (id: string) => {
    setApplicationId(id);
    if (!id) return;
    const app = applications.find((a) => a.id === id);
    if (app) {
      setCompany(app.company);
      setRole(app.role);
    }
  };

  const canSubmit = !!company.trim() && !!role.trim() && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (!user) {
      showToast('Please sign in to generate interview questions.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/generate-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: applicationId || undefined,
          company: company.trim(),
          role: role.trim(),
          jobDescription: jobDescription.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate interview questions.');
      }
      onSessionReady({
        id: data.sessionId,
        userId: user.id,
        applicationId: applicationId || null,
        company: data.company,
        role: data.role,
        questions: data.questions,
        createdAt: data.createdAt,
      });
      showToast('Mock interview generated — good luck!', 'success');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Something went wrong',
        'error',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-5"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
          <MessageSquareCode className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Session Setup</h2>
          <p className="text-xs text-slate-500">
            Pick a saved application or enter the details manually.
          </p>
        </div>
      </div>

      {/* Application picker */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
          <Wand2 className="h-3.5 w-3.5" /> Saved Application
        </label>
        <div className="relative">
          <select
            value={applicationId}
            onChange={(e) => selectApplication(e.target.value)}
            disabled={!hydrated}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-10 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all disabled:opacity-50"
          >
            <option value="">Enter details manually</option>
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.company} — {app.role}
              </option>
            ))}
          </select>
          <Building2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
        {!hydrated && (
          <p className="mt-1 text-[11px] text-slate-400">Loading your applications…</p>
        )}
      </div>

      {/* Company + Role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            <Building2 className="h-3.5 w-3.5" /> Company
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Stripe"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all placeholder:text-slate-400"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            <Briefcase className="h-3.5 w-3.5" /> Role
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Job description */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
          <FileText className="h-3.5 w-3.5" /> Job Description
        </label>
        <textarea
          rows={6}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here for sharper, tailored questions…"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all placeholder:text-slate-400"
        />
        <p className="mt-1 text-[11px] text-slate-400">
          {applicationId
            ? 'Optional — the saved application already fills company & role. Add the JD for sharper questions.'
            : 'Required for manual sessions — the AI tailors every question to this description.'}
        </p>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating questions…</span>
          </>
        ) : (
          <>
            <MessageSquareCode className="h-4 w-4" />
            <span>Generate Mock Interview</span>
          </>
        )}
      </button>
    </form>
  );
}