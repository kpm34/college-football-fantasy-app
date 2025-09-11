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
graph TD
root["/ (Landing)"]

root --> join[Join & Invite]
join --> invite["/invite/:leagueId"]
join --> joinLeague["/league/join"]

root --> auth[Auth]
auth --> login["/login"]
auth --> signup["/signup"]
auth --> oauth["/auth/callback (OAuth)"]

root --> dash[Dashboard]
dash --> dhome["/dashboard"]
dash --> acct["/account-settings"]
dash --> scb["/scoreboard"]
dash --> std["/standings"]

root --> league[League]
league --> create["/league/create"]
league --> lid["/league/:leagueId"]
lid --> lr["/league/:leagueId/locker-room"]
lid --> sched["/league/:leagueId/schedule"]
lid --> lscore["/league/:leagueId/scoreboard"]
lid --> lstand["/league/:leagueId/standings"]
lid --> comm["/league/:leagueId/commissioner (role: commissioner)"]

root --> draft[Draft]
draft --> draftId["/draft/:leagueId (time-gated)"]

root --> admin[Admin]
admin --> aroot["/admin"]
admin --> diags[Diagrams]
diags --> sm["/admin/diagrams/site-map"]
diags --> pm["/admin/diagrams/project-map"]
diags --> ff["/admin/diagrams/functional-flow"]
diags --> sa["/admin/diagrams/system-architecture"]
admin --> tools[Tools]
tools --> cache["/admin/cache-status"]
tools --> sync["/admin/sync-status"]
tools --> sec["/admin/sec-survey"]
tools --> pv["/admin/product-vision"]

  root --> public[Public Content]
  public --> conf["/conference-showcase"]
  public --> proj["/projection-showcase"]
  public --> vids["/videos"]
  public --> vprog["/videos/:program"]
  public --> launch["/launch"]
  public --> offline["/offline"]
```

### Legend

- Inverted tree: root at top, branches expand downward
- Role/time gates indicated inline (e.g., role: commissioner, time-gated)
- Admin/tools grouped for brevity
