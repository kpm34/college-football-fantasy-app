# Project Map — app/api/conferences

```mermaid
flowchart TB
  classDef folder fill:#e0f2fe,stroke:#0284c7,stroke-width:2,color:#075985,rx:8,ry:8
  classDef file fill:#f0f9ff,stroke:#64748b,stroke-width:1,color:#334155,rx:4,ry:4
  app_api_conferences["app/api/conferences/" ]
  class app_api_conferences folder
  app_api_conferences__conference_["[conference]/"]
  class app_api_conferences__conference_ folder
  app_api_conferences --> app_api_conferences__conference_
```
