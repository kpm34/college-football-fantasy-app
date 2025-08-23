# Project Map — app/api/rotowire

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  app_api_rotowire["app/api/rotowire/" ]
  class app_api_rotowire folder
  app_api_rotowire_news["news/"]
  class app_api_rotowire_news folder
  app_api_rotowire --> app_api_rotowire_news
  app_api_rotowire_route_ts["route.ts"]
  class app_api_rotowire_route_ts file
  app_api_rotowire --> app_api_rotowire_route_ts
```
