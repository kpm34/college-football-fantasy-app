# Draft User Flow

Pre-draft:

- League setup → members join → draft scheduled

In-draft:

- Enter draft room → load state → subscribe realtime
- Turn UI: round/pick, time remaining, on-clock team
- Pick: validate → submit → realtime broadcast → advance

Post-draft:

- Results view → export board → roster management

Related: ../overview/draft.md

```mermaid
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
    U0["Enter '/draft/:leagueId'"]
    U1["Make pick"]
  end

  subgraph "Vercel/API"
    V0[["Load draft state"]]
    V1[["On-clock turn: enforce order/timer"]]
    V2[["Validate pick"]]
    V3[["Apply pick → advance"]]
    V4[["Results view"]]
  end

  subgraph "Appwrite"
    A0[("Drafts + State")]
    A1[("Realtime channel: drafts/:leagueId")]
  end

  %% Flow
  U0 --> V0 --> A0
  V0 --> A1
  A1 --> V1
  V1 --> U1 --> V2 --> V3 --> A0
  V3 --> V1
  V3 --> V4

  %% Classes
  class U0,U1 user
  class V0,V1,V2,V3,V4 vercel
  class A0,A1 appwrite

  %% Legend at end
  Legend["Legend:\n• Beige = User\n• Light Blue = Appwrite (DB)\n• Blush = Meshy AI\n• DarkOrchid = Vercel/API\n• Cardinal = External APIs (CFBD/ESPN)"]:::legend
```
