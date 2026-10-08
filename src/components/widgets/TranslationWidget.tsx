import React, { useState } from 'react';
import { Languages, Copy, Check } from 'lucide-react';

interface TranslationData {
  source_language: string;
  source_text: string;
  target_language: string;
  translation: string;
  pronunciation?: string;
  notes?: string;
}

export function TranslationWidget({ data }: { data: TranslationData }) {
  const [copied, setCopied] = useState(false);

  const copyTranslation = () => {
    navigator.clipboard.writeText(data.translation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-[#cc785c]" />
          <span className="text-xs font-semibold text-stone-800">
            {data.source_language} → {data.target_language}
          </span>
        </div>
        <button
          onClick={copyTranslation}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg bg-stone-50 p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            {data.source_language}
          </span>
          <p className="mt-1 text-xs text-stone-700 leading-relaxed">{data.source_text}</p>
        </div>

        <div className="rounded-lg bg-amber-50/60 border border-amber-200/50 p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#cc785c]">
            {data.target_language}
          </span>
          <p className="mt-1 text-xs font-medium text-stone-900 leading-relaxed">{data.translation}</p>
          {data.pronunciation && (
            <p className="mt-1 text-[11px] font-mono text-stone-500">[{data.pronunciation}]</p>
          )}
        </div>
      </div>
    </div>
  );
}
