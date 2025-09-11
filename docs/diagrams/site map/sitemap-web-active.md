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
  classDef l0 fill:#fed7aa,stroke:#9a3412,color:#7c2d12,rx:8,ry:8
  classDef l1 fill:#e5effe,stroke:#60a5fa,color:#1f2937,rx:6,ry:6
  classDef l2 fill:#fef3c7,stroke:#f59e0b,color:#7c2d12,rx:6,ry:6
  classDef l3 fill:#eef5d7,stroke:#6B8E23,color:#1f2937,rx:6,ry:6
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

  %% Apply level-based colors
  class root l0;
  class join,auth,dash,league,draft,admin,public l1;
  class invite,joinLeague,login,signup,oauth,dhome,acct,scb,std,create,lid,draftId,aroot,diags,tools,conf,proj,vids,vprog,launch,offline l2;
  class lr,sched,lscore,lstand,comm,sm,pm,ff,sa,cache,sync,sec,pv l3;
```

### Legend

- Inverted tree: root at top, branches expand downward
- Role/time gates indicated inline (e.g., role: commissioner, time-gated)
- Admin/tools grouped for brevity
