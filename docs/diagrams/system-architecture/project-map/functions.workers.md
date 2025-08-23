# Project Map — functions/workers

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  functions_workers["functions/workers/" ]
  class functions_workers folder
  functions_workers_Dockerfile["Dockerfile"]
  class functions_workers_Dockerfile file
  functions_workers --> functions_workers_Dockerfile
  functions_workers_live_worker_py["live_worker.py"]
  class functions_workers_live_worker_py file
  functions_workers --> functions_workers_live_worker_py
  functions_workers_recalc_projections_ts["recalc-projections.ts"]
  class functions_workers_recalc_projections_ts file
  functions_workers --> functions_workers_recalc_projections_ts
  functions_workers_requirements_txt["requirements.txt"]
  class functions_workers_requirements_txt file
  functions_workers --> functions_workers_requirements_txt
  functions_workers_sync_college_data_ts["sync-college-data.ts"]
  class functions_workers_sync_college_data_ts file
  functions_workers --> functions_workers_sync_college_data_ts
```
