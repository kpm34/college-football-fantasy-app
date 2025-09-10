# Projections User Flow

Admin:
- Trigger projection run → monitor status → review outputs

User:
- Browse player projections → filter/sort → use in draft/rankings

Related: ../overview/projections.md

```mermaid
flowchart LR
  A[Admin Triggers Run] --> R[(model_runs)]
  R --> P[(projections)]
  P --> UI[Draft/Rankings UI]
```


