# Draft User Flow

Pre-draft:
- League setup → members join → draft scheduled

In-draft:
- Enter draft room → load state → subscribe realtime
- Turn UI: round/pick, time remaining, on-clock team
- Pick: validate → submit → realtime broadcast → advance

Post-draft:
- Results view → export board → roster management

Related: ../overview/draft.md

```mermaid
flowchart TB
  subgraph PreDraft
    L[League Setup] --> M[Members Join]
    M --> S[Draft Scheduled]
  end

  subgraph InDraft
    E[Enter Draft Room] --> C[Connect Realtime]
    C --> T[On-Clock Turn]
    T --> P[Pick Validation]
    P --> R[Realtime Broadcast]
  end

  subgraph PostDraft
    X[Results View] --> RO[Roster Management]
  end

  S --> E
  R --> T
  R --> X
```


