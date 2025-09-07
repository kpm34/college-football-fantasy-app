# Project Map — app/marketing/login

```mermaid
flowchart TB
  classDef folder fill:#fef3c7,stroke:#d97706,stroke-width:2,color:#451a03,rx:8,ry:8
  classDef file fill:#f0fdf4,stroke:#65a30d,stroke-width:1.5,color:#422006,rx:4,ry:4
  app_marketing_login["app/marketing/login/" ]
  class app_marketing_login folder
  app_marketing_login_oauth_success["oauth-success/"]
  class app_marketing_login_oauth_success folder
  app_marketing_login --> app_marketing_login_oauth_success
  app_marketing_login_page_tsx["page.tsx"]
  class app_marketing_login_page_tsx file
  app_marketing_login --> app_marketing_login_page_tsx
```
