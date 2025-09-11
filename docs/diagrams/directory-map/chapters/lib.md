# Chapter: lib/

- Purpose: Core utilities, repositories, domain logic, and SDKs.
- Usage: Keep business logic here; avoid importing UI into `lib/*`.

Notables: `lib/repos/*`, `lib/db/*`, `lib/appwrite-*.ts`, `lib/types/*`.

```mermaid
graph LR
  classDef folder fill:#e5e7eb,stroke:#6b7280,color:#111827,rx:6,ry:6
  classDef data fill:#10b981,stroke:#065f46,color:#ffffff,rx:6,ry:6
  classDef external fill:#f59e0b,stroke:#b45309,color:#1f2937,rx:6,ry:6
  classDef note fill:#fef3c7,stroke:#f59e0b,color:#7c2d12,rx:4,ry:4

  subgraph DATA[Data/Schema]
    L[lib/]:::folder --> L1[db/]:::folder
    L --> L2[repos/]:::folder
    L --> L3[hooks/]:::folder
    L --> L4[types/]:::folder
    L --> L5[services/]:::folder
  end
  class DATA data;

  EXT_APPWRITE{{Appwrite SDK}}:::external
  L5 -. uses .-> EXT_APPWRITE

  subgraph LEGEND[Legend]
    LG_folder[folder]:::folder
    LG_data[cluster: data/schema]:::data
  end
```
