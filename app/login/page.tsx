'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, LogIn, Mail, Sparkles, UserPlus } from 'lucide-react';
import { useApplications } from '@/context/ApplicationsContext';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all placeholder:text-slate-400';
const labelClass =
  'block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, signInWithPassword, signUpWithPassword } = useApplications();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const from = searchParams.get('from') || '/';

  // Already signed in? Send them where they intended to go.
  useEffect(() => {
    if (user) router.replace(from === '/login' ? '/' : from);
  }, [user, router, from]);

  const switchMode = (next: 'signin' | 'signup') => {
    setMode(next);
    setError('');
    setNotice('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'signin') {
        await signInWithPassword(email.trim(), password);
      } else {
        const { session } = await signUpWithPassword(email.trim(), password);
        if (!session) {
          setNotice(
            'Account created! Please check your email to confirm your address, then sign in.',
          );
          return;
        }
      }
      router.push(from === '/login' ? '/' : from);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Authentication failed. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 mb-4">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome to ApplyWise
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Sign in to manage your job search pipeline.
          </p>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`rounded-xl py-2 text-sm font-semibold transition-all ${
                mode === 'signin'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`rounded-xl py-2 text-sm font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {from !== '/' && from !== '/login' && (
            <p className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-xs font-semibold text-indigo-700">
              Please sign in to continue to {from}.
            </p>
          )}

          {notice && (
            <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700">
              {notice}
            </p>
          )}

          {error && (
            <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-11`}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {mode === 'signin' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {busy ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-[11px] text-slate-400 mt-5">
            Protected by Supabase Auth. New here?{' '}
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
