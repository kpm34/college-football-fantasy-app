# Project Map — app/api/games

```mermaid
flowchart TB
  classDef folder fill:#e0f2fe,stroke:#0284c7,stroke-width:2,color:#075985,rx:8,ry:8
  classDef file fill:#f0f9ff,stroke:#64748b,stroke-width:1,color:#334155,rx:4,ry:4
  app_api_games["app/api/games/" ]
  class app_api_games folder
  app_api_games_cached["cached/"]
  class app_api_games_cached folder
  app_api_games --> app_api_games_cached
```
