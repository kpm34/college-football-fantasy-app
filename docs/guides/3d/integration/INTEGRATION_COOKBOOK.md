# 3D Integration Cookbook (Assets & Embeds)

## Assets
- Prefer GLB/GLTF; compress textures (KTX2/Basis)
- Keep materials PBR-consistent; avoid excessive shader variants
- Provide static PNG/SVG fallback

## Embeds (Spline)
- Lazy-load; `pointer-events: none` if decorative
- Pause when offscreen; unmount on route change
- Guard with feature flags; avoid draft room routes

## R3F Widgets
- Isolate in their own routes or lazy chunks
- Gate with flags; keep JS under budget
- Provide SSR-safe shells; avoid blocking hydration

## Security & Stability
- No dynamic shader code from user input
- Validate asset URLs; cache-control & integrity where possible
