# API Routes Map

## Overview
Total routes analyzed: 190

## Data Flow Diagram

```mermaid
graph LR
  subgraph "Frontend"
    P0[/standings]
    P1[/scoreboard]
    P2[/client-brief]
    P3[/admin]
    P4[/(league)]
    P5[/draft/:leagueId]
    P6[/auth/callback]
    P7[/admin/sync-status]
    P8[/admin/sec-survey]
    P9[/admin/product-vision]
    P10[/admin/directory-map]
    P11[/admin/cache-status]
    P12[/(dashboard)/dashboard]
    P13[/(dashboard)/account-settings]
    P14[/(league)/videos]
    P15[/(league)/signup]
    P16[/(league)/projection-showcase]
    P17[/(league)/offline]
    P18[/(league)/login]
    P19[/(league)/launch]
    P20[/(league)/conference-showcase]
    P21[/admin/resources]
    P22[/admin/diagrams]
    P23[/(dashboard)/league/join]
    P24[/(dashboard)/league/create]
    P25[/(league)/videos/guide]
    P26[/(dashboard)/league/:leagueId]
    P27[/admin/project-map/:root]
    P28[/(league)/videos/:program]
    P29[/(league)/invite/:leagueId]
    P30[/admin/diagrams/user-journeys]
    P31[/admin/diagrams/system-architecture]
    P32[/admin/diagrams/site-map]
    P33[/admin/diagrams/draft]
    P34[/admin/diagrams/entity-relations]
    P35[/admin/diagrams/directory-map]
    P36[/admin/diagrams/:slug]
    P37[/admin/project-map/app/:group]
    P38[/(dashboard)/league/:leagueId/standings]
    P39[/(dashboard)/league/:leagueId/scoreboard]
    P40[/(dashboard)/league/:leagueId/schedule]
    P41[/(dashboard)/league/:leagueId/locker-room]
    P42[/(dashboard)/league/:leagueId/commissioner]
    P43[/admin/project-map/:root/:group]
    P44[/admin/diagrams/viewer/:...path]
    P45[/admin/diagrams/site-map/final-table]
    P46[/admin/project-map/:root/:group/:sub]
  end

  subgraph "API Layer"
    A0[GET /api/scraper]
    A1[POST /api/scraper]
    A2[GET /api/rotowire]
    A3[GET /api/health]
    A4[POST /api/cursor-report]
    A5[GET /api/bids]
    A6[GET /api/auctions]
    A7[GET /api/rotowire/news]
    A8[GET /api/static/:...path]
    A9[POST /api/projections/run]
    A10[GET /api/mascot/templates]
    A11[POST /api/mascot/templates]
    A12[POST /api/launch/signup]
    A13[POST /api/lucid/import]
    A14[GET /api/lucid/health]
    A15[GET /api/lucid/callback]
    A16[GET /api/lucid/authorize]
    A17[GET /api/docs/project-map-inventory]
    A18[POST /api/security/csp-report]
    A19[GET /api/debug/whoami]
    A20[GET /api/cache/stats]
    A21[POST /api/debug/dev-e2e]
    A22[POST /api/debug/dev-join]
    A23[POST /api/cache/invalidate]
    A24[GET /api/auth/test-login]
    A25[POST /api/auth/test-login]
    A26[GET /api/auth/session]
    A27[POST /api/auth/logout]
    A28[GET /api/auth/oauth-callback]
    A29[GET /api/auth/google]
    A30[POST /api/auth/sync-session]
    A31[GET /api/conferences/:conference]
    A32[GET /api/(backend)/sync]
    A33[POST /api/(backend)/sync]
    A34[GET /api/(backend)/admin]
    A35[GET /api/(external)/claude]
    A36[POST /api/(external)/claude]
    A37[GET /api/(frontend)/search]
    A38[GET /api/(frontend)/schedule]
    A39[GET /api/(frontend)/rosters]
    A40[GET /api/(frontend)/rankings]
    A41[GET /api/(frontend)/players]
    A42[GET /api/(frontend)/leagues]
    A43[GET /api/lucid/oauth/start]
    A44[GET /api/lucid/oauth/callback]
    A45[GET /api/docs/mermaid/:slug]
    A46[GET /api/docs/diagrams/sign]
    A47[GET /api/docs/diagrams/mock-draft-flow]
    A48[GET /api/docs/diagrams/:file]
    A49[GET /api/docs/diagrams/:...path]
    A50[GET /api/drafts/:leagueId/state]
    A51[POST /api/drafts/:leagueId/start]
    A52[POST /api/drafts/:leagueId/resume]
    A53[POST /api/drafts/:leagueId/pick]
    A54[POST /api/drafts/:leagueId/pause]
    A55[POST /api/(backend)/webhooks/deployment-sync]
    A56[GET /api/(backend)/monitoring/dashboard]
    A57[GET /api/(backend)/migrations/relax-draft-leagueid]
    A58[POST /api/(backend)/migrations/relax-draft-leagueid]
    A59[GET /api/(backend)/migrations/standardize-auth-ids]
    A60[POST /api/(backend)/migrations/standardize-auth-ids]
    A61[GET /api/(backend)/migrations/ensure-meshy-jobs]
    A62[GET /api/(backend)/migrations/ensure-buckets]
    A63[GET /api/(backend)/migrations/ensure-blender-jobs]
    A64[POST /api/(backend)/migrations/backfill-auth-users]
    A65[POST /api/(backend)/migrations/backfill-commissioner]
    A66[GET /api/(backend)/cron/synthetic-monitoring]
    A67[GET /api/(backend)/cron/start-drafts]
    A68[GET /api/(backend)/cron/poll-jobs]
    A69[GET /api/(backend)/cron/draft-autopick]
    A70[GET /api/(backend)/cron/data-sync]
    A71[GET /api/(backend)/cron/assign-draft-orders]
    A72[GET /api/(backend)/admin/pipeline-status]
    A73[POST /api/(external)/runway/create]
    A74[POST /api/(external)/meshy/webhook]
    A75[POST /api/(external)/meshy/jobs]
    A76[PATCH /api/(external)/meshy/jobs]
    A77[GET /api/(external)/cfbd/players]
    A78[POST /api/(external)/blender/upload]
    A79[GET /api/(external)/blender/jobs]
    A80[POST /api/(external)/blender/jobs]
    A81[PATCH /api/(external)/blender/jobs]
    A82[GET /api/(external)/blender/exports]
    A83[GET /api/(frontend)/rankings/cached]
    A84[POST /api/(frontend)/rankings/cached]
    A85[GET /api/(frontend)/players/search]
    A86[POST /api/(frontend)/players/search]
    A87[POST /api/(frontend)/players/cleanup]
    A88[GET /api/(frontend)/players/cached]
    A89[GET /api/(frontend)/games/cached]
    A90[POST /api/(frontend)/games/cached]
    A91[GET /api/(frontend)/leagues/schedule]
    A92[POST /api/(frontend)/leagues/schedule]
    A93[POST /api/(frontend)/leagues/recount]
    A94[GET /api/(frontend)/leagues/mine]
    A95[POST /api/(frontend)/leagues/join]
    A96[GET /api/(frontend)/leagues/invite]
    A97[POST /api/(frontend)/leagues/invite]
    A98[GET /api/(frontend)/leagues/:leagueId]
    A99[PATCH /api/(frontend)/leagues/:leagueId]
    A100[GET /api/(frontend)/draft/players]
    A101[GET /api/(frontend)/leagues/search]
    A102[POST /api/(frontend)/draft/complete]
    A103[GET /api/(frontend)/auth/user]
    A104[PATCH /api/(frontend)/auth/update-profile]
    A105[GET /api/(frontend)/auth/debug]
    A106[POST /api/(frontend)/auth/login]
    A107[GET /api/(frontend)/auth/check]
    A108[GET /api/docs/diagrams/draft/list]
    A109[POST /api/(frontend)/auth/clear-session]
    A110[POST /api/(backend)/webhooks/appwrite/schema-drift]
    A111[POST /api/debug/drafts/:id/reset]
    A112[DELETE /api/debug/leagues/:leagueId/delete]
    A113[GET /api/(backend)/drafts/:leagueId/data]
    A114[GET /api/(backend)/admin/users/exists]
    A115[POST /api/(backend)/admin/players/survey-sec-nfl]
    A116[POST /api/(backend)/admin/players/retire]
    A117[POST /api/(backend)/admin/players/reconcile-depth]
    A118[POST /api/(backend)/admin/players/prune-old-teams]
    A119[POST /api/(backend)/admin/players/override]
    A120[POST /api/(backend)/admin/players/refresh]
    A121[GET /api/(backend)/admin/model-inputs/backfill]
    A122[POST /api/(backend)/admin/model-inputs/backfill]
    A123[POST /api/(backend)/admin/players/cron-cleanup]
    A124[POST /api/(backend)/admin/leagues/sync-members]
    A125[GET /api/(backend)/admin/players/export]
    A126[POST /api/(backend)/admin/dedupe/players]
    A127[GET /api/(external)/blender/file/:fileId]
    A128[GET /api/(frontend)/users/:userId/name]
    A129[PUT /api/(frontend)/leagues/:leagueId/update-team]
    A130[GET /api/(frontend)/leagues/:leagueId/schedule]
    A131[GET /api/(frontend)/leagues/:leagueId/members]
    A132[DELETE /api/(frontend)/leagues/:leagueId/members]
    A133[POST /api/(frontend)/leagues/:leagueId/sync-members]
    A134[GET /api/(frontend)/leagues/:leagueId/locker-room]
    A135[POST /api/(frontend)/leagues/:leagueId/backfill-league-name]
    A136[GET /api/(frontend)/leagues/:leagueId/commissioner]
    A137[PUT /api/(frontend)/leagues/:leagueId/commissioner]
    A138[GET /api/(frontend)/leagues/is-commissioner/:leagueId]
  end

  subgraph "Server Actions"
  end

  subgraph "Appwrite Functions"
    F0[function:on-draft-deadline-sweep]
    F1[function:import-players]
    F2[function:on-league-membership-change]
    F3[function:on-auction-close]
  end

  subgraph "Data Layer"
    C0[games]
    C1[leagues]
    C2[schools]
    C3[fantasy_teams]
    C4[college_players]
    C5[drafts]
    C6[league_memberships]
    C7[activity_log]
    C8[clients]
    C9[draft_states]
  end

  P3 --> A34
  P6 --> A15
  P6 --> A44
  P7 --> A32
  P7 --> A33
  P7 --> A34
  P8 --> A34
  P9 --> A34
  P10 --> A34
  P11 --> A34
  P12 --> A56
  P13 --> A56
  P15 --> A12
  P15 --> A46
  P18 --> A106
  P21 --> A34
  P22 --> A34
  P23 --> A56
  P23 --> A95
  P24 --> A56
  P24 --> A73
  P26 --> A56
  P27 --> A34
  P29 --> A96
  P29 --> A97
  P30 --> A34
  P30 --> A103
  P31 --> A34
  P32 --> A34
  P33 --> A34
  P34 --> A34
  P35 --> A34
  P36 --> A34
  P37 --> A34
  P38 --> A56
  P39 --> A56
  P40 --> A38
  P40 --> A56
  P40 --> A91
  P40 --> A92
  P40 --> A130
  P41 --> A56
  P41 --> A134
  P42 --> A56
  P42 --> A136
  P42 --> A137
  P43 --> A34
  P44 --> A34
  P45 --> A34
  P46 --> A34
  A19 --> C3
  A19 --> C1
  A31 --> C0
  A31 --> C2
  A37 --> C1
  A37 --> C4
  A57 --> C5
  A58 --> C5
  A59 --> C6
  A60 --> C6
  A65 --> C1
  A71 --> C6
  A95 --> C6
  A95 --> C3
  A96 --> C7
  A97 --> C7
  A98 --> C8
  A99 --> C8
  A100 --> C4
  A115 --> C4
  A116 --> C4
  A117 --> C4
  A118 --> C4
  A120 --> C4
  A121 --> C4
  A122 --> C4
  A123 --> C4
  A125 --> C4
  A126 --> C4
  A129 --> C2
  A136 --> C6
  A137 --> C6
```

