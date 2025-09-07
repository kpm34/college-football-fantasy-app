# Project Map — ops/common/functions

```mermaid
flowchart TB
  classDef folder fill:#fef3c7,stroke:#d97706,stroke-width:2,color:#451a03,rx:8,ry:8
  classDef file fill:#f0fdf4,stroke:#65a30d,stroke-width:1.5,color:#422006,rx:4,ry:4
  ops_common_functions["ops/common/functions/" ]
  class ops_common_functions folder
  ops_common_functions_draft_reminder["draft-reminder/"]
  class ops_common_functions_draft_reminder folder
  ops_common_functions --> ops_common_functions_draft_reminder
  ops_common_functions_pipeline["pipeline/"]
  class ops_common_functions_pipeline folder
  ops_common_functions --> ops_common_functions_pipeline
```
