import React, { useState } from 'react';
import { HelpCircle, Check, X, RotateCw, Sparkles, BookOpen } from 'lucide-react';

interface QuizQuestion {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
  correct_option_id: string;
  explanation: string;
  hint?: string;
}

export function QuizWidget({
  title = 'Knowledge Check',
  questions = [],
}: {
  title?: string;
  questions?: QuizQuestion[];
}) {
  const [currentMode, setCurrentMode] = useState<'quiz' | 'flashcards'>('quiz');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Fallback demo questions if none supplied
  const activeQuestions: QuizQuestion[] = questions.length > 0 ? questions : [
    {
      id: 'q1',
      prompt: 'In distributed systems, what is the core guarantee provided by the Raft consensus algorithm?',
      options: [
        { id: 'a', text: 'Linearizable state machine replication across a quorum of nodes' },
        { id: 'b', text: 'Infinite horizontal write scaling without leader election' },
        { id: 'c', text: 'Sub-millisecond latency over WAN networks' },
        { id: 'd', text: 'Byzantine fault tolerance against malicious actors' },
      ],
      correct_option_id: 'a',
      explanation: 'Raft provides strong consistency (linearizable state machine replication) ensuring nodes agree on values even during network partitions as long as a quorum survives.',
      hint: 'Think about leader election and replicated log entries.',
    },
    {
      id: 'q2',
      prompt: 'Under yathish.ai’s memory filesystem protocol, which file is used for user role, identity, and company?',
      options: [
        { id: 'a', text: '/preferences.md' },
        { id: 'b', text: '/profile.md' },
        { id: 'c', text: '/areas/general.md' },
        { id: 'd', text: '/identity.txt' },
      ],
      correct_option_id: 'b',
      explanation: '/profile.md holds durable stable facts about who the user is: name, role, company, or where they live.',
      hint: 'It sits at the root directory of the memory store.',
    }
  ];

  const currentQ = activeQuestions[currentIdx];

  const handleSelect = (optionId: string) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionId);
    setShowExplanation(true);
    if (optionId === currentQ.correct_option_id) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < activeQuestions.length) {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
      setShowExplanation(false);
      setShowHint(false);
      setIsFlipped(false);
    } else {
      setCompleted(true);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setShowHint(false);
    setIsFlipped(false);
    setScore(0);
    setCompleted(false);
  };

  return (
    <div className="my-4 rounded-xl border border-stone-200 bg-white p-5 shadow-xs transition-all">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-[#cc785c]" />
          <h4 className="font-serif font-medium text-stone-900">{title}</h4>
          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600">
            {currentIdx + 1} of {activeQuestions.length}
          </span>
        </div>

        {/* Mode switch */}
        <div className="flex items-center rounded-lg bg-stone-100 p-0.5 text-xs font-medium">
          <button
            onClick={() => {
              setCurrentMode('quiz');
              setIsFlipped(false);
            }}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-all ${
              currentMode === 'quiz' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" /> Quiz
          </button>
          <button
            onClick={() => {
              setCurrentMode('flashcards');
              setIsFlipped(false);
            }}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-all ${
              currentMode === 'flashcards'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" /> Flashcards
          </button>
        </div>
      </div>

      {completed ? (
        <div className="py-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Check className="h-6 w-6" />
          </div>
          <h5 className="mt-3 text-base font-semibold text-stone-900">Quiz Completed!</h5>
          <p className="mt-1 text-sm text-stone-600">
            You scored {score} out of {activeQuestions.length} ({Math.round((score / activeQuestions.length) * 100)}%)
          </p>
          <button
            onClick={handleReset}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-stone-800 transition-colors"
          >
            <RotateCw className="h-3.5 w-3.5" /> Retake Quiz
          </button>
        </div>
      ) : currentMode === 'quiz' ? (
        <div className="mt-4">
          <p className="text-sm font-medium text-stone-800 leading-relaxed">{currentQ.prompt}</p>

          {/* Options */}
          <div className="mt-3.5 space-y-2">
            {currentQ.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              const isCorrect = opt.id === currentQ.correct_option_id;
              let style = 'border-stone-200 bg-stone-50/50 hover:bg-stone-100 text-stone-700';

              if (selectedOption !== null) {
                if (isCorrect) {
                  style = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium';
                } else if (isSelected) {
                  style = 'border-rose-400 bg-rose-50 text-rose-900';
                } else {
                  style = 'border-stone-100 bg-stone-50 text-stone-400 opacity-60';
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  disabled={selectedOption !== null}
                  className={`flex w-full items-center justify-between rounded-lg border p-3 text-left text-xs transition-all ${style}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white font-mono text-[11px] font-bold text-stone-600 border border-stone-200">
                      {opt.id.toUpperCase()}
                    </span>
                    <span>{opt.text}</span>
                  </div>
                  {selectedOption !== null && isCorrect && <Check className="h-4 w-4 text-emerald-600" />}
                  {selectedOption !== null && isSelected && !isCorrect && (
                    <X className="h-4 w-4 text-rose-600" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation box */}
          {showExplanation && (
            <div className="mt-3.5 rounded-lg bg-amber-50/70 border border-amber-200/60 p-3 text-xs text-stone-700">
              <span className="font-semibold text-amber-900">
                {selectedOption === currentQ.correct_option_id ? "That's right! " : 'Not quite. '}
              </span>
              {currentQ.explanation}
            </div>
          )}

          {/* Footer actions */}
          <div className="mt-4 flex items-center justify-between">
            {currentQ.hint && !showExplanation && (
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-xs text-stone-500 hover:text-stone-800 underline decoration-dotted"
              >
                {showHint ? `Hint: ${currentQ.hint}` : 'Need a hint?'}
              </button>
            )}
            <div className="ml-auto">
              {showExplanation && (
                <button
                  onClick={handleNext}
                  className="rounded-lg bg-[#cc785c] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#b8654a] transition-colors"
                >
                  {currentIdx + 1 === activeQuestions.length ? 'See Results' : 'Next Question'}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Flashcards mode */
        <div className="mt-4">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border border-stone-200 bg-gradient-to-br from-stone-50 to-amber-50/30 p-6 text-center shadow-xs transition-transform hover:scale-[1.01]"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#cc785c]">
              {isFlipped ? 'Answer & Explanation (Click to flip)' : 'Question (Click to flip)'}
            </span>
            <p className="mt-3 text-sm font-medium text-stone-900 leading-relaxed">
              {isFlipped
                ? currentQ.options.find((o) => o.id === currentQ.correct_option_id)?.text +
                  ' — ' +
                  currentQ.explanation
                : currentQ.prompt}
            </p>
          </div>

          <div className="mt-3.5 flex items-center justify-between">
            <button
              onClick={() => {
                setCurrentIdx((i) => Math.max(0, i - 1));
                setIsFlipped(false);
              }}
              disabled={currentIdx === 0}
              className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => {
                if (currentIdx + 1 < activeQuestions.length) {
                  setCurrentIdx((i) => i + 1);
                  setIsFlipped(false);
                }
              }}
              disabled={currentIdx + 1 >= activeQuestions.length}
              className="rounded-lg bg-stone-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-stone-800 disabled:opacity-40"
            >
              Next Card
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
