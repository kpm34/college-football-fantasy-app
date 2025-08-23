# Project Map — app/api/draft

```mermaid
flowchart TB
  classDef folder fill:#e0f2fe,stroke:#0284c7,stroke-width:2,color:#075985,rx:8,ry:8
  classDef file fill:#f0f9ff,stroke:#64748b,stroke-width:1,color:#334155,rx:4,ry:4
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
