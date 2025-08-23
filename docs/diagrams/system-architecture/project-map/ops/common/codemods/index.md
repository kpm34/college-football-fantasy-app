# Project Map — ops/common/codemods

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  ops_common_codemods["ops/common/codemods/" ]
  class ops_common_codemods folder
  ops_common_codemods_rename_imports_js["rename-imports.js"]
  class ops_common_codemods_rename_imports_js file
  ops_common_codemods --> ops_common_codemods_rename_imports_js
  ops_common_codemods_reorg_app_structure_ts["reorg-app-structure.ts"]
  class ops_common_codemods_reorg_app_structure_ts file
  ops_common_codemods --> ops_common_codemods_reorg_app_structure_ts
```