## Routes Detail

| Type | Path | Method | Collections | External APIs | File |
|------|------|--------|-------------|---------------|------|
| page | /standings | - | - | - | app/standings/page.tsx |
| page | /scoreboard | - | - | - | app/scoreboard/page.tsx |
| page | /client-brief | - | - | - | app/client-brief/page.tsx |
| page | /admin | - | - | CFBD, Anthropic, OpenAI | app/admin/page.tsx |
| page | /(league) | - | - | - | app/(league)/page.tsx |
| page | /draft/:leagueId | - | - | - | app/draft/[leagueId]/page.tsx |
| page | /auth/callback | - | - | Google | app/auth/callback/page.tsx |
| page | /admin/sync-status | - | - | - | app/admin/sync-status/page.tsx |
| page | /admin/sec-survey | - | - | - | app/admin/sec-survey/page.tsx |
| page | /admin/product-vision | - | - | Anthropic, OpenAI | app/admin/product-vision/page.tsx |
| page | /admin/directory-map | - | - | - | app/admin/directory-map/page.tsx |
| page | /admin/cache-status | - | games | - | app/admin/cache-status/page.tsx |
| page | /(dashboard)/dashboard | - | - | - | app/(dashboard)/dashboard/page.tsx |
| page | /(dashboard)/account-settings | - | - | - | app/(dashboard)/account-settings/page.tsx |
| page | /(league)/videos | - | - | - | app/(league)/videos/page.tsx |
| page | /(league)/signup | - | - | - | app/(league)/signup/page.tsx |
| page | /(league)/projection-showcase | - | - | - | app/(league)/projection-showcase/page.tsx |
| page | /(league)/offline | - | - | - | app/(league)/offline/page.tsx |
| page | /(league)/login | - | - | - | app/(league)/login/page.tsx |
| page | /(league)/launch | - | - | Anthropic | app/(league)/launch/page.tsx |
| page | /(league)/conference-showcase | - | - | - | app/(league)/conference-showcase/page.tsx |
| page | /admin/resources | - | - | - | app/admin/resources/page.tsx |
| page | /admin/diagrams | - | - | - | app/admin/diagrams/page.tsx |
| page | /(dashboard)/league/join | - | leagues | - | app/(dashboard)/league/join/page.tsx |
| page | /(dashboard)/league/create | - | - | - | app/(dashboard)/league/create/page.tsx |
| page | /(league)/videos/guide | - | - | - | app/(league)/videos/guide/page.tsx |
| page | /(dashboard)/league/:leagueId | - | schools | - | app/(dashboard)/league/[leagueId]/page.tsx |
| page | /admin/project-map/:root | - | - | - | app/admin/project-map/[root]/page.tsx |
| page | /(league)/videos/:program | - | - | - | app/(league)/videos/[program]/page.tsx |
| page | /(league)/invite/:leagueId | - | - | - | app/(league)/invite/[leagueId]/page.tsx |
| page | /admin/diagrams/user-journeys | - | - | - | app/admin/diagrams/user-journeys/page.tsx |
| page | /admin/diagrams/system-architecture | - | - | - | app/admin/diagrams/system-architecture/page.tsx |
| page | /admin/diagrams/site-map | - | - | - | app/admin/diagrams/site-map/page.tsx |
| page | /admin/diagrams/draft | - | - | - | app/admin/diagrams/draft/page.tsx |
| page | /admin/diagrams/entity-relations | - | - | - | app/admin/diagrams/entity-relations/page.tsx |
| page | /admin/diagrams/directory-map | - | - | - | app/admin/diagrams/directory-map/page.tsx |
| page | /admin/diagrams/:slug | - | - | - | app/admin/diagrams/[slug]/page.tsx |
| page | /admin/project-map/app/:group | - | - | - | app/admin/project-map/app/[group]/page.tsx |
| page | /(dashboard)/league/:leagueId/standings | - | - | - | app/(dashboard)/league/[leagueId]/standings/page.tsx |
| page | /(dashboard)/league/:leagueId/scoreboard | - | - | - | app/(dashboard)/league/[leagueId]/scoreboard/page.tsx |
| page | /(dashboard)/league/:leagueId/schedule | - | - | - | app/(dashboard)/league/[leagueId]/schedule/page.tsx |
| page | /(dashboard)/league/:leagueId/locker-room | - | - | CFBD, Rotowire | app/(dashboard)/league/[leagueId]/locker-room/page.tsx |
| page | /(dashboard)/league/:leagueId/commissioner | - | - | - | app/(dashboard)/league/[leagueId]/commissioner/page.tsx |
| page | /admin/project-map/:root/:group | - | - | - | app/admin/project-map/[root]/[group]/page.tsx |
| page | /admin/diagrams/viewer/:...path | - | - | - | app/admin/diagrams/viewer/[...path]/page.tsx |
| page | /admin/diagrams/site-map/final-table | - | - | - | app/admin/diagrams/site-map/final-table/page.tsx |
| page | /admin/project-map/:root/:group/:sub | - | - | - | app/admin/project-map/[root]/[group]/[sub]/page.tsx |
| api | /api/scraper | GET | - | ESPN | app/api/scraper/route.ts |
| api | /api/scraper | POST | - | ESPN | app/api/scraper/route.ts |
| api | /api/rotowire | GET | - | Rotowire | app/api/rotowire/route.ts |
| api | /api/health | GET | - | - | app/api/health/route.ts |
| api | /api/cursor-report | POST | - | - | app/api/cursor-report/route.ts |
| api | /api/bids | GET | - | - | app/api/bids/route.ts |
| api | /api/auctions | GET | - | - | app/api/auctions/route.ts |
| api | /api/rotowire/news | GET | - | Rotowire | app/api/rotowire/news/route.ts |
| api | /api/static/:...path | GET | - | - | app/api/static/[...path]/route.ts |
| api | /api/projections/run | POST | - | - | app/api/projections/run/route.ts |
| api | /api/mascot/templates | GET | - | - | app/api/mascot/templates/route.ts |
| api | /api/mascot/templates | POST | - | - | app/api/mascot/templates/route.ts |
| api | /api/launch/signup | POST | - | - | app/api/launch/signup/route.ts |
| api | /api/lucid/import | POST | - | - | app/api/lucid/import/route.ts |
| api | /api/lucid/health | GET | - | Google | app/api/lucid/health/route.ts |
| api | /api/lucid/callback | GET | - | Google | app/api/lucid/callback/route.ts |
| api | /api/lucid/authorize | GET | - | Google | app/api/lucid/authorize/route.ts |
| api | /api/docs/project-map-inventory | GET | - | - | app/api/docs/project-map-inventory/route.ts |
| api | /api/security/csp-report | POST | - | - | app/api/security/csp-report/route.ts |
| api | /api/debug/whoami | GET | fantasy_teams, leagues | - | app/api/debug/whoami/route.ts |
| api | /api/cache/stats | GET | - | - | app/api/cache/stats/route.ts |
| api | /api/debug/dev-e2e | POST | - | - | app/api/debug/dev-e2e/route.ts |
| api | /api/debug/dev-join | POST | - | - | app/api/debug/dev-join/route.ts |
| api | /api/cache/invalidate | POST | - | - | app/api/cache/invalidate/route.ts |
| api | /api/auth/test-login | GET | - | - | app/api/auth/test-login/route.ts |
| api | /api/auth/test-login | POST | - | - | app/api/auth/test-login/route.ts |
| api | /api/auth/session | GET | - | - | app/api/auth/session/route.ts |
| api | /api/auth/logout | POST | - | - | app/api/auth/logout/route.ts |
| api | /api/auth/oauth-callback | GET | - | Google | app/api/auth/oauth-callback/route.ts |
| api | /api/auth/google | GET | - | Google | app/api/auth/google/route.ts |
| api | /api/auth/sync-session | POST | - | - | app/api/auth/sync-session/route.ts |
| api | /api/conferences/:conference | GET | games, schools | - | app/api/conferences/[conference]/route.ts |
| api | /api/(backend)/sync | GET | - | - | app/api/(backend)/sync/route.ts |
| api | /api/(backend)/sync | POST | - | - | app/api/(backend)/sync/route.ts |
| api | /api/(backend)/admin | GET | - | - | app/api/(backend)/admin/route.ts |
| api | /api/(external)/claude | GET | - | Anthropic | app/api/(external)/claude/route.ts |
| api | /api/(external)/claude | POST | - | Anthropic | app/api/(external)/claude/route.ts |
| api | /api/(frontend)/search | GET | leagues, college_players | - | app/api/(frontend)/search/route.ts |
| api | /api/(frontend)/schedule | GET | - | - | app/api/(frontend)/schedule/route.ts |
| api | /api/(frontend)/rosters | GET | - | - | app/api/(frontend)/rosters/route.ts |
| api | /api/(frontend)/rankings | GET | - | - | app/api/(frontend)/rankings/route.ts |
| api | /api/(frontend)/players | GET | - | - | app/api/(frontend)/players/route.ts |
| api | /api/(frontend)/leagues | GET | - | - | app/api/(frontend)/leagues/route.ts |
| api | /api/lucid/oauth/start | GET | - | Google | app/api/lucid/oauth/start/route.ts |
| api | /api/lucid/oauth/callback | GET | - | Google | app/api/lucid/oauth/callback/route.ts |
| api | /api/docs/mermaid/:slug | GET | - | - | app/api/docs/mermaid/[slug]/route.ts |
| api | /api/docs/diagrams/sign | GET | - | - | app/api/docs/diagrams/sign/route.ts |
| api | /api/docs/diagrams/mock-draft-flow | GET | - | - | app/api/docs/diagrams/mock-draft-flow/route.ts |
| api | /api/docs/diagrams/:file | GET | - | - | app/api/docs/diagrams/[file]/route.ts |
| api | /api/docs/diagrams/:...path | GET | - | - | app/api/docs/diagrams/[...path]/route.ts |
| api | /api/drafts/:leagueId/state | GET | - | - | app/api/drafts/[leagueId]/state/route.ts |
| api | /api/drafts/:leagueId/start | POST | - | - | app/api/drafts/[leagueId]/start/route.ts |
| api | /api/drafts/:leagueId/resume | POST | - | - | app/api/drafts/[leagueId]/resume/route.ts |
| api | /api/drafts/:leagueId/pick | POST | - | - | app/api/drafts/[leagueId]/pick/route.ts |
| api | /api/drafts/:leagueId/pause | POST | - | - | app/api/drafts/[leagueId]/pause/route.ts |
| api | /api/(backend)/webhooks/deployment-sync | POST | - | - | app/api/(backend)/webhooks/deployment-sync/route.ts |
| api | /api/(backend)/monitoring/dashboard | GET | - | - | app/api/(backend)/monitoring/dashboard/route.ts |
| api | /api/(backend)/migrations/relax-draft-leagueid | GET | drafts | - | app/api/(backend)/migrations/relax-draft-leagueid/route.ts |
| api | /api/(backend)/migrations/relax-draft-leagueid | POST | drafts | - | app/api/(backend)/migrations/relax-draft-leagueid/route.ts |
| api | /api/(backend)/migrations/standardize-auth-ids | GET | league_memberships | - | app/api/(backend)/migrations/standardize-auth-ids/route.ts |
| api | /api/(backend)/migrations/standardize-auth-ids | POST | league_memberships | - | app/api/(backend)/migrations/standardize-auth-ids/route.ts |
| api | /api/(backend)/migrations/ensure-meshy-jobs | GET | - | - | app/api/(backend)/migrations/ensure-meshy-jobs/route.ts |
| api | /api/(backend)/migrations/ensure-buckets | GET | - | - | app/api/(backend)/migrations/ensure-buckets/route.ts |
| api | /api/(backend)/migrations/ensure-blender-jobs | GET | - | - | app/api/(backend)/migrations/ensure-blender-jobs/route.ts |
| api | /api/(backend)/migrations/backfill-auth-users | POST | - | - | app/api/(backend)/migrations/backfill-auth-users/route.ts |
| api | /api/(backend)/migrations/backfill-commissioner | POST | leagues | - | app/api/(backend)/migrations/backfill-commissioner/route.ts |
| api | /api/(backend)/cron/synthetic-monitoring | GET | - | - | app/api/(backend)/cron/synthetic-monitoring/route.ts |
| api | /api/(backend)/cron/start-drafts | GET | - | - | app/api/(backend)/cron/start-drafts/route.ts |
| api | /api/(backend)/cron/poll-jobs | GET | - | - | app/api/(backend)/cron/poll-jobs/route.ts |
| api | /api/(backend)/cron/draft-autopick | GET | - | - | app/api/(backend)/cron/draft-autopick/route.ts |
| api | /api/(backend)/cron/data-sync | GET | - | CFBD, Rotowire | app/api/(backend)/cron/data-sync/route.ts |
| api | /api/(backend)/cron/assign-draft-orders | GET | league_memberships | - | app/api/(backend)/cron/assign-draft-orders/route.ts |
| api | /api/(backend)/admin/pipeline-status | GET | - | - | app/api/(backend)/admin/pipeline-status/route.ts |
| api | /api/(external)/runway/create | POST | - | - | app/api/(external)/runway/create/route.ts |
| api | /api/(external)/meshy/webhook | POST | - | - | app/api/(external)/meshy/webhook/route.ts |
| api | /api/(external)/meshy/jobs | POST | - | - | app/api/(external)/meshy/jobs/route.ts |
| api | /api/(external)/meshy/jobs | PATCH | - | - | app/api/(external)/meshy/jobs/route.ts |
| api | /api/(external)/cfbd/players | GET | - | CFBD | app/api/(external)/cfbd/players/route.ts |
| api | /api/(external)/blender/upload | POST | - | - | app/api/(external)/blender/upload/route.ts |
| api | /api/(external)/blender/jobs | GET | - | - | app/api/(external)/blender/jobs/route.ts |
| api | /api/(external)/blender/jobs | POST | - | - | app/api/(external)/blender/jobs/route.ts |
| api | /api/(external)/blender/jobs | PATCH | - | - | app/api/(external)/blender/jobs/route.ts |
| api | /api/(external)/blender/exports | GET | - | - | app/api/(external)/blender/exports/route.ts |
| api | /api/(frontend)/rankings/cached | GET | - | - | app/api/(frontend)/rankings/cached/route.ts |
| api | /api/(frontend)/rankings/cached | POST | - | - | app/api/(frontend)/rankings/cached/route.ts |
| api | /api/(frontend)/players/search | GET | - | - | app/api/(frontend)/players/search/route.ts |
| api | /api/(frontend)/players/search | POST | - | - | app/api/(frontend)/players/search/route.ts |
| api | /api/(frontend)/players/cleanup | POST | - | CFBD, Rotowire | app/api/(frontend)/players/cleanup/route.ts |
| api | /api/(frontend)/players/cached | GET | - | - | app/api/(frontend)/players/cached/route.ts |
| api | /api/(frontend)/games/cached | GET | - | - | app/api/(frontend)/games/cached/route.ts |
| api | /api/(frontend)/games/cached | POST | - | - | app/api/(frontend)/games/cached/route.ts |
| api | /api/(frontend)/leagues/schedule | GET | - | - | app/api/(frontend)/leagues/schedule/route.ts |
| api | /api/(frontend)/leagues/schedule | POST | - | - | app/api/(frontend)/leagues/schedule/route.ts |
| api | /api/(frontend)/leagues/recount | POST | - | - | app/api/(frontend)/leagues/recount/route.ts |
| api | /api/(frontend)/leagues/mine | GET | - | - | app/api/(frontend)/leagues/mine/route.ts |
| api | /api/(frontend)/leagues/join | POST | league_memberships, fantasy_teams | - | app/api/(frontend)/leagues/join/route.ts |
| api | /api/(frontend)/leagues/invite | GET | activity_log | - | app/api/(frontend)/leagues/invite/route.ts |
| api | /api/(frontend)/leagues/invite | POST | activity_log | - | app/api/(frontend)/leagues/invite/route.ts |
| api | /api/(frontend)/leagues/:leagueId | GET | clients | - | app/api/(frontend)/leagues/[leagueId]/route.ts |
| api | /api/(frontend)/leagues/:leagueId | PATCH | clients | - | app/api/(frontend)/leagues/[leagueId]/route.ts |
| api | /api/(frontend)/draft/players | GET | college_players | CFBD | app/api/(frontend)/draft/players/route.ts |
| api | /api/(frontend)/leagues/search | GET | - | - | app/api/(frontend)/leagues/search/route.ts |
| api | /api/(frontend)/draft/complete | POST | - | - | app/api/(frontend)/draft/complete/route.ts |
| api | /api/(frontend)/auth/user | GET | - | - | app/api/(frontend)/auth/user/route.ts |
| api | /api/(frontend)/auth/update-profile | PATCH | - | - | app/api/(frontend)/auth/update-profile/route.ts |
| api | /api/(frontend)/auth/debug | GET | - | - | app/api/(frontend)/auth/debug/route.ts |
| api | /api/(frontend)/auth/login | POST | - | - | app/api/(frontend)/auth/login/route.ts |
| api | /api/(frontend)/auth/check | GET | - | - | app/api/(frontend)/auth/check/route.ts |
| api | /api/docs/diagrams/draft/list | GET | - | - | app/api/docs/diagrams/draft/list/route.ts |
| api | /api/(frontend)/auth/clear-session | POST | - | - | app/api/(frontend)/auth/clear-session/route.ts |
| api | /api/(backend)/webhooks/appwrite/schema-drift | POST | - | - | app/api/(backend)/webhooks/appwrite/schema-drift/route.ts |
| api | /api/debug/drafts/:id/reset | POST | - | - | app/api/debug/drafts/[id]/reset/route.ts |
| api | /api/debug/leagues/:leagueId/delete | DELETE | - | - | app/api/debug/leagues/[leagueId]/delete/route.ts |
| api | /api/(backend)/drafts/:leagueId/data | GET | - | - | app/api/(backend)/drafts/[leagueId]/data/route.ts |
| api | /api/(backend)/admin/users/exists | GET | - | - | app/api/(backend)/admin/users/exists/route.ts |
| api | /api/(backend)/admin/players/survey-sec-nfl | POST | college_players | ESPN | app/api/(backend)/admin/players/survey-sec-nfl/route.ts |
| api | /api/(backend)/admin/players/retire | POST | college_players | - | app/api/(backend)/admin/players/retire/route.ts |
| api | /api/(backend)/admin/players/reconcile-depth | POST | college_players | - | app/api/(backend)/admin/players/reconcile-depth/route.ts |
| api | /api/(backend)/admin/players/prune-old-teams | POST | college_players | - | app/api/(backend)/admin/players/prune-old-teams/route.ts |
| api | /api/(backend)/admin/players/override | POST | - | - | app/api/(backend)/admin/players/override/route.ts |
| api | /api/(backend)/admin/players/refresh | POST | college_players | CFBD | app/api/(backend)/admin/players/refresh/route.ts |
| api | /api/(backend)/admin/model-inputs/backfill | GET | college_players | - | app/api/(backend)/admin/model-inputs/backfill/route.ts |
| api | /api/(backend)/admin/model-inputs/backfill | POST | college_players | - | app/api/(backend)/admin/model-inputs/backfill/route.ts |
| api | /api/(backend)/admin/players/cron-cleanup | POST | college_players | CFBD | app/api/(backend)/admin/players/cron-cleanup/route.ts |
| api | /api/(backend)/admin/leagues/sync-members | POST | - | - | app/api/(backend)/admin/leagues/sync-members/route.ts |
| api | /api/(backend)/admin/players/export | GET | college_players | CFBD | app/api/(backend)/admin/players/export/route.ts |
| api | /api/(backend)/admin/dedupe/players | POST | college_players | - | app/api/(backend)/admin/dedupe/players/route.ts |
| api | /api/(external)/blender/file/:fileId | GET | - | - | app/api/(external)/blender/file/[fileId]/route.ts |
| api | /api/(frontend)/users/:userId/name | GET | - | - | app/api/(frontend)/users/[userId]/name/route.ts |
| api | /api/(frontend)/leagues/:leagueId/update-team | PUT | schools | - | app/api/(frontend)/leagues/[leagueId]/update-team/route.ts |
| api | /api/(frontend)/leagues/:leagueId/schedule | GET | - | - | app/api/(frontend)/leagues/[leagueId]/schedule/route.ts |
| api | /api/(frontend)/leagues/:leagueId/members | GET | - | - | app/api/(frontend)/leagues/[leagueId]/members/route.ts |
| api | /api/(frontend)/leagues/:leagueId/members | DELETE | - | - | app/api/(frontend)/leagues/[leagueId]/members/route.ts |
| api | /api/(frontend)/leagues/:leagueId/sync-members | POST | - | - | app/api/(frontend)/leagues/[leagueId]/sync-members/route.ts |
| api | /api/(frontend)/leagues/:leagueId/locker-room | GET | - | - | app/api/(frontend)/leagues/[leagueId]/locker-room/route.ts |
| api | /api/(frontend)/leagues/:leagueId/backfill-league-name | POST | - | - | app/api/(frontend)/leagues/[leagueId]/backfill-league-name/route.ts |
| api | /api/(frontend)/leagues/:leagueId/commissioner | GET | league_memberships | - | app/api/(frontend)/leagues/[leagueId]/commissioner/route.ts |
| api | /api/(frontend)/leagues/:leagueId/commissioner | PUT | league_memberships | - | app/api/(frontend)/leagues/[leagueId]/commissioner/route.ts |
| api | /api/(frontend)/leagues/is-commissioner/:leagueId | GET | - | - | app/api/(frontend)/leagues/is-commissioner/[leagueId]/route.ts |
| function | function:on-draft-deadline-sweep | - | draft_states | - | functions/appwrite/on-draft-deadline-sweep/index.ts |
| function | function:import-players | - | - | CFBD | functions/appwrite/import-players/index.ts |
| function | function:on-league-membership-change | - | fantasy_teams, leagues | - | functions/appwrite/on-league-membership-change/index.ts |
| function | function:on-auction-close | - | - | - | functions/appwrite/on-auction-close/index.ts |
