## Figma: HTML-to-Design + Anima Playground (Screenshot/Import Hybrid)

Goal: Rapidly study, adapt, and code high-quality UI by combining HTML-to-Design imports with Anima’s Playground, while preserving our app’s architecture.

### 0) Prereqs
- Figma installed; HTML to Figma (html.to.design) plugin installed
- Anima plugin installed; Anima Playground account
- Local: `.env.local` has `CODE_TO_DESIGN_API_KEY` for import services

### 1) Import (Optional) — HTML → Figma
- In Figma: run HTML to Figma plugin
- Paste URL → import as editable layers (expect some cleanup)
- Use only for reference/wireframe fidelity; don’t force pixel-perfect parity

### 2) Compose in Figma
- Apply our naming/variants aligned to code (atoms → molecules → sections)
- Auto Layout for responsiveness; set constraints and min/max widths
- Define motion intents in layer notes (e.g., slide-in-right 160ms, pop-in 140ms)

### 3) Anima Playground
- Select a frame/component → open Anima ➝ Playground
- Export React + Tailwind (preferred) with responsive options enabled
- Validate breakpoints and semantic tags

### 4) Handoff Package
- Export code from Anima
- Include Figma links, notes on deltas from inspiration
- Provide a brief of desired tweaks vs the Anima output
- Use our `HANDOFF_PACKAGE_TEMPLATE.md` for consistency

### 5) Integration (by dev)
- Map exported components to shadcn/ui equivalents; remove inline fetch; server components by default
- Move any motion to CSS/Anime.js per `3D_UI_IMPLEMENTATION_GUIDE.md`
- Gate heavy assets behind lazy imports; align with `components/features/*` structure

### Tips
- Imports are a starting point, not the source of truth
- Keep contrast and motion accessible; use feature flags for large visual changes
- Prefer design tokens via `ops/design/export-tokens.ts`
