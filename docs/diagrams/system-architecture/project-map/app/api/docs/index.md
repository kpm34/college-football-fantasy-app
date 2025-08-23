# Project Map — app/api/docs

```mermaid
flowchart TB
  classDef folder fill:#0b2942,stroke:#60a5fa,stroke-width:1.2,color:#e5f2ff,rx:6,ry:6
  classDef file fill:#111827,stroke:#9ca3af,stroke-width:1,color:#f3f4f6,rx:4,ry:4
  app_api_docs["app/api/docs/" ]
  class app_api_docs folder
  app_api_docs_mermaid["mermaid/"]
  class app_api_docs_mermaid folder
  app_api_docs --> app_api_docs_mermaid
```
