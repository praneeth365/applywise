'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ResumeInput from '@/components/analyzer/ResumeInput';
import ApplicationLinkSelect from '@/components/analyzer/ApplicationLinkSelect';
import AnalyzeButton from '@/components/analyzer/AnalyzeButton';
import ResultsDashboard from '@/components/analyzer/ResultsDashboard';
import { useApplications } from '@/context/ApplicationsContext';
import { FileSearch, Sparkles, AlertCircle, FileText } from 'lucide-react';
import type { ResumeAnalysisResult } from '@/lib/ai/resume-analysis';

export default function ResumeAnalyzerPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { updateApplication, showToast } = useApplications();

  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [applicationId, setApplicationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysisResult | null>(null);
  const [error, setError] = useState('');

  const hasResume = mode === 'upload' ? !!file : resumeText.trim().length > 0;

  const handleAnalyze = async () => {
    // Always either POST or show a clear inline validation error.
    if (loading) return;
    if (!jobDescription.trim()) { setError('Please add the job description.'); return; }
    if (!hasResume) { setError('Please upload a PDF resume or paste your resume text.'); return; }
    setError('');
    setAnalysis(null);
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 120_000);
    try {
      const form = new FormData();
      if (mode === 'upload' && file) form.append('resumeFile', file);
      if (mode === 'paste') form.append('resumeText', resumeText);
      form.append('jobDescription', jobDescription);
      if (applicationId) form.append('applicationId', applicationId);

      const res = await fetch('/api/analyze-resume', { method: 'POST', body: form, signal: controller.signal });
      if (!res.ok) {
        let body: { error?: string } = {};
        try { body = (await res.json()) as { error?: string }; } catch { /* non-JSON error body */ }
        const msg = body.error ?? `Analysis failed (HTTP ${res.status}). Please try again.`;
        console.error('[analyze-resume] request failed:', res.status, msg);
        setError(msg);
        showToast(msg, 'error');
        return;
      }
      let data: ResumeAnalysisResult;
      try { data = (await res.json()) as ResumeAnalysisResult; } catch { throw new Error('Invalid response from server. Please try again.'); }
      if (typeof data?.matchScore !== 'number') {
        throw new Error('Invalid analysis response from server. Please try again.');
      }
      setAnalysis(data);
      showToast('Resume analyzed successfully');
      if (applicationId) updateApplication(applicationId, { matchScore: data.matchScore });
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        const msg = 'Analysis timed out after 2 minutes. Please try again.';
        setError(msg);
        showToast(msg, 'error');
        return;
      }
      const msg = e instanceof Error ? e.message : 'Analysis failed. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className={`flex flex-1 flex-col transition-all duration-300 ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <Header title="Resume Analyzer" setMobileOpen={setMobileOpen} collapsed={collapsed} />
        <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
                <FileSearch className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">Phase 4 Preview</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">AI Resume Match & Tailor</h2>
                <p className="text-xs text-slate-500">Upload your resume and target job description to get instant AI tailoring suggestions.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Resume & Target Role</h3>
              </div>

              <ResumeInput
                file={file}
                setFile={setFile}
                resumeText={resumeText}
                setResumeText={setResumeText}
                mode={mode}
                setMode={setMode}
                disabled={loading}
              />

              <ApplicationLinkSelect value={applicationId} onChange={setApplicationId} disabled={loading} />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Job Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  disabled={loading}
                  placeholder="Paste the job description here..."
                  className="w-full min-h-[160px] rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all placeholder:text-slate-400 disabled:opacity-50"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <AnalyzeButton disabled={loading} loading={loading} onClick={handleAnalyze}>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze Resume
              </AnalyzeButton>
            </div>

            <div className="lg:col-span-3">
              <ResultsDashboard analysis={analysis} loading={loading} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
