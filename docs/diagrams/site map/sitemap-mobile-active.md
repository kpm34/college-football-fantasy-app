---
title: Sitemap — Mobile (Active)
updated: 2025-09-10T16:44:37Z
state: active
platform: mobile
source: docs/diagrams/site map
---

### Purpose
Active mobile sitemap in inverted tree form (top → down), mirroring web where applicable.

```mermaid
mindmap
  root((/ Landing))
    Auth
      "/login"
      "/signup"
      "/auth/callback"
    Tabs
      "Home (/dashboard)"
      "Leagues"
      "Activity"
      "Profile"
    Leagues
      "/league/join"
      "/league/create"
      "league/[leagueId]"
        "/league/[leagueId]/locker-room"
        "/league/[leagueId]/schedule"
        "/league/[leagueId]/scoreboard"
        "/league/[leagueId]/standings"
        "/league/[leagueId]/commissioner (role: commissioner)"
    Draft
      "/draft/[leagueId] (time-gated)"
    Content
      "/conference-showcase"
      "/projection-showcase"
      "/videos"
      "/videos/[program]"
```
