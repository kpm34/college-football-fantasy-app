# Project Map — app/api/drafts

```mermaid
flowchart TB
  classDef folder fill:#fef3c7,stroke:#d97706,stroke-width:2,color:#451a03,rx:8,ry:8
  classDef file fill:#f0fdf4,stroke:#65a30d,stroke-width:1.5,color:#422006,rx:4,ry:4
  app_api_drafts["app/api/drafts/" ]
  class app_api_drafts folder
  app_api_drafts__id_["[id]/"]
  class app_api_drafts__id_ folder
  app_api_drafts --> app_api_drafts__id_
  app_api_drafts_route_ts["route.ts"]
  class app_api_drafts_route_ts file
  app_api_drafts --> app_api_drafts_route_ts
```
