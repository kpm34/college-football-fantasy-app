# Leagues User Flow

Commissioner:
<<<<<<< HEAD

- Create league → configure rules → invite members → schedule draft

Member:

- Discover/join league → create team → view dashboard

Post-creation:

=======
- Create league → configure rules → invite members → schedule draft

Member:
- Discover/join league → create team → view dashboard

Post-creation:
>>>>>>> 24f9fd624f579848150ad3605557a38310d191b4
- Manage settings (non-immutable only) → monitor join status → draft readiness

Related: ../overview/leagues.md

```mermaid
<<<<<<< HEAD
flowchart TD
  %% Service classes
  classDef user fill:#F5F5DC,stroke:#C9C9A3,color:#262626;
  classDef appwrite fill:#ADD8E6,stroke:#6CB6D9,color:#003A8C;
  classDef meshy fill:#DE5D83,stroke:#B34463,color:#FFFFFF;
  classDef vercel fill:#9932CC,stroke:#6E259B,color:#FFFFFF;
  classDef external fill:#C41E3A,stroke:#8E1F2E,color:#FFFFFF;
  classDef legend fill:#FAFAFA,stroke:#D9D9D9,color:#595959;

  %% Swimlanes
  subgraph "User"
    U0["Commissioner: '/league/create'"]
    U1["Invite members"]
    U2["Members join"]
  end

  subgraph "Vercel/API"
    V0[["Create league document"]]
    V1[["Configure settings (immutable excluded)"]]
    V2[["Generate invite link"]]
    V3[["Schedule draft when full"]]
  end

  subgraph "Appwrite"
    A0[("Leagues")]
    A1[("League Memberships")]
    A2[("Drafts")]
  end

  %% Flow
  U0 --> V0 --> A0 --> V1 --> A0
  U1 --> V2 --> A0
  U2 --> A1 --> V3 --> A2

  %% Classes
  class U0,U1,U2 user
  class V0,V1,V2,V3 vercel
  class A0,A1,A2 appwrite

  %% Legend at end
  Legend["Legend:\n• Beige = User\n• Light Blue = Appwrite (DB)\n• Blush = Meshy AI\n• DarkOrchid = Vercel/API\n• Cardinal = External APIs (CFBD/ESPN)"]:::legend
```
=======
flowchart LR
  C[Create League] --> CFG[Configure Rules]
  CFG --> INV[Invite Members]
  INV --> J[Members Join]
  J --> SCH[Schedule Draft]
  SCH --> D[Draft Ready]
```


>>>>>>> 24f9fd624f579848150ad3605557a38310d191b4
