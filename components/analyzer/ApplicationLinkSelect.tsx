'use client';

import React from 'react';
import { Link2 } from 'lucide-react';
import { useApplications } from '@/context/ApplicationsContext';

interface Props {
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}

export default function ApplicationLinkSelect({ value, onChange, disabled }: Props) {
  const { applications } = useApplications();

  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
        Link to Saved Application
      </label>
      <div className="relative">
        <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all disabled:opacity-50"
        >
          <option value="">Not linked</option>
          {applications.map((app) => (
            <option key={app.id} value={app.id}>
              {app.company} — {app.role}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-1 text-[10px] text-slate-400">
        Saving the score will update the Dashboard and Applications table automatically.
      </p>
    </div>
  );
}