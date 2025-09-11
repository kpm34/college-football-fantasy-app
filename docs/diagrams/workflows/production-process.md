---
slug: workflows:production-process
---

### Workflow — Production Process (Backlog → Prod)

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
  CI -- fail --> I
  REV -- changes --> I
  MON -- incident --> HOTFIX

  HOTFIX[[Hotfix Path]]
  HOTFIX --> I
```
