# Leagues User Flow

Commissioner:
- Create league → configure rules → invite members → schedule draft

Member:
- Discover/join league → create team → view dashboard

Post-creation:
- Manage settings (non-immutable only) → monitor join status → draft readiness

Related: ../overview/leagues.md

```mermaid
flowchart LR
  C[Create League] --> CFG[Configure Rules]
  CFG --> INV[Invite Members]
  INV --> J[Members Join]
  J --> SCH[Schedule Draft]
  SCH --> D[Draft Ready]
```


