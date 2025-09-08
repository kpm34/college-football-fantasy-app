# Pipeline Cheatsheet (MVP, Clipping, Interpolation)

- Spaces: model → world → view → clip; `clip = P * V * M * vec4(pos,1)`
- Perspective divide: `ndc = clip.xyz / clip.w` → viewport mapping
- Clipping: frustum plane clipping prior to rasterization
- Interpolation: perspective-correct (divide varyings by w; re-multiply in fragment)
- Normals: normal matrix = inverseTranspose(mat3(M*V))
- Depth: prefer tight near/far or reversed-Z; watch precision
- Culling: verify winding after transforms
- Gamma: linear-light compute → sRGB output

References: Zadvorsky “Into Vertex Shaders”, XR Practices Part 2 (Clipping & Projection)
