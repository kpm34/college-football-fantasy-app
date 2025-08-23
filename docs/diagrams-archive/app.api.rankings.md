# Project Map — app/api/rankings

```mermaid
flowchart TB
  classDef folder fill:#e0f2fe,stroke:#0284c7,stroke-width:2,color:#075985,rx:8,ry:8
  classDef file fill:#f0f9ff,stroke:#64748b,stroke-width:1,color:#334155,rx:4,ry:4
  app_api_rankings["app/api/rankings/" ]
  class app_api_rankings folder
  app_api_rankings_cached["cached/"]
  class app_api_rankings_cached folder
  app_api_rankings --> app_api_rankings_cached
  app_api_rankings_route_ts["route.ts"]
  class app_api_rankings_route_ts file
  app_api_rankings --> app_api_rankings_route_ts
```
