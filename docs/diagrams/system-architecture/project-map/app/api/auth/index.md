# Project Map — app/api/auth

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  app_api_auth["app/api/auth/" ]
  class app_api_auth folder
  app_api_auth_login["login/"]
  class app_api_auth_login folder
  app_api_auth --> app_api_auth_login
  app_api_auth_logout["logout/"]
  class app_api_auth_logout folder
  app_api_auth --> app_api_auth_logout
  app_api_auth_oauth["oauth/"]
  class app_api_auth_oauth folder
  app_api_auth --> app_api_auth_oauth
  app_api_auth_signup["signup/"]
  class app_api_auth_signup folder
  app_api_auth --> app_api_auth_signup
  app_api_auth_sync_oauth["sync-oauth/"]
  class app_api_auth_sync_oauth folder
  app_api_auth --> app_api_auth_sync_oauth
  app_api_auth_update_profile["update-profile/"]
  class app_api_auth_update_profile folder
  app_api_auth --> app_api_auth_update_profile
  app_api_auth_user["user/"]
  class app_api_auth_user folder
  app_api_auth --> app_api_auth_user
```
