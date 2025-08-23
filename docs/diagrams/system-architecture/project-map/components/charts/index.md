# Project Map — components/charts

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  components_charts["components/charts/" ]
  class components_charts folder
  components_charts_TeamUsage_tsx["TeamUsage.tsx"]
  class components_charts_TeamUsage_tsx file
  components_charts --> components_charts_TeamUsage_tsx
  components_charts_index_ts["index.ts"]
  class components_charts_index_ts file
  components_charts --> components_charts_index_ts
```
