'use client';

import React from 'react';
import { ApplicationStatus } from '@/lib/mock-data';
import { useApplications } from '@/context/ApplicationsContext';
import { Briefcase, MapPin, Building2, ExternalLink, Sparkles } from 'lucide-react';

export default function RecentApplications() {
  const { applications } = useApplications();
  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Offer':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Interviewing':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Applied':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Wishlist':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getMatchBadge = (score: number) => {
    if (score >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 80) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-slate-200/80 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-slate-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Applications</h2>
            <p className="text-xs text-slate-500">Latest job submissions and AI match ratings.</p>
          </div>
        </div>
        <a
          href="/applications"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
        >
          <span>View all applications</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-6">Company & Role</th>
              <th className="py-3.5 px-6">Location</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6">Date Applied</th>
              <th className="py-3.5 px-6">AI Match</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {applications.map((app) => (
              <tr
                key={app.id}
                className="group hover:bg-slate-50/80 transition-colors"
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs shadow-sm">
                      {app.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {app.company}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {app.role} {app.salaryRange && <span className="text-slate-400 font-normal">({app.salaryRange})</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-slate-600 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{app.location}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-slate-500 text-xs font-medium">
                  {app.dateApplied}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${getMatchBadge(app.matchScore)}`}>
                      <Sparkles className="h-3 w-3" />
                      {app.matchScore}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
