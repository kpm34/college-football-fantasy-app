# Project Map — data/player

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  data_player["data/player/" ]
  class data_player folder
  data_player_depth["depth/"]
  class data_player_depth folder
  data_player --> data_player_depth
  click data_player_depth "/admin/project-map/data/player/depth" "Open depth"
  data_player_ea["ea/"]
  class data_player_ea folder
  data_player --> data_player_ea
  click data_player_ea "/admin/project-map/data/player/ea" "Open ea"
  data_player_processed["processed/"]
  class data_player_processed folder
  data_player --> data_player_processed
  click data_player_processed "/admin/project-map/data/player/processed" "Open processed"
  data_player_raw["raw/"]
  class data_player_raw folder
  data_player --> data_player_raw
  click data_player_raw "/admin/project-map/data/player/raw" "Open raw"
```
