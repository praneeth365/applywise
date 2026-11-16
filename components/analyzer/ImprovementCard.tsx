'use client';

import React, { useCallback, useState } from 'react';
import { useApplications } from '@/context/ApplicationsContext';
import { Check, Copy } from 'lucide-react';

interface Props {
  item: { section: string; suggestion: string; exampleBullet: string };
}

export default function ImprovementCard({ item }: Props) {
  const { showToast } = useApplications();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(item.exampleBullet);
    setCopied(true);
    showToast('Bullet copied to clipboard');
    setTimeout(() => setCopied(false), 1800);
  }, [item.exampleBullet, showToast]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3 mb-2">
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
          {item.section}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="ml-auto shrink-0 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
          aria-label="Copy bullet"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      <p className="mb-3 text-sm text-slate-600">{item.suggestion}</p>
      <blockquote className="rounded-lg border-l-2 border-indigo-300 bg-indigo-50 pl-3 text-sm italic text-slate-700">
        “{item.exampleBullet}”
      </blockquote>
    </div>
  );
}