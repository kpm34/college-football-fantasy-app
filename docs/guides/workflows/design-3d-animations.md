---
title: Design 3D & Animations — Asset → Integrate → Optimize
updated: 2025-09-11
---

## Goal

Create and integrate 3D models/animations that perform well across devices with a delightful UX.

## Roles

- 3D Designer: concepts, modeling, textures, animation
- Frontend Engineer: integration (R3F), performance, UX
- Motion Designer: timing, easing, narrative
- Reviewer: a11y/perf checks, consistency

## Pipeline

1. Concept & Asset
   - Tools: Spline, Blender, Runway (gen video/overlays)
   - Constraints: polygon budget, texture sizes, animation length
2. Prepare & Export
   - Format: GLB/GLTF for models, texture atlases; compress (draco/basis)
   - Test in isolated scene; measure draw calls and size
3. Integrate in App
   - React Three Fiber scene; lazy‑load heavy assets
   - Use `drei` helpers; memoize nodes/materials; suspend and fallback
   - Add motion via Framer Motion; respect `prefers-reduced-motion`
4. Optimize
   - Reduce overdraw; limit lights/shadows; bake when possible
   - Gate high‑cost effects behind feature flags
5. QA & Perf
   - Target: TTI < 3s; main thread quiet; 60 FPS goal (mobile); memory within limits

## Budgets

- Geometry: < 50k tris (mobile), < 150k (desktop) per scene segment
- Textures: total < 8 MB compressed; prefer shared atlases
- Materials: limit unique materials; reuse shader params; avoid heavy post FX

## Data Model (Appwrite)

- `assets`: id, type(model/texture/anim), size, variant, createdBy
- `scenes`: id, nodes, materials, animations, presets, performanceMeta
- `presets`: camera, lights, theme; `animations`: clip names, durations
- `snapshots`: png thumb, scene ref, changelog; `shares`: slug, visibility

## AI & Tools

- Runway for generating motion variants; pick best and compress
- Claude to create scene setup scaffolds and code review for R3F
- Chrome AI for asset summarization and alt‑text

## Implementation Phases

1. Editor Shell (Phase 1)
   - R3F + Drei canvas, asset loader, presets, material studio
   - Save/Load scene to Appwrite; snapshot thumbnails
2. Timeline & Motion (Phase 2)
   - Keyframe editor for transforms/material params; easing; clip blending
   - Motion packs (idle/run/celebrate) loader and cross‑fade
3. AI Hooks (Phase 3)
   - Claude prompt → scene scaffold; Vercel AI NL commands; Runway variants
4. Share & Integrate (Phase 4)
   - Embed viewer, “Use in App” push to team/league branding; performance HUD

## Acceptance Criteria

- Meets budgets; passes perf audit on mobile; respects reduced motion
- Scene loads progressively; no layout shift; controls intuitive
- Artifacts versioned; rollback possible; shareable URL works

## References

- React Three Fiber: https://docs.pmnd.rs/react-three-fiber/getting-started/introduction
- Drei: https://github.com/pmndrs/drei
- Framer Motion: https://www.framer.com/motion/
- Runway: https://docs.runwayml.com

Diagram: /admin/diagrams/workflows%3Adesign-3d-animations
