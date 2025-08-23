# Project Map — app/marketing/videos

```mermaid
flowchart TB
  classDef folder fill:#e0f2fe,stroke:#0284c7,stroke-width:2,color:#075985,rx:8,ry:8
  classDef file fill:#f0f9ff,stroke:#64748b,stroke-width:1,color:#334155,rx:4,ry:4
  app_marketing_videos["app/marketing/videos/" ]
  class app_marketing_videos folder
  app_marketing_videos__program_["[program]/"]
  class app_marketing_videos__program_ folder
  app_marketing_videos --> app_marketing_videos__program_
  app_marketing_videos_guide["guide/"]
  class app_marketing_videos_guide folder
  app_marketing_videos --> app_marketing_videos_guide
  app_marketing_videos_page_tsx["page.tsx"]
  class app_marketing_videos_page_tsx file
  app_marketing_videos --> app_marketing_videos_page_tsx
```
