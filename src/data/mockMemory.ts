import { MemoryFile } from '../types';

export const INITIAL_MEMORY_FILES: MemoryFile[] = [
  {
    path: '/profile.md',
    name: 'profile',
    description: 'User identity, role, location, and core background',
    sources: ['chat'],
    version: 'v89a1b2c3d4e',
    updatedAt: '2026-09-28',
    content: [
      '---',
      'name: profile',
      'description: User identity, role, location, and core background',
      'sources: [chat]',
      '---',
      '',
      '- [stated] Name: Yathish (Creator & Lead Developer of yathish.ai)',
      '- [stated] Works primarily with TypeScript, React, Go, and distributed AI architectures',
      '- [stated] Leads yathish.ai platform infrastructure and product development'
    ]
  },
  {
    path: '/preferences.md',
    name: 'preferences',
    description: 'Communication guidelines, output formatting, and response conciseness',
    sources: ['chat'],
    version: 'vf7e6d5c4b3a',
    updatedAt: '2026-09-27',
    content: [
      '---',
      'name: preferences',
      'description: Communication guidelines, output formatting, and response conciseness',
      'sources: [chat]',
      '---',
      '',
      '- [stated] Prefers direct, focused answers without unnecessary fluff or sycophancy',
      '- [stated] Appreciates standalone artifacts (React components, SVG diagrams) for non-trivial deliverables',
      '- [stated] Avoids clichés like "genuinely", "honestly", and filler preambles',
      '- [stated] Values Codex-style collaborative thought partnership: lead with outcome, calibrated plain language, minimal formatting'
    ]
  },
  {
    path: '/topics/tech_stack.md',
    name: 'tech_stack',
    description: 'Favorite programming languages, libraries, and frameworks',
    sources: ['chat'],
    aliases: ['stack', 'tools', 'languages'],
    version: 'va1b2c3d4e5f',
    updatedAt: '2026-09-26',
    content: [
      '---',
      'name: tech_stack',
      'description: Favorite programming languages, libraries, and frameworks',
      'sources: [chat]',
      'aliases: [stack, tools, languages]',
      '---',
      '',
      '- [stated] Core languages: TypeScript (strict mode), Go 1.24+, Rust for systems',
      '- [stated] Frontend: React 19, Tailwind CSS, Vite',
      '- [stated] Data stores: PostgreSQL, Redis, ClickHouse'
    ]
  },
  {
    path: '/areas/platform_redesign.md',
    name: 'platform_redesign',
    description: 'Active project migrating monolithic services to event-driven architecture',
    sources: ['chat'],
    aliases: ['event_bus', 'kafka_migration'],
    version: 'v4c5d6e7f8a9',
    updatedAt: '2026-09-25',
    content: [
      '---',
      'name: platform_redesign',
      'description: Active project migrating monolithic services to event-driven architecture',
      'sources: [chat]',
      'aliases: [event_bus, kafka_migration]',
      '---',
      '',
      '- [stated] Target Q4 milestone: decouple user notification pipeline via Kafka',
      '- [stated] Constraint: zero downtime migration with dual-write phase'
    ]
  },
  {
    path: '/topics/prompt_a_video.md',
    name: 'prompt_a_video',
    description: 'Prompt-A-Video preference-aligned LLM booster for video diffusion models (Open-Sora 1.2 & CogVideoX)',
    sources: ['paper', 'arxiv:2412.15156'],
    aliases: ['video_prompts', 'open_sora', 'cogvideox', 'dpo_video'],
    version: 'vp1a2v3d4e5f',
    updatedAt: '2026-10-07',
    content: [
      '---',
      'name: prompt_a_video',
      'description: Prompt-A-Video preference-aligned LLM booster for video diffusion models (Open-Sora 1.2 & CogVideoX)',
      'sources: [paper, arxiv:2412.15156]',
      'aliases: [video_prompts, open_sora, cogvideox, dpo_video]',
      '---',
      '',
      '- [architecture] Model: LLaMA-3-Instruct fine-tuned with LoRA on video prompt pairs, preference-aligned via DPO',
      '- [supported_models] Open-Sora 1.2 (OS_prompt_pairs_gpt4o_webvid) & CogVideoX (CV_prompt_pairs_glm_webvid)',
      '- [reward_pipeline] Three-part reward scoring: VideoScore (temporal consistency), MPS (motion plausibility), Aesthetic Predictor (visual quality)',
      '- [dpo_triplet] Generates { prompt, chosen, rejected } triplets to continually improve video prompt fidelity and suppress motion artifacts'
    ]
  }
];
