---
slug: user-journeys:auth:invite-join-and-draft-room
---

### Auth — Invite / Join League / Draft Room Access

```mermaid
flowchart TD
  subgraph U[User]
    U0((Start))
  end
  subgraph A[App (Next.js)]
    %% Replace bracket params to avoid Mermaid NODE_ID parsing issues
    A1[/Open /invite/:leagueId or /league/join/]
    A2{Has session?}
    A3[Redirect to /login?returnTo=…]
    A4[Fetch league + draft]
    A5{Member?}
    A6{Draft Window?}
    A7[Show DRAFT ROOM]
    A8[Hide (not in window)]
  end
  subgraph AW[Appwrite]
    W1[Leagues]
    W2[Drafts + States]
    W3[League Memberships]
  end

  U0 --> A1 --> A2
  A2 -- no --> A3
  A2 -- yes --> A4 --> W1 --> W2 --> W3 --> A5
  A5 -- yes --> A6
  A5 -- no --> A8
  A6 -- in window or commissioner --> A7
  A6 -- else --> A8
```

#### Legend
- Terminator: rounded (Start/End)
- Decision: diamond
- Process: rectangle
- Swimlanes: User | App (Next.js) | Appwrite
- Async steps are dashed when shown