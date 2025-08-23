# Project Map — app/marketing/videos

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
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
