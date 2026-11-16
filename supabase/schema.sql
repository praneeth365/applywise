-- ============================================================
-- ApplyWise - Phase 3 database schema
-- Paste this into the Supabase SQL Editor and click "Run".
-- ============================================================

-- ------------------------------------------------------------
-- Applications table
-- ------------------------------------------------------------
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company text not null,
  role text not null,
  location text,
  work_mode text,
  status text not null,
  date_applied date,
  salary_range text,
  job_url text,
  match_score integer,
  notes text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Interviews table
-- ------------------------------------------------------------
create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  application_id uuid not null references public.applications (id) on delete cascade,
  company text not null,
  role text not null,
  round text,
  scheduled_at timestamptz not null
);

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------
create index if not exists idx_applications_user_id
  on public.applications (user_id);

create index if not exists idx_applications_created_at
  on public.applications (created_at desc);

create index if not exists idx_interviews_user_id
  on public.interviews (user_id);

create index if not exists idx_interviews_application_id
  on public.interviews (application_id);

create index if not exists idx_interviews_scheduled_at
  on public.interviews (scheduled_at);

-- ------------------------------------------------------------
-- Row Level Security (owner-only access)
-- ------------------------------------------------------------
alter table public.applications enable row level security;
alter table public.interviews enable row level security;

-- Applications: owner-only policies
create policy "Users can view their own applications"
  on public.applications for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own applications"
  on public.applications for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own applications"
  on public.applications for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own applications"
  on public.applications for delete
  to authenticated
  using (auth.uid() = user_id);

-- Interviews: owner-only policies
create policy "Users can view their own interviews"
  on public.interviews for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own interviews"
  on public.interviews for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own interviews"
  on public.interviews for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own interviews"
  on public.interviews for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- Phase 5: Interview Preparation
-- ============================================================

-- ------------------------------------------------------------
-- Interview sessions table (AI-generated mock interviews)
-- ------------------------------------------------------------
create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  application_id uuid references public.applications (id) on delete cascade,
  role text not null,
  company text not null,
  questions jsonb not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------
create index if not exists idx_interview_sessions_user_id
  on public.interview_sessions (user_id);

create index if not exists idx_interview_sessions_application_id
  on public.interview_sessions (application_id);

create index if not exists idx_interview_sessions_created_at
  on public.interview_sessions (created_at desc);

-- ------------------------------------------------------------
-- Row Level Security (owner-only access)
-- ------------------------------------------------------------
alter table public.interview_sessions enable row level security;

create policy "Users can view their own interview sessions"
  on public.interview_sessions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own interview sessions"
  on public.interview_sessions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own interview sessions"
  on public.interview_sessions for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own interview sessions"
  on public.interview_sessions for delete
  to authenticated
  using (auth.uid() = user_id);
