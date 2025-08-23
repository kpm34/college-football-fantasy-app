# Project Map — app/api/migrations

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  app_api_migrations["app/api/migrations/" ]
  class app_api_migrations folder
  app_api_migrations_backfill_auth_users["backfill-auth-users/"]
  class app_api_migrations_backfill_auth_users folder
  app_api_migrations --> app_api_migrations_backfill_auth_users
  app_api_migrations_backfill_commissioner["backfill-commissioner/"]
  class app_api_migrations_backfill_commissioner folder
  app_api_migrations --> app_api_migrations_backfill_commissioner
  app_api_migrations_ensure_blender_jobs["ensure-blender-jobs/"]
  class app_api_migrations_ensure_blender_jobs folder
  app_api_migrations --> app_api_migrations_ensure_blender_jobs
  app_api_migrations_ensure_buckets["ensure-buckets/"]
  class app_api_migrations_ensure_buckets folder
  app_api_migrations --> app_api_migrations_ensure_buckets
  app_api_migrations_ensure_meshy_jobs["ensure-meshy-jobs/"]
  class app_api_migrations_ensure_meshy_jobs folder
  app_api_migrations --> app_api_migrations_ensure_meshy_jobs
```
