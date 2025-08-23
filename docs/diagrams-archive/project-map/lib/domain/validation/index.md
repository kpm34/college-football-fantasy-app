# Project Map — lib/domain/validation

```mermaid
flowchart TB
  classDef folder fill:#e0f2fe,stroke:#0284c7,stroke-width:2,color:#075985,rx:8,ry:8
  classDef file fill:#f0f9ff,stroke:#64748b,stroke-width:1,color:#334155,rx:4,ry:4
  lib_domain_validation["lib/domain/validation/" ]
  class lib_domain_validation folder
  lib_domain_validation_schema_enforcer_ts["schema-enforcer.ts"]
  class lib_domain_validation_schema_enforcer_ts file
  lib_domain_validation --> lib_domain_validation_schema_enforcer_ts
```
