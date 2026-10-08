import React, { useState } from 'react';
import {
  Wrench,
  FileSpreadsheet,
  FileText,
  Presentation,
  Palette,
  Terminal,
  Search,
  BookOpen,
  Sparkles,
  ExternalLink,
  Bot,
  Globe,
  PieChart,
  Package,
  Video,
  Zap,
  X,
  CheckCircle2,
} from 'lucide-react';
import { HIGGSFIELD_MARKETING_STUDIO_SKILL, AUTONOMOUS_EXECUTION_ENGINE_PROMPT } from '../data/skills/higgsfieldMarketingStudio';
import { SEEDREAM_5_PROMPTS_SKILL } from '../data/skills/seedreamPrompts';
import { BASELINE_GUIDELINES_SKILL } from '../data/skills/baselineGuidelines';

interface SkillItem {
  name: string;
  category: 'Document & Office' | 'Design & Frontend' | 'Agentic & System' | 'Specialized';
  description: string;
  location: string;
  icon: any;
  details?: {
    overview?: string;
    quickFacts?: string[];
    presets?: { name: string; slug: string; picklist: boolean; notes: string }[];
    templates?: { title: string; subject: string; useCase: string }[];
  };
}

const AVAILABLE_SKILLS: SkillItem[] = [
  {
    name: 'baseline-guidelines',
    category: 'Agentic & System',
    description: 'Google AI Studio Build Baseline Guidelines: runtime environment on Cloud Run, port 3000 constraints, zero mock data policy, real OAuth integrations, and strict intent classification.',
    location: BASELINE_GUIDELINES_SKILL.location,
    icon: Terminal,
    details: {
      overview: BASELINE_GUIDELINES_SKILL.description,
      quickFacts: BASELINE_GUIDELINES_SKILL.quickFacts,
    }
  },
  {
    name: 'autonomous-execution-engine',
    category: 'Agentic & System',
    description: 'Fully autonomous AI execution engine mandate: Comprehend & Diagnose, Autonomously Resolve & Fix, Optimize & Polish, Output Deliverable directly with zero TODOs or placeholders.',
    location: '/mnt/skills/system/autonomous-execution-engine/SKILL.md',
    icon: Zap,
    details: {
      overview: 'Autonomous execution protocol for all complex tasks: silently diagnose edge cases, eliminate placeholders, resolve all constraints, and output production-ready deliverables without manual user fixes.',
      quickFacts: [
        'Phase 1: Comprehend & Diagnose (identify goals, hidden logic flaws, missing constraints, bottlenecks)',
        'Phase 2: Autonomously Resolve & Fix (silently fix errors, zero TODOs/placeholders, fully implement logic)',
        'Phase 3: Optimize & Polish (elevate to industry standards, edge-to-edge safety checks)',
        'Phase 4: Output Deliverable (present final perfect result directly with concise summary)'
      ]
    }
  },
  {
    name: 'higgsfield-marketing-studio',
    category: 'Specialized',
    description: 'Short-form DTC ad-video generation engine across 9 presets (UGC, Tutorial, Unboxing, Hyper Motion, Product Review, TV Spot, Wild Card, UGC/Pro Virtual Try On), hook & setting picklists, Ad Multiplier, and Genjutsu.',
    location: HIGGSFIELD_MARKETING_STUDIO_SKILL.location,
    icon: Video,
    details: {
      overview: HIGGSFIELD_MARKETING_STUDIO_SKILL.description,
      quickFacts: HIGGSFIELD_MARKETING_STUDIO_SKILL.quickFacts,
      presets: HIGGSFIELD_MARKETING_STUDIO_SKILL.presets
    }
  },
  {
    name: 'seedream-5-prompts',
    category: 'Design & Frontend',
    description: 'Awesome Seedream 5 Prompts & Commercial Image Workflows: 7-step prompt formula, e-commerce PDP hero shots, editorial styling, editing formulas, and video source-frame discipline.',
    location: SEEDREAM_5_PROMPTS_SKILL.location,
    icon: Palette,
    details: {
      overview: SEEDREAM_5_PROMPTS_SKILL.description,
      quickFacts: SEEDREAM_5_PROMPTS_SKILL.quickFacts,
      templates: SEEDREAM_5_PROMPTS_SKILL.templates
    }
  },
  {
    name: 'docx',
    category: 'Document & Office',
    description: 'Create, read, edit, or manipulate Word documents (.docx) with tables of contents, page numbers, and professional formatting.',
    location: '/mnt/skills/public/docx/SKILL.md',
    icon: FileText,
  },
  {
    name: 'pdf',
    category: 'Document & Office',
    description: 'Extract text and tables from PDFs, merge/split documents, fill forms, rotate pages, and perform OCR.',
    location: '/mnt/skills/public/pdf/SKILL.md',
    icon: FileText,
  },
  {
    name: 'pptx',
    category: 'Document & Office',
    description: 'Generate slide decks, pitch decks, and presentations as PowerPoint (.pptx) files with clean layout hierarchy and speaker notes.',
    location: '/mnt/skills/public/pptx/SKILL.md',
    icon: Presentation,
  },
  {
    name: 'xlsx',
    category: 'Document & Office',
    description: 'Build spreadsheets, financial models, compute formulas, clean messy CSVs, and output styled .xlsx files.',
    location: '/mnt/skills/public/xlsx/SKILL.md',
    icon: FileSpreadsheet,
  },
  {
    name: 'frontend-design',
    category: 'Design & Frontend',
    description: 'Distinctive, intentional visual design constitution: anti-AI slop rules, typography hierarchy, and non-generic color palettes.',
    location: '/mnt/skills/public/frontend-design/SKILL.md',
    icon: Palette,
  },
  {
    name: 'product-self-knowledge',
    category: 'Agentic & System',
    description: 'Grounding in yathish.ai architecture: interactive artifacts engine, real-time web search grounding, and cognitive reasoning.',
    location: '/mnt/skills/public/product-self-knowledge/SKILL.md',
    icon: BookOpen,
  },
  {
    name: 'file-reading',
    category: 'Agentic & System',
    description: 'Router for reading uploaded files (archives, binaries, spreadsheets, ebooks) without dumping raw binaries.',
    location: '/mnt/skills/public/file-reading/SKILL.md',
    icon: Search,
  },
  {
    name: 'skill-creator',
    category: 'Specialized',
    description: 'Create, benchmark, and evaluate reusable skills with variance analysis and trigger accuracy optimization.',
    location: '/mnt/skills/examples/skill-creator/SKILL.md',
    icon: Terminal,
  },
  {
    name: 'visualize',
    category: 'Design & Frontend',
    description: 'Create interactive HTML visual simulations, lab models, data plots, and maps in conversation with theme-aware tokens.',
    location: '/mnt/skills/public/visualize/SKILL.md',
    icon: PieChart,
  },
  {
    name: 'sites-building',
    category: 'Specialized',
    description: 'Construct full-stack websites, dashboards, portfolios, trackers, and portals with fast-path and capability execution.',
    location: '/mnt/skills/public/sites/SKILL.md',
    icon: Globe,
  },
  {
    name: 'plugin-creator',
    category: 'Agentic & System',
    description: 'Scaffold and create verified plugins for Codex with plugin.json manifests, marketplace entries, and capability bundles.',
    location: '/mnt/skills/public/plugin-creator/SKILL.md',
    icon: Package,
  },
  {
    name: 'codex-collaboration',
    category: 'Agentic & System',
    description: 'Codex collaborative intelligence, outcome-first technical communication, calibrated explanations, and autonomous goal handling.',
    location: '/mnt/skills/system/codex-collaboration/SKILL.md',
    icon: Bot,
  },
  {
    name: 'morning',
    category: 'Specialized',
    description: 'Renders personalized morning brief executive summary as an interactive styled HTML artifact.',
    location: '/mnt/skills/examples/morning/SKILL.md',
    icon: Sparkles,
  },
];

