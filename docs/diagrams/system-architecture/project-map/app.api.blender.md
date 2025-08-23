# Project Map — app/api/blender

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  app_api_blender["app/api/blender/" ]
  class app_api_blender folder
  app_api_blender_exports["exports/"]
  class app_api_blender_exports folder
  app_api_blender --> app_api_blender_exports
  app_api_blender_file["file/"]
  class app_api_blender_file folder
  app_api_blender --> app_api_blender_file
  app_api_blender_jobs["jobs/"]
  class app_api_blender_jobs folder
  app_api_blender --> app_api_blender_jobs
  app_api_blender_schema_md["schema.md"]
  class app_api_blender_schema_md file
  app_api_blender --> app_api_blender_schema_md
  app_api_blender_upload["upload/"]
  class app_api_blender_upload folder
  app_api_blender --> app_api_blender_upload
```
