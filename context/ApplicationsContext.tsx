'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import type { Session, User } from '@supabase/supabase-js';
import { ApplicationStatus, JobApplication } from '@/lib/mock-data';
import {
  toApplicationRow,
  toApplicationRowPatch,
  toJobApplication,
} from '@/lib/supabase/applications';

/**
 * Phase 3 storage layer.
 * All CRUD operations are isolated inside this provider so that UI
 * components stay untouched. The localStorage persistence has been
 * swapped for live Supabase queries scoped to the authenticated user,
 * with optimistic UI updates.
 */

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface ApplicationsContextValue {
  applications: JobApplication[];
  hydrated: boolean;
  loading: boolean;
  user: User | null;
  addApplication: (data: Omit<JobApplication, 'id'>) => JobApplication;
  updateApplication: (id: string, data: Partial<JobApplication>) => void;
  deleteApplication: (id: string) => void;
  updateStatus: (id: string, status: ApplicationStatus) => void;
  getApplication: (id: string) => JobApplication | undefined;
  isModalOpen: boolean;
  editingApplication: JobApplication | null;
  openAddModal: () => void;
  openEditModal: (app: JobApplication) => void;
  closeModal: () => void;
  toast: Toast | null;
  showToast: (message: string, type?: 'success' | 'error') => void;
  dismissToast: () => void;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (
    email: string,
    password: string,
  ) => Promise<{ user: User | null; session: Session | null }>;
  signOut: () => Promise<void>;
}

const NOT_CONFIGURED_MESSAGE =
  'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.';

const ApplicationsContext = createContext<ApplicationsContextValue | undefined>(
  undefined,
);

export function ApplicationsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';
    // Guard against placeholder/misconfigured env values so the app
    // still builds and renders while credentials are being set up.
    if (!url.startsWith('http') || !key) return null;
    return createBrowserClient(url, key);
  }, []);

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ id: Date.now(), message, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const dismissToast = useCallback(() => setToast(null), []);

  /** Fetch every application belonging to the authenticated user. */
  const loadApplications = useCallback(
    async (userId: string) => {
      if (!supabase) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setApplications((data ?? []).map(toJobApplication));
      } catch (err) {
        console.error('Failed to load applications from Supabase', err);
        showToast('Failed to load applications. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    },
    [supabase, showToast],
  );

  // Resolve the initial session, then keep the user in sync on any
  // auth change (sign in / sign out / token refresh).
  useEffect(() => {
    let mounted = true;

    if (!supabase) {
      setHydrated(true);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setHydrated(true);
      if (session?.user) {
        loadApplications(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadApplications(session.user.id);
      } else {
        setApplications([]);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, loadApplications]);

  const addApplication = useCallback(
    (data: Omit<JobApplication, 'id'>): JobApplication => {
      const tempId = `app-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const app: JobApplication = { ...data, id: tempId };
      // Optimistic insert so the Dashboard/Table/Board update instantly.
      setApplications((prev) => [app, ...prev]);
      showToast('Application added successfully');

      if (supabase && user) {
        supabase
          .from('applications')
          .insert(toApplicationRow(data, user.id))
          .select()
          .single()
          .then(({ data: row, error }) => {
            if (error) {
              console.error('Failed to insert application', error);
              setApplications((prev) => prev.filter((a) => a.id !== tempId));
              showToast('Failed to save application', 'error');
              return;
            }
            setApplications((prev) =>
              prev.map((a) => (a.id === tempId ? toJobApplication(row) : a)),
            );
          });
      }

      return app;
    },
    [supabase, user, showToast],
  );

  const updateApplication = useCallback(
    (id: string, data: Partial<JobApplication>) => {
      const previous = applications;
      // Optimistic update.
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...data, id: a.id } : a)),
      );
      showToast('Application updated');

      if (!supabase || !user) return;
      supabase
        .from('applications')
        .update(toApplicationRowPatch(data))
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            console.error('Failed to update application', error);
            setApplications(previous);
            showToast('Failed to update application', 'error');
          }
        });
    },
    [supabase, user, applications, showToast],
  );

  const deleteApplication = useCallback(
    (id: string) => {
      const previous = applications;
      // Optimistic delete.
      setApplications((prev) => prev.filter((a) => a.id !== id));
      showToast('Application deleted');

      if (!supabase || !user) return;
      supabase
        .from('applications')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            console.error('Failed to delete application', error);
            setApplications(previous);
            showToast('Failed to delete application', 'error');
          }
        });
    },
    [supabase, user, applications, showToast],
  );

  const updateStatus = useCallback(
    (id: string, status: ApplicationStatus) => {
      const previous = applications;
      // Optimistic status change.
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a)),
      );
      showToast(`Status updated to ${status}`);

      if (!supabase || !user) return;
      supabase
        .from('applications')
        .update({ status })
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            console.error('Failed to update status', error);
            setApplications(previous);
            showToast('Failed to update status', 'error');
          }
        });
    },
    [supabase, user, applications, showToast],
  );

  // ------------------------------------------------------------------
  // Authentication
  // ------------------------------------------------------------------

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      if (!supabase) throw new Error(NOT_CONFIGURED_MESSAGE);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.refresh();
    },
    [supabase, router],
  );

  const signUpWithPassword = useCallback(
    async (email: string, password: string) => {
      if (!supabase) throw new Error(NOT_CONFIGURED_MESSAGE);
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      router.refresh();
      return { user: data.user ?? null, session: data.session ?? null };
    },
    [supabase, router],
  );

  const signOut = useCallback(async () => {
    if (!supabase) throw new Error(NOT_CONFIGURED_MESSAGE);
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setApplications([]);
    router.push('/login');
    router.refresh();
  }, [supabase, router]);

  const getApplication = useCallback(
    (id: string) => applications.find((a) => a.id === id),
    [applications],
  );

  const openAddModal = useCallback(() => {
    setEditingApplication(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((app: JobApplication) => {
    setEditingApplication(app);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingApplication(null);
  }, []);

  const value = useMemo<ApplicationsContextValue>(
    () => ({
      applications,
      hydrated,
      loading,
      user,
      addApplication,
      updateApplication,
      deleteApplication,
      updateStatus,
      getApplication,
      isModalOpen,
      editingApplication,
      openAddModal,
      openEditModal,
      closeModal,
      toast,
      showToast,
      dismissToast,
      signInWithPassword,
      signUpWithPassword,
      signOut,
    }),
    [
      applications,
      hydrated,
      loading,
      user,
      addApplication,
      updateApplication,
      deleteApplication,
      updateStatus,
      getApplication,
      isModalOpen,
      editingApplication,
      openAddModal,
      openEditModal,
      closeModal,
      toast,
      showToast,
      dismissToast,
      signInWithPassword,
      signUpWithPassword,
      signOut,
    ],
  );

  return <ApplicationsContext.Provider value={value}>{children}</ApplicationsContext.Provider>;
}

export function useApplications() {
  const ctx = useContext(ApplicationsContext);
  if (!ctx) throw new Error('useApplications must be used within ApplicationsProvider');
  return ctx;
}