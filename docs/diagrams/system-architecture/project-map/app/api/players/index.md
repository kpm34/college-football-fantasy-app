# Project Map — app/api/players

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
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
