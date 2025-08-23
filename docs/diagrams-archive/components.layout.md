# Project Map — components/layout

```mermaid
flowchart TB
  classDef folder fill:#e0f2fe,stroke:#0284c7,stroke-width:2,color:#075985,rx:8,ry:8
  classDef file fill:#f0f9ff,stroke:#64748b,stroke-width:1,color:#334155,rx:4,ry:4
  components_layout["components/layout/" ]
  class components_layout folder
  components_layout_FeaturesSection_tsx["FeaturesSection.tsx"]
  class components_layout_FeaturesSection_tsx file
  components_layout --> components_layout_FeaturesSection_tsx
  components_layout_GamesSection_tsx["GamesSection.tsx"]
  class components_layout_GamesSection_tsx file
  components_layout --> components_layout_GamesSection_tsx
  components_layout_LeaguePortal_tsx["LeaguePortal.tsx"]
  class components_layout_LeaguePortal_tsx file
  components_layout --> components_layout_LeaguePortal_tsx
  components_layout_index_ts["index.ts"]
  class components_layout_index_ts file
  components_layout --> components_layout_index_ts
```
