import type { InterviewQuestion } from '@/lib/ai/interview';

/**
 * Row shape returned by the `interview_sessions` table in Supabase.
 * Snake_case here maps to the camelCase `InterviewSessionRecord` type
 * used across the interview-prep UI.
 */
export interface InterviewSessionRow {
  id: string;
  user_id: string;
  application_id: string | null;
  role: string;
  company: string;
  questions: unknown;
  created_at: string;
}

export interface InterviewSessionRecord {
  id: string;
  userId: string;
  applicationId: string | null;
  role: string;
  company: string;
  questions: InterviewQuestion[];
  createdAt: string;
}

/** Convert a Supabase row into the shared `InterviewSessionRecord` UI type. */
export function toInterviewSessionRecord(row: InterviewSessionRow): InterviewSessionRecord {
  const raw = row.questions;
  return {
    id: row.id,
    userId: row.user_id,
    applicationId: row.application_id ?? null,
    role: row.role,
    company: row.company,
    questions: Array.isArray(raw) ? (raw as InterviewQuestion[]) : [],
    createdAt: row.created_at,
  };
}