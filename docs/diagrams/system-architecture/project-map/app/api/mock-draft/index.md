# Project Map — app/api/mock-draft

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  app_api_mock_draft["app/api/mock-draft/" ]
  class app_api_mock_draft folder
  app_api_mock_draft_create["create/"]
  class app_api_mock_draft_create folder
  app_api_mock_draft --> app_api_mock_draft_create
  app_api_mock_draft_join["join/"]
  class app_api_mock_draft_join folder
  app_api_mock_draft --> app_api_mock_draft_join
  app_api_mock_draft_pick["pick/"]
  class app_api_mock_draft_pick folder
  app_api_mock_draft --> app_api_mock_draft_pick
  app_api_mock_draft_results["results/"]
  class app_api_mock_draft_results folder
  app_api_mock_draft --> app_api_mock_draft_results
  app_api_mock_draft_start["start/"]
  class app_api_mock_draft_start folder
  app_api_mock_draft --> app_api_mock_draft_start
  app_api_mock_draft_turn["turn/"]
  class app_api_mock_draft_turn folder
  app_api_mock_draft --> app_api_mock_draft_turn
```
