import React, { useState } from 'react';
import { ListOrdered, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';

interface StepItem {
  title: string;
  description: string;
}

export function StepWalkthroughWidget({
  summary = 'Step-by-step procedure',
  steps = [],
}: {
  summary?: string;
  steps?: StepItem[];
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<Record<number, boolean>>({});

  const defaultSteps: StepItem[] = steps.length > 0 ? steps : [
    { title: 'Provision Environment', description: 'Configure environment variables including backend AI keys.' },
    { title: 'Initialize System Prompt', description: 'Attach yathish.ai behavioral guidelines, reasoning mode, and protocol rules.' },
    { title: 'Deploy & Verify', description: 'Run full-stack verification and execute prompt test suite.' }
  ];

  const toggleComplete = (idx: number) => {
    setCompleted((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="my-4 rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2">
          <ListOrdered className="h-4 w-4 text-[#cc785c]" />
          <span className="text-xs font-semibold text-stone-800">{summary}</span>
        </div>
        <span className="text-xs text-stone-500 font-mono">
          Step {currentStep + 1} of {defaultSteps.length}
        </span>
      </div>

      {/* Step Stepper Header */}
      <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-2">
        {defaultSteps.map((step, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentStep(idx)}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
              currentStep === idx
                ? 'bg-stone-900 text-white'
                : completed[idx]
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {completed[idx] ? <CheckCircle2 className="h-3 w-3" /> : <span>{idx + 1}</span>}
            <span className="truncate max-w-[120px]">{step.title}</span>
          </button>
        ))}
      </div>

      {/* Current Step Body */}
      <div className="mt-3 rounded-lg bg-stone-50/70 border border-stone-100 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h5 className="text-sm font-semibold text-stone-900">{defaultSteps[currentStep]?.title}</h5>
            <p className="mt-1 text-xs text-stone-600 leading-relaxed">
              {defaultSteps[currentStep]?.description}
            </p>
          </div>
          <button
            onClick={() => toggleComplete(currentStep)}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              completed[currentStep]
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {completed[currentStep] ? 'Completed' : 'Mark Done'}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-3 flex justify-between">
        <button
          onClick={() => setCurrentStep((c) => Math.max(0, c - 1))}
          disabled={currentStep === 0}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100 disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </button>
        <button
          onClick={() => setCurrentStep((c) => Math.min(defaultSteps.length - 1, c + 1))}
          disabled={currentStep === defaultSteps.length - 1}
          className="flex items-center gap-1 rounded-lg bg-stone-900 px-3 py-1 text-xs font-medium text-white hover:bg-stone-800 disabled:opacity-40"
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
