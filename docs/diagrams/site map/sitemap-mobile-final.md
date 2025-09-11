---
title: Sitemap — Mobile (Final)
updated: 2025-09-10T16:44:37Z
state: final
platform: mobile
source: docs/diagrams/site map
---

### Purpose

Final/target mobile sitemap in inverted tree form.

```mermaid
mindmap
  root((/ Landing))
    Auth
      /login
      /signup
      /auth/callback
    Tabs
      Home (/dashboard)
      Leagues
      Activity
      Profile
    Leagues
      /league/join
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
    Content
      /conference-showcase
      /projection-showcase
      /videos
      /videos/:program
```
