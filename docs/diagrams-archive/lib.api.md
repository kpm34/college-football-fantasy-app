# Project Map — lib/api

```mermaid
flowchart TB
  classDef folder fill:#e0f2fe,stroke:#0284c7,stroke-width:2,color:#075985,rx:8,ry:8
  classDef file fill:#f0f9ff,stroke:#64748b,stroke-width:1,color:#334155,rx:4,ry:4
  lib_api["lib/api/" ]
  class lib_api folder
  lib_api_client_ts["client.ts"]
  class lib_api_client_ts file
  lib_api --> lib_api_client_ts
  lib_api_games_ts["games.ts"]
  class lib_api_games_ts file
  lib_api --> lib_api_games_ts
  lib_api_rankings_ts["rankings.ts"]
  class lib_api_rankings_ts file
  lib_api --> lib_api_rankings_ts
  lib_api_teams_ts["teams.ts"]
  class lib_api_teams_ts file
  lib_api --> lib_api_teams_ts
```
