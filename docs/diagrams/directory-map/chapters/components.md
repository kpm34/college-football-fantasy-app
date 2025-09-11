# Chapter: components/

- Purpose: Reusable UI pieces and feature-level components.
- Usage: Mirror target folder structure; prefer server-driven data into props; expose via `components/index.ts`.

Key subfolders: `ui/`, `features/`, `layout/`, `tables/`, `charts/`.

```mermaid
graph LR
  classDef folder fill:#e5e7eb,stroke:#6b7280,color:#111827,rx:6,ry:6
  classDef entry fill:#ffffff,stroke:#0f766e,stroke-width:3,color:#0f766e,rx:4,ry:4
  classDef client fill:#0ea5e9,stroke:#0369a1,color:#ffffff,rx:6,ry:6
  classDef note fill:#fef3c7,stroke:#f59e0b,color:#7c2d12,rx:4,ry:4

  subgraph CLIENT[Client/UI]
    C[components/]:::folder --> C1[ui/]:::folder
    C --> C2[features/]:::folder
    C --> C3[layout/]:::folder
    C --> C4[tables/]:::folder
    C --> C5[charts/]:::folder
    C --> C6[index.ts]:::entry
  end
  class CLIENT client;

  subgraph LEGEND[Legend]
    L1[folder]:::folder
    L2[[entry point]]:::entry
    L3[PAGE/LAYOUT badge on files where used]:::note
  end
```
