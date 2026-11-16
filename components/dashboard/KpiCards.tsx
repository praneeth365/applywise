'use client';

import React from 'react';
import { useApplications } from '@/context/ApplicationsContext';
import { Briefcase, CalendarCheck, Award, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function KpiCards() {
  const { applications } = useApplications();

  const total = applications.length;
  const interviewing = applications.filter((a) => a.status === 'Interviewing').length;
  const offers = applications.filter((a) => a.status === 'Offer').length;
  const wishlist = applications.filter((a) => a.status === 'Wishlist').length;
  const responseRate = total > 0 ? (((total - wishlist) / total) * 100).toFixed(1) + '%' : '0%';

  const metrics = [
    { title: 'Total Applications', value: total, change: '+12%', trend: 'up' as const, timeframe: 'vs last month' },
    { title: 'Interviews Scheduled', value: interviewing, change: '+25%', trend: 'up' as const, timeframe: 'vs last month' },
    { title: 'Offers Received', value: offers, change: '+100%', trend: 'up' as const, timeframe: 'vs last month' },
    { title: 'Response Rate', value: responseRate, change: '+5.4%', trend: 'up' as const, timeframe: 'vs industry avg' },
  ];

  const icons = [Briefcase, CalendarCheck, Award, TrendingUp];
  const colors = [
    'bg-blue-50 text-blue-600 border-blue-100',
    'bg-indigo-50 text-indigo-600 border-indigo-100',
    'bg-emerald-50 text-emerald-600 border-emerald-100',
    'bg-amber-50 text-amber-600 border-amber-100',
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {metrics.map((metric, idx) => {
        const Icon = icons[idx % icons.length];
        const colorClass = colors[idx % colors.length];
        const isPositive = metric.trend === 'up';

        return (
          <div
            key={metric.title}
            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 hover:shadow-md hover:border-indigo-200 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {metric.title}
              </span>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${colorClass} transition-transform group-hover:scale-110`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-extrabold tracking-tight text-slate-900">
                {metric.value}
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                <span>{metric.change}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
              <span>{metric.timeframe}</span>
              <span className="font-medium text-slate-600 group-hover:text-indigo-600 transition-colors">View details &rarr;</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
