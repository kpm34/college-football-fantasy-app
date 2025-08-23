# Project Map — app/api/webhooks

```mermaid
flowchart TB
  classDef folder fill:#e0f2fe,stroke:#0284c7,stroke-width:2,color:#075985,rx:8,ry:8
  classDef file fill:#f0f9ff,stroke:#64748b,stroke-width:1,color:#334155,rx:4,ry:4
  app_api_webhooks["app/api/webhooks/" ]
  class app_api_webhooks folder
  app_api_webhooks_appwrite["appwrite/"]
  class app_api_webhooks_appwrite folder
  app_api_webhooks --> app_api_webhooks_appwrite
  app_api_webhooks_deployment_sync["deployment-sync/"]
  class app_api_webhooks_deployment_sync folder
  app_api_webhooks --> app_api_webhooks_deployment_sync
```
