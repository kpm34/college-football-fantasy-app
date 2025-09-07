# Auth User Flow

1. Visit login → choose provider (email, Google)
2. Authenticate → Appwrite session cookie set
3. Redirect to dashboard or intended page
4. Session refresh on navigation; logout clears session

Related: ../overview/auth.md

```mermaid
flowchart LR
  subgraph Client
    A[Login Page]
    B[Dashboard]
  end

  subgraph Appwrite
    S[(Session Cookie)]
  end

  A -->|Email/Google| S
  S -->|valid| B
  B -->|Logout| A
```


