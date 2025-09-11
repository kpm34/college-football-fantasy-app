---
title: System & Architecture Diagram — Style & Authoring Guide
source: Drive Section 4 — System & Architecture Diagrams Style & Authoring Guide
updated: 2025-09-11
---

## Purpose
Depict major components, data stores, externals, and runtime boundaries with performance and integration notes.

## Visual style
- Use Mermaid `flowchart TD` with clusters for: Client Apps, Edge (Vercel Edge), API (Next API/Appwrite), Data (Appwrite collections, KV), External Providers (CFBD, ESPN, Lucid, Runway).
- Edges show request/response; label with protocol or key event (HTTP, WebSocket, Cron).
- Annotate latency/TTL where applicable.

## Content rules
- Include only active components for the “current” diagram; clearly tag planned components.
- Note runtimes (EDGE/NODE) and deployment surfaces (Vercel, Appwrite Functions).
- Show core data paths for key flows (auth, draft, scoring, projections) but keep high‑level.

## Authoring steps
1) List components and group into clusters.
2) Draw main request paths and data flows.
3) Add latency/TTL notes (e.g., KV TTLs, expected response times).
4) Add error/retry/monitoring notes sparingly.

## Mermaid starter
```mermaid
flowchart TD
  subgraph Client
    Web
    Mobile
  end
  subgraph Edge
    EdgeRuntime
  end
  subgraph API
    NextAPI
    AppwriteFunctions
  end
  subgraph Data
    AppwriteDB
    VercelKV
  end
  Client-->EdgeRuntime-->NextAPI
  NextAPI-->AppwriteDB
  NextAPI-->VercelKV
```

## QA checklist
- [ ] Clear cluster separations
- [ ] Runtimes and externals labeled
- [ ] Only essential flows

## Parser‑safe Mermaid conventions
- Use simple cluster titles without brackets (e.g., `subgraph API` not `subgraph API[Next API]`).
- Quote labels that include slashes or parentheses.
- Keep edges directional and label with protocol, e.g., `-- HTTP -->`, `-- WS -->`, `-- Cron -->`.
- For planned components, append `(planned)` in label text.

## Runtime & boundary notes
- Tag nodes with runtime if helpful: `[EDGE]`, `[NODE]` (inline in label).
- Draw boundaries as clusters: Client, Edge, API, Data, External.
- Note TTL/latency annotations near edges (e.g., `KV TTL 60s`).

## Render & audit
- Preview via Admin pages under `system-architecture:*`.
- Live audit on production:
  - `BASE_URL=https://<deploy-url> npx tsx ops/common/scripts/audit-diagrams-live.ts`

### Citation
- Drive PDS: [Diagram Guides Folder](https://drive.google.com/drive/folders/10FsLx1yEHSZrEJdum_jdU3ukQvEAX21G?usp=sharing)
- System & Architecture PDS: [Section 4 PDF](https://drive.google.com/file/d/1obMENHUFVtuphPBqNfsLXtugnSa_hxhO/view?usp=sharing)
