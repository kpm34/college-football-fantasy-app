## AI-First Design Workflows (Figma · Anima · Cursor · Vercel · Runway · Meshy)

Goal: Move from inspiration → spec → wireframe → polished design → production code with minimal manual effort, leveraging our toolchain and automation.

### 1) Inspiration → Structured Brief (screenshot-first)
- Drop your screenshots (PNG/JPG) into `docs/inspiration/screenshots/` (you can also paste external URLs to auto-capture).
- Optional: Run `npm run design:capture` to auto-capture pages listed in `docs/inspiration/urls.txt`.
- For each screenshot, create a short brief using the template below; we’ll aggregate into a research pack.
- Outputs live in:
  - PNG screenshots in `docs/inspiration/screenshots/`
  - JSON data in `docs/inspiration/data/` (only if captured from URL)
  - Markdown summaries in `docs/inspiration/summaries/`
- These become prompt context for AI (Cursor/Claude/GPT) and for token creation.

### 2) Brief → Wireframe (Figma-first)
- Use AI to synthesize a design brief from summaries and our brand constraints.
- Import references or live pages to Figma via `html.to.design` using `CODE_TO_DESIGN_API_KEY` (already in `.env.local`).
- Translate the brief into wireframes with reusable components; leverage Figma Auto Layout and constraints.
- Keep naming aligned with our code components and variants.

### 3) Wireframe → Design Tokens
- Normalize palette and typography with `ops/design/export-tokens.ts`.
- Store tokens in `ops/design/tokens.tokens.json`; export CSS variables and Tailwind config if needed.
- Gate token rollouts behind feature flags when changing live visuals.

### 4) High-Fidelity Design → Code
- Two routes (use both where they fit):
  - Anima: export responsive React/Tailwind scaffolds for net-new pages/sections.
  - Figma Code Connect: map Figma components to existing React components and props.
- Code generation is checked into feature branches, then adapted to our patterns:
  - App Router (server components default), shadcn/ui, Tailwind, Zod validation, SSR-first.
  - Motion: CSS keyframes, Anime.js for microinteractions, GSAP/ScrollTrigger sparingly on non-critical routes.

### 5) 3D & Motion Accents
- Meshy / Runway produce assets (GLB/GLTF, videos). Store under `public/assets/3d` and `public/assets/video`.
- Integrate with React Three Fiber for interactive scenes; Spline for decorative/ambient embeds.
- Respect performance budget and `prefers-reduced-motion`.

### 6) QA & Rollout
- Canary behind feature flags (e.g., `draftUiV2`).
- E2E snapshot of key routes (Playwright) and visual checks.
- Observe Sentry + Vercel Analytics; optimize or roll back quickly.

---

### Daily Flow (fast loop)
1) Paste 3–10 inspiration URLs into `docs/inspiration/urls.txt`.
2) Run `npm run design:capture` and skim the generated summaries.
3) Ask Cursor/Claude: “Synthesize a brief and wireframe for <page> given these summaries + our brand.”
4) In Figma, import a key reference with `html.to.design` for layout cues.
5) Use Anima/Code Connect to generate or bind code, then refine manually as needed.

### Tool Notes
- `html.to.design` (import URL → Figma): needs `CODE_TO_DESIGN_API_KEY`.
- Anima: best for initial responsive scaffolds; we refine to SSR and our component system.
- Code Connect: ensures Figma → code parity on component level.
- Runway/Meshy: generate hero/motion/3D accents; export lightweight formats.

### References
- See `docs/guides/3D_UI_IMPLEMENTATION_GUIDE.md` for motion recipes and performance guardrails.
- Use `npm run design:tokens` to regenerate tokens.
