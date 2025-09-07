# Project Map — app/admin

```mermaid
flowchart TB
  classDef folder fill:#fef3c7,stroke:#d97706,stroke-width:2,color:#451a03,rx:8,ry:8
  classDef file fill:#f0fdf4,stroke:#65a30d,stroke-width:1.5,color:#422006,rx:4,ry:4
  app_admin["app/admin/" ]
  class app_admin folder
  app_admin_cache_status["cache-status/"]
  class app_admin_cache_status folder
  app_admin --> app_admin_cache_status
  click app_admin_cache_status "/admin/project-map/app/admin/cache-status" "Open cache-status"
  app_admin_page_tsx["page.tsx"]
  class app_admin_page_tsx file
  app_admin --> app_admin_page_tsx
  app_admin_project_map["project-map/"]
  class app_admin_project_map folder
  app_admin --> app_admin_project_map
  click app_admin_project_map "/admin/project-map/app/admin/project-map" "Open project-map"
  app_admin_sec_survey["sec-survey/"]
  class app_admin_sec_survey folder
  app_admin --> app_admin_sec_survey
  click app_admin_sec_survey "/admin/project-map/app/admin/sec-survey" "Open sec-survey"
  app_admin_sync_status["sync-status/"]
  class app_admin_sync_status folder
  app_admin --> app_admin_sync_status
  click app_admin_sync_status "/admin/project-map/app/admin/sync-status" "Open sync-status"
```
