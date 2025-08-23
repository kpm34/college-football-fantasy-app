# Project Map — data/scripts/testing

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  data_scripts_testing["data/scripts/testing/" ]
  class data_scripts_testing folder
  data_scripts_testing_validation_py["validation.py"]
  class data_scripts_testing_validation_py file
  data_scripts_testing --> data_scripts_testing_validation_py
```
