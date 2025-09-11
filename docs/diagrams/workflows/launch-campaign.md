---
slug: workflows:launch-campaign
---

### Workflow — Launch a Campaign (Content Pipeline)

```mermaid
flowchart TD
  PLAN[Plan Campaign] --> ASSETS[Create Assets]
  ASSETS --> SCHEDULE[Schedule Posts]
  SCHEDULE --> RELEASE[Release]
  RELEASE --> METRICS[Collect Metrics]
  METRICS --> OPTIMIZE[Optimize]
```
