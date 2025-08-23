# Project Map — app/marketing/login

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  app_marketing_login["app/marketing/login/" ]
  class app_marketing_login folder
  app_marketing_login_oauth_success["oauth-success/"]
  class app_marketing_login_oauth_success folder
  app_marketing_login --> app_marketing_login_oauth_success
  app_marketing_login_page_tsx["page.tsx"]
  class app_marketing_login_page_tsx file
  app_marketing_login --> app_marketing_login_page_tsx
```
