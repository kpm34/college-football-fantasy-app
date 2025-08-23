# Project Map — app/api/og

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  app_api_og["app/api/og/" ]
  class app_api_og folder
  app_api_og_home["home/"]
  class app_api_og_home folder
  app_api_og --> app_api_og_home
  app_api_og_league_invite["league-invite/"]
  class app_api_og_league_invite folder
  app_api_og --> app_api_og_league_invite
```
