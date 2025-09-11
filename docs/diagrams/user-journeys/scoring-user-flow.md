# Scoring User Flow

Season week:
- Set lineups → lock before kickoff → games played → scores computed

Commissioner:
- Review weekly results → resolve disputes → finalize standings

Related: ../overview/scoring.md

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
    U0["Set lineups"]
    U1["View scoreboard/standings"]
  end

  subgraph "Vercel/API"
    V0[["Lock before kickoff"]]
    V1[["Compute scores"]]
    V2[["Update standings"]]
  end

  subgraph "Appwrite"
    A0[("Lineups")]
    A1[("Games")]
    A2[("Player Stats")]
    A3[("Standings")]
  end

  subgraph "External APIs (CFBD/ESPN)"
    X0[["Fetch game results/stats"]]
  end

  %% Flow
  U0 --> A0 --> V0
  V0 --> X0 --> A1
  A1 --> A2 --> V1 --> A3 --> V2
  V2 --> U1

  %% Classes
  class U0,U1 user
  class V0,V1,V2 vercel
  class A0,A1,A2,A3 appwrite
  class X0 external

  %% Legend at end
  Legend["Legend:\n• Beige = User\n• Light Blue = Appwrite (DB)\n• Blush = Meshy AI\n• DarkOrchid = Vercel/API\n• Cardinal = External APIs (CFBD/ESPN)"]:::legend
```


