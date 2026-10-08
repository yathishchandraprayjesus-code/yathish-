import React, { useState } from 'react';
import {
  PROMPT_SECTIONS,
  PERPLEXITY_SECTIONS,
  DEFAULT_CLAUDE_PROMPT,
  PERPLEXITY_SYSTEM_PROMPT,
  SYSTEM_PERSONAS,
} from '../data/claudePrompt';
import {
  FileText,
  Search,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  ShieldAlert,
  Sliders,
  Cpu,
  BookmarkCheck,
  Compass,
} from 'lucide-react';

interface PromptInspectorProps {
  currentPrompt: string;
  onUpdatePrompt: (newPrompt: string) => void;
  onResetPrompt: () => void;
  isCustomized: boolean;
}

export function PromptInspector({
  currentPrompt,
  onUpdatePrompt,
  onResetPrompt,
  isCustomized,
}: PromptInspectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(currentPrompt);

  const isPerplexity =
    currentPrompt.includes('You are Perplexity') ||
    currentPrompt.includes('Perplexity AI') ||
    currentPrompt.includes('Knowledge cutoff: 2023-10');

  const activePersonaId = isPerplexity ? 'perplexity-search' : 'claude-opus-5.5';
  const activeSections = isPerplexity ? PERPLEXITY_SECTIONS : PROMPT_SECTIONS;

  const approxTokens = Math.round(currentPrompt.length / 3.9);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    onUpdatePrompt(editText);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(currentPrompt);
    setIsEditing(false);
  };

  const handleSelectPersona = (personaId: string) => {
    if (personaId === 'perplexity-search') {
      onUpdatePrompt(PERPLEXITY_SYSTEM_PROMPT);
      setEditText(PERPLEXITY_SYSTEM_PROMPT);
    } else {
      onUpdatePrompt(DEFAULT_CLAUDE_PROMPT);
      setEditText(DEFAULT_CLAUDE_PROMPT);
    }
    setSelectedSection('all');
    setIsEditing(false);
  };

  // Filter sections
  const filteredSections = activeSections.filter(
    (sec) =>
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#faf9f6]">
      {/* Top Banner with Stats */}
      <div className="border-b border-stone-200 bg-white px-6 py-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-semibold text-stone-900">
                Tune our AI — System Prompt & Visual Architecture
              </h2>
              {isCustomized && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                  Customized
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-stone-500">
              The operational cognitive constitution governing yathish.ai behavior, hyper-realistic photo generation, memory filesystem, and artifacts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Access Status */}
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-xs font-mono">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-800 font-semibold">Unlimited Access</span>
              <span className="text-emerald-300">•</span>
              <span className="text-emerald-700">Zero Limits</span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Full Prompt'}</span>
            </button>

            {isCustomized && (
              <button
                onClick={onResetPrompt}
                className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                title="Reset to default prompt"
              >
                <RotateCcw className="h-3.5 w-3.5 text-stone-500" />
                <span>Reset</span>
              </button>
            )}

            {!isEditing ? (
              <button
                onClick={() => {
                  setEditText(currentPrompt);
                  setIsEditing(true);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-stone-800 transition-colors shadow-2xs"
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Edit Prompt</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="rounded-lg bg-[#cc785c] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#b8654a]"
                >
                  Apply Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sub-Navigation / Module Overview */}
        <div className="w-80 border-r border-stone-200 bg-white p-4 overflow-y-auto">
          {/* Persona Switcher */}
          <div className="mb-4">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
              Active Persona / Constitution
            </span>
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-stone-100 border border-stone-200">
              <button
                type="button"
                onClick={() => handleSelectPersona('claude-opus-5.5')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg text-center transition-all ${
                  activePersonaId === 'claude-opus-5.5'
                    ? 'bg-white shadow-2xs text-stone-900 border border-stone-200'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#cc785c]" />
                  <span className="text-[11px] font-bold">Claude Opus 5.5</span>
                </div>
                <span className="text-[9px] text-stone-400 mt-0.5">Frontier + Memory</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPersona('perplexity-search')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg text-center transition-all ${
                  activePersonaId === 'perplexity-search'
                    ? 'bg-white shadow-2xs text-stone-900 border border-stone-200'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-teal-600" />
                  <span className="text-[11px] font-bold">Perplexity AI</span>
                </div>
                <span className="text-[9px] text-stone-400 mt-0.5">Search & Citations</span>
              </button>
            </div>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search prompt sections or rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-stone-50/50 py-1.5 pl-8 pr-3 text-xs placeholder:text-stone-400 focus:border-[#cc785c] focus:outline-hidden focus:ring-1 focus:ring-[#cc785c]"
            />
          </div>

          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              {isPerplexity ? 'Perplexity Guidelines' : 'Prompt Modules'}
            </span>
            <button
              onClick={() => setSelectedSection('all')}
              className={`text-[11px] font-medium transition-colors ${
                selectedSection === 'all' ? 'text-[#cc785c] font-semibold' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Show All
            </button>
          </div>

          <div className="space-y-2">
            {filteredSections.map((sec) => (
              <div
                key={sec.id}
                onClick={() => setSelectedSection(sec.id)}
                className={`cursor-pointer rounded-lg border p-3 text-left transition-all ${
                  selectedSection === sec.id
                    ? 'border-[#cc785c] bg-amber-50/40 shadow-xs'
                    : 'border-stone-200/80 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-900">{sec.title}</span>
                  <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-mono text-stone-600">
                    {sec.badge}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-stone-500 leading-snug line-clamp-2">
                  {sec.summary}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {sec.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-stone-100/80 px-1.5 py-0.2 text-[9px] font-mono text-stone-500"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Info Box */}
          <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50/80 p-3.5 text-xs text-stone-600">
            <div className="flex items-center gap-1.5 font-semibold text-stone-800">
              <BookmarkCheck className="h-4 w-4 text-[#cc785c]" />
              <span>Prompt Design Takeaways</span>
            </div>
            <ul className="mt-2 space-y-1.5 text-[11px] text-stone-500 list-disc pl-4 leading-relaxed">
              <li>Direct, unfiltered, comprehensive answers to user queries.</li>
              <li>Zero moralizing, lecturing, or patronizing preambles.</li>
              <li>Virtual memory filesystem retains persistent preferences and project context.</li>
              <li>Artifact criteria generates full standalone runnable applications.</li>
            </ul>
          </div>
        </div>

        {/* Right Code/Text Editor or Inspector View */}
        <div className="flex-1 overflow-auto bg-white p-6">
          {isEditing ? (
            <div className="flex h-full flex-col">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-700">
                  Editing System Instruction (unlimited length supported):
                </span>
                <span className="text-xs font-mono text-emerald-600 font-medium">
                  Unlimited Mode Active
                </span>
              </div>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="flex-1 w-full rounded-xl border border-stone-300 bg-stone-50/30 p-4 font-mono text-xs text-stone-800 leading-relaxed focus:border-[#cc785c] focus:outline-hidden focus:ring-1 focus:ring-[#cc785c]"
                placeholder="Edit system prompt here..."
              />
            </div>
          ) : (
            <div className="h-full">
              <div className="mb-3 flex items-center justify-between border-b border-stone-100 pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#cc785c]" />
                  <span className="text-xs font-semibold text-stone-800">
                    {selectedSection === 'all'
                      ? `Full System Prompt (${isPerplexity ? 'Perplexity Guidelines' : 'Raw XML Specification'})`
                      : `Filtered Section: ${activeSections.find((s) => s.id === selectedSection)?.title || selectedSection}`}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-stone-400">
                  Read-only view • Click "Edit Prompt" to modify
                </span>
              </div>

              <div className="rounded-xl border border-stone-200 bg-[#1e1e1e] p-5 shadow-xs overflow-auto max-h-[calc(100vh-180px)]">
                <pre className="font-mono text-[11.5px] leading-relaxed text-stone-300 whitespace-pre-wrap selection:bg-[#cc785c]/30">
                  {currentPrompt}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
