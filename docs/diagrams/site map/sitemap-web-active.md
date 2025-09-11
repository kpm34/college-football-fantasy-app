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
<<<<<<< HEAD
flowchart TD
  %% Sections folded by domain; retain all routes via hub nodes
  ROOT["/ (Landing)"]

  subgraph AUTH["Auth"]
    A0["/login"]
    A1["/signup"]
    A2["/auth/callback"]
    A3["/invite/:leagueId"]
  end

  subgraph DASH["Dashboard"]
    D0["/dashboard"]
    D1["/account-settings"]
    D2["/scoreboard"]
    D3["/standings"]
    D4["/client-brief"]
  end

  subgraph LEAGUE["League"]
    L0["/league/:leagueId"]
    L1["/league/join"]
    L2["/league/create"]
  end

  subgraph DRAFT["Draft"]
    R0["/draft/:leagueId"]
  end

  subgraph ADMIN["Admin"]
    AD0["/admin"]
  end

  subgraph PUBLIC["Public"]
    P0["/conference-showcase"]
    P1["/projection-showcase"]
    P2["/videos"]
    P4["/launch"]
    P5["/offline"]
  end

  ROOT --> A0
  ROOT --> A1
  ROOT --> A2
  ROOT --> A3
  ROOT --> D0
  ROOT --> D1
  ROOT --> D2
  ROOT --> D3
  ROOT --> D4
  ROOT --> L1
  ROOT --> L2
  ROOT --> L0
  ROOT --> R0
  ROOT --> AD0
  ROOT --> P0
  ROOT --> P1
  ROOT --> P2
  ROOT --> P4
  ROOT --> P5

  %% Click mappings (open in new tab where external)
  click L0 "/admin/diagrams/user-journeys%3Aleagues-user-flow" "Open leagues journey" _blank
=======
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
>>>>>>> 24f9fd624f579848150ad3605557a38310d191b4
```

### Legend

- Inverted tree: root at top, branches expand downward
- Role/time gates indicated inline (e.g., role: commissioner, time-gated)
- Admin/tools grouped for brevity
