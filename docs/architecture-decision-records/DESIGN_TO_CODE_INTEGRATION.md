## Design → Code Integration (Mapping to Our Stack)

### Principles
- Server components by default; client components only for interactivity
- No data fetching inside UI components; pass via props
- Validate inputs with Zod for routes/actions
- Tailwind + shadcn/ui patterns; motion per 3D_UI_IMPLEMENTATION_GUIDE

### Mapping Anima Output
- Replace generated layout wrappers with our layout components if applicable
- Convert any fetch/hooks to server-side data loaders
- Rename files/exports to match our naming conventions
- Strip inline styles where Tailwind tokens exist; unify via design tokens
- Move assets to `public/` with hashed filenames

### 3D & Motion
- Simple microinteractions: CSS keyframes / Anime.js; import lazily
- Scroll/scene-heavy: R3F/Three.js on isolated routes; Spline embeds paused when offscreen

### Testing & Rollout
- Add Playwright smoke for new routes/critical flows
- Feature-flag major visual changes
- Monitor via Sentry + Vercel Analytics; validate Core Web Vitals
