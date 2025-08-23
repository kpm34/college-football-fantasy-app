# Project Map — app/api/docs

```mermaid
flowchart TB
  classDef folder fill:#fef3c7,stroke:#d97706,stroke-width:2,color:#451a03,rx:8,ry:8
  classDef file fill:#f0fdf4,stroke:#65a30d,stroke-width:1.5,color:#422006,rx:4,ry:4
  app_api_docs["app/api/docs/" ]
  class app_api_docs folder
  app_api_docs_mermaid["mermaid/"]
  class app_api_docs_mermaid folder
  app_api_docs --> app_api_docs_mermaid
```
