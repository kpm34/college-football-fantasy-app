# Project Map — app/marketing

```mermaid
flowchart TB
  classDef folder fill:#e0f2fe,stroke:#0284c7,stroke-width:2,color:#075985,rx:8,ry:8
  classDef file fill:#f0f9ff,stroke:#64748b,stroke-width:1,color:#334155,rx:4,ry:4
  app_marketing["app/marketing/" ]
  class app_marketing folder
  app_marketing_conference_showcase["conference-showcase/"]
  class app_marketing_conference_showcase folder
  app_marketing --> app_marketing_conference_showcase
  click app_marketing_conference_showcase "/admin/project-map/app/marketing/conference-showcase" "Open conference-showcase"
  app_marketing_invite["invite/"]
  class app_marketing_invite folder
  app_marketing --> app_marketing_invite
  click app_marketing_invite "/admin/project-map/app/marketing/invite" "Open invite"
  app_marketing_launch["launch/"]
  class app_marketing_launch folder
  app_marketing --> app_marketing_launch
  click app_marketing_launch "/admin/project-map/app/marketing/launch" "Open launch"
  app_marketing_login["login/"]
  class app_marketing_login folder
  app_marketing --> app_marketing_login
  click app_marketing_login "/admin/project-map/app/marketing/login" "Open login"
  app_marketing_offline["offline/"]
  class app_marketing_offline folder
  app_marketing --> app_marketing_offline
  click app_marketing_offline "/admin/project-map/app/marketing/offline" "Open offline"
  app_marketing_page_tsx["page.tsx"]
  class app_marketing_page_tsx file
  app_marketing --> app_marketing_page_tsx
  app_marketing_projection_showcase["projection-showcase/"]
  class app_marketing_projection_showcase folder
  app_marketing --> app_marketing_projection_showcase
  click app_marketing_projection_showcase "/admin/project-map/app/marketing/projection-showcase" "Open projection-showcase"
  app_marketing_signup["signup/"]
  class app_marketing_signup folder
  app_marketing --> app_marketing_signup
  click app_marketing_signup "/admin/project-map/app/marketing/signup" "Open signup"
  app_marketing_videos["videos/"]
  class app_marketing_videos folder
  app_marketing --> app_marketing_videos
  click app_marketing_videos "/admin/project-map/app/marketing/videos" "Open videos"
```
