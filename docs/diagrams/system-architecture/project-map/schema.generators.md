# Project Map — schema/generators

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  schema_generators["schema/generators/" ]
  class schema_generators folder
  schema_generators_README_md["README.md"]
  class schema_generators_README_md file
  schema_generators --> schema_generators_README_md
  schema_generators_appwrite_ts["appwrite.ts"]
  class schema_generators_appwrite_ts file
  schema_generators --> schema_generators_appwrite_ts
  schema_generators_env_ts["env.ts"]
  class schema_generators_env_ts file
  schema_generators --> schema_generators_env_ts
  schema_generators_generate_appwrite_types_ts["generate-appwrite-types.ts"]
  class schema_generators_generate_appwrite_types_ts file
  schema_generators --> schema_generators_generate_appwrite_types_ts
  schema_generators_seed_appwrite_ts["seed-appwrite.ts"]
  class schema_generators_seed_appwrite_ts file
  schema_generators --> schema_generators_seed_appwrite_ts
  schema_generators_types_ts["types.ts"]
  class schema_generators_types_ts file
  schema_generators --> schema_generators_types_ts
```
