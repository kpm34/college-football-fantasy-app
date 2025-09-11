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

1. Place root folder; add top‑level directories.
2. Cluster by layer (Client, API, Data, Shared, Tooling, Docs).
3. Add key files (entry points like `page.tsx`, `layout.tsx`, `route.ts`).
4. Add badges (PAGE, LAYOUT, ROUTE, CLIENT, SERVER, EDGE, NODE, TYPE, SCHEMA, QUERY, TEST, CFG, ASSET).
5. Add up to 5 cross‑cluster links if critical.

## QA checklist

- [ ] Depth ≤ 3
- [ ] Consistent cluster colors
- [ ] Entry points marked
- [ ] Legend present
- [ ] No clutter / readable spacing

## Parser‑safe Mermaid conventions

- Use `graph TD` or `graph LR` with clusters per layer; avoid nested subgraphs beyond two levels.
- Keep labels short; quote labels containing slashes/parentheses.
- Define consistent classDefs for layer colors and reuse them across maps.

### Suggested classDefs

```mermaid
flowchart LR
  classDef ui fill:#60a5fa,stroke:#1d4ed8,color:#0b1020,rx:6,ry:6;
  classDef api fill:#2dd4bf,stroke:#0f766e,color:#052e2b,rx:6,ry:6;
  classDef data fill:#86efac,stroke:#16a34a,color:#052e2b,rx:6,ry:6;
  classDef lib fill:#c4b5fd,stroke:#7c3aed,color:#20104b,rx:6,ry:6;
  classDef tool fill:#fde68a,stroke:#ca8a04,color:#201a05,rx:6,ry:6;
  classDef docs fill:#a5b4fc,stroke:#4338ca,color:#0b1020,rx:6,ry:6;
  classDef ext fill:#fdba74,stroke:#ea580c,color:#201004,rx:6,ry:6;
  classDef gen fill:#e5e7eb,stroke:#6b7280,color:#111827,rx:6,ry:6,stroke-dasharray:4 3;
```

### Badges (inline conventions)

- Append small uppercase tags in label text: `page.tsx [PAGE]`, `route.ts [ROUTE]`, `layout.tsx [LAYOUT]`, `client [CLIENT]`, `server [SERVER]`, `edge [EDGE]`, `schema [SCHEMA]`, `test [TEST]`, `cfg [CFG]`.

## Render & audit

- Preview via Admin: `/admin/diagrams/directory-map:chapters:<section>`
- Live audit on production:
  - `BASE_URL=https://<deploy-url> npx tsx ops/common/scripts/audit-diagrams-live.ts`

### Citation

- Drive PDS: [Diagram Guides Folder](https://drive.google.com/drive/folders/10FsLx1yEHSZrEJdum_jdU3ukQvEAX21G?usp=sharing)
- Directory Maps PDS: [Section 3 PDF](https://drive.google.com/file/d/1I_YY-tbz176nGZ0C1M9ehIVKYyv-SpA2/view?usp=sharing)
