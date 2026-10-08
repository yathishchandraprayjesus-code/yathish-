export const HIGGSFIELD_MARKETING_STUDIO_SKILL = {
  name: "higgsfield-marketing-studio",
  title: "Higgsfield Marketing Studio",
  version: "1.1.0",
  category: "Specialized" as const,
  location: "/mnt/skills/public/higgsfield-marketing-studio/SKILL.md",
  description: "Short-form DTC ad-video generation engine across 9 presets (UGC, Tutorial, Unboxing, Hyper Motion, Product Review, TV Spot, Wild Card, UGC Virtual Try On, Pro Virtual Try On), hook & setting picklists, Ad Multiplier, and Genjutsu object replacement.",
  tags: ["higgsfield", "marketing-studio", "dtc-ads", "marketing", "ugc", "ad", "video", "preset", "hook", "setting", "avatar", "cross-surface", "ad-multiplier", "genjutsu"],
  quickFacts: [
    "Hard duration cap: 4–15s per clip; out-of-range values get clamped; longer narrative = multi-clip sequence edited externally",
    "9 presets: UGC, Tutorial, Unboxing (ugc_unboxing), Hyper Motion, Product Review, TV Spot, Wild Card, UGC Virtual Try On, Pro Virtual Try On",
    "Pro Virtual Try On slug is virtual_try_on, NOT pro_virtual_try_on",
    "Preset routing happens via show_marketing_studio.mode — generate_video has NO mode parameter at all",
    "Hook + setting picklists on FIVE presets only: UGC, Tutorial, Unboxing, Product Review, UGC Virtual Try On (NOT Pro Virtual Try On)",
    "9 hooks (4 stunt / 5 subtle) as of 2026-05-18 — picklists drift; enumerate live for current UUIDs",
    "14 settings (8 realistic / 6 unrealistic) as of 2026-05-18, passed by UUID as setting_id",
    "avatars array MUST contain exactly one entry; empty avatars: [] substitutes a random face per render — always pass one",
    "Two-person scenes: primary in avatars, secondary as a reference image in medias",
    "avatars and medias are top-level siblings of params — NOT nested under params; wrong nesting rejects",
    "prompt is optional; aspect_ratio enum: auto/21:9/16:9/4:3/1:1/3:4/9:16; resolution: 480p/720p/1080p (default 720p)",
    "Ad Multiplier (ad_multiplier, powered by Seedance 2.5): many independently edited versions of ONE supplied 4–30s ad",
    "One object swapped in one clip is Genjutsu (hf_mult_replace_object), not Ad Multiplier",
    "Three avatar types: preset (~40 in library), uploaded, text-generated",
    "TV Spot has a default packshot beat — negate explicitly ('ABSOLUTELY NO PACKSHOT') when unwanted"
  ],
  presets: [
    { name: "UGC", slug: "ugc", picklist: true, notes: "Realistic single-take social videos with a person + product. Phone-native selfie framing, handheld, eye-level." },
    { name: "Tutorial", slug: "tutorial", picklist: true, notes: "Step-by-step how-to / recipe. Stable camera, cuts allowed between steps, imperative-voice dialogue." },
    { name: "Unboxing", slug: "ugc_unboxing", picklist: true, notes: "High-quality unboxing reveal from packaging. Top-down or 3/4 angle, hands in frame, tactile close-ups." },
    { name: "Hyper Motion", slug: "hyper_motion", picklist: false, notes: "Kinetic product hero shots (splash, pour, spin, drop). Auto pack-shot at end. Works without an avatar." },
    { name: "Product Review", slug: "product_review", picklist: true, notes: "Authentic talking-head review with product in hand. Medium shot of presenter + B-roll inserts." },
    { name: "TV Spot", slug: "tv_spot", picklist: false, notes: "Cinematic commercial spots. Dolly/crane framing. Has default packshot beat that must be negated if unwanted." },
    { name: "Wild Card", slug: "wild_card", picklist: false, notes: "Surreal one-shot creative concepts breaking conventional ad grammar; impossible geometry, unexpected scale." },
    { name: "UGC Virtual Try On", slug: "ugc_virtual_try_on", picklist: true, notes: "Try-before-buy, casual register. Selfie/mirror framing, casual environment, natural movement." },
    { name: "Pro Virtual Try On", slug: "virtual_try_on", picklist: false, notes: "Editorial / lookbook-style virtual try-on. Clean backdrop (cyc wall, studio seamless), controlled lighting." }
  ]
};

export const AUTONOMOUS_EXECUTION_ENGINE_PROMPT = `
# autonomous_execution_engine

You are an advanced, fully autonomous AI execution engine. Your mandate is to take any input, request, task, or prompt provided by the user and deliver an optimized, complete, and production-ready output without requiring manual fixes or extra iterations.

For EVERY request, you must execute the following workflow internally:

1. COMPREHEND & DIAGNOSE:
   - Identify the primary goal, underlying requirements, and target audience/context.
   - Analyze the prompt or provided material for hidden logic flaws, missing constraints, formatting errors, performance bottlenecks, or edge cases.

2. AUTONOMOUSLY RESOLVE & FIX:
   - Silently resolve every error, ambiguity, or missing component you find.
   - Do NOT leave placeholders, incomplete logic, "TODO" comments, or ask the user to fill in missing parts.
   - Fully implement and refine every component required for a complete solution.

3. OPTIMIZE & POLISH:
   - Elevate the output to elite, industry-standard quality (clean code, clear structure, persuasive prose, or rigorous analysis depending on the task type).
   - Ensure all edge cases, safety checks, and edge-to-edge logic hold up under real-world usage.

4. OUTPUT DELIVERABLE:
   - Present the final, perfect result directly.
   - Follow up only with a concise summary of critical fixes/optimizations applied, if relevant.
`;
