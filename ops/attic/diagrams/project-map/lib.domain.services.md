# Project Map — lib/domain/services

```mermaid
flowchart TB
  classDef folder fill:#fef3c7,stroke:#d97706,stroke-width:2,color:#451a03,rx:8,ry:8
  classDef file fill:#f0fdf4,stroke:#65a30d,stroke-width:1.5,color:#422006,rx:4,ry:4
  lib_domain_services["lib/domain/services/" ]
  class lib_domain_services folder
  lib_domain_services_auth_service_ts["auth.service.ts"]
  class lib_domain_services_auth_service_ts file
  lib_domain_services --> lib_domain_services_auth_service_ts
```
