# Project Map — app/draft/draft

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  app_draft_draft["app/draft/draft/" ]
  class app_draft_draft folder
  app_draft_draft__leagueId_["[leagueId]/"]
  class app_draft_draft__leagueId_ folder
  app_draft_draft --> app_draft_draft__leagueId_
  app_draft_draft_mock["mock/"]
  class app_draft_draft_mock folder
  app_draft_draft --> app_draft_draft_mock
```
