# Scoring User Flow

Season week:
- Set lineups → lock before kickoff → games played → scores computed

Commissioner:
- Review weekly results → resolve disputes → finalize standings

Related: ../overview/scoring.md

```mermaid
flowchart LR
  L[Set Lineups] --> K[Lock Before Kickoff]
  K --> G[Games Played]
  G --> C[Compute Scores]
  C --> S[Standings Updated]
```


