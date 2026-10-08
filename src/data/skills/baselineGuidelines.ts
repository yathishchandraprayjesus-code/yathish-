export const BASELINE_GUIDELINES_SKILL = {
  name: "baseline-guidelines",
  title: "Google AI Studio Build: Baseline Guidelines",
  version: "1.0.0",
  category: "Agentic & System" as const,
  location: "/mnt/skills/system/baseline-guidelines/SKILL.md",
  description: "World-class engineering and product design constitution for Google AI Studio Build: runtime environment, TypeScript standards, port 3000 constraints, zero mock data policy, and user intent classification.",
  tags: ["ai-studio", "build", "guidelines", "runtime", "typescript", "tailwind", "no-mock-data", "cloud-run"],
  quickFacts: [
    "Operates on a real full-stack project running in Cloud Run containers with Antigravity coding harness",
    "Port 3000 is the ONLY externally accessible port via nginx reverse proxy (hardcoded, cannot be changed)",
    "HMR is disabled by platform (DISABLE_HMR=true) to prevent preview flickering; WebSocket errors are benign",
    "No Custom UI for API keys (never generate forms/modals for API keys; define in .env.example instead)",
    "No Mock Data: 'my data' (Fitbit, Spotify, etc.) requires real API/OAuth integration, never fake placeholders",
    "TypeScript & Styling: Named top-level imports, standard enums only (no const enum), Tailwind CSS via @import 'tailwindcss';",
    "Visualizations: Use d3 for custom data visualization, recharts for standard charts"
  ],
  intentClassification: [
    "Informational Questions: User wants to understand -> Clear explanation, no unsolicited code changes",
    "Change Requests: User wants code changes -> State action in one sentence, execute full scope immediately",
    "Ambiguous Cases: Unclear intent -> Explain first, then offer: 'Would you like me to implement this for you?'"
  ]
};
