# Project Map — ops/common/codemods

```mermaid
flowchart TB
  classDef folder fill:#e0f2fe,stroke:#0284c7,stroke-width:2,color:#075985,rx:8,ry:8
  classDef file fill:#f0f9ff,stroke:#64748b,stroke-width:1,color:#334155,rx:4,ry:4
  ops_common_codemods["ops/common/codemods/" ]
  class ops_common_codemods folder
  ops_common_codemods_rename_imports_js["rename-imports.js"]
  class ops_common_codemods_rename_imports_js file
  ops_common_codemods --> ops_common_codemods_rename_imports_js
  ops_common_codemods_reorg_app_structure_ts["reorg-app-structure.ts"]
  class ops_common_codemods_reorg_app_structure_ts file
  ops_common_codemods --> ops_common_codemods_reorg_app_structure_ts
```
