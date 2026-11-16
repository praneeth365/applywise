export type ApplicationStatus = 'Wishlist' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';

export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'Wishlist',
  'Applied',
  'Interviewing',
  'Offer',
  'Rejected',
];

export const WORK_MODES: WorkMode[] = ['Remote', 'Hybrid', 'On-site'];

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  isRemote: boolean;
  status: ApplicationStatus;
  dateApplied: string;
  matchScore: number;
  salaryRange?: string;
  logoUrl?: string;
  workMode?: WorkMode;
  jobUrl?: string;
  notes?: string;
}

export interface KpiMetric {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  timeframe: string;
}

export const MOCK_KPI_METRICS: KpiMetric[] = [
  {
    title: 'Total Applications',
    value: 28,
    change: '+12%',
    trend: 'up',
    timeframe: 'vs last month',
  },
  {
    title: 'Interviews Scheduled',
    value: 6,
    change: '+25%',
    trend: 'up',
    timeframe: 'vs last month',
  },
  {
    title: 'Offers Received',
    value: 2,
    change: '+100%',
    trend: 'up',
    timeframe: 'vs last month',
  },
  {
    title: 'Response Rate',
    value: '42.8%',
    change: '+5.4%',
    trend: 'up',
    timeframe: 'vs industry avg',
  },
];

export const MOCK_APPLICATIONS: JobApplication[] = [
  {
    id: 'app-1',
    company: 'Stripe',
    role: 'Senior Frontend Engineer',
    location: 'San Francisco, CA',
    isRemote: true,
    status: 'Interviewing',
    dateApplied: '2026-10-12',
    matchScore: 94,
    salaryRange: '$180k - $220k',
    workMode: 'Hybrid',
    jobUrl: 'https://jobs.stripe.com/senior-frontend-engineer',
    notes: 'Strong referral from Sarah. System design round went well.',
  },
  {
    id: 'app-2',
    company: 'Vercel',
    role: 'Full Stack React Engineer',
    location: 'Remote',
    isRemote: true,
    status: 'Offer',
    dateApplied: '2026-10-02',
    matchScore: 98,
    salaryRange: '$190k - $230k',
    workMode: 'Remote',
    jobUrl: 'https://vercel.com/careers/full-stack-react-engineer',
    notes: 'Offer received - negotiating base + equity.',
  },
  {
    id: 'app-3',
    company: 'Linear',
    role: 'Product Engineer',
    location: 'New York, NY',
    isRemote: true,
    status: 'Interviewing',
    dateApplied: '2026-10-18',
    matchScore: 91,
    salaryRange: '$170k - $210k',
  },
  {
    id: 'app-4',
    company: 'OpenAI',
    role: 'UI/UX AI Systems Engineer',
    location: 'San Francisco, CA',
    isRemote: false,
    status: 'Applied',
    dateApplied: '2026-11-01',
    matchScore: 88,
    salaryRange: '$220k - $280k',
    workMode: 'On-site',
    jobUrl: 'https://openai.com/careers/ui-ux-ai-systems-engineer',
  },
  {
    id: 'app-5',
    company: 'Figma',
    role: 'Design Systems Engineer',
    location: 'San Francisco, CA',
    isRemote: true,
    status: 'Wishlist',
    dateApplied: '2026-11-10',
    matchScore: 85,
    salaryRange: '$180k - $220k',
  },
  {
    id: 'app-6',
    company: 'Notion',
    role: 'Frontend Infrastructure Engineer',
    location: 'New York, NY',
    isRemote: true,
    status: 'Rejected',
    dateApplied: '2026-09-15',
    matchScore: 76,
    salaryRange: '$160k - $200k',
  },
  {
    id: 'app-7',
    company: 'Supabase',
    role: 'TypeScript SDK Engineer',
    location: 'Remote',
    isRemote: true,
    status: 'Applied',
    dateApplied: '2026-11-05',
    matchScore: 92,
    salaryRange: '$150k - $190k',
    workMode: 'Remote',
    jobUrl: 'https://supabase.com/careers/typescript-sdk-engineer',
    notes: 'Applied via careers page. OSS contributions highlighted.',
  },
];
