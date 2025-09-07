# Diagram Merge & Migration Plan

Goals:
- Reduce fragmentation while avoiding oversized diagrams
- Canonicalize under four-folder structure per domain

Process:
1) Inventory archived diagrams in ops/attic/diagrams/project-map
2) Tag keep/merge/archive per domain
3) For each domain, produce 2–3 concise diagrams per folder:
   - overview (1)
   - user-flow (1–3)
   - data-and-entity-relation (1–2)
   - api-and-events (1–2)
4) Update docs/diagrams/_inventory.json to list only canonical diagrams
5) Leave a pointer in attic README for any diagram not migrated

Guidelines:
- 80–120 lines per diagram, one logical page
- Use consistent naming and link to domain overviews
- Avoid duplicates; prefer combined views with sub-sections

Next domains:
- Auth, Leagues, Projections, Scoring, Realtime, Ops/Deploy


