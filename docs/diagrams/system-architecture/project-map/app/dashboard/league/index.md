# Project Map — app/dashboard/league

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  app_dashboard_league["app/dashboard/league/" ]
  class app_dashboard_league folder
  app_dashboard_league__leagueId_["[leagueId]/"]
  class app_dashboard_league__leagueId_ folder
  app_dashboard_league --> app_dashboard_league__leagueId_
  app_dashboard_league_create["create/"]
  class app_dashboard_league_create folder
  app_dashboard_league --> app_dashboard_league_create
  app_dashboard_league_join["join/"]
  class app_dashboard_league_join folder
  app_dashboard_league --> app_dashboard_league_join
```
