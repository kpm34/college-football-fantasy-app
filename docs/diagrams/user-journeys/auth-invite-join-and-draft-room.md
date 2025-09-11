---
slug: user-journeys:auth:invite-join-and-draft-room
---

### Auth — Invite / Join League / Draft Room Access

```mermaid
flowchart TD
<<<<<<< HEAD
  %% Service classes
  classDef user fill:#F5F5DC,stroke:#C9C9A3,color:#262626;
  classDef appwrite fill:#ADD8E6,stroke:#6CB6D9,color:#003A8C;
  classDef meshy fill:#DE5D83,stroke:#B34463,color:#FFFFFF;
  classDef vercel fill:#9932CC,stroke:#6E259B,color:#FFFFFF;
  classDef external fill:#C41E3A,stroke:#8E1F2E,color:#FFFFFF;
  classDef legend fill:#FAFAFA,stroke:#D9D9D9,color:#595959;

  %% Swimlanes
  subgraph "User"
    U0["Open '/invite/:leagueId' or '/league/join'"]
  end

  subgraph "Vercel/API"
    V0[["Has session?"]]
    V1[["Redirect to '/login?returnTo=…' if not"]]
    V2[["Fetch league + draft"]]
    V3[["Member?"]]
    V4[["Draft window? (or commissioner)"]]
    V5[["Show 'DRAFT ROOM'"]]
    V6[["Hide (not in window)"]]
  end

  subgraph "Appwrite"
    A0[("Leagues")]
    A1[("Drafts + States")]
    A2[("League Memberships")]
  end

  %% Flow
  U0 --> V0
  V0 -- "No" --> V1
  V0 -- "Yes" --> V2 --> A0 --> A1 --> A2 --> V3
  V3 -- "Yes" --> V4
  V3 -- "No" --> V6
  V4 -- "In window or commissioner" --> V5
  V4 -- "Else" --> V6

  %% Classes
  class U0 user
  class V0,V1,V2,V3,V4,V5,V6 vercel
  class A0,A1,A2 appwrite

  %% Legend at end
  Legend["Legend:\n• Beige = User\n• Light Blue = Appwrite (DB)\n• Blush = Meshy AI\n• DarkOrchid = Vercel/API\n• Cardinal = External APIs (CFBD/ESPN)"]:::legend
=======
  %% Simplify subgraph titles to avoid bracket parsing issues
  subgraph User
    U0((Start))
  end
  subgraph App
    %% Replace bracket params to avoid Mermaid NODE_ID parsing issues
    A1[/Open /invite/:leagueId or /league/join/]
    A2{Has session?}
    A3[Redirect to /login?returnTo=…]
    A4[Fetch league + draft]
    A5{Member?}
    A6{Draft Window?}
    A7["Show DRAFT ROOM"]
    A8["Hide (not in window)"]
  end
  subgraph Appwrite
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
>>>>>>> 24f9fd624f579848150ad3605557a38310d191b4
```

#### Legend

- Terminator: rounded (Start/End)
- Decision: diamond
- Process: rectangle
- Swimlanes: User | App (Next.js) | Appwrite
- Async steps are dashed when shown
