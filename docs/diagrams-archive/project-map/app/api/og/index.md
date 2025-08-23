# Project Map — app/api/og

```mermaid
flowchart TB
  classDef folder fill:#e0f2fe,stroke:#0284c7,stroke-width:2,color:#075985,rx:8,ry:8
  classDef file fill:#f0f9ff,stroke:#64748b,stroke-width:1,color:#334155,rx:4,ry:4
  app_api_og["app/api/og/" ]
  class app_api_og folder
  app_api_og_home["home/"]
  class app_api_og_home folder
  app_api_og --> app_api_og_home
  app_api_og_league_invite["league-invite/"]
  class app_api_og_league_invite folder
  app_api_og --> app_api_og_league_invite
```
