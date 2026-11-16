'use client';

import React, { useCallback, useRef, useState } from 'react';
import { FileText, UploadCloud, X, Clipboard, Loader2 } from 'lucide-react';

interface Props {
  file: File | null;
  setFile: (f: File | null) => void;
  resumeText: string;
  setResumeText: (s: string) => void;
  mode: 'upload' | 'paste';
  setMode: (m: 'upload' | 'paste') => void;
  disabled?: boolean;
}

export default function ResumeInput({ file, setFile, resumeText, setResumeText, mode, setMode, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }, [disabled, setFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Mode tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setMode('upload')}
          className={`flex-1 rounded-lg py-2 transition-all ${
            mode === 'upload' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Upload PDF
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setMode('paste')}
          className={`flex-1 rounded-lg py-2 transition-all ${
            mode === 'paste' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Paste Resume Text
        </button>
      </div>

      {mode === 'upload' ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
            dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:border-indigo-400'
          } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input ref={inputRef} type="file" accept="application/pdf" onChange={onFileChange} className="hidden" />
          {file ? (
            <div className="flex w-full items-center justify-between gap-3 rounded-xl bg-white p-3 border border-slate-200">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-5 w-5 text-indigo-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{file.name}</p>
                  <p className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition-colors"
                aria-label="Clear file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-3">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold text-slate-900">Drag & drop your resume</p>
              <p className="text-[10px] text-slate-500 mt-1">or click to browse (PDF only)</p>
            </>
          )}
        </div>
      ) : (
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          disabled={disabled}
          placeholder="Paste your resume text here..."
          className="w-full min-h-[180px] rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all placeholder:text-slate-400 disabled:opacity-50"
        />
      )}
    </div>
  );
}