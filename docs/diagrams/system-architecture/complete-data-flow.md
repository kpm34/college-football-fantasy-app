# System Architecture — Complete Data Flow (Auth IDs canonicalized)

```mermaid
flowchart TB
  subgraph Client
    UI[Next.js App Router UI]
    Navbar[Sidebar/Navigation]
    Locker[Locker Room]
  end

  subgraph API[Next.js API Routes]
    Mine[/GET /(dashboard)/api/leagues/mine/]
    Members[/GET /(dashboard)/api/leagues/:id/members/]
    LockerAPI[/GET /(dashboard)/api/leagues/:id/locker-room/]
    Join[/POST /(dashboard)/api/leagues/join]
    Create[/POST /(dashboard)/api/leagues/create]
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
  note right of Teams: ownerAuthUserId
  note right of Leagues: commissionerAuthUserId
  note right of Memberships: authUserId

  RT --> UI
  DB --> RT
```
