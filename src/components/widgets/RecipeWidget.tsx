import React, { useState, useEffect } from 'react';
import { ChefHat, Users, Play, Pause, RotateCcw, Clock, CheckCircle2 } from 'lucide-react';

interface RecipeIngredient {
  id: string;
  name: string;
  amount: number;
  unit?: string;
}

interface RecipeStep {
  id: string;
  title: string;
  content: string;
  timer_seconds?: number;
}

interface RecipeData {
  title: string;
  description?: string;
  base_servings: number;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
}

export function RecipeWidget({ data }: { data: RecipeData }) {
  const [servings, setServings] = useState(data.base_servings || 4);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [activeTimerStep, setActiveTimerStep] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const ratio = servings / (data.base_servings || 4);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsLeft]);

  const startTimer = (stepId: string, duration: number) => {
    setActiveTimerStep(stepId);
    setSecondsLeft(duration);
    setIsTimerRunning(true);
  };

  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="my-4 rounded-xl border border-amber-200/70 bg-gradient-to-br from-amber-50/50 via-stone-50 to-orange-50/30 p-5 shadow-xs transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/50 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#cc785c]/10 text-[#cc785c]">
            <ChefHat className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-serif text-lg font-medium text-stone-900">{data.title}</h4>
            {data.description && <p className="text-xs text-stone-500">{data.description}</p>}
          </div>
        </div>

        {/* Servings control */}
        <div className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-sm shadow-2xs">
          <Users className="h-4 w-4 text-stone-400" />
          <span className="text-xs font-medium text-stone-600">Servings:</span>
          <button
            onClick={() => setServings((s) => Math.max(1, s - 1))}
            className="flex h-6 w-6 items-center justify-center rounded bg-stone-100 text-xs font-semibold text-stone-700 hover:bg-stone-200 transition-colors"
          >
            -
          </button>
          <span className="w-5 text-center font-mono text-xs font-semibold text-stone-900">{servings}</span>
          <button
            onClick={() => setServings((s) => s + 1)}
            className="flex h-6 w-6 items-center justify-center rounded bg-stone-100 text-xs font-semibold text-stone-700 hover:bg-stone-200 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Grid: Ingredients & Steps */}
      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-5">
        {/* Ingredients */}
        <div className="md:col-span-2">
          <h5 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-stone-500">Ingredients</h5>
          <ul className="space-y-1.5">
            {data.ingredients.map((ing) => {
              const scaledAmount = Math.round(ing.amount * ratio * 10) / 10;
              return (
                <li
                  key={ing.id}
                  className="flex items-center justify-between rounded-md bg-white/70 px-2.5 py-1.5 text-xs border border-stone-100/80"
                >
                  <span className="font-medium text-stone-800">{ing.name}</span>
                  <span className="font-mono text-stone-600 font-semibold">
                    {scaledAmount} {ing.unit || ''}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Steps */}
        <div className="md:col-span-3">
          <h5 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-stone-500">Method & Steps</h5>
          <div className="space-y-2.5">
            {data.steps.map((step) => {
              const isDone = completedSteps[step.id];
              const isThisTimerActive = activeTimerStep === step.id;

              return (
                <div
                  key={step.id}
                  className={`rounded-lg border p-3 transition-colors ${
                    isDone
                      ? 'border-emerald-200 bg-emerald-50/40 text-stone-500'
                      : 'border-stone-200/80 bg-white/80'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <button
                      onClick={() => toggleStep(step.id)}
                      className="mt-0.5 text-stone-400 hover:text-emerald-600 transition-colors"
                    >
                      <CheckCircle2
                        className={`h-4 w-4 ${isDone ? 'fill-emerald-600 text-white' : 'text-stone-300'}`}
                      />
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold ${isDone ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                          {step.title}
                        </span>
                        {step.timer_seconds && (
                          <div className="flex items-center gap-1.5">
                            {isThisTimerActive && secondsLeft > 0 ? (
                              <div className="flex items-center gap-1 rounded bg-[#cc785c]/10 px-2 py-0.5 text-xs font-mono font-semibold text-[#cc785c]">
                                <Clock className="h-3 w-3 animate-spin" />
                                {formatTimer(secondsLeft)}
                                <button
                                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                                  className="ml-1 hover:opacity-75"
                                >
                                  {isTimerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                                </button>
                                <button
                                  onClick={() => {
                                    setIsTimerRunning(false);
                                    setActiveTimerStep(null);
                                  }}
                                  className="hover:opacity-75"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => startTimer(step.id, step.timer_seconds!)}
                                className="flex items-center gap-1 rounded bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600 hover:bg-stone-200 transition-colors"
                              >
                                <Play className="h-3 w-3 text-[#cc785c]" />
                                {formatTimer(step.timer_seconds)} timer
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <p className={`mt-1 text-xs leading-relaxed ${isDone ? 'text-stone-400' : 'text-stone-600'}`}>
                        {step.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
