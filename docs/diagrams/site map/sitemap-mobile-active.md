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
flowchart TD
  ROOT["/ (Landing)"]
  ROOT --> "/login"
  ROOT --> "/signup"
  ROOT --> "/auth/callback"
  ROOT --> "/invite/:leagueId"
  ROOT --> "/dashboard"

  "/dashboard" --> "/league/:leagueId"
  "/league/:leagueId" --> "/league/:leagueId/locker-room"
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
