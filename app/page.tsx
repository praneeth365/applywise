'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import KpiCards from '@/components/dashboard/KpiCards';
import PipelineOverview from '@/components/dashboard/PipelineOverview';
import RecentApplications from '@/components/dashboard/RecentApplications';

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Header
          title="Dashboard"
          setMobileOpen={setMobileOpen}
          collapsed={collapsed}
        />

        <main className="flex-1 p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto">
          {/* KPI Summary Cards */}
          <KpiCards />

          {/* Application Pipeline Overview */}
          <PipelineOverview />

          {/* Recent Applications */}
          <RecentApplications />
        </main>
      </div>
    </div>
  );
}
