'use client';

import React, { useState } from 'react';
import { useApplications } from '@/context/ApplicationsContext';
import type { InterviewSessionRecord } from '@/lib/supabase/interview-sessions';
import type { AnswerEvaluation } from '@/lib/ai/evaluate-answer';
import type { InterviewQuestionCategory } from '@/lib/ai/interview';
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Loader2,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';

interface Props {
  session: InterviewSessionRecord;
  onExit: () => void;
}

const CATEGORY_BADGE: Record<InterviewQuestionCategory, string> = {
  Technical: 'bg-blue-50 text-blue-700 border-blue-200',
  Behavioral: 'bg-violet-50 text-violet-700 border-violet-200',
  Culture: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function scoreBadge(score: number): string {
  if (score >= 8) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (score >= 5) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-rose-50 text-rose-700 border-rose-200';
}

export default function InterviewSession({ session, onExit }: Props) {
  const { showToast } = useApplications();
  const questions = session.questions;

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(() => questions.map(() => ''));
  const [hintOpen, setHintOpen] = useState(false);
  const [frameworkOpen, setFrameworkOpen] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [evaluations, setEvaluations] = useState<Record<number, AnswerEvaluation>>({});
  const [finished, setFinished] = useState(false);

  const current = questions[index];
  const isLast = index === questions.length - 1;
  const evaluation = evaluations[index];

  const scoredValues = questions
    .map((_, i) => evaluations[i]?.score)
    .filter((s): s is number => typeof s === 'number');
  const averageScore = scoredValues.length
    ? Math.round(scoredValues.reduce((a, b) => a + b, 0) / scoredValues.length)
    : 0;

  const evaluate = async () => {
    const answer = answers[index].trim();
    if (!answer) {
      showToast('Type or paste your answer first.', 'error');
      return;
    }
    setEvaluating(true);
    setEvalError(null);
    try {
      const res = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: current.question,
          answer,
          category: current.category,
          role: session.role,
          company: session.company,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Evaluation failed. Please try again.');
      }
      setEvaluations((prev) => ({ ...prev, [index]: data as AnswerEvaluation }));
    } catch (err) {
      setEvalError(err instanceof Error ? err.message : 'Evaluation failed.');
    } finally {
      setEvaluating(false);
    }
  };

  const setAnswer = (value: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header + progress */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Exit
          </button>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-900">
              {session.company} · {session.role}
            </p>
            <p className="text-[11px] text-slate-500">
              Question {index + 1} of {questions.length}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFinished(true)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Trophy className="h-4 w-4" /> Finish
          </button>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-300"
            style={{
              width: `${Math.round(((index + 1) / questions.length) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Question card */}
      {!finished && (
        <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${CATEGORY_BADGE[current.category]}`}
            >
              {current.category}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              {index + 1} / {questions.length}
            </span>
          </div>

          <h2 className="text-lg font-bold text-slate-900 leading-snug">
            {current.question}
          </h2>

          {/* Hint box */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 overflow-hidden">
            <button
              type="button"
              onClick={() => setHintOpen((o) => !o)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <span className="flex items-center gap-2 text-xs font-semibold text-indigo-700">
                <Lightbulb className="h-4 w-4" /> What the interviewer is looking for
              </span>
              <ChevronDown
                className={`h-4 w-4 text-indigo-500 transition-transform ${
                  hintOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {hintOpen && (
              <p className="px-4 pb-4 text-xs text-slate-600 leading-relaxed">
                {current.whatTheInterviewerIsLookingFor}
              </p>
            )}
          </div>

          {/* Sample framework */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
            <button
              type="button"
              onClick={() => setFrameworkOpen((o) => !o)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Sparkles className="h-4 w-4 text-indigo-500" /> Sample strong-answer
                framework
              </span>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform ${
                  frameworkOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {frameworkOpen && (
              <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed space-y-2">
                <p>{current.sampleGoodAnswer.framework}</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-500">
                  {current.sampleGoodAnswer.keyPoints.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Answer input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Your answer
            </label>
            <textarea
              rows={6}
              value={answers[index]}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type or practice your answer here…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Evaluate */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void evaluate()}
              disabled={evaluating || !answers[index].trim()}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {evaluating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span>{evaluating ? 'Evaluating…' : 'AI Evaluate Answer'}</span>
            </button>
            {evaluation && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${scoreBadge(evaluation.score)}`}
              >
                <Trophy className="h-3.5 w-3.5" /> Score: {evaluation.score}/10
              </span>
            )}
          </div>

          {evalError && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700">
              {evalError}
            </p>
          )}

          {/* Evaluation result */}
          {evaluation && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-3">
              <p className="text-xs font-semibold text-emerald-800">
                {evaluation.feedback}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1.5">
                    What you did well
                  </p>
                  <ul className="space-y-1">
                    {evaluation.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1.5">
                    Tips to improve
                  </p>
                  <ul className="space-y-1">
                    {evaluation.tips.map((t, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Nav */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            {isLast ? (
              <button
                type="button"
                onClick={() => setFinished(true)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-colors"
              >
                <Trophy className="h-4 w-4" /> Finish Interview
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-colors"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Summary view */}
      {finished && (
        <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
          <div className="text-center space-y-1">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Trophy className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Interview Complete!</h2>
            <p className="text-xs text-slate-500">
              {scoredValues.length} of {questions.length} questions evaluated
            </p>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
              <div className="text-center">
                <p className="text-3xl font-extrabold">{averageScore}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                  avg score
                </p>
              </div>
            </div>
          </div>

          <ul className="space-y-3">
            {questions.map((q, i) => {
              const ev = evaluations[i];
              return (
                <li
                  key={i}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${CATEGORY_BADGE[q.category]}`}
                      >
                        {q.category}
                      </span>
                      <p className="mt-1 text-xs font-semibold text-slate-900">
                        {q.question}
                      </p>
                      {ev && (
                        <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                          {ev.feedback}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      {ev ? (
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${scoreBadge(ev.score)}`}
                        >
                          {ev.score}/10
                        </span>
                      ) : (
                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-400">
                          Not evaluated
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setIndex(i);
                          setFinished(false);
                        }}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        Re-answer
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIndex(0);
                setFinished(false);
                setEvaluations({});
                setAnswers(questions.map(() => ''));
              }}
              className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              <RotateCcw className="h-4 w-4" /> Practice Again
            </button>
            <button
              type="button"
              onClick={onExit}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-colors"
            >
              <X className="h-4 w-4" /> Back to Setup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}