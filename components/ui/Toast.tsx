'use client';

import React from 'react';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useApplications } from '@/context/ApplicationsContext';

export default function Toast() {
  const { toast, dismissToast } = useApplications();
  if (!toast) return null;
  const isSuccess = toast.type === 'success';
  return (
    <div
      className={`fixed bottom-6 right-6 z-[70] flex items-center gap-3 rounded-2xl px-5 py-4 shadow-xl border max-w-sm animate-in fade-in slide-in-from-bottom-4 ${
        isSuccess
          ? 'bg-white text-emerald-700 border-emerald-200'
          : 'bg-white text-rose-700 border-rose-200'
      }`}
    >
      {isSuccess ? (
        <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
      ) : (
        <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
      )}
      <span className="text-sm font-semibold text-slate-800">{toast.message}</span>
      <button
        onClick={dismissToast}
        className="ml-2 text-slate-400 hover:text-slate-600 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}