# Project Map — app/api/draft

```mermaid
flowchart TB
  classDef folder fill:#fef3c7,stroke:#d97706,stroke-width:2,color:#451a03,rx:8,ry:8
  classDef file fill:#f0fdf4,stroke:#65a30d,stroke-width:1.5,color:#422006,rx:4,ry:4
  app_api_draft["app/api/draft/" ]
  class app_api_draft folder
  app_api_draft__leagueId_["[leagueId]/"]
  class app_api_draft__leagueId_ folder
  app_api_draft --> app_api_draft__leagueId_
  app_api_draft_complete["complete/"]
  class app_api_draft_complete folder
  app_api_draft --> app_api_draft_complete
  app_api_draft_players["players/"]
  class app_api_draft_players folder
  app_api_draft --> app_api_draft_players
```
