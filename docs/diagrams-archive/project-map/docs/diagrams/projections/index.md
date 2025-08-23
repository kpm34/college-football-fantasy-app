# Project Map — docs/diagrams/projections

```mermaid
flowchart TB
  classDef folder fill:#e0f2fe,stroke:#0284c7,stroke-width:2,color:#075985,rx:8,ry:8
  classDef file fill:#f0f9ff,stroke:#64748b,stroke-width:1,color:#334155,rx:4,ry:4
  docs_diagrams_projections["docs/diagrams/projections/" ]
  class docs_diagrams_projections folder
  docs_diagrams_projections_api_flow_md["api-flow.md"]
  class docs_diagrams_projections_api_flow_md file
  docs_diagrams_projections --> docs_diagrams_projections_api_flow_md
  docs_diagrams_projections_data_sources_md["data-sources.md"]
  class docs_diagrams_projections_data_sources_md file
  docs_diagrams_projections --> docs_diagrams_projections_data_sources_md
  docs_diagrams_projections_depth_multipliers_md["depth-multipliers.md"]
  class docs_diagrams_projections_depth_multipliers_md file
  docs_diagrams_projections --> docs_diagrams_projections_depth_multipliers_md
  docs_diagrams_projections_projections_algorithm_md["projections-algorithm.md"]
  class docs_diagrams_projections_projections_algorithm_md file
  docs_diagrams_projections --> docs_diagrams_projections_projections_algorithm_md
  docs_diagrams_projections_projections_overview_md["projections-overview.md"]
  class docs_diagrams_projections_projections_overview_md file
  docs_diagrams_projections --> docs_diagrams_projections_projections_overview_md
  docs_diagrams_projections_troubleshooting_md["troubleshooting.md"]
  class docs_diagrams_projections_troubleshooting_md file
  docs_diagrams_projections --> docs_diagrams_projections_troubleshooting_md
```
