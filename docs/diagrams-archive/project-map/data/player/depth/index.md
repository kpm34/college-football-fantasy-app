# Project Map — data/player/depth

```mermaid
flowchart TB
  classDef folder fill:#e0f2fe,stroke:#0284c7,stroke-width:2,color:#075985,rx:8,ry:8
  classDef file fill:#f0f9ff,stroke:#64748b,stroke-width:1,color:#334155,rx:4,ry:4
  data_player_depth["data/player/depth/" ]
  class data_player_depth folder
  data_player_depth_overrides_2025_json["overrides_2025.json"]
  class data_player_depth_overrides_2025_json file
  data_player_depth --> data_player_depth_overrides_2025_json
  data_player_depth_team_sites_2025_json["team_sites_2025.json"]
  class data_player_depth_team_sites_2025_json file
  data_player_depth --> data_player_depth_team_sites_2025_json
```
