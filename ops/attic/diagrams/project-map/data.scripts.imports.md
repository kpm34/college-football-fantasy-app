# Project Map — data/scripts/imports

```mermaid
flowchart TB
  classDef folder fill:#fef3c7,stroke:#d97706,stroke-width:2,color:#451a03,rx:8,ry:8
  classDef file fill:#f0fdf4,stroke:#65a30d,stroke-width:1.5,color:#422006,rx:4,ry:4
  data_scripts_imports["data/scripts/imports/" ]
  class data_scripts_imports folder
  data_scripts_imports_2026_consensus["2026-consensus/"]
  class data_scripts_imports_2026_consensus folder
  data_scripts_imports --> data_scripts_imports_2026_consensus
  data_scripts_imports__backup_ea_20250820_210604["_backup_ea_20250820_210604/"]
  class data_scripts_imports__backup_ea_20250820_210604 folder
  data_scripts_imports --> data_scripts_imports__backup_ea_20250820_210604
  data_scripts_imports_build_2026_consensus_real_py["build_2026_consensus_real.py"]
  class data_scripts_imports_build_2026_consensus_real_py file
  data_scripts_imports --> data_scripts_imports_build_2026_consensus_real_py
  data_scripts_imports_depth_charts_2025["depth-charts-2025/"]
  class data_scripts_imports_depth_charts_2025 folder
  data_scripts_imports --> data_scripts_imports_depth_charts_2025
  data_scripts_imports_ea["ea/"]
  class data_scripts_imports_ea folder
  data_scripts_imports --> data_scripts_imports_ea
  data_scripts_imports_manual_overrides_2025_json["manual_overrides_2025.json"]
  class data_scripts_imports_manual_overrides_2025_json file
  data_scripts_imports --> data_scripts_imports_manual_overrides_2025_json
```
