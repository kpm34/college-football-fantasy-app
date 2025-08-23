# Project Map — docs/diagrams/admin-tools

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  docs_diagrams_admin_tools["docs/diagrams/admin-tools/" ]
  class docs_diagrams_admin_tools folder
  docs_diagrams_admin_tools_admin_operations_md["admin-operations.md"]
  class docs_diagrams_admin_tools_admin_operations_md file
  docs_diagrams_admin_tools --> docs_diagrams_admin_tools_admin_operations_md
  docs_diagrams_admin_tools_commissioner_settings_md["commissioner-settings.md"]
  class docs_diagrams_admin_tools_commissioner_settings_md file
  docs_diagrams_admin_tools --> docs_diagrams_admin_tools_commissioner_settings_md
```
