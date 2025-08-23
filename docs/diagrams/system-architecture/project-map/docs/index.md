# Project Map — docs

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  R["docs/"]
  class R folder
  docs_adr_["adr/"]
  class docs_adr_ folder
  R --> docs_adr_
  click docs_adr_ "/admin/project-map/docs/adr" "Open adr"
  docs_diagrams_["diagrams/"]
  class docs_diagrams_ folder
  R --> docs_diagrams_
  click docs_diagrams_ "/admin/project-map/docs/diagrams" "Open diagrams"
  docs_draft_["draft/"]
  class docs_draft_ folder
  R --> docs_draft_
  click docs_draft_ "/admin/project-map/docs/draft" "Open draft"
  docs_guardrails_["guardrails/"]
  class docs_guardrails_ folder
  R --> docs_guardrails_
  click docs_guardrails_ "/admin/project-map/docs/guardrails" "Open guardrails"
  docs_guides_["guides/"]
  class docs_guides_ folder
  R --> docs_guides_
  click docs_guides_ "/admin/project-map/docs/guides" "Open guides"
  docs_reference_["reference/"]
  class docs_reference_ folder
  R --> docs_reference_
  click docs_reference_ "/admin/project-map/docs/reference" "Open reference"
  docs_runbooks_["runbooks/"]
  class docs_runbooks_ folder
  R --> docs_runbooks_
  click docs_runbooks_ "/admin/project-map/docs/runbooks" "Open runbooks"
```
