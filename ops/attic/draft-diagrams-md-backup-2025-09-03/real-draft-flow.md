# Real Draft Flow (League Season)

> Official league draft with scheduled timing and season commitments.

```mermaid
graph TD
  classDef pre fill:#dbeafe,stroke:#1e3a8a,color:#0f172a,rx:6,ry:6
  classDef live fill:#fbbf24,stroke:#b45309,color:#111827,rx:6,ry:6
  classDef commit fill:#10b981,stroke:#065f46,color:#06221b,rx:6,ry:6
  classDef warn fill:#fee2e2,stroke:#dc2626,color:#7f1d1d,rx:6,ry:6
  classDef step fill:#111827,stroke:#374151,color:#e5e7eb,rx:6,ry:6

  A[Scheduled Draft Time]:::pre --> B{Check Current Time}
  B -->|T-60min| C[Draft Room Opens]:::pre
  C --> D[Read-Only Preview Mode]:::pre
  D --> E[Show Draft Position]:::pre
  E --> F[Show Countdown Timer]:::pre

  B -->|T=0| G[Draft Goes Live]:::live
  G --> H[Enable Pick Clock]:::live
  H --> I[Enable Pick Actions]:::live

  I --> J{User Turn?}
  J -- Yes --> K[Pick Window Open]:::step
  J -- No --> L[Watch Only]:::step

  K --> M{Timer Expired?}
  M -- No --> N[User Selects Player]:::step
  M -- Yes --> O[Auto-Pick BPA]:::warn

  N --> P[Validate Pick]:::step
  O --> P

  P --> Q[Write draft_picks]:::step
  Q --> R[Update draft_states]:::step
  R --> S[Write roster_slots]:::commit
  S --> T[Write transactions]:::commit
  T --> U[Update budget if auction]:::commit

  U --> V[Next Pick]:::step
  V --> W{Draft Complete?}
  W -- No --> J
  W -- Yes --> X[Finalize Draft]:::commit

  X --> Y[Mark status completed]:::commit
  Y --> Z[Generate Board]:::step
  Z --> AA[Save to draft-boards]:::step
  AA --> AB[Notify All Users]:::step
```

## Notes
- No emojis; clear three-phase timing and season commitments.
- Auto-pick explicitly shown as a fallback on timer expiration.
- Colors chosen for accessibility and contrast on light background.
