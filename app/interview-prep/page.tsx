'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import InterviewSetup from '@/components/interview/InterviewSetup';
import InterviewSession from '@/components/interview/InterviewSession';
import SavedSessions from '@/components/interview/SavedSessions';
import type { InterviewSessionRecord } from '@/lib/supabase/interview-sessions';
import { useApplications } from '@/context/ApplicationsContext';
import { BrainCircuit, MessageSquareCode } from 'lucide-react';

export default function InterviewPrepPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { showToast } = useApplications();
  const [activeSession, setActiveSession] = useState<InterviewSessionRecord | null>(null);
  const [sessions, setSessions] = useState<InterviewSessionRecord[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/interview-sessions', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setSessions(Array.isArray(data.sessions) ? data.sessions : []);
    } catch {
      /* sidebar shows the empty state */
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const handleSessionReady = (record: InterviewSessionRecord) => {
    setActiveSession(record);
    void loadSessions();
  };

  const handleExit = () => {
    setActiveSession(null);
    void loadSessions();
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Header title="Interview Prep" setMobileOpen={setMobileOpen} collapsed={collapsed} />
        <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {activeSession ? (
            <InterviewSession session={activeSession} onExit={handleExit} />
          ) : (
            <>
              <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
                    <MessageSquareCode className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                        Phase 5
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">
                      AI Mock Interview Studio
                    </h2>
                    <p className="text-xs text-slate-500">
                      Practice role-specific technical and behavioral questions with
                      real-time AI feedback.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5">
                  <BrainCircuit className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span className="text-xs font-semibold text-slate-600">
                    5 tailored questions per session · instant AI scoring
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
                <InterviewSetup onSessionReady={handleSessionReady} />
                <SavedSessions
                  sessions={sessions}
                  loading={sessionsLoading}
                  onResume={(s) => setActiveSession(s)}
                  onDeleted={(id) =>
                    setSessions((prev) => prev.filter((x) => x.id !== id))
                  }
                />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
