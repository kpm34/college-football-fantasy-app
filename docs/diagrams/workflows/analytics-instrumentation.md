---
slug: workflows:analytics-instrumentation
---

### Workflow — Event Instrumentation & Analytics

```mermaid
flowchart TD
  DEFINE[Define Events] --> SPEC[Spec & Naming]
  SPEC --> INSTR[Implement Tracking]
  INSTR --> QA[QA Events]
  QA --> DEPLOY[Deploy]
  DEPLOY --> DASH[Dashboards]
  DASH --> ITERATE[Iterate KPIs]
```