export function SkillsViewer() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalSkill, setActiveModalSkill] = useState<SkillItem | null>(null);

  const categories = ['all', 'Document & Office', 'Design & Frontend', 'Agentic & System', 'Specialized'];

  const filtered = AVAILABLE_SKILLS.filter((s) => {
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesQuery =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#faf9f6]">
      {/* Header */}
      <div className="border-b border-stone-200 bg-white px-6 py-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-[#cc785c]" />
              <h2 className="font-serif text-lg font-semibold text-stone-900">
                Skills & Agentic Tools Catalog
              </h2>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-mono text-stone-600">
                {AVAILABLE_SKILLS.length} Skills • 48 Tools
              </span>
            </div>
            <p className="mt-0.5 text-xs text-stone-500">
              Autonomous skill capabilities and specialized functions available to yathish.ai under the provided prompt.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 rounded-lg bg-stone-100 p-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {cat === 'all' ? 'All Skills' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Skills */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((skill) => {
            const Icon = skill.icon;
            return (
              <div
                key={skill.name}
                onClick={() => setActiveModalSkill(skill)}
                className="group cursor-pointer rounded-xl border border-stone-200 bg-white p-5 shadow-xs hover:border-[#cc785c]/60 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-[#cc785c] group-hover:bg-[#cc785c]/10 transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded bg-stone-100 px-2 py-0.5 text-[10px] font-mono text-stone-600">
                    {skill.category}
                  </span>
                </div>

                <h3 className="mt-3.5 text-sm font-semibold text-stone-900 group-hover:text-[#cc785c] transition-colors">
                  {skill.name}
                </h3>
                <p className="mt-1.5 text-xs text-stone-600 leading-relaxed min-h-[60px]">
                  {skill.description}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
                  <span className="font-mono text-[10px] text-stone-400 truncate max-w-[180px]">
                    {skill.location}
                  </span>
                  <span className="text-[11px] font-medium text-[#cc785c] flex items-center gap-1 group-hover:underline">
                    View Specs
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal for Skill Detail */}
        {activeModalSkill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-stone-200">
              <div className="flex items-start justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-[#cc785c]">
                    {React.createElement(activeModalSkill.icon, { className: 'h-5 w-5' })}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-stone-900">{activeModalSkill.name}</h3>
                    <p className="font-mono text-xs text-stone-500">{activeModalSkill.location}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModalSkill(null)}
                  className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">Overview</h4>
                  <p className="mt-1 text-sm text-stone-700 leading-relaxed">
                    {activeModalSkill.details?.overview || activeModalSkill.description}
                  </p>
                </div>

                {activeModalSkill.details?.quickFacts && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">Core Specifications & Quick Facts</h4>
                    <ul className="mt-2 space-y-1.5">
                      {activeModalSkill.details.quickFacts.map((fact, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-stone-700">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                          <span>{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeModalSkill.details?.presets && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">9 Marketing Studio Presets</h4>
                    <div className="mt-2 space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {activeModalSkill.details.presets.map((p) => (
                        <div key={p.slug} className="rounded-lg border border-stone-200 bg-stone-50/50 p-2 text-xs">
                          <div className="flex items-center justify-between font-medium text-stone-800">
                            <span>{p.name}</span>
                            <span className="font-mono text-[10px] text-stone-500 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                              slug: {p.slug} {p.picklist ? '• hook/setting' : '• no picklist'}
                            </span>
                          </div>
                          <p className="mt-1 text-stone-600 text-[11px]">{p.notes}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeModalSkill.details?.templates && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">Featured Commercial Templates</h4>
                    <div className="mt-2 space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {activeModalSkill.details.templates.map((tmpl, idx) => (
                        <div key={idx} className="rounded-lg border border-stone-200 bg-stone-50/50 p-2.5 text-xs">
                          <div className="flex items-center justify-between font-medium text-stone-800">
                            <span>{tmpl.title}</span>
                            <span className="font-mono text-[10px] text-stone-500 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                              {tmpl.useCase}
                            </span>
                          </div>
                          <p className="mt-1 text-stone-600 text-[11px] leading-relaxed">{tmpl.subject}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end border-t border-stone-100 pt-4">
                <button
                  onClick={() => setActiveModalSkill(null)}
                  className="rounded-lg bg-stone-900 px-4 py-2 text-xs font-medium text-white hover:bg-stone-800 transition-colors"
                >
                  Close Specification
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Function Calling Reference */}
        <div className="mt-8 rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <h4 className="font-serif text-sm font-semibold text-stone-900">
            Registered Tool Invocations
          </h4>
          <p className="mt-1 text-xs text-stone-500">
            Native interactive cards and system operations defined in the prompt:
          </p>

          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs font-mono">
            {[
              'quiz_display_v0',
              'recipe_display_v0',
              'comparison_card_display_v0',
              'step_card_display_v0',
              'translation_display_v0',
              'visualize:show_widget',
              'chart_display_v0',
              'memory_read',
              'memory_write',
              'memory_str_replace',
              'present_files',
              'create_file',
            ].map((tool) => (
              <div
                key={tool}
                className="rounded-lg border border-stone-100 bg-stone-50/70 px-2.5 py-1.5 text-stone-700"
              >
                {tool}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
