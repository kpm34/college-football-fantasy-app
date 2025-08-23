# Project Map — data/market

```mermaid
flowchart TB
  classDef folder fill:#e0f2fe,stroke:#0284c7,stroke-width:2,color:#075985,rx:8,ry:8
  classDef file fill:#f0f9ff,stroke:#64748b,stroke-width:1,color:#334155,rx:4,ry:4
  data_market["data/market/" ]
  class data_market folder
  data_market_efficiency["efficiency/"]
  class data_market_efficiency folder
  data_market --> data_market_efficiency
  click data_market_efficiency "/admin/project-map/data/market/efficiency" "Open efficiency"
  data_market_mockdraft["mockdraft/"]
  class data_market_mockdraft folder
  data_market --> data_market_mockdraft
  click data_market_mockdraft "/admin/project-map/data/market/mockdraft" "Open mockdraft"
```
