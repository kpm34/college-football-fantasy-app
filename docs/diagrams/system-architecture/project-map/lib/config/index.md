# Project Map — lib/config

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  lib_config["lib/config/" ]
  class lib_config folder
  lib_config_config["config/"]
  class lib_config_config folder
  lib_config --> lib_config_config
  click lib_config_config "/admin/project-map/lib/config/config" "Open config"
  lib_config_environment_ts["environment.ts"]
  class lib_config_environment_ts file
  lib_config --> lib_config_environment_ts
  lib_config_middleware_config_ts["middleware.config.ts"]
  class lib_config_middleware_config_ts file
  lib_config --> lib_config_middleware_config_ts
  lib_config_sentry_config_ts["sentry.config.ts"]
  class lib_config_sentry_config_ts file
  lib_config --> lib_config_sentry_config_ts
```
