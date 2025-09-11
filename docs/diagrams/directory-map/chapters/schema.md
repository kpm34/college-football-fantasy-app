# Chapter: schema/

- Purpose: Single Source of Truth for Appwrite collections.
- Usage: Update zod schema; run generators; sync to Appwrite.

```mermaid
graph LR
  classDef folder fill:#e5e7eb,stroke:#6b7280,color:#111827,rx:6,ry:6
  classDef data fill:#10b981,stroke:#065f46,color:#ffffff,rx:6,ry:6
  classDef generated fill:#f3f4f6,stroke:#9ca3af,color:#374151,rx:4,ry:4,stroke-dasharray:5 3

  subgraph DATA[Data/Schema]
    S[schema/]:::folder --> S1[zod-schema.ts]:::folder
    S --> S2[generators/]:::folder
    S --> S3[indexes.ts]:::folder
    S2 -. generates .-> GEN_TYPES[generated types]:::generated
  end
  class DATA data;
```
