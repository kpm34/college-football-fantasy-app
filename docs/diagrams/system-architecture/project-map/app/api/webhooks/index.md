# Project Map — app/api/webhooks

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  app_api_webhooks["app/api/webhooks/" ]
  class app_api_webhooks folder
  app_api_webhooks_appwrite["appwrite/"]
  class app_api_webhooks_appwrite folder
  app_api_webhooks --> app_api_webhooks_appwrite
  app_api_webhooks_deployment_sync["deployment-sync/"]
  class app_api_webhooks_deployment_sync folder
  app_api_webhooks --> app_api_webhooks_deployment_sync
```
