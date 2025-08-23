# Project Map — docs/diagrams

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  docs_diagrams["docs/diagrams/" ]
  class docs_diagrams folder
  docs_diagrams_SYSTEM_MAP_md["SYSTEM_MAP.md"]
  class docs_diagrams_SYSTEM_MAP_md file
  docs_diagrams --> docs_diagrams_SYSTEM_MAP_md
  docs_diagrams_admin_tools["admin-tools/"]
  class docs_diagrams_admin_tools folder
  docs_diagrams --> docs_diagrams_admin_tools
  click docs_diagrams_admin_tools "/admin/project-map/docs/diagrams/admin-tools" "Open admin-tools"
  docs_diagrams_app_structure_md["app-structure.md"]
  class docs_diagrams_app_structure_md file
  docs_diagrams --> docs_diagrams_app_structure_md
  docs_diagrams_league_draft["league-draft/"]
  class docs_diagrams_league_draft folder
  docs_diagrams --> docs_diagrams_league_draft
  click docs_diagrams_league_draft "/admin/project-map/docs/diagrams/league-draft" "Open league-draft"
  docs_diagrams_projections["projections/"]
  class docs_diagrams_projections folder
  docs_diagrams --> docs_diagrams_projections
  click docs_diagrams_projections "/admin/project-map/docs/diagrams/projections" "Open projections"
  docs_diagrams_system_architecture["system-architecture/"]
  class docs_diagrams_system_architecture folder
  docs_diagrams --> docs_diagrams_system_architecture
  click docs_diagrams_system_architecture "/admin/project-map/docs/diagrams/system-architecture" "Open system-architecture"
```
