# Project Map — app/api/games

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  app_api_games["app/api/games/" ]
  class app_api_games folder
  app_api_games_cached["cached/"]
  class app_api_games_cached folder
  app_api_games --> app_api_games_cached
```
