# Project Map — ops/attic/core-remaining

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  ops_attic_core_remaining["ops/attic/core-remaining/" ]
  class ops_attic_core_remaining folder
  ops_attic_core_remaining_data_ingestion["data-ingestion/"]
  class ops_attic_core_remaining_data_ingestion folder
  ops_attic_core_remaining --> ops_attic_core_remaining_data_ingestion
  ops_attic_core_remaining_errors["errors/"]
  class ops_attic_core_remaining_errors folder
  ops_attic_core_remaining --> ops_attic_core_remaining_errors
  ops_attic_core_remaining_helpers["helpers/"]
  class ops_attic_core_remaining_helpers folder
  ops_attic_core_remaining --> ops_attic_core_remaining_helpers
  ops_attic_core_remaining_log_ts["log.ts"]
  class ops_attic_core_remaining_log_ts file
  ops_attic_core_remaining --> ops_attic_core_remaining_log_ts
  ops_attic_core_remaining_pipeline["pipeline/"]
  class ops_attic_core_remaining_pipeline folder
  ops_attic_core_remaining --> ops_attic_core_remaining_pipeline
  ops_attic_core_remaining_validation["validation/"]
  class ops_attic_core_remaining_validation folder
  ops_attic_core_remaining --> ops_attic_core_remaining_validation
```
