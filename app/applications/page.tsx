'use client';

import React, { useMemo, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ApplicationsTable from '@/components/applications/ApplicationsTable';
import ApplicationsBoard from '@/components/applications/ApplicationsBoard';
import ApplicationDrawer from '@/components/applications/ApplicationDrawer';
import { useApplications } from '@/context/ApplicationsContext';
import { APPLICATION_STATUSES, ApplicationStatus, JobApplication } from '@/lib/mock-data';
import { ArrowUpDown, Briefcase, ChevronDown, LayoutGrid, Search, Table2, SearchX } from 'lucide-react';

type SortKey = 'newest' | 'match' | 'company';
type ViewMode = 'table' | 'board';
type StatusFilter = 'All' | ApplicationStatus;

export default function ApplicationsPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { applications } = useApplications();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [sort, setSort] = useState<SortKey>('newest');
  const [view, setView] = useState<ViewMode>('table');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = applications.filter((a) => {
      const matchesQuery =
        !q || a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
    return [...list].sort((a, b) => {
      if (sort === 'newest') return b.dateApplied.localeCompare(a.dateApplied);
      if (sort === 'match') return b.matchScore - a.matchScore;
      return a.company.localeCompare(b.company);
    });
  }, [applications, query, statusFilter, sort]);

  const selected = applications.find((a) => a.id === selectedId) ?? null;

  const pills: StatusFilter[] = ['All', ...APPLICATION_STATUSES];
  const pillClass = (active: boolean) =>
    `rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
      active
        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
    }`;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className={`flex flex-1 flex-col transition-all duration-300 ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <Header title="Applications" setMobileOpen={setMobileOpen} collapsed={collapsed} />
        <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Page header */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">All Job Applications</h2>
                <p className="text-xs text-slate-500">
                  {filtered.length} of {applications.length} applications
                </p>
              </div>
            </div>
          </div>

          {/* Controls bar */}
          <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-xs text-slate-500 border border-slate-200 flex-1">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search by company or role..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-slate-800 placeholder-slate-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-8 text-xs font-semibold text-slate-600 outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="newest">Newest first</option>
                    <option value="match">Highest match score</option>
                    <option value="company">Company A-Z</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>

                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1">
                  <button
                    onClick={() => setView('table')}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      view === 'table'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Table2 className="h-3.5 w-3.5" /> Table
                  </button>
                  <button
                    onClick={() => setView('board')}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      view === 'board'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" /> Board
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {pills.map((p) => (
                <button
                  key={p}
                  onClick={() => setStatusFilter(p)}
                  className={pillClass(statusFilter === p)}
                >
                  {p}
                  {p !== 'All' && (
                    <span className="ml-1.5 opacity-70">
                      {applications.filter((a) => a.status === p).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {filtered.length === 0 ? (
            <div className="rounded-2xl bg-white shadow-sm border border-slate-200/80 p-12 flex flex-col items-center text-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <SearchX className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No applications found</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Try adjusting your search or status filter to find what you&apos;re looking for.
              </p>
            </div>
          ) : view === 'table' ? (
            <ApplicationsTable
              applications={filtered}
              onView={(app: JobApplication) => setSelectedId(app.id)}
            />
          ) : (
            <ApplicationsBoard
              applications={filtered}
              onView={(app: JobApplication) => setSelectedId(app.id)}
            />
          )}
        </main>
      </div>

      <ApplicationDrawer application={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}
