# Project Map — data/player/depth

```mermaid
flowchart TB
  classDef folder fill:#fef3c7,stroke:#d97706,stroke-width:2,color:#451a03,rx:8,ry:8
  classDef file fill:#f0fdf4,stroke:#65a30d,stroke-width:1.5,color:#422006,rx:4,ry:4
  data_player_depth["data/player/depth/" ]
  class data_player_depth folder
  data_player_depth_overrides_2025_json["overrides_2025.json"]
  class data_player_depth_overrides_2025_json file
  data_player_depth --> data_player_depth_overrides_2025_json
  data_player_depth_team_sites_2025_json["team_sites_2025.json"]
  class data_player_depth_team_sites_2025_json file
  data_player_depth --> data_player_depth_team_sites_2025_json
```
