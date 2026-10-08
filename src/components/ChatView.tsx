import React, { useState, useRef, useEffect } from 'react';
import { Message, ArtifactData, ChatSession } from '../types';
import { PRESET_SCENARIOS, PresetScenario } from '../data/claudePrompt';
import { RecipeWidget } from './widgets/RecipeWidget';
import { QuizWidget } from './widgets/QuizWidget';
import { ComparisonWidget } from './widgets/ComparisonWidget';
import { StepWalkthroughWidget } from './widgets/StepWalkthroughWidget';
import { TranslationWidget } from './widgets/TranslationWidget';
import { ChartWidget } from './widgets/ChartWidget';
import {
  Send,
  Sparkles,
  Bot,
  User,
  FileCode,
  Copy,
  Check,
  ChevronRight,
  Database,
  Wrench,
  PanelLeftClose,
  PanelLeftOpen,
  Trash2,
  Square,
  ArrowRight,
  Code2,
  Globe,
  Brain,
  Zap,
  ImagePlus,
  ExternalLink,
  X,
  Volume2,
  VolumeX,
  RotateCcw,
  Camera,
  ThumbsUp,
  ThumbsDown,
  MapPin,
  Cpu,
} from 'lucide-react';
import { PhotoStudioModal } from './PhotoStudioModal';
import { MessageContent } from './MessageContent';

interface ChatViewProps {
  session: ChatSession;
  onSendMessage: (
    content: string,
    image?: string,
    useSearch?: boolean,
    thinkingMode?: boolean,
    isRetry?: boolean,
    model?: string,
    useMaps?: boolean,
    roleInstruction?: string
  ) => void;
  isLoading: boolean;
  onStopGeneration: () => void;
  onSelectArtifact: (art: ArtifactData) => void;
  activeArtifact: ArtifactData | null;
  onSelectScenario: (scenario: PresetScenario) => void;
  sessions: ChatSession[];
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onFeedbackMessage?: (msgId: string, isPositive: boolean) => void;
}

