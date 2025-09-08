# three-bas (Buffer Animation System) Guide

## When to Use
- Thousands of instances with unique offsets/timings
- Vertex displacement (ribbons, text effects) in shader
- Keyframe blending on GPU without CPU updates

## Setup (later)
- Add dependency and ensure WebGL2 availability
- Model per-instance attributes (start, duration, offset, curve params)
- Extend ShaderMaterial or onBeforeCompile; wire BAS chunks

## Checklist
- Batch draw calls; reuse materials
- Frustum cull aggressively
- Provide low-end fallback (reduced counts; static assets)
- QA: culling/winding, z precision, gamma, perf budget

References: https://github.com/zadvorsky/three.bas
