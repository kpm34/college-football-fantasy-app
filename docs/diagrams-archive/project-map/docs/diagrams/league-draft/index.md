# Project Map — docs/diagrams/league-draft

```mermaid
flowchart TB
  classDef folder fill:#e0f2fe,stroke:#0284c7,stroke-width:2,color:#075985,rx:8,ry:8
  classDef file fill:#f0f9ff,stroke:#64748b,stroke-width:1,color:#334155,rx:4,ry:4
  docs_diagrams_league_draft["docs/diagrams/league-draft/" ]
  class docs_diagrams_league_draft folder
  docs_diagrams_league_draft_draft_realtime_md["draft-realtime.md"]
  class docs_diagrams_league_draft_draft_realtime_md file
  docs_diagrams_league_draft --> docs_diagrams_league_draft_draft_realtime_md
  docs_diagrams_league_draft_league_management_md["league-management.md"]
  class docs_diagrams_league_draft_league_management_md file
  docs_diagrams_league_draft --> docs_diagrams_league_draft_league_management_md
  docs_diagrams_league_draft_search_filter_flow_md["search-filter-flow.md"]
  class docs_diagrams_league_draft_search_filter_flow_md file
  docs_diagrams_league_draft --> docs_diagrams_league_draft_search_filter_flow_md
```
