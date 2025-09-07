# Realtime Entity Relation

Entities:
- Appwrite Realtime channels (draft-{leagueId})
- Vercel KV locks (draft:{leagueId}:lock)
- Draft/state collections publishing events

Relationships:
- DB updates → emit events → channel subscribers receive

Related: ../overview/realtime.md

```mermaid
erDiagram
  DRAFT_STATES ||--o{ EVENTS : publishes
  DRAFT_PICKS ||--o{ EVENTS : publishes
  CHANNELS ||--o{ SUBSCRIBERS : notifies
  KV_LOCKS ||..|| DRAFT_STATES : guards
```


