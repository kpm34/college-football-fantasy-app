# System Architecture — Complete Data Flow (Auth IDs canonicalized)

```mermaid
flowchart TB
  subgraph Client
    UI[Next.js App Router UI]
    Navbar[Sidebar/Navigation]
    Locker[Locker Room]
  end

  subgraph API[Next.js API Routes]
    Mine[/GET /api/leagues/mine/]
    Members[/GET /api/leagues/:id/members/]
    LockerAPI[/GET /api/leagues/:id/locker-room/]
    Join[/POST /api/leagues/join]
    Create[/POST /api/leagues/create]
  end

  subgraph Appwrite[Appwrite BaaS]
    DB[(Databases)]
    Auth[(Auth Users)]
    RT[(Realtime)]
  end

  UI -->|fetch| Mine
  UI -->|fetch| Members
  UI -->|fetch| LockerAPI
  UI -->|join/create| Join
  UI -->|create| Create

  Mine --> DB
  Members --> DB
  LockerAPI --> DB
  Join --> DB
  Create --> DB

  DB -->|reads| Leagues{{leagues}}
  DB -->|reads/writes| Teams{{fantasy_teams}}
  DB -->|reads/writes| Memberships{{league_memberships}}
  DB -->|reads| Invites{{invites}}
  DB -->|reads| Players{{college_players}}

  Auth --- Mine
  Auth --- Join
  Auth --- LockerAPI

  note over Members,DB: Canonical IDs
  note right of Teams: owner_auth_user_id
  note right of Leagues: commissioner_auth_user_id
  note right of Memberships: auth_user_id

  RT --> UI
  DB --> RT
```
