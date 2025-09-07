# Project Map — app/api/cache

```mermaid
flowchart TB
  classDef folder fill:#fef3c7,stroke:#d97706,stroke-width:2,color:#451a03,rx:8,ry:8
  classDef file fill:#f0fdf4,stroke:#65a30d,stroke-width:1.5,color:#422006,rx:4,ry:4
  app_api_cache["app/api/cache/" ]
  class app_api_cache folder
  app_api_cache_invalidate["invalidate/"]
  class app_api_cache_invalidate folder
  app_api_cache --> app_api_cache_invalidate
  app_api_cache_stats["stats/"]
  class app_api_cache_stats folder
  app_api_cache --> app_api_cache_stats
```
