'use client';

import React, { useEffect, useState } from 'react';
import { Building2, X, CheckCircle } from 'lucide-react';
import { useApplications } from '@/context/ApplicationsContext';
import { APPLICATION_STATUSES, JobApplication, WORK_MODES, WorkMode } from '@/lib/mock-data';

interface FormState {
  company: string;
  role: string;
  location: string;
  workMode: WorkMode;
  status: (typeof APPLICATION_STATUSES)[number];
  dateApplied: string;
  salaryRange: string;
  jobUrl: string;
  matchScore: number;
  notes: string;
}

const EMPTY_FORM: FormState = {
  company: '',
  role: '',
  location: '',
  workMode: 'Remote',
  status: 'Applied',
  dateApplied: new Date().toISOString().slice(0, 10),
  salaryRange: '',
  jobUrl: '',
  matchScore: 85,
  notes: '',
};

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all placeholder:text-slate-400';
const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5';

export default function ApplicationModal() {
  const { isModalOpen, editingApplication, closeModal, addApplication, updateApplication } =
    useApplications();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isModalOpen) return;
    if (editingApplication) {
      const a = editingApplication;
      setForm({
        company: a.company,
        role: a.role,
        location: a.location,
        workMode: a.workMode ?? (a.isRemote ? 'Remote' : 'On-site'),
        status: a.status,
        dateApplied: a.dateApplied,
        salaryRange: a.salaryRange ?? '',
        jobUrl: a.jobUrl ?? '',
        matchScore: a.matchScore,
        notes: a.notes ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError('');
  }, [isModalOpen, editingApplication]);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isModalOpen, closeModal]);

  if (!isModalOpen) return null;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company.trim() || !form.role.trim()) {
      setError('Company Name and Job Title / Role are required.');
      return;
    }
    const payload: Omit<JobApplication, 'id'> = {
      company: form.company.trim(),
      role: form.role.trim(),
      location: form.location.trim() || (form.workMode === 'Remote' ? 'Remote' : 'On-site'),
      isRemote: form.workMode === 'Remote',
      workMode: form.workMode,
      status: form.status,
      dateApplied: form.dateApplied || new Date().toISOString().slice(0, 10),
      salaryRange: form.salaryRange.trim() || undefined,
      jobUrl: form.jobUrl.trim() || undefined,
      matchScore: Math.max(0, Math.min(100, form.matchScore || 0)),
      notes: form.notes.trim() || undefined,
    };
    if (editingApplication) {
      updateApplication(editingApplication.id, payload);
    } else {
      addApplication(payload);
    }
    closeModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={closeModal}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {editingApplication ? 'Edit Application' : 'Add New Application'}
              </h3>
              <p className="text-xs text-slate-500">
                {editingApplication
                  ? `Update details for ${editingApplication.company}.`
                  : 'Track a new job opportunity in ApplyWise.'}
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Company Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Google, Stripe"
                value={form.company}
                onChange={(e) => set('company', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Job Title / Role *</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Frontend Engineer"
                value={form.role}
                onChange={(e) => set('role', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input
                type="text"
                placeholder="e.g. San Francisco, CA"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Work Mode</label>
              <select
                value={form.workMode}
                onChange={(e) => set('workMode', e.target.value as WorkMode)}
                className={inputClass}
              >
                {WORK_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value as FormState['status'])}
                className={inputClass}
              >
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Date Applied</label>
              <input
                type="date"
                value={form.dateApplied}
                onChange={(e) => set('dateApplied', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Salary Range (optional)</label>
              <input
                type="text"
                placeholder="e.g. $150k - $190k"
                value={form.salaryRange}
                onChange={(e) => set('salaryRange', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Match Score (0-100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.matchScore}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  set('matchScore', Number.isNaN(v) ? 0 : Math.max(0, Math.min(100, v)));
                }}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Job URL (optional)</label>
            <input
              type="url"
              placeholder="https://jobs.example.com/listing"
              value={form.jobUrl}
              onChange={(e) => set('jobUrl', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              rows={3}
              placeholder="Referral contact, interview prep, follow-ups..."
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              className={inputClass}
            />
          </div>

          {error && (
            <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 transition-all"
            >
              <CheckCircle className="h-4 w-4" />
              {editingApplication ? 'Save Changes' : 'Save Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}