## Design Vision (Screenshot-First)

Purpose: Align the team on the look, feel, and motion language for a highly interactive, sophisticated, sports-grade UI—prioritizing performance, accessibility, and maintainability.

### Pillars
- Clarity under motion: animations always reinforce hierarchy and state changes.
- Sport broadcast quality: bold typography, dynamic energy, controlled contrast, crisp data visualization.
- 3D with restraint: ambient depth as accent; interactive 3D as focused moments, not everywhere.
- Mobile-first flow: thumbs-only reach, sticky heads/CTAs, latency-sensitive UI.
- Performance-first: SSR by default, lazy-load heavy JS, respect prefers-reduced-motion.

### Motion Language
- Microinteractions: button press bounce, specular sweeps on fills, ticker slide-ins.
- Temporal rhythm: short (120–200ms) utility motion; medium (300–500ms) for content transitions.
- State feedback: urgency pulse for timers under threshold; calm states are still.

### 3D Strategy
- Ambient: Spline embeds paused when offscreen; PNG/SVG fallback.
- Interactive: React Three Fiber widgets for hero moments (e.g., Draft pick highlight, Mascot studio).
- Asset pipeline: Meshy (GLB/GLTF) and Runway (short hero loops) with optimized sizes.

### Visual System
- Tokens: color, typography, spacing exported via `ops/design/export-tokens.ts`.
- Components: shadcn/ui base with variants; no data fetching inside components.
- Layouts: App Router server components with client shells only where needed.

### Accessibility & Perf
- WCAG AA; focus states always visible; reduced-motion mode.
- Budget: +<30KB route JS for motion; FPS capped for 3D; avoid layout shift.

### What We Are Not Doing (Now)

- 
