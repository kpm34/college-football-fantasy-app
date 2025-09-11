# Chapter: functions/

- Purpose: Appwrite/cron/workers functions.
- Usage: One folder per function; document triggers and I/O; keep shared bits in `functions/_shared` or import `lib/**`.

```mermaid
graph LR
  classDef folder fill:#e5e7eb,stroke:#6b7280,color:#111827,rx:6,ry:6
  classDef api fill:#14b8a6,stroke:#0f766e,color:#ffffff,rx:6,ry:6
  classDef note fill:#fef3c7,stroke:#f59e0b,color:#7c2d12,rx:4,ry:4
  classDef external fill:#f59e0b,stroke:#b45309,color:#1f2937,rx:6,ry:6

  subgraph API[API/Server]
    F[functions/]:::folder --> F1[appwrite/]:::folder
    F --> F2[cron/]:::folder
    F --> F3[workers/]:::folder
  end
  class API api;

  F1 -. triggers .-> EXT_APPWRITE{{Appwrite}}:::external

  subgraph LEGEND[Legend]
    L1[cluster: API/Server]:::api
    L2[folder]:::folder
    L3[dotted: triggers/calls]:::note
  end
```
