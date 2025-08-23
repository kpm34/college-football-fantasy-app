# Project Map — app/api/meshy

```mermaid
flowchart TB
  classDef folder fill:#fef3c7,stroke:#d97706,stroke-width:2,color:#451a03,rx:8,ry:8
  classDef file fill:#f0fdf4,stroke:#65a30d,stroke-width:1.5,color:#422006,rx:4,ry:4
  app_api_meshy["app/api/meshy/" ]
  class app_api_meshy folder
  app_api_meshy_jobs["jobs/"]
  class app_api_meshy_jobs folder
  app_api_meshy --> app_api_meshy_jobs
  app_api_meshy_webhook["webhook/"]
  class app_api_meshy_webhook folder
  app_api_meshy --> app_api_meshy_webhook
```
