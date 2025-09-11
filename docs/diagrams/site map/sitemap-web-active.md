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

Generated from the live Next.js App Router by `ops/diagrams/generate-sitemap-from-routes.ts`.

```mermaid
flowchart TD
  ROOT["/"]
  ROOT --> "/login"
  ROOT --> "/signup"
  ROOT --> "/auth/callback"
  ROOT --> "/invite/:leagueId"
  ROOT --> "/dashboard"
  ROOT --> "/account-settings"
  ROOT --> "/client-brief"
  ROOT --> "/scoreboard"
  ROOT --> "/standings"
  ROOT --> "/conference-showcase"
  ROOT --> "/projection-showcase"
  ROOT --> "/videos"
  ROOT --> "/league/join"
  ROOT --> "/league/create"
  ROOT --> "/league/:leagueId"
  ROOT --> "/draft/:leagueId"
  ROOT --> "/admin"
  ROOT --> "/launch"
  ROOT --> "/offline"
```

### Legend

- Inverted tree: root at top, branches expand downward
- Role/time gates indicated inline (e.g., role: commissioner, time-gated)
- Admin/tools grouped for brevity
