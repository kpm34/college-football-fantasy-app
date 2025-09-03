# Mock Draft Flow (Practice Mode)

> Practice drafts do not commit to season state; only the board is saved.

```mermaid
graph TD
  classDef start fill:#0ea5e9,stroke:#0369a1,color:#fff,rx:6,ry:6
  classDef step fill:#111827,stroke:#374151,color:#e5e7eb,rx:6,ry:6
  classDef highlight fill:#f59e0b,stroke:#b45309,color:#111827,rx:6,ry:6
  classDef success fill:#10b981,stroke:#065f46,color:#06221b,rx:6,ry:6
  classDef noCommit fill:#fee2e2,stroke:#dc2626,color:#7f1d1d,rx:6,ry:6

  A[Start Mock Draft]:::start --> B[Create Mock Draft]:::step
  B --> C[Set is_mock = true]:::highlight
  C --> D[Generate Random Order]:::step
  D --> E[Open Draft Room]:::step

  E --> F[Display "MOCK DRAFT" Banner]:::highlight
  F --> G[Enable All Pick Actions]:::step

  G --> H{User Turn?}
  H -- Yes --> I[Make Pick]:::step
  H -- No --> J[Wait / Watch]:::step

  I --> K[Write draft_picks]:::step
  K --> L[Update draft_states]:::step
  L --> M[Next Pick]:::step

  M --> N{All Picks Done?}
  N -- No --> H
  N -- Yes --> O[Mock Draft Complete]:::success

  O --> P[Save Board]:::step
  P --> Q[Show Results]:::step
  Q --> R[Offer Reset / Restart]:::highlight

  S[NO roster_slots]:::noCommit
  T[NO transactions]:::noCommit
  U[NO budget updates]:::noCommit

  K -.-> S
  K -.-> T
  K -.-> U
```

## Notes
- No emojis; accessible colors with high contrast.
- Highlights key flags and non-commit guarantees.
- Designed for clear reading on light background.
