import { JobApplication, WorkMode } from '@/lib/mock-data';

/**
 * Row shape returned by the `applications` table in Supabase.
 * Snake_case here maps to the camelCase `JobApplication` type
 * used across all UI components.
 */
export interface ApplicationRow {
  id: string;
  user_id: string;
  company: string;
  role: string;
  location: string | null;
  work_mode: string | null;
  status: string;
  date_applied: string | null;
  salary_range: string | null;
  job_url: string | null;
  match_score: number | null;
  notes: string | null;
  created_at: string;
}

/** Convert a Supabase row into the shared `JobApplication` UI type. */
export function toJobApplication(row: ApplicationRow): JobApplication {
  const workMode = (row.work_mode as WorkMode | null) ?? 'Remote';
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    location: row.location ?? (workMode === 'Remote' ? 'Remote' : 'On-site'),
    isRemote: workMode === 'Remote',
    workMode,
    status: row.status as JobApplication['status'],
    dateApplied: row.date_applied ?? new Date().toISOString().slice(0, 10),
    matchScore: row.match_score ?? 0,
    salaryRange: row.salary_range ?? undefined,
    jobUrl: row.job_url ?? undefined,
    notes: row.notes ?? undefined,
  };
}

/** Payload for inserting a new application on behalf of a user. */
export function toApplicationRow(
  app: Omit<JobApplication, 'id'>,
  userId: string,
): Record<string, unknown> {
  return {
    user_id: userId,
    company: app.company,
    role: app.role,
    location: app.location || null,
    work_mode: app.workMode ?? (app.isRemote ? 'Remote' : 'On-site'),
    status: app.status,
    date_applied: app.dateApplied,
    salary_range: app.salaryRange ?? null,
    job_url: app.jobUrl ?? null,
    match_score: app.matchScore,
    notes: app.notes ?? null,
  };
}

/** Payload for updating only the changed fields of an application. */
export function toApplicationRowPatch(
  data: Partial<JobApplication>,
): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  if (data.company !== undefined) patch.company = data.company;
  if (data.role !== undefined) patch.role = data.role;
  if (data.location !== undefined) patch.location = data.location ?? null;
  if (data.workMode !== undefined) {
    patch.work_mode = data.workMode;
  } else if (data.isRemote !== undefined) {
    patch.work_mode = data.isRemote ? 'Remote' : 'On-site';
  }
  if (data.status !== undefined) patch.status = data.status;
  if (data.dateApplied !== undefined) patch.date_applied = data.dateApplied;
  if (data.salaryRange !== undefined) patch.salary_range = data.salaryRange ?? null;
  if (data.jobUrl !== undefined) patch.job_url = data.jobUrl ?? null;
  if (data.matchScore !== undefined) patch.match_score = data.matchScore;
  if (data.notes !== undefined) patch.notes = data.notes ?? null;
  return patch;
}
