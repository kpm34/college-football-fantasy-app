# Project Map — data/player/processed

```mermaid
flowchart TB
  classDef folder fill:#e0f2fe,stroke:#0284c7,stroke-width:2,color:#075985,rx:8,ry:8
  classDef file fill:#f0f9ff,stroke:#64748b,stroke-width:1,color:#334155,rx:4,ry:4
  data_player_processed["data/player/processed/" ]
  class data_player_processed folder
  data_player_processed_depth["depth/"]
  class data_player_processed_depth folder
  data_player_processed --> data_player_processed_depth
  data_player_processed_efficiency["efficiency/"]
  class data_player_processed_efficiency folder
  data_player_processed --> data_player_processed_efficiency
```
