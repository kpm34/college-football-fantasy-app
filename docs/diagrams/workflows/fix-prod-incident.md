---
slug: workflows:fix-prod-incident
---

### Workflow — Fix a Production Incident

```mermaid
flowchart TD
  DETECT([Detect Incident]) --> TRIAGE{Severity?}
  TRIAGE -- Critical --> PAGE[Page On‑call]
  TRIAGE -- Degraded --> ACK[Acknowledge]
  PAGE --> MITIGATE[Mitigate/Rollback]
  ACK --> MITIGATE
  MITIGATE --> FIX[Patch/Fix]
  FIX --> VERIFY[Verify in Prod]
  VERIFY --> POST[Postmortem]
  POST --> IMPROVE[Action Items]
```
