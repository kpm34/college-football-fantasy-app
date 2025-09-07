# Projections APIs & Events

APIs:
- POST /api/projections/run (admin)
- GET /api/(frontend)/draft/players (consume projections)

Events:
- projection_run_started, projection_run_finished

Related: ../overview/projections.md

```mermaid
sequenceDiagram
  participant Admin
  participant API as Projections API
  participant DB as Appwrite

  Admin->>API: POST /api/projections/run
  API->>DB: create model_runs
  API->>DB: write projections
  API-->>Admin: run id + status
```


