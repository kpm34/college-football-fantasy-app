# Project Map — app/admin/project-map

```mermaid
flowchart TB
  classDef folder fill:#e0f2fe,stroke:#0284c7,stroke-width:2,color:#075985,rx:8,ry:8
  classDef file fill:#f0f9ff,stroke:#64748b,stroke-width:1,color:#334155,rx:4,ry:4
  app_admin_project_map["app/admin/project-map/" ]
  class app_admin_project_map folder
  app_admin_project_map__root_["[root]/"]
  class app_admin_project_map__root_ folder
  app_admin_project_map --> app_admin_project_map__root_
  app_admin_project_map_app["app/"]
  class app_admin_project_map_app folder
  app_admin_project_map --> app_admin_project_map_app
  app_admin_project_map_page_tsx["page.tsx"]
  class app_admin_project_map_page_tsx file
  app_admin_project_map --> app_admin_project_map_page_tsx
```
