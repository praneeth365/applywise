'use client';

import React from 'react';
import { useApplications } from '@/context/ApplicationsContext';
import type { InterviewSessionRecord } from '@/lib/supabase/interview-sessions';
import { getInitials } from '@/lib/application-utils';
import { History, Loader2, MessageSquareCode, Play, Trash2 } from 'lucide-react';

interface Props {
  sessions: InterviewSessionRecord[];
  loading: boolean;
  onResume: (session: InterviewSessionRecord) => void;
  onDeleted: (id: string) => void;
}

function formatSessionDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function SavedSessions({
  sessions,
  loading,
  onResume,
  onDeleted,
}: Props) {
  const { showToast } = useApplications();

  const removeSession = async (id: string) => {
    try {
      const res = await fetch('/api/interview-sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete session.');
      }
      onDeleted(id);
      showToast('Practice session deleted.', 'success');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to delete session.',
        'error',
      );
    }
  };

  return (
    <aside className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
          <History className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Practice History</h3>
          <p className="text-[11px] text-slate-500">
            {sessions.length} saved session{sessions.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-xs text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading sessions…</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
          <MessageSquareCode className="mx-auto h-8 w-8 text-slate-300 mb-2" />
          <p className="text-xs font-semibold text-slate-700">No practice sessions yet</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Generate your first mock interview to see it here.
          </p>
        </div>
      ) : (
        <ul className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
          {sessions.map((s) => (
            <li
              key={s.id}
              className="group rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 hover:border-indigo-200 hover:bg-indigo-50/40 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-[10px]">
                  {getInitials(s.company)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{s.role}</p>
                  <p className="text-[11px] font-medium text-slate-500 truncate">
                    {s.company} · {s.questions.length} questions
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {formatSessionDate(s.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => onResume(s)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-700 transition-colors"
                >
                  <Play className="h-3 w-3" /> Resume
                </button>
                <button
                  type="button"
                  onClick={() => void removeSession(s.id)}
                  title="Delete session"
                  aria-label="Delete session"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}