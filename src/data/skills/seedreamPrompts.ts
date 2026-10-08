export const SEEDREAM_5_PROMPTS_SKILL = {
  name: "seedream-5-prompts",
  title: "Seedream 5 Prompts & Commercial Image Workflows",
  version: "1.0.0",
  category: "Design & Frontend" as const,
  location: "/mnt/skills/public/seedream-5-prompts/SKILL.md",
  description: "Comprehensive prompt engineering formula, commercial image templates, editing formulas, and source-frame guidelines for Seedream 5, Flux, Imagen, and image-to-video workflows.",
  tags: ["seedream", "seedream-5", "ai-image-generator", "product-photography", "ad-creative", "poster-design", "prompt-engineering", "image-to-video"],
  formula: `intent -> subject -> composition -> environment -> lighting -> detail -> restrictions -> QA -> variants -> final polish`,
  commercialStructure: [
    "1. Subject: What is the hero product or entity?",
    "2. Composition: Framing, crop, camera angle, negative space",
    "3. Environment: Setting, studio backdrop, or surface texture",
    "4. Lighting: Direction, source, softness, reflections, rim accents",
    "5. Detail Cues: Textures, materials, color focus, realism indicators",
    "6. Intended Use: E-commerce PDP, paid social ad, hero banner, source frame",
    "7. Restrictions: Negative constraints to prevent common AI failure modes"
  ],
  quickFacts: [
    "Core formula: Create a [style/medium] image of [subject]. Composition: [...]. Environment: [...]. Lighting: [...]. Details: [...]. Purpose: [...]. Mood: [...]. Restrictions: [...]",
    "Editing formula: Edit the image to [change]. Preserve [must stay]. Improve [better]. Style: [...]. Restrictions: [...]",
    "Source-frame discipline: Clear focal point, visible depth, stable perspective, room for motion, zero tiny-text dependency",
    "Quality Assurance checklist: Subject clarity, crop safety, label integrity, hand/face realism, lighting consistency, aspect ratio check",
    "16 Production-ready prompt categories: Smartwatch, Skincare serum, Lifestyle desk, Food marketing, Real estate, YouTube thumbnail, SaaS feature illustration, etc."
  ],
  templates: [
    { title: "Premium Product Hero", subject: "Matte black smartwatch on dark reflective surface with directional edge lighting", useCase: "PDP Hero & Ad Creative" },
    { title: "Beauty Editorial", subject: "Translucent skincare serum bottle with silver dropper on light stone with soft daylight", useCase: "Landing Page & Social" },
    { title: "Lifestyle Desk Setup", subject: "Wireless earbuds on oak wooden desk beside ceramic mug with morning window light", useCase: "Approachable Social Media" },
    { title: "SaaS Workflow Illustration", subject: "Three floating interface cards with glowing motion paths on soft gradient background", useCase: "Web Feature Section" },
    { title: "Video Source Frame", subject: "Artisan coffee cup on wood table by sunlit window with visible steam and background depth", useCase: "Image-to-Video Animation" }
  ]
};
