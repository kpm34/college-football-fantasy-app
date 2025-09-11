# Chapter: docs/

- Purpose: Documentation, diagrams, ADRs, guides.
- Usage: Keep developer-facing documents here; diagrams rendered via admin viewer.

```mermaid
graph LR
  classDef folder fill:#e5e7eb,stroke:#6b7280,color:#111827,rx:6,ry:6
  classDef docs fill:#6366f1,stroke:#4338ca,color:#ffffff,rx:6,ry:6

  subgraph DOCS[Docs/Design]
    D[docs/]:::folder --> D1[diagrams/]:::folder
    D --> D2[guides/]:::folder
    D --> D3[architecture-decision-records/]:::folder
  end
  class DOCS docs;
```
