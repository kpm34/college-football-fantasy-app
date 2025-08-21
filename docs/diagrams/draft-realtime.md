# Draft Flow (Real-time)

```mermaid
flowchart LR
    subgraph Client
        UI[Draft UI]
    end

    UI -->|subscribe| RT[Appwrite Realtime]
    UI -->|POST pick| API[/api/drafts/pick]

    API -->|SETNX lock| KV[(Vercel KV)]
    KV --> API

    API -->|validate+persist| DB[(Appwrite DB)]
    API -->|publish event| RT
    API -->|DEL lock| KV

    SCHED[Vercel Cron] --> AUTOPICK[/api/drafts/autopick]
    AUTOPICK --> DB
    AUTOPICK --> RT

    RT -->|state updates| UI
```
