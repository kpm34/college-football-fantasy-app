# Project Map — data/player/processed

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  data_player_processed["data/player/processed/" ]
  class data_player_processed folder
  data_player_processed_depth["depth/"]
  class data_player_processed_depth folder
  data_player_processed --> data_player_processed_depth
  data_player_processed_efficiency["efficiency/"]
  class data_player_processed_efficiency folder
  data_player_processed --> data_player_processed_efficiency
```
