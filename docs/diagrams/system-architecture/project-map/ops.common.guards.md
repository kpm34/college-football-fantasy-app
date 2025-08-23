# Project Map — ops/common/guards

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  ops_common_guards["ops/common/guards/" ]
  class ops_common_guards folder
  ops_common_guards_detect_schema_drift_basic_ts["detect-schema-drift.basic.ts"]
  class ops_common_guards_detect_schema_drift_basic_ts file
  ops_common_guards --> ops_common_guards_detect_schema_drift_basic_ts
  ops_common_guards_detect_schema_drift_ts["detect-schema-drift.ts"]
  class ops_common_guards_detect_schema_drift_ts file
  ops_common_guards --> ops_common_guards_detect_schema_drift_ts
  ops_common_guards_diff_ssot_vs_appwrite_ts["diff-ssot-vs-appwrite.ts"]
  class ops_common_guards_diff_ssot_vs_appwrite_ts file
  ops_common_guards --> ops_common_guards_diff_ssot_vs_appwrite_ts
  ops_common_guards_forbid_legacy_collections_ts["forbid-legacy-collections.ts"]
  class ops_common_guards_forbid_legacy_collections_ts file
  ops_common_guards --> ops_common_guards_forbid_legacy_collections_ts
  ops_common_guards_forbid_test_pages_ts["forbid-test-pages.ts"]
  class ops_common_guards_forbid_test_pages_ts file
  ops_common_guards --> ops_common_guards_forbid_test_pages_ts
  ops_common_guards_validate_ssot_integrity_basic_ts["validate-ssot-integrity.basic.ts"]
  class ops_common_guards_validate_ssot_integrity_basic_ts file
  ops_common_guards --> ops_common_guards_validate_ssot_integrity_basic_ts
  ops_common_guards_validate_ssot_integrity_ts["validate-ssot-integrity.ts"]
  class ops_common_guards_validate_ssot_integrity_ts file
  ops_common_guards --> ops_common_guards_validate_ssot_integrity_ts
```
