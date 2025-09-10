---
title: Sitemap — Web (Active)
updated: 2025-09-10T14:19:14Z
state: active
platform: web
source: docs/diagrams/site map
---

### Purpose
Active (current) site map for the web experience. Keep under ~120 lines; expand only as needed.

### Method
Scanned Next.js App Router under `app/` including `(league)`, `(dashboard)`, `admin`, and `api/` subtrees, plus `middleware.ts`. No `src/app/` present. Cross-checked attic diagrams for gaps.

```mermaid
flowchart TD
  %% Site Map – generated 2025-09-10T14:19:14Z
  %% Icon snippets (inline SVG): lock=<svg width="10" height="10" viewBox="0 0 24 24" style="vertical-align:-2px"><path fill="currentColor" d="M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V11a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm3 8H9V6a3 3 0 016 0v3z"/></svg>; shield=<svg width="10" height="10" viewBox="0 0 24 24" style="vertical-align:-2px"><path fill="currentColor" d="M12 2l7 3v6c0 5-3.8 9.7-7 11-3.2-1.3-7-6-7-11V5l7-3z"/></svg>; timer=<svg width="10" height="10" viewBox="0 0 24 24" style="vertical-align:-2px"><path fill="currentColor" d="M9 1h6v2H9V1zm3 4a9 9 0 110 18 9 9 0 010-18zm0 2a7 7 0 100 14 7 7 0 000-14zm1 3v4.2l3 1.8-.9 1.45L11 14V10h2z"/></svg>

  subgraph Public
    root["/ (Landing)"]
    conf["/conference-showcase"]
    proj["/projection-showcase"]
    videos["/videos"]
    videosProgram["/videos/[program]"]
    launch["/launch"]
    offline["/offline"]
  end

  subgraph Auth
    login["/login"]
    signup["/signup"]
    authCallback["/auth/callback (OAuth)"]
  end

  subgraph Join_Invite["Join / Invite"]
    leagueJoin["/league/join"]
    invite["/invite/[leagueId]"]
  end

  subgraph Dashboard
    dash["/ <svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" style=\"vertical-align:-2px\"><path fill=\"currentColor\" d=\"M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V11a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm3 8H9V6a3 3 0 016 0v3z\"/></svg> (My Leagues)"]
    acct["/account-settings <svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" style=\"vertical-align:-2px\"><path fill=\"currentColor\" d=\"M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V11a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm3 8H9V6a3 3 0 016 0v3z\"/></svg>"]
    score["/scoreboard <svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" style=\"vertical-align:-2px\"><path fill=\"currentColor\" d=\"M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V11a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm3 8H9V6a3 3 0 016 0v3z\"/></svg>"]
    standings["/standings <svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" style=\"vertical-align:-2px\"><path fill=\"currentColor\" d=\"M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V11a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm3 8H9V6a3 3 0 016 0v3z\"/></svg>"]
  end

  subgraph League
    leagueHome["/league/[leagueId] <svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" style=\"vertical-align:-2px\"><path fill=\"currentColor\" d=\"M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V11a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm3 8H9V6a3 3 0 016 0v3z\"/></svg>"]
    locker["/league/[leagueId]/locker-room <svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" style=\"vertical-align:-2px\"><path fill=\"currentColor\" d=\"M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V11a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm3 8H9V6a3 3 0 016 0v3z\"/></svg>"]
    schedule["/league/[leagueId]/schedule <svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" style=\"vertical-align:-2px\"><path fill=\"currentColor\" d=\"M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V11a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm3 8H9V6a3 3 0 016 0v3z\"/></svg>"]
    scoreboardL["/league/[leagueId]/scoreboard <svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" style=\"vertical-align:-2px\"><path fill=\"currentColor\" d=\"M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V11a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm3 8H9V6a3 3 0 016 0v3z\"/></svg>"]
    standingsL["/league/[leagueId]/standings <svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" style=\"vertical-align:-2px\"><path fill=\"currentColor\" d=\"M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V11a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm3 8H9V6a3 3 0 016 0v3z\"/></svg>"]
    settings["/league/[leagueId]/commissioner <svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" style=\"vertical-align:-2px\"><path fill=\"currentColor\" d=\"M12 2l7 3v6c0 5-3.8 9.7-7 11-3.2-1.3-7-6-7-11V5l7-3z\"/></svg>"]
    createLeague["/league/create <svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" style=\"vertical-align:-2px\"><path fill=\"currentColor\" d=\"M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V11a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm3 8H9V6a3 3 0 016 0v3z\"/></svg>"]
    joinLeague["/league/join"]
  end

  subgraph Draft
    draft["/draft/[leagueId] <svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" style=\"vertical-align:-2px\"><path fill=\"currentColor\" d=\"M9 1h6v2H9V1zm3 4a9 9 0 110 18 9 9 0 010-18zm0 2a7 7 0 100 14 7 7 0 000-14zm1 3v4.2l3 1.8-.9 1.45L11 14V10h2z\"/></svg> <svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" style=\"vertical-align:-2px; margin-left:2px\"><path fill=\"currentColor\" d=\"M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V11a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm3 8H9V6a3 3 0 016 0v3z\"/></svg>"]
  end

  subgraph Admin
    adminRoot["/admin <svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" style=\"vertical-align:-2px\"><path fill=\"currentColor\" d=\"M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V11a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm3 8H9V6a3 3 0 016 0v3z\"/></svg> <svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" style=\"vertical-align:-2px; margin-left:2px\"><path fill=\"currentColor\" d=\"M12 2l7 3v6c0 5-3.8 9.7-7 11-3.2-1.3-7-6-7-11V5l7-3z\"/></svg>"]
    adminDiagrams["/admin/diagrams <svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" style=\"vertical-align:-2px; margin-left:2px\"><path fill=\"currentColor\" d=\"M12 2l7 3v6c0 5-3.8 9.7-7 11-3.2-1.3-7-6-7-11V5l7-3z\"/></svg>"]
    adminSiteMap["/admin/diagrams/site-map <svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" style=\"vertical-align:-2px; margin-left:2px\"><path fill=\"currentColor\" d=\"M12 2l7 3v6c0 5-3.8 9.7-7 11-3.2-1.3-7-6-7-11V5l7-3z\"/></svg>"]
    adminCache["/admin/cache-status <svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" style=\"vertical-align:-2px; margin-left:2px\"><path fill=\"currentColor\" d=\"M12 2l7 3v6c0 5-3.8 9.7-7 11-3.2-1.3-7-6-7-11V5l7-3z\"/></svg>"]
    adminSync["/admin/sync-status <svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" style=\"vertical-align:-2px; margin-left:2px\"><path fill=\"currentColor\" d=\"M12 2l7 3v6c0 5-3.8 9.7-7 11-3.2-1.3-7-6-7-11V5l7-3z\"/></svg>"]
    adminSurvey["/admin/sec-survey <svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" style=\"vertical-align:-2px; margin-left:2px\"><path fill=\"currentColor\" d=\"M12 2l7 3v6c0 5-3.8 9.7-7 11-3.2-1.3-7-6-7-11V5l7-3z\"/></svg>"]
    adminPV["/admin/product-vision <svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" style=\"vertical-align:-2px; margin-left:2px\"><path fill=\"currentColor\" d=\"M12 2l7 3v6c0 5-3.8 9.7-7 11-3.2-1.3-7-6-7-11V5l7-3z\"/></svg>"]
  end

  subgraph API_Summary["API (summary)"]
    apiAuth["/api/auth/*"]
    apiLeagues["/api/leagues/*"]
    apiDrafts["/api/drafts/*"]
    apiPlayers["/api/players/*"]
    apiGames["/api/games/*"]
    apiRankings["/api/rankings/*"]
    apiAdmin["/api/admin/*"]
    apiCron["/api/cron/*"]
    apiDocs["/api/docs/*"]
    apiExternal["/api/{blender|meshy|runway}/*"]
  end

  %% Key flows / redirects
  root --> login
  login -. redirect if session .-> dash
  authCallback -- redirect on success --> dash
  root --> leagueJoin
  invite -. server redirect .-> leagueJoin
  dash --> leagueHome
  leagueHome --> draft
  leagueHome --> locker
  joinLeague --> leagueHome
  createLeague --> leagueHome
```

### Legend
- Requires auth: inline lock SVG indicates authentication required
- Role-gated: inline shield SVG indicates commissioner/admin role required
- Draft window/gate: inline timer SVG indicates time- or state-gated access
