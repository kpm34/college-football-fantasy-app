# Project Map — app/dashboard/league

```mermaid
flowchart TB
  classDef folder fill:#fef3c7,stroke:#d97706,stroke-width:2,color:#451a03,rx:8,ry:8
  classDef file fill:#f0fdf4,stroke:#65a30d,stroke-width:1.5,color:#422006,rx:4,ry:4
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
