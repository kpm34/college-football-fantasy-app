# Project Map — docs/diagrams/system-architecture

```mermaid
flowchart TB
  classDef folder fill:#fef3c7,stroke:#d97706,stroke-width:2,color:#451a03,rx:8,ry:8
  classDef file fill:#f0fdf4,stroke:#65a30d,stroke-width:1.5,color:#422006,rx:4,ry:4
  docs_diagrams_system_architecture["docs/diagrams/system-architecture/" ]
  class docs_diagrams_system_architecture folder
  docs_diagrams_system_architecture_authentication_flow_md["authentication-flow.md"]
  class docs_diagrams_system_architecture_authentication_flow_md file
  docs_diagrams_system_architecture --> docs_diagrams_system_architecture_authentication_flow_md
  docs_diagrams_system_architecture_complete_data_flow_md["complete-data-flow.md"]
  class docs_diagrams_system_architecture_complete_data_flow_md file
  docs_diagrams_system_architecture --> docs_diagrams_system_architecture_complete_data_flow_md
  docs_diagrams_system_architecture_project_map["project-map/"]
  class docs_diagrams_system_architecture_project_map folder
  docs_diagrams_system_architecture --> docs_diagrams_system_architecture_project_map
  docs_diagrams_system_architecture_system_architecture_md["system-architecture.md"]
  class docs_diagrams_system_architecture_system_architecture_md file
  docs_diagrams_system_architecture --> docs_diagrams_system_architecture_system_architecture_md
```
