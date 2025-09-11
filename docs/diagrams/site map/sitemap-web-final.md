---
title: Sitemap — Web (Final)
updated: 2025-09-10T16:44:37Z
state: final
platform: web
source: docs/diagrams/site map
---

### Purpose

Final/target web sitemap as inverted tree (top → down). Future/planned routes denoted in parentheses.

```mermaid
mindmap
  root((/ Landing))
    Auth
      /login
      /signup
      /auth/callback
    Dashboard
      /dashboard
      /account-settings
      /scoreboard
      /standings
      My Teams (planned)
    League
      /league/create
      /league/:leagueId
        /league/:leagueId/locker-room
        /league/:leagueId/lineups (planned)
        /league/:leagueId/matchups (planned)
        /league/:leagueId/waivers (planned)
        /league/:leagueId/trades (planned)
        /league/:leagueId/schedule
        /league/:leagueId/scoreboard
        /league/:leagueId/standings
        /league/:leagueId/commissioner
    Draft
      /draft/:leagueId (time-gated)
      Mock Draft (planned)
    Admin
      /admin
      Diagrams
        /admin/diagrams/site-map
        /admin/diagrams/project-map
        /admin/diagrams/functional-flow
        /admin/diagrams/system-architecture
      Reports & Tools (planned)
        Admin Reports (planned)
        /admin/cache-status
        /admin/sync-status
        /admin/sec-survey
        /admin/product-vision
    Public Content
      /conference-showcase
      /projection-showcase
      /videos
      /videos/:program
      /launch
      /offline
```
