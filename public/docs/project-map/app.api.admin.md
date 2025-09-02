# Project Map — app/api/admin

```mermaid
flowchart TB
  classDef folder fill:#fef3c7,stroke:#d97706,stroke-width:2,color:#451a03,rx:8,ry:8
  classDef file fill:#f0fdf4,stroke:#65a30d,stroke-width:1.5,color:#422006,rx:4,ry:4
  app_api_admin["app/api/admin/" ]
  class app_api_admin folder
  app_api_admin_dedupe["dedupe/"]
  class app_api_admin_dedupe folder
  app_api_admin --> app_api_admin_dedupe
  app_api_admin_leagues["leagues/"]
  class app_api_admin_leagues folder
  app_api_admin --> app_api_admin_leagues
  app_api_admin_model_inputs["model-inputs/"]
  class app_api_admin_model_inputs folder
  app_api_admin --> app_api_admin_model_inputs
  app_api_admin_pipeline_status["pipeline-status/"]
  class app_api_admin_pipeline_status folder
  app_api_admin --> app_api_admin_pipeline_status
  app_api_admin_players["players/"]
  class app_api_admin_players folder
  app_api_admin --> app_api_admin_players
  app_api_admin_route_ts["route.ts"]
  class app_api_admin_route_ts file
  app_api_admin --> app_api_admin_route_ts
  app_api_admin_users["users/"]
  class app_api_admin_users folder
  app_api_admin --> app_api_admin_users
```
