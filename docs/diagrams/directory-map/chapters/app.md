# Chapter: app/

- Purpose: Next.js App Router entry points, routes, and pages.
- Usage: Server Components by default; client components only where interactivity is required.
- Notes: Organize by route segments; colocate route-specific components; avoid data fetching in client components.

Key files:
- `app/layout.tsx` — Root layout
- `app/globals.css` — Global styles

```mermaid
graph LR
  %% Classes (legend-driven colors)
  classDef folder fill:#e5e7eb,stroke:#6b7280,color:#111827,rx:6,ry:6
  classDef file fill:#ffffff,stroke:#94a3b8,color:#1f2937,rx:4,ry:4
  classDef entry fill:#ffffff,stroke:#0f766e,stroke-width:3,color:#0f766e,rx:4,ry:4
  classDef external fill:#f59e0b,stroke:#b45309,color:#1f2937,rx:6,ry:6
  classDef generated fill:#f3f4f6,stroke:#9ca3af,color:#374151,rx:4,ry:4,stroke-dasharray:5 3
  classDef client fill:#0ea5e9,stroke:#0369a1,color:#ffffff,rx:6,ry:6
  classDef api fill:#14b8a6,stroke:#0f766e,color:#ffffff,rx:6,ry:6
  classDef docs fill:#6366f1,stroke:#4338ca,color:#ffffff,rx:6,ry:6
  classDef note fill:#fef3c7,stroke:#f59e0b,color:#7c2d12,rx:4,ry:4

  %% Client/UI cluster
  subgraph CLIENT[Client/UI]
    A[app/]:::folder
    A --> A_layout[[PAGE layout.tsx]]:::entry
    A --> A_global[file: global-error.tsx]:::file
    A --> A_league[(league)]:::folder
    A --> A_dashboard[(dashboard)]:::folder
    A --> A_admin[admin/]:::folder
  end
  class CLIENT client;

  %% API/Server cluster
  subgraph API[API/Server]
    A_api[app/api/]:::folder
    A_api --> API_backend[(backend)]:::folder
    A_api --> API_frontend[(frontend)]:::folder
    A_api --> API_external[(external)]:::folder
    API_external --> EXT_CFBD{{CFBD API}}:::external
    API_external --> EXT_APPWRITE{{Appwrite}}:::external
  end
  class API api;

  %% Docs/Design pointer (optional)
  subgraph DOCS[Docs/Design]
    D_docs[docs/diagrams]:::folder
  end
  class DOCS docs;

  %% Legend (reused across chapters)
  subgraph LEGEND[Legend]
    LG_folder[folder]:::folder
    LG_file[file]:::file
    LG_entry[[entry point]]:::entry
    LG_ext{{external}}:::external
    LG_gen[generated]:::generated
    LGE1[solid: contains]:::note --> LGE2[ ]:::note
    LGE3[dotted: alias/generated]:::note -.-> LGE4[ ]:::note
  end

  %% Relations
  A_admin -. uses .-> A_api
```
