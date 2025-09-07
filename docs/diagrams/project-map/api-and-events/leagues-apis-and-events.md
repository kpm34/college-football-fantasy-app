# Leagues APIs & Events

APIs:
- Create/update league, join/invite
- Read league data, members, teams

Events:
- membership_added, membership_removed
- league_updated (non-immutable)

Related: ../overview/leagues.md
 
```mermaid
sequenceDiagram
  participant UI
  participant API as Leagues API
  participant DB as Appwrite

  UI->>API: POST /leagues (create)
  API->>DB: create leagues doc
  UI->>API: POST /leagues/:id/join
  API->>DB: create membership + team
  API-->>UI: success
```


