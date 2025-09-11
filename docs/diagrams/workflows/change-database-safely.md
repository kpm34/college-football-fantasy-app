---
slug: workflows:change-database-safely
---

### Workflow — Change the Database Safely (Backward‑compat + Canary)

```mermaid
flowchart TD
  PLAN[Plan migration] --> DESIGN[Design backward‑compatible change]
  DESIGN --> CANARY[Canary release]
  CANARY --> VERIFY[Verify canary]
  VERIFY --> ROLLALL[Roll out]
  ROLLALL --> CLEANUP[Clean up old paths]
  ROLLALL --> ROLLBACK{Errors?}
  ROLLBACK -- yes --> REVERT[Revert]
  ROLLBACK -- no --> DONE([Done])

  %% Lane colors (Plan/Deploy/Verify)
  classDef lanePlan fill:#E0F2FE,stroke:#0284C7,color:#0C4A6E
  classDef laneDeploy fill:#FFFBEB,stroke:#F59E0B,color:#7C2D12
  classDef laneVerify fill:#ECFDF5,stroke:#10B981,color:#065F46

  class PLAN,DESIGN lanePlan
  class CANARY,ROLLALL,CLEANUP laneDeploy
  class VERIFY,ROLLBACK,REVERT,DONE laneVerify

  %% Legend
  subgraph Legend
    L1[Plan]:::lanePlan
    L2[Deploy]:::laneDeploy
    L3[Verify]:::laneVerify
  end
```
