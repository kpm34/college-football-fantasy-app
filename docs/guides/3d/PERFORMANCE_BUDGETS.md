# 3D Performance Budgets & Profiling

## Budgets (per route)
- Added JS ≤ 30KB (draft room ≤ 20KB)
- GPU frame time headroom ≥ 4ms @ 60Hz
- Max active meshes ≤ 500 (unless instanced)
- Instanced draw calls consolidated; prefer ≤ 50

## Profiling
- Use Chrome Performance & WebGL Inspector
- Measure long tasks; watch layout/paint
- FPS, dropped frames on mid-tier mobile

## Optimization Tactics
- Instancing; merge geometries
- Texture atlases; compressed textures (KTX2)
- LOD, frustum & occlusion culling
- Pause offscreen renders; respect reduced motion
