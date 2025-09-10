---
title: Sitemap — Web (Active)
updated: 2025-09-10T14:19:14Z
state: active
platform: web
source: docs/diagrams/site map
---

### Purpose

Active (current) site map for the web experience in inverted tree form (top → down).

### Method

Scanned Next.js App Router under `app/` including `(league)`, `(dashboard)`, `admin`, and `api/` subtrees, plus `middleware.ts`. No `src/app/` present. Cross-checked attic diagrams for gaps.

```mermaid
mindmap
  root((/ Landing))
    Join & Invite
      /invite/[leagueId]
      /league/join
    Auth
      /login
      /signup
      /auth/callback (OAuth)
    Dashboard
      /dashboard
      /account-settings
      /scoreboard
      /standings
    League
      /league/create
      /league/[leagueId]
        /league/[leagueId]/locker-room
        /league/[leagueId]/schedule
        /league/[leagueId]/scoreboard
        /league/[leagueId]/standings
        /league/[leagueId]/commissioner (role: commissioner)
    Draft
      /draft/[leagueId] (time-gated)
    Admin
      /admin
      Diagrams
        /admin/diagrams/site-map
        /admin/diagrams/project-map
        /admin/diagrams/functional-flow
        /admin/diagrams/system-architecture
      Tools
        /admin/cache-status
        /admin/sync-status
        /admin/sec-survey
        /admin/product-vision
    Public Content
      /conference-showcase
      /projection-showcase
      /videos
      /videos/[program]
      /launch
      /offline
```

### Legend

- Inverted tree: root at top, branches expand downward
- Role/time gates indicated inline (e.g., role: commissioner, time-gated)
- Admin/tools grouped for brevity
