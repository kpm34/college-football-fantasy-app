# Project Map — lib/domain/validation

```mermaid
flowchart TB
  classDef folder fill:#fef3c7,stroke:#d97706,stroke-width:2,color:#451a03,rx:8,ry:8
  classDef file fill:#f0fdf4,stroke:#65a30d,stroke-width:1.5,color:#422006,rx:4,ry:4
  lib_domain_validation["lib/domain/validation/" ]
  class lib_domain_validation folder
  lib_domain_validation_schema_enforcer_ts["schema-enforcer.ts"]
  class lib_domain_validation_schema_enforcer_ts file
  lib_domain_validation --> lib_domain_validation_schema_enforcer_ts
```
