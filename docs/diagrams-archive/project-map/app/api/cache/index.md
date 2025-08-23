# Project Map — app/api/cache

```mermaid
flowchart TB
  classDef folder fill:#e0f2fe,stroke:#0284c7,stroke-width:2,color:#075985,rx:8,ry:8
  classDef file fill:#f0f9ff,stroke:#64748b,stroke-width:1,color:#334155,rx:4,ry:4
  app_api_cache["app/api/cache/" ]
  class app_api_cache folder
  app_api_cache_invalidate["invalidate/"]
  class app_api_cache_invalidate folder
  app_api_cache --> app_api_cache_invalidate
  app_api_cache_stats["stats/"]
  class app_api_cache_stats folder
  app_api_cache --> app_api_cache_stats
```
