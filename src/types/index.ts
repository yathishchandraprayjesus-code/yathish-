export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  image?: string;
  artifact?: ArtifactData;
  widget?: WidgetData;
  groundingSources?: { title: string; url: string }[];
  searchQueries?: string[];
  feedback?: 'positive' | 'negative';
  latencyMs?: number;
}

export interface ArtifactData {
  id: string;
  title: string;
  type: 'react' | 'html' | 'svg' | 'markdown' | 'code';
  language?: string;
  content: string;
}

export type WidgetType = 'recipe' | 'quiz' | 'comparison' | 'steps' | 'translation' | 'chart';

export interface WidgetData {
  type: WidgetType;
  data: any;
}

export interface ChartDataset {
  name: string;
  data: number[];
  color?: string;
}

export interface ChartData {
  title: string;
  chartType: 'line' | 'bar' | 'area' | 'pie' | 'depth';
  labels: string[];
  datasets: ChartDataset[];
  unit?: string;
  summaryMetrics?: Record<string, string | number>;
  description?: string;
}

export interface LearnedHeuristic {
  id: string;
  domain: string;
  heuristic: string;
  confidence: number;
  occurrences: number;
  lastUpdated: number;
  source: 'feedback' | 'error_recovery' | 'pattern_mining' | 'user_correction';
}

export interface SelfEvolutionMetrics {
  generation: number;
  totalInteractions: number;
  autonomousOptimizations: number;
  runtimeQualityScore: number;
  positiveFeedbackCount: number;
  negativeFeedbackCount: number;
  learnedHeuristics: LearnedHeuristic[];
  latencyHistory: { timestamp: number; latencyMs: number }[];
  qualityProgression: { generation: number; score: number; timestamp: number }[];
}

export interface MemoryFile {
  path: string;
  name: string;
  description: string;
  sources: string[];
  aliases?: string[];
  content: string[];
  version: string;
  updatedAt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  systemPromptOverride?: string;
}
