# Project Map — ops/common/functions

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  ops_common_functions["ops/common/functions/" ]
  class ops_common_functions folder
  ops_common_functions_draft_reminder["draft-reminder/"]
  class ops_common_functions_draft_reminder folder
  ops_common_functions --> ops_common_functions_draft_reminder
  ops_common_functions_pipeline["pipeline/"]
  class ops_common_functions_pipeline folder
  ops_common_functions --> ops_common_functions_pipeline
```
