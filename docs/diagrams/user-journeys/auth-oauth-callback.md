---
slug: user-journeys:auth:oauth-callback
---

### Auth — Google OAuth Callback

```mermaid
flowchart TD
  %% Lanes (use simple subgraph titles to avoid bracket parsing issues)
  subgraph User
    U0((Click Continue with Google))
  end
  subgraph App
    A0["GET /login (Google)"]
    A1[Create state+nonce; store]
    A2[Redirect to Google OAuth]
    A3["GET /auth/callback"]
    A4{State/nonce valid?}
    A5[Exchange code for token]
    A6[Create Appwrite session]
    A7[Set app session cookie]
    A8[Redirect to returnTo or /dashboard]
  end
  subgraph Google
    G1[OAuth consent]
    G2[Redirect with code+state]
  end
  subgraph Appwrite
    W1[Create session]
  end

  U0 --> A0 --> A1 --> A2 --> G1 --> G2 --> A3 --> A4
  A4 -- yes --> A5 --> W1 --> A7 --> A8
  A4 -- no --> A8

  %% Errors
  G1 -. denied .-x A8
<<<<<<< HEAD

  %% Lane colors (match UI legend)
  classDef laneUser fill:#DBEAFE,stroke:#1D4ED8,color:#0B1020
  classDef laneApp fill:#E5E7EB,stroke:#6B7280,color:#111827
  classDef laneAppwrite fill:#EDE9FE,stroke:#7C3AED,color:#111827
  classDef laneGoogle fill:#F0FDFA,stroke:#14B8A6,color:#115E59
  class U0 laneUser
  class A0,A1,A2,A3,A4,A5,A6,A7,A8 laneApp
  class W1 laneAppwrite
  class G1,G2 laneGoogle
=======
>>>>>>> 24f9fd624f579848150ad3605557a38310d191b4
```

#### Legend

- Terminator: rounded (Start/End)
- Decision: diamond
- Process: rectangle
- Swimlanes: User | App (Next.js) | Appwrite | Google
- Async steps are dashed when shown
