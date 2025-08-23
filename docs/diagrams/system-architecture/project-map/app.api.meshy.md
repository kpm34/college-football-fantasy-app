# Project Map — app/api/meshy

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  app_api_meshy["app/api/meshy/" ]
  class app_api_meshy folder
  app_api_meshy_jobs["jobs/"]
  class app_api_meshy_jobs folder
  app_api_meshy --> app_api_meshy_jobs
  app_api_meshy_webhook["webhook/"]
  class app_api_meshy_webhook folder
  app_api_meshy --> app_api_meshy_webhook
```
