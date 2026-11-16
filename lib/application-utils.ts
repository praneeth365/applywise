import { ApplicationStatus, JobApplication, WorkMode } from './mock-data';

export const STATUS_ORDER: ApplicationStatus[] = [
  'Wishlist',
  'Applied',
  'Interviewing',
  'Offer',
  'Rejected',
];

export function getWorkMode(app: JobApplication): WorkMode {
  return app.workMode ?? (app.isRemote ? 'Remote' : 'On-site');
}

export function getStatusBadge(status: ApplicationStatus): string {
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
}

export function getStatusDot(status: ApplicationStatus): string {
  switch (status) {
    case 'Offer':
      return 'bg-emerald-500';
    case 'Interviewing':
      return 'bg-indigo-500';
    case 'Applied':
      return 'bg-blue-500';
    case 'Wishlist':
      return 'bg-slate-400';
    case 'Rejected':
      return 'bg-rose-500';
    default:
      return 'bg-slate-400';
  }
}

export function getMatchBadge(score: number): string {
  if (score >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (score >= 80) return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-amber-50 text-amber-700 border-amber-200';
}

export function getInitials(company: string): string {
  return company
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}