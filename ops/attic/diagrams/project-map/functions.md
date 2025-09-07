# Project Map — functions

```mermaid
flowchart TB
  classDef folder fill:#fef3c7,stroke:#d97706,stroke-width:2,color:#451a03,rx:8,ry:8
  classDef file fill:#f0fdf4,stroke:#65a30d,stroke-width:1.5,color:#422006,rx:4,ry:4
  R["functions/"]
  class R folder
  functions_appwrite_["appwrite/"]
  class functions_appwrite_ folder
  R --> functions_appwrite_
  click functions_appwrite_ "/admin/project-map/functions/appwrite" "Open appwrite"
  functions_cron_["cron/"]
  class functions_cron_ folder
  R --> functions_cron_
  click functions_cron_ "/admin/project-map/functions/cron" "Open cron"
  functions_workers_["workers/"]
  class functions_workers_ folder
  R --> functions_workers_
  click functions_workers_ "/admin/project-map/functions/workers" "Open workers"
```
