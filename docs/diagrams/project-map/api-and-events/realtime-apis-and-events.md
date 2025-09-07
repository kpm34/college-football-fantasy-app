# Realtime APIs & Events

APIs:
- None (client connects directly to Appwrite Realtime)
- Backend emits events after DB changes

Events:
- Domain-specific (draft picks, scoring updates)

Related: ../overview/realtime.md

```mermaid
sequenceDiagram
  participant UI
  participant RT as Appwrite Realtime
  participant API as Backend

  UI->>RT: subscribe draft-{leagueId}
  API->>RT: publish event on pick/state change
  RT-->>UI: message delivered
```


