# Project Map — functions/cron

```mermaid
flowchart TB
  classDef folder fill:#e0f2fe,stroke:#0284c7,stroke-width:2,color:#075985,rx:8,ry:8
  classDef file fill:#f0f9ff,stroke:#64748b,stroke-width:1,color:#334155,rx:4,ry:4
  functions_cron["functions/cron/" ]
  class functions_cron folder
  functions_cron_nightly_projections_ts["nightly-projections.ts"]
  class functions_cron_nightly_projections_ts file
  functions_cron --> functions_cron_nightly_projections_ts
  functions_cron_weekly_reset_ts["weekly-reset.ts"]
  class functions_cron_weekly_reset_ts file
  functions_cron --> functions_cron_weekly_reset_ts
```
