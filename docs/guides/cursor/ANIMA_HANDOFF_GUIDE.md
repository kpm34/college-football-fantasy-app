## Anima Handoff Guide (From Playground to Repo)

Use this when you share Anima-generated code and instructions.

### What to Export
- Target framework: React + Tailwind
- Include responsive settings and assets
- Export as a zip; do not minify (keep readable)

### What to Provide in Your Message
- Figma link(s) and the exact frame/component exported
- Anima Playground link
- Zip of the exported code
- Notes on desired changes: layout, motion, states, interactions
- Any screenshots/GIFs highlighting behaviors

### How We Integrate
- Create a feature branch
- Place components under `components/features/<area>/` (no data fetching)
- Convert to App Router patterns (server components default)
- Replace ad-hoc motion with our recipes (CSS keyframes / Anime.js)
- Wire props/types; add Zod where inputs/params exist
- Write minimal Playwright smoke if user-facing route is added

### Acceptance
- Lint/typecheck clean
- Matches intended behaviors (states/motion)
- Accessible (focus, contrast, reduced-motion)
- Performance budget respected
