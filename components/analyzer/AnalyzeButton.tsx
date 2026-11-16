'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
  disabled: boolean;
  loading: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export default function AnalyzeButton({ disabled, loading, onClick, children }: Props) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Analyzing…
        </>
      ) : (
        children
      )}
    </button>
  );
}