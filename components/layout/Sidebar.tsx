'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  FileSearch,
  MessageSquareCode,
  Settings,
  HelpCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Applications', href: '/applications', icon: Briefcase },
    { name: 'Resume Analyzer', href: '/resume-analyzer', icon: FileSearch },
    { name: 'Interview Prep', href: '/interview-prep', icon: MessageSquareCode },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          {(!collapsed || mobileOpen) && (
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white">
                ApplyWise
              </span>
              <span className="text-[10px] font-medium text-indigo-400 uppercase tracking-widest">
                AI Job Manager
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className={`px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${collapsed && !mobileOpen ? 'lg:hidden' : ''}`}>
          Platform
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
              {(!collapsed || mobileOpen) && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </div>

      {/* Bottom Settings / Help */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        <a
          href="#settings"
          onClick={(e) => e.preventDefault()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Settings className="h-5 w-5 shrink-0 text-slate-400" />
          {(!collapsed || mobileOpen) && <span>Settings</span>}
        </a>
        <a
          href="#help"
          onClick={(e) => e.preventDefault()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <HelpCircle className="h-5 w-5 shrink-0 text-slate-400" />
          {(!collapsed || mobileOpen) && <span>Support & Docs</span>}
        </a>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed inset-y-0 left-0 z-30 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex w-72 flex-col bg-slate-900 shadow-2xl animate-in slide-in-from-left duration-300 z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
