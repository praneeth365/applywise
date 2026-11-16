'use client';

import React from 'react';
import { LogOut, Menu, Plus, Bell, Search } from 'lucide-react';
import { useApplications } from '@/context/ApplicationsContext';

interface HeaderProps {
  title: string;
  setMobileOpen: (open: boolean) => void;
  collapsed: boolean;
}

function getEmailInitials(email?: string | null): string {
  if (!email) return '?';
  const parts = email
    .split('@')[0]
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

export default function Header({ title, setMobileOpen, collapsed }: HeaderProps) {
  const { openAddModal, user, signOut } = useApplications();

  return (
    <>
      <header className={`sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 sm:px-8 backdrop-blur-md transition-all`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              Manage your job search pipeline with AI-powered insights.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-500 border border-slate-200 w-64">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search companies, roles..."
              className="bg-transparent border-none outline-none w-full text-slate-800 placeholder-slate-400 text-xs"
            />
          </div>

          <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-indigo-600 animate-ping"></span>
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-indigo-600"></span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all transform active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add Application</span>
          </button>

          <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-semibold text-slate-800 max-w-[150px] truncate">
                    {user.email}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    Signed in
                  </p>
                </div>
                <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm shadow-sm">
                  <span>{getEmailInitials(user.email)}</span>
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white"></div>
                </div>
                <button
                  onClick={() => void signOut()}
                  title="Sign out"
                  aria-label="Sign out"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-sm"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
              >
                Sign In
              </a>
            )}
          </div>
        </div>
      </header>
    </>
  );
}