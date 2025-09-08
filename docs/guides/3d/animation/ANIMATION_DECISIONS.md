# Animation Decisions (CSS vs Anime.js vs R3F vs three-bas)

## Decision Tree
- If count < 300 and UI-only → CSS or Anime.js (lazy)
- If interactive 3D mesh count modest (≤ few hundred) → R3F with instancing
- If 300–5000+ instances or vertex displacement driven → consider three-bas

## Pros/Cons Summary
- CSS/Anime.js: simplest, minimal JS, great for microinteractions
- R3F: full control, materials/shaders, higher complexity
- three-bas: GPU-scale performance, requires GLSL and attribute authoring

## Guardrails
- Respect `prefers-reduced-motion`
- Budget < 30KB extra JS per route (draft room stricter)
- Avoid scroll hijacking; contain pointer capture in 3D areas
