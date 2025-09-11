---
title: Directory Map — Style & Authoring Guide
source: Drive Section 3 — Directory Maps Style & Authoring Guide
updated: 2025-09-11
---

## Purpose
Show where things live in the repo and how code is organized by feature/layer.

## Visual style
- Top‑down `graph TD` or left‑right `graph LR` for wide screens.
- Clusters by layer: Client/UI (Blue), API/Server (Teal), Data/Schema (Green), Shared/Lib (Purple), Tooling (Yellow), Docs (Indigo), External (Orange), Generated (Grey).
- Entry points use double borders; generated uses dashed borders; external uses hexagons.
- Keep a reusable legend panel on the diagram.

## Depth & scope
- Show ≤3 levels per diagram; create zoom‑ins for draft, league, etc.
- Exclude vendor/build folders; list excluded in a sticky note.

## Authoring steps
1) Place root folder; add top‑level directories.
2) Cluster by layer (Client, API, Data, Shared, Tooling, Docs).
3) Add key files (entry points like `page.tsx`, `layout.tsx`, `route.ts`).
4) Add badges (PAGE, LAYOUT, ROUTE, CLIENT, SERVER, EDGE, NODE, TYPE, SCHEMA, QUERY, TEST, CFG, ASSET).
5) Add up to 5 cross‑cluster links if critical.

## QA checklist
- [ ] Depth ≤ 3
- [ ] Consistent cluster colors
- [ ] Entry points marked
- [ ] Legend present
- [ ] No clutter / readable spacing