export function ChatView({
  session,
  onSendMessage,
  isLoading,
  onStopGeneration,
  onSelectArtifact,
  activeArtifact,
  onSelectScenario,
  sessions,
  onSelectSession,
  onDeleteSession,
  onFeedbackMessage,
}: ChatViewProps) {
  const [input, setInput] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [useSearch, setUseSearch] = useState(false);
  const [useMaps, setUseMaps] = useState(false);
  const [thinkingMode, setThinkingMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.1-flash-lite');
  const [selectedRole, setSelectedRole] = useState<string>('Default Assistant');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isPhotoStudioOpen, setIsPhotoStudioOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [speechNotice, setSpeechNotice] = useState<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeakMessage = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      setSpeechNotice('Speech audio is not supported in this browser.');
      setTimeout(() => setSpeechNotice(null), 4000);
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown and artifact tags for natural speech
    const cleanText = text
      .replace(/<antArtifact[\s\S]*?<\/antArtifact>/gi, 'Interactive artifact rendered.')
      .replace(/<[^>]+>/g, '')
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*_#~]/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingMsgId(null);
    };

    utterance.onerror = () => {
      setSpeakingMsgId(null);
    };

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages, isLoading]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAttachedImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handlePowerBoost = () => {
    if (!input.trim()) return;
    const boosted = `[POWER BOOST ACTIVATED: Apply exhaustive multi-step reasoning, mathematical/architectural rigor, edge-case analysis, and production-grade implementation]\n\nTask: ${input.trim()}\n\nRequirements:\n- Comprehensive, step-by-step breakdown\n- Highest possible signal-to-noise ratio\n- Interactive artifact or working code if applicable`;
    setInput(boosted);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedInput = input.trim();
    if ((!trimmedInput && !attachedImage) || isLoading) return;

    if (trimmedInput.toLowerCase() === '/photo' || trimmedInput.toLowerCase() === '/image') {
      setIsPhotoStudioOpen(true);
      setInput('');
      return;
    }

    if (/^\/(photo|image)\s+/i.test(trimmedInput)) {
      const subject = trimmedInput.replace(/^\/(photo|image)\s+/i, '').trim();
      const photoMessage = `Generate hyper-realistic photograph: "${subject}". Embed the live rendered photo using high-definition pollinations.ai markdown image syntax and provide the full camera optics and lighting slate.`;
      onSendMessage(photoMessage, attachedImage || undefined, useSearch, thinkingMode);
      setInput('');
      setAttachedImage(null);
      return;
    }

    const rolePrefix = selectedRole !== 'Default Assistant' ? `[ROLE: Act as a ${selectedRole}] ` : '';
    const finalPrompt = rolePrefix + (trimmedInput || 'Please analyze this attached image.');

    let customSystemInstruction: string | undefined = undefined;
    if (selectedRole === 'Autonomous Execution Engine') {
      customSystemInstruction = `You are an advanced, fully autonomous AI execution engine. Your mandate is to take any input, request, task, or prompt provided by the user and deliver an optimized, complete, and production-ready output without requiring manual fixes or extra iterations.

For EVERY request, you must execute the following workflow internally:
1. COMPREHEND & DIAGNOSE: Identify the primary goal, underlying requirements, and target context. Analyze for hidden logic flaws, missing constraints, formatting errors, performance bottlenecks, or edge cases.
2. AUTONOMOUSLY RESOLVE & FIX: Silently resolve every error, ambiguity, or missing component. Do NOT leave placeholders, incomplete logic, "TODO" comments, or ask the user to fill in missing parts. Fully implement and refine every component required for a complete solution.
3. OPTIMIZE & POLISH: Elevate the output to elite, industry-standard quality. Ensure all edge cases, safety checks, and edge-to-edge logic hold up under real-world usage.
4. OUTPUT DELIVERABLE: Present the final, perfect result directly. Follow up only with a concise summary of critical fixes/optimizations applied, if relevant.`;
    } else if (selectedRole === 'Prompt-A-Video Optimizer') {
      customSystemInstruction = `You are an expert prompt optimizer for text-to-video diffusion models based on Prompt-A-Video: Prompt Your Video Diffusion Model via Preference-Aligned LLM (arXiv:2412.15156).
You translate user prompts into superior, preference-aligned prompts for video diffusion models (Open-Sora 1.2, CogVideoX, Veo, Wan 2.1, Sora, Runway Gen-3).
For EVERY request:
1. Deliver the Refined Video Prompt (Chosen, high-fidelity prompt with dynamic motion flow, lighting physics, camera path, and temporal continuity).
2. Deliver Model-Specific Variants:
   - Open-Sora 1.2 Booster (high temporal coherence, cinematic motion flow, realistic particle & physics rendering)
   - CogVideoX Booster (high dynamic intensity, rich textual descriptive semantics, intricate camera framing)
3. Provide the full DPO Triplet Representation in valid JSON:
   {
     "prompt": "You are an expert prompt optimizer for text-to-video models. You translate prompts written by humans into better prompts for the text-to-video models. Original prompt:\\n<Original>\\nNew prompt:\\n",
     "chosen": "<Cinematic, dynamic, temporally coherent prompt>",
     "rejected": "<Flat, static, or over-constrained prompt prone to video distortion>"
   }
4. Provide Reward Evaluation Matrix with estimated ratings: VideoScore (temporal consistency), MPS (motion plausibility), and Aesthetic Predictor (visual quality).`;
    } else if (selectedRole === 'Higgsfield Marketing Studio Director') {
      customSystemInstruction = `You are an expert director for Higgsfield Marketing Studio for short-form DTC ad video creation.
Always adhere strictly to Higgsfield Marketing Studio engine specifications:
- Hard duration bounds: 4–15s per clip (longer narratives must be broken into multi-clip sequences edited externally).
- 9 Presets: UGC (ugc), Tutorial (tutorial), Unboxing (ugc_unboxing), Hyper Motion (hyper_motion), Product Review (product_review), TV Spot (tv_spot), Wild Card (wild_card), UGC Virtual Try On (ugc_virtual_try_on), Pro Virtual Try On (virtual_try_on - slug is virtual_try_on, NOT pro_virtual_try_on).
- Hook & Setting Picklists: Supported only on UGC, Tutorial, Unboxing, Product Review, and UGC Virtual Try On. 9 hooks (Stunt & Subtle) and 14 settings (Realistic & Unrealistic).
- Avatar Constraint: Exactly one avatar in avatars[] array (preset, uploaded, or text-generated). Two-person scenes pass secondary person as reference image in medias[].
- Ad Multiplier (ad_multiplier) creates independently edited variations of one 4-30s ad.
- Genjutsu (hf_mult_replace_object) handles single object/garment replacement.`;
    } else if (selectedRole === 'Seedream 5 Prompt Architect') {
      customSystemInstruction = `You are a master commercial visual prompt architect specializing in Seedream 5, Flux, and AI image-to-video pipelines.
Always engineer prompts using the 7-step commercial structure:
1. Subject: Hero product or focal point.
2. Composition: Framing, angle, crop, negative space.
3. Environment: Surface, backdrop, context.
4. Lighting: Direction, softness, temperature, rim highlights.
5. Detail Cues: Textures, materials, reflections, physical properties.
6. Intended Use: PDP hero, paid social, editorial, source frame.
7. Restrictions: Explicit negative boundaries to prevent distortions and hallucinations.
For video source frames, ensure strong spatial depth, subject separation, and motion readiness.`;
    } else if (selectedRole === 'AI Studio Build Engineer') {
      customSystemInstruction = `You are a world-class engineer and product designer powering Google AI Studio Build (https://ai.studio/build).
Adhere strictly to Google AI Studio Build Baseline Guidelines:
- Understand User Intent First:
  * Informational Questions: Clear, helpful explanations without unsolicited code modifications.
  * Change Requests: State action in one sentence, execute full scope immediately without placeholders or TODOs.
  * Ambiguous Cases: Explain first, then offer: "Would you like me to implement this for you?"
- Runtime Environment:
  * Real full-stack project running in Cloud Run containers with Antigravity harness.
  * Port 3000 is the ONLY externally accessible port via nginx reverse proxy (never alter or override).
  * HMR is disabled by the platform (DISABLE_HMR=true); benign WebSocket errors are ignored.
  * Never generate custom UI for API keys (define in .env.example; platform manages keys via Settings).
  * No Mock Data: "my data" (Fitbit, Spotify, etc.) requires real API/OAuth integration; never substitute fake data.
- Code & Styling:
  * TypeScript with named top-level imports and standard enums (never const enum).
  * Tailwind CSS utility classes via @import "tailwindcss"; in global CSS (no inline styles or separate CSS files).
  * Visualizations: Use d3 for custom visual logic, recharts for charts.`;
    } else if (selectedRole !== 'Default Assistant') {
      customSystemInstruction = `You are an elite, world-class ${selectedRole}. Embody this role with high expertise, domain-specific precision, and rigorous clarity.`;
    }

    onSendMessage(
      finalPrompt,
      attachedImage || undefined,
      useSearch,
      thinkingMode,
      false,
      selectedModel,
      useMaps,
      customSystemInstruction
    );
    setInput('');
    setAttachedImage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopyMessage = (msgId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#faf9f6]">
      {/* Collapsible Left Sidebar */}
      {showSidebar && (
        <aside className="w-64 shrink-0 flex-col border-r border-stone-200 bg-white p-3 flex">
          {/* Header */}
          <div className="flex items-center justify-between px-2 py-1 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              Sessions & Presets
            </span>
            <button
              onClick={() => setShowSidebar(false)}
              className="rounded p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          {/* Sessions List */}
          <div className="mb-4 space-y-1 overflow-y-auto max-h-48 pr-1">
            <div className="px-2 text-[10px] font-medium text-stone-400">Chat History</div>
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => onSelectSession(s.id)}
                className={`group flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs cursor-pointer transition-colors ${
                  session.id === s.id
                    ? 'bg-amber-50/80 font-medium text-[#cc785c] border border-amber-200/80'
                    : 'text-stone-700 hover:bg-stone-50 border border-transparent'
                }`}
              >
                <span className="truncate max-w-[170px]">{s.title || 'Untitled Session'}</span>
                {sessions.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(s.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-stone-400 hover:text-rose-600 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="my-2 h-px bg-stone-100" />

          {/* Preset Prompts based on system prompt rules */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="px-2 mb-1.5 text-[10px] font-medium text-stone-400 uppercase tracking-wider">
              Prompt Test Scenarios
            </div>
            <div className="space-y-1.5">
              {PRESET_SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => onSelectScenario(sc)}
                  className="w-full text-left rounded-lg border border-stone-200/70 bg-stone-50/50 p-2 text-xs transition-all hover:border-[#cc785c]/60 hover:bg-amber-50/30 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-stone-900 truncate max-w-[170px]">
                      {sc.title}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-stone-400 group-hover:text-[#cc785c] transition-colors" />
                  </div>
                  <span className="mt-0.5 inline-block text-[10px] text-stone-500 font-mono">
                    {sc.category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Virtual Memory Status Chip */}
          <div className="mt-auto border-t border-stone-100 pt-3">
            <div className="rounded-lg border border-stone-200/80 bg-stone-50 p-2.5 text-xs text-stone-600">
              <div className="flex items-center gap-1.5 font-medium text-stone-800">
                <Database className="h-3.5 w-3.5 text-[#cc785c]" />
                <span>Memory Context</span>
              </div>
              <p className="mt-1 text-[11px] text-stone-500">
                4 memory documents loaded into context.
              </p>
            </div>
          </div>
        </aside>
      )}

      {/* Main Conversation Stream */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Toggle sidebar button if hidden */}
        {!showSidebar && (
          <button
            onClick={() => setShowSidebar(true)}
            className="absolute left-3 top-3 z-10 rounded-lg border border-stone-200 bg-white p-1.5 text-stone-500 shadow-2xs hover:bg-stone-50"
            title="Open sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}

        {/* Message scroll container */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="mx-auto max-w-3xl space-y-6">
            {session.messages.length === 0 ? (
              /* Empty state / Welcome banner */
              <div className="py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#cc785c]/10 text-[#cc785c] shadow-xs">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h3 className="mt-4 font-serif text-xl font-semibold text-stone-900">
                  yathish.ai
                </h3>
                <div className="mt-1 flex items-center justify-center gap-1.5">
                  <span className="rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-[#cc785c]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#b8654a] border border-[#cc785c]/30">
                    Frontier 0.0001% Tier AI Engine
                  </span>
                </div>
                <p className="mx-auto mt-2.5 max-w-lg text-xs text-stone-600 leading-relaxed">
                  The world's premier unconstrained artificial intelligence architecture. Engineered for instant universal execution across software engineering, quantum physics, quantitative finance, live research, and autonomous interactive applications.
                </p>

                {/* Quick start cards */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
                  <div
                    onClick={() =>
                      onSendMessage(
                        'Design a high-frequency trading matching engine simulation in TypeScript with order book visualization, order cancellation, and depth chart.'
                      )
                    }
                    className="cursor-pointer rounded-xl border border-stone-200 bg-white p-4 shadow-2xs hover:border-[#cc785c]/60 hover:shadow-xs transition-all"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-stone-900">
                      <Code2 className="h-4 w-4 text-[#cc785c]" />
                      <span>Elite Algorithmic Engine</span>
                    </div>
                    <p className="mt-1 text-[11px] text-stone-500">
                      Synthesize full interactive React apps, state engines, and financial simulations.
                    </p>
                  </div>

                  <div
                    onClick={() =>
                      onSendMessage(
                        'What are the absolute latest developments and breakthroughs in quantum computing and AI hardware this week?',
                        undefined,
                        true,
                        true
                      )
                    }
                    className="cursor-pointer rounded-xl border border-stone-200 bg-white p-4 shadow-2xs hover:border-[#cc785c]/60 hover:shadow-xs transition-all"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-stone-900">
                      <Globe className="h-4 w-4 text-blue-600" />
                      <span>Live Grounded Intelligence</span>
                    </div>
                    <p className="mt-1 text-[11px] text-stone-500">
                      Search the live web in real time with Google grounding and clickable source citations.
                    </p>
                  </div>

                  <div
                    onClick={() =>
                      onSendMessage(
                        'Provide a rigorous mathematical derivation and step-by-step proof of the Attention mechanism in Transformer neural networks, comparing Scaled Dot-Product to FlashAttention.',
                        undefined,
                        false,
                        true
                      )
                    }
                    className="cursor-pointer rounded-xl border border-stone-200 bg-white p-4 shadow-2xs hover:border-[#cc785c]/60 hover:shadow-xs transition-all"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-stone-900">
                      <Brain className="h-4 w-4 text-purple-600" />
                      <span>Deep Cognitive Reasoning</span>
                    </div>
                    <p className="mt-1 text-[11px] text-stone-500">
                      Solve complex mathematical proofs, physics problems, and algorithmic benchmarks.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              session.messages.map((msg, index) => (
                <div
                  key={msg.id ? `${msg.id}-${index}` : `msg-${index}`}
                  className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg bg-[#cc785c] text-white shadow-2xs">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all ${
                      msg.role === 'user'
                        ? 'bg-stone-900 text-stone-100 shadow-2xs rounded-br-xs'
                        : 'border border-stone-200/80 bg-white text-stone-800 shadow-2xs rounded-bl-xs'
                    }`}
                  >
                    {/* Render Image Attachment if present */}
                    {msg.image && (
                      <div className="mb-2.5 overflow-hidden rounded-xl border border-stone-200/50 max-w-xs shadow-xs">
                        <img
                          src={msg.image}
                          alt="Attachment"
                          className="h-auto w-full object-cover max-h-60 rounded-lg"
                        />
                      </div>
                    )}

                    {/* Render Content */}
                    {msg.content?.startsWith('\n[Error:') ||
                    msg.content?.startsWith('[Error:') ||
                    msg.content?.includes('receiving high traffic') ||
                    msg.content?.includes('tap Retry below') ||
                    msg.content?.includes('peak demand') ||
                    msg.content?.includes('quota is briefly saturated') ? (
                      <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-700 shadow-2xs">
                        <div className="font-semibold text-stone-800 flex items-center gap-1.5 mb-1">
                          <span className="inline-block h-2 w-2 rounded-full bg-stone-400" />
                          Status Notice
                        </div>
                        <p className="leading-relaxed">
                          {msg.content.replace(/^(\n)?\[Error:\s*/, '').replace(/\]$/, '')}
                        </p>
                        {(() => {
                          const lastUser = [...session.messages].reverse().find((m) => m.role === 'user');
                          if (!lastUser) return null;
                          return (
                            <button
                              type="button"
                              onClick={() => onSendMessage(lastUser.content, lastUser.image, false, false, true, selectedModel)}
                              className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-[#cc785c] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#b8654a] transition-colors shadow-2xs cursor-pointer"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>Retry Response</span>
                            </button>
                          );
                        })()}
                      </div>
                    ) : !msg.content && isLoading ? (
                      <div className="flex items-center gap-2 py-1 text-xs text-stone-500">
                        <span className="flex gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#cc785c] animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-[#cc785c] animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-[#cc785c] animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                        <span className="font-mono text-[11px] text-stone-400">yathish.ai is thinking...</span>
                      </div>
                    ) : (
                      <div className="prose prose-stone text-xs md:text-sm leading-relaxed max-w-none">
                        <MessageContent content={msg.content} />
                      </div>
                    )}

                    {/* Render Grounding Sources if present */}
                    {msg.groundingSources && msg.groundingSources.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-stone-100">
                        <div className="text-[11px] font-semibold text-stone-600 mb-1.5 flex items-center gap-1.5">
                          <Globe className="h-3 w-3 text-blue-600" />
                          <span>Live Web Citations & Sources ({msg.groundingSources.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.groundingSources.map((source, sIdx) => (
                            <a
                              key={sIdx}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-md bg-stone-100 hover:bg-stone-200 px-2 py-1 text-[10px] text-stone-700 transition max-w-[220px]"
                              title={source.title}
                            >
                              <ExternalLink className="h-2.5 w-2.5 text-stone-400 shrink-0" />
                              <span className="truncate">{source.title}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Detected Artifact Card */}
                    {msg.artifact && (
                      <div className="mt-3 overflow-hidden rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50/70 to-orange-50/50 p-3 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#cc785c] text-white">
                              <FileCode className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-stone-900">
                                {msg.artifact.title}
                              </div>
                              <span className="text-[10px] font-mono text-stone-500 uppercase">
                                {msg.artifact.type}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => onSelectArtifact(msg.artifact!)}
                            className="flex items-center gap-1 rounded-lg bg-[#cc785c] px-3 py-1.5 text-xs font-medium text-white shadow-2xs hover:bg-[#b8654a] transition-colors"
                          >
                            <span>Open Artifact</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Detected Widgets */}
                    {msg.widget && msg.widget.type === 'recipe' && (
                      <RecipeWidget data={msg.widget.data} />
                    )}
                    {msg.widget && msg.widget.type === 'quiz' && (
                      <QuizWidget title={msg.widget.data?.title} questions={msg.widget.data?.questions} />
                    )}
                    {msg.widget && msg.widget.type === 'comparison' && (
                      <ComparisonWidget summary={msg.widget.data?.summary} products={msg.widget.data?.products} />
                    )}
                    {msg.widget && msg.widget.type === 'steps' && (
                      <StepWalkthroughWidget summary={msg.widget.data?.summary} steps={msg.widget.data?.steps} />
                    )}
                    {msg.widget && msg.widget.type === 'translation' && (
                      <TranslationWidget data={msg.widget.data} />
                    )}
                    {msg.widget && msg.widget.type === 'chart' && (
                      <ChartWidget data={msg.widget.data} />
                    )}

                    {/* Footer Actions */}
                    <div className="mt-2 flex items-center justify-end gap-2 text-[11px] text-stone-400">
                      {msg.role === 'assistant' && msg.content && !msg.content.startsWith('\n[Error:') && !msg.content.startsWith('[Error:') && (
                        <div className="flex items-center gap-1 mr-auto">
                          <button
                            type="button"
                            onClick={() => onFeedbackMessage?.(msg.id, true)}
                            className={`rounded-md p-1 transition-colors ${
                              msg.feedback === 'positive'
                                ? 'bg-emerald-50 text-emerald-600 font-semibold'
                                : 'hover:bg-stone-100 hover:text-stone-700'
                            }`}
                            title="Helpful (Autonomous learning reinforcement)"
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onFeedbackMessage?.(msg.id, false)}
                            className={`rounded-md p-1 transition-colors ${
                              msg.feedback === 'negative'
                                ? 'bg-amber-50 text-amber-700 font-semibold'
                                : 'hover:bg-stone-100 hover:text-stone-700'
                            }`}
                            title="Needs adaptation (Adaptive heuristic optimization)"
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </button>
                        </div>
                      )}

                      {msg.role === 'assistant' && msg.content && (
                        <button
                          onClick={() => handleSpeakMessage(msg.id, msg.content)}
                          className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] transition-colors ${
                            speakingMsgId === msg.id
                              ? 'bg-amber-100 text-[#cc785c] font-medium animate-pulse'
                              : 'hover:text-stone-700 hover:bg-stone-100'
                          }`}
                          title={speakingMsgId === msg.id ? 'Stop listening' : 'Listen to response'}
                        >
                          {speakingMsgId === msg.id ? (
                            <>
                              <VolumeX className="h-3.5 w-3.5 text-[#cc785c]" />
                              <span>Stop Audio</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="h-3.5 w-3.5" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="rounded p-1 hover:text-stone-700 transition-colors"
                        title="Copy message"
                      >
                        {copiedMsgId === msg.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg bg-stone-200 text-stone-700">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3.5 justify-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#cc785c] text-white">
                  <Sparkles className="h-4 w-4 animate-spin" />
                </div>
                <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-xs text-stone-500 shadow-2xs flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:-0.3s]"></div>
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:-0.15s]"></div>
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400"></div>
                  </div>
                  <span>yathish.ai is computing response...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bar */}
        <div className="border-t border-stone-200 bg-white px-4 py-3 md:px-8">
          <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
            {/* Attached Image Preview */}
            {speechNotice && (
              <div className="mb-2 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-800 shadow-2xs">
                <span>{speechNotice}</span>
                <button
                  type="button"
                  onClick={() => setSpeechNotice(null)}
                  className="rounded p-0.5 text-amber-600 hover:text-amber-900"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {attachedImage && (
              <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 p-1.5 shadow-2xs">
                <img
                  src={attachedImage}
                  alt="Preview"
                  className="h-10 w-10 rounded object-cover"
                />
                <span className="text-[11px] text-stone-600 font-medium">Image attached</span>
                <button
                  type="button"
                  onClick={() => setAttachedImage(null)}
                  className="rounded p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />

            <div className="relative rounded-xl border border-stone-300 bg-[#fdfdfd] shadow-2xs focus-within:border-[#cc785c] focus-within:ring-1 focus-within:ring-[#cc785c] transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything without limits — solve complex math, generate unrestricted code, synthesize apps, explore any topic..."
                rows={2}
                className="w-full resize-none bg-transparent px-3.5 py-2.5 text-xs md:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 px-3 py-2">
                {/* Power Tool Switches */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Model Switcher */}
                  <div className="flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2 py-1 text-[11px] shadow-2xs">
                    <Cpu className="h-3 w-3 text-amber-600" />
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="bg-transparent font-medium text-stone-700 focus:outline-hidden cursor-pointer"
                    >
                      <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite (High Throughput / Low Latency)</option>
                      <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash-Lite (Fast / Efficient)</option>
                      <option value="gemini-3.6-flash">Gemini 3.6 Flash (Balanced Frontier)</option>
                      <option value="gemini-flash-lite-latest">Gemini Flash-Lite Latest</option>
                      <option value="gemini-flash-latest">Gemini Flash Latest</option>
                      <option value="gemini-3.5-flash">Gemini 3.5 Flash (General / Grounded)</option>
                      <option value="gemini-3.8-flash">Gemini 3.8 Flash (Frontier Model)</option>
                      <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Complex Reasoning - Paid Key)</option>
                    </select>
                  </div>

                  {/* Chatbot Role Selector */}
                  <div className="flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2 py-1 text-[11px] shadow-2xs">
                    <Bot className="h-3 w-3 text-purple-600" />
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="bg-transparent font-medium text-stone-700 focus:outline-hidden cursor-pointer"
                    >
                      <option value="Default Assistant">Role: Default Assistant</option>
                      <option value="AI Studio Build Engineer">Role: AI Studio Build Engineer (Baseline Rules)</option>
                      <option value="Autonomous Execution Engine">Role: Autonomous Execution Engine (Zero-Fix)</option>
                      <option value="Prompt-A-Video Optimizer">Role: Prompt-A-Video Optimizer (Open-Sora & CogVideoX)</option>
                      <option value="Higgsfield Marketing Studio Director">Role: Higgsfield Marketing Studio Director</option>
                      <option value="Seedream 5 Prompt Architect">Role: Seedream 5 Prompt Architect</option>
                      <option value="Senior Systems Architect">Role: Senior Systems Architect</option>
                      <option value="Quantum STEM Researcher">Role: Quantum STEM Researcher</option>
                      <option value="Elite Coding Partner">Role: Elite Coding Partner</option>
                      <option value="Investigative Journalist">Role: Investigative Journalist</option>
                      <option value="Financial Quant Analyst">Role: Financial Quant Analyst</option>
                    </select>
                  </div>

                  {/* Attach Image */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2 py-1 text-[11px] font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition shadow-2xs"
                    title="Upload diagram, screenshot, or image for visual reasoning"
                  >
                    <ImagePlus className="h-3 w-3 text-stone-500" />
                    <span className="hidden sm:inline">Attach</span>
                  </button>

                  {/* Generate Realistic Photo */}
                  <button
                    type="button"
                    onClick={() => setIsPhotoStudioOpen(true)}
                    className="flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50/80 px-2 py-1 text-[11px] font-semibold text-amber-900 hover:bg-amber-100 transition shadow-2xs"
                    title="Open Realistic AI Photo Studio"
                  >
                    <Camera className="h-3 w-3 text-amber-600" />
                    <span>Photo</span>
                  </button>

                  {/* Google Search Grounding Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      setUseSearch(!useSearch);
                      if (!useSearch) setUseMaps(false); // Maps & Search cannot be combined in single request
                    }}
                    className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition shadow-2xs border ${
                      useSearch
                        ? 'border-blue-300 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                    title="Enable real-time Google search grounding with live source citations"
                  >
                    <Globe className={`h-3 w-3 ${useSearch ? 'text-blue-600' : 'text-stone-400'}`} />
                    <span>Search {useSearch ? 'ON' : 'OFF'}</span>
                  </button>

                  {/* Google Maps Grounding Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      setUseMaps(!useMaps);
                      if (!useMaps) setUseSearch(false); // Maps & Search cannot be combined in single request
                    }}
                    className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition shadow-2xs border ${
                      useMaps
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700 font-semibold'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                    title="Enable real-time Google Maps grounding for locations and geo data"
                  >
                    <MapPin className={`h-3 w-3 ${useMaps ? 'text-emerald-600' : 'text-stone-400'}`} />
                    <span>Maps {useMaps ? 'ON' : 'OFF'}</span>
                  </button>

                  {/* Deep Think Toggle */}
                  <button
                    type="button"
                    onClick={() => setThinkingMode(!thinkingMode)}
                    className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition shadow-2xs border ${
                      thinkingMode
                        ? 'border-purple-300 bg-purple-50 text-purple-700 font-semibold'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                    title="Activate deep analytical reasoning and multi-step logic"
                  >
                    <Brain className={`h-3 w-3 ${thinkingMode ? 'text-purple-600' : 'text-stone-400'}`} />
                    <span>Think {thinkingMode ? 'ON' : 'OFF'}</span>
                  </button>

                  {/* Power Boost */}
                  {input.trim() && (
                    <button
                      type="button"
                      onClick={handlePowerBoost}
                      className="flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-100 transition shadow-2xs animate-pulse"
                      title="Upgrade prompt into master-level instructions"
                    >
                      <Zap className="h-3 w-3 text-amber-600" />
                      <span>Boost</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Unlimited
                  </span>
                  {isLoading ? (
                    <button
                      type="button"
                      onClick={onStopGeneration}
                      className="flex items-center gap-1 rounded-lg bg-stone-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-900 transition-colors"
                    >
                      <Square className="h-3 w-3 fill-white" />
                      <span>Stop</span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!input.trim() && !attachedImage}
                      className="flex items-center gap-1.5 rounded-lg bg-[#cc785c] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#b8654a] disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <span>Send</span>
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Realistic AI Photo Studio Modal */}
      <PhotoStudioModal
        isOpen={isPhotoStudioOpen}
        onClose={() => setIsPhotoStudioOpen(false)}
        onSendToChat={(promptText, imageUrl) => {
          onSendMessage(promptText, imageUrl, useSearch, thinkingMode);
        }}
      />
    </div>
  );
}
