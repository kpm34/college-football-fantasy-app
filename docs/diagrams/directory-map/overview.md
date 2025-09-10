# Directory Map — Overview

This section documents the repository structure in a doc-first format with:
- Table of contents of root folders (chapters)
- A brief description of each folder's responsibilities and usage patterns
- A diagrams area (Mermaid) to visualize structure
- Deep links to important files with overlays in the admin UI

```mermaid
graph TB
  classDef root fill:#0ea5e9,stroke:#0369a1,stroke-width:2,color:#fff,rx:6,ry:6
  classDef sub fill:#111827,stroke:#334155,stroke-width:1,color:#e5e7eb,rx:4,ry:4

  R["<b>Repo Root</b>"]:::root
  R --> A[app/]:::sub
  R --> C[components/]:::sub
  R --> L[lib/]:::sub
  R --> D[docs/]:::sub
  R --> F[functions/]:::sub
  R --> S[schema/]:::sub
  R --> O[ops/]:::sub
  R --> T[tests/]:::sub
```
