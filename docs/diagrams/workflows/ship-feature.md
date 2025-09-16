---
slug: workflows:ship-feature
---

### Workflow — Ship a Feature (Backlog → Production)

```mermaid
flowchart TD
  subgraph Plan
    B([Backlog])
    R[Refine]
    P[Plan Sprint]
  end
  subgraph Build
    I[Implement]
    PR[Open PR]
    CI[CI Lint/Type/Test]
    REV[Review]
  end
  subgraph Release
    MERGE[Merge to main]
    PREV[Deploy Preview]
    PROD[Deploy Prod]
  end
  subgraph Observe
    MON[Monitor (Sentry/Vercel)]
    RPT[Report]
  end

  B --> R --> P --> I --> PR --> CI --> REV --> MERGE --> PREV --> PROD --> MON --> RPT
  CI --|fail|--> I
  REV --|changes|--> I
  MON --|incident|--> HOTFIX

  HOTFIX[[Hotfix Path]]
  HOTFIX --> I

  %% Lane colors
  classDef lanePlan fill:#E0F2FE,stroke:#0284C7,color:#0C4A6E
  classDef laneBuild fill:#ECFDF5,stroke:#10B981,color:#065F46
  classDef laneRelease fill:#FFFBEB,stroke:#F59E0B,color:#7C2D12
  classDef laneObserve fill:#F3E8FF,stroke:#8B5CF6,color:#4C1D95

  class B,R,P lanePlan
  class I,PR,CI,REV laneBuild
  class MERGE,PREV,PROD laneRelease
  class MON,RPT laneObserve

  %% Legend
  subgraph Legend
    L1[Plan]:::lanePlan
    L2[Build]:::laneBuild
    L3[Release]:::laneRelease
    L4[Observe]:::laneObserve
  end
```
