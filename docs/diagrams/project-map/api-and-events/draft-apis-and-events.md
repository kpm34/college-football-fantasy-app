# Draft APIs & Events

APIs:
- Backend: /api/(backend)/drafts/[leagueId]/data, /start, cron/draft-autopick
- Frontend: /api/(frontend)/draft/players
- External: /api/(external)/cfbd/players

Events:
- pick_made, turn_changed, draft_started, draft_ended, autopick_triggered

Related: ../overview/draft.md

```mermaid
sequenceDiagram
  participant UI
  participant API as Draft API
  participant DB as Appwrite DB
  participant RT as Realtime

  UI->>API: POST /drafts/:leagueId/pick
  API->>DB: Validate + write pick/state
  API->>RT: publish pick_made
  RT-->>UI: pick_made event
```


