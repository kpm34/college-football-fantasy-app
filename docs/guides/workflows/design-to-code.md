---
title: Design to Code — Handoff → Integration
updated: 2025-09-11
---

## Steps
1. Design review (accessibility, performance, feasibility)
2. Create tickets with acceptance criteria & snapshots
3. Implement UI/3D components (RSC by default; client only when needed)
4. Visual QA (contrast, keyboard, screen reader)
5. Performance QA (skeletons, lazy load, code split)
6. Merge → preview → ship

## Acceptance Criteria
- Meets component API and design spec
- Passes a11y checks (axe/lighthouse), keyboard nav
- Respects `prefers-reduced-motion`; provides fallbacks

## AI & Tools
- Claude to summarize design diffs and propose component API
- Vercel AI SDK to scaffold tests and story variations

Diagram: /admin/diagrams/workflows%3Adesign-to-code
