---
slug: user-journeys:auth:sign-in-up
---

### Auth — Sign in/up

```mermaid
flowchart TD
  %% Lanes
  subgraph User
    U0((Start))
  end
  subgraph App
    %% Avoid special shape variants to reduce parser ambiguity
    A1[Open /login or /signup]
    A2{Has session?}
    A3[Post credentials to API]
    A4[Set returnTo]
    A5[Redirect to returnTo or /dashboard]
    A6[Logout, clear cookie]
  end
  subgraph Appwrite
    W1[Verify email+password]
    W2[Create session]
    W3[Issue httpOnly cookie]
  end

  U0 --> A1
  A1 --> A2
  A2 -- yes --> A5
  A2 -- no --> A3
  A3 --> W1 --> W2 --> W3 --> A5

  %% Errors
  A3 -. invalid creds .-x U0

  %% Logout (separate entry)
  U0 -. click Logout .-> A6

  %% Lane colors (match UI legend blues/purples)
  classDef laneUser fill:#DBEAFE,stroke:#1D4ED8,color:#0B1020
  classDef laneApp fill:#E5E7EB,stroke:#6B7280,color:#111827
  classDef laneAppwrite fill:#EDE9FE,stroke:#7C3AED,color:#111827

  class U0 laneUser
  class A1,A2,A3,A4,A5,A6 laneApp
  class W1,W2,W3 laneAppwrite
```

#### Legend

- Terminator: rounded (Start/End)
- Decision: diamond
- Process: rectangle
- Swimlanes: User | App (Next.js) | Appwrite
- Async steps are dashed when shown
