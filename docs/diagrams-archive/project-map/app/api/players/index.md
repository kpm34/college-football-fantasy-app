# Project Map — app/api/players

```mermaid
flowchart TB
  classDef folder fill:#e0f2fe,stroke:#0284c7,stroke-width:2,color:#075985,rx:8,ry:8
  classDef file fill:#f0f9ff,stroke:#64748b,stroke-width:1,color:#334155,rx:4,ry:4
  app_api_players["app/api/players/" ]
  class app_api_players folder
  app_api_players_cached["cached/"]
  class app_api_players_cached folder
  app_api_players --> app_api_players_cached
  app_api_players_cleanup["cleanup/"]
  class app_api_players_cleanup folder
  app_api_players --> app_api_players_cleanup
  app_api_players_route_ts["route.ts"]
  class app_api_players_route_ts file
  app_api_players --> app_api_players_route_ts
  app_api_players_search["search/"]
  class app_api_players_search folder
  app_api_players --> app_api_players_search
```
