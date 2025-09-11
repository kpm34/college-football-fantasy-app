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
flowchart TD
  ROOT["/ (Landing)"]
  ROOT --> "/login"
  ROOT --> "/signup"
  ROOT --> "/auth/callback"
  ROOT --> "/invite/:leagueId"
  ROOT --> "/dashboard"

  "/dashboard" --> "/league/:leagueId"
  "/league/:leagueId" --> "/league/:leagueId/locker-room"
  "/league/:leagueId" --> "/league/:leagueId/lineups" %% planned
  "/league/:leagueId" --> "/league/:leagueId/matchups" %% planned
  "/league/:leagueId" --> "/league/:leagueId/waivers" %% planned
  "/league/:leagueId" --> "/league/:leagueId/trades" %% planned
  "/league/:leagueId" --> "/league/:leagueId/schedule"
  "/league/:leagueId" --> "/league/:leagueId/scoreboard"
  "/league/:leagueId" --> "/league/:leagueId/standings"
  "/league/:leagueId" --> "/league/:leagueId/commissioner"

  "/league/:leagueId" --> "/draft/:leagueId"

  %% Content (public)
  ROOT --> "/conference-showcase"
  ROOT --> "/projection-showcase"
  ROOT --> "/videos"
  "/videos" --> "/videos/:program"

  %% Mobile-only branches
  "Sheet: Team Switcher (mobile)"
```
