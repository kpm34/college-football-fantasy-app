## 💡 Idea Bank — Organized by Expense, Practicality, Ease (2025)

Legend
- Expense: Low (≤ $100/mo incremental), Medium ($100–$500/mo), High ($500+/mo or heavy usage/infra)
- Practicality: High (core value, broad users), Medium (nice-to-have), Low (niche/experimental)
- Ease: Easy (≤ 1 week), Medium (1–3 weeks), Hard (≥ 1 month or multi-team)

### Tier A — Ship First (Low expense • High practicality • Easy)
1) Draft Advisor v1 (server-only)
   - Tools: Claude + GPT (server), Appwrite, Vercel Edge
   - Deliverable: `/api/draft/advice` returns top 3 picks with reasons; UI hint in `components/draft/DraftHelper.tsx`
   - KPIs: Pick time ↓, user satisfaction ↑
2) On-the-clock & Outbid Notifications
   - Tools: Appwrite Functions + Realtime; Email provider
   - Deliverable: triggers for draft/auction timers; in-app + email notifications
   - KPIs: Missed-pick rate ↓, bid engagement ↑
3) Live Scoreboard + Win Probability (basic)
   - Tools: Appwrite Realtime, Vercel KV, simple logistic model
   - Deliverable: `app/scoreboard/page.tsx` shows live totals + win% with “why” deltas
   - KPIs: Session length ↑, return rate ↑
4) KV Caching for Players/Games/Rankings
   - Tools: Vercel KV
   - Deliverable: implement caches in `app/api/*/cached/route.ts`, invalidate via `app/api/cache/invalidate`
   - KPIs: P95 latency ↓, error rate ↓
5) Auto Schedule on League Fill
   - Tools: Appwrite Function
   - Deliverable: generate `matchups` when `leagues.currentTeams == maxTeams`
   - KPIs: Time-to-first-draft ↓
6) Eligibility Explanations in Live Feed
   - Tools: CFBD/ESPN + rule engine
   - Deliverable: “Counts (vs Top-25)” or “Not eligible (non-conference)” labels

### Tier B — Near-term Upgrades (Low/Medium expense • High practicality • Medium ease)
1) Trade Analyzer v1
   - Tools: Claude + GPT, projections service
   - Deliverable: `/api/trades/analyze` with fairness score, SoS impact
2) Weekly Recap (Email + In-app)
   - Tools: Claude + GPT + templates
   - Deliverable: top players, grade, missed-optimals; send Sunday night
3) Draft Timer + Auto-pick (authoritative)
   - Tools: Appwrite Function + Realtime
   - Deliverable: server clock, emits ticks, auto-pick on timeout
4) Admin Ops Dashboard + MCP Fixers
   - Tools: MCP route + admin UI
   - Deliverable: buttons for player dedupe, cache invalidate, schedule regen
5) Invite Deep Links + OG Enhancements
   - Tools: Next OG routes
   - Deliverable: better previews and auto-join links

### Tier C — Media/3D Identity (Medium expense • Medium/High practicality • Medium/Hard)
1) Mascot Presets + Thumbnails
   - Tools: Spline (viewer), Next/Image, Appwrite Storage
   - Deliverable: save preset JSON and thumbnail on `team/[teamId]`
2) Team Intro Video Templates
   - Tools: Runway
   - Deliverable: 5–10s intro clip on draft start or weekly matchup
3) Share Cards (Matchup/Win%)
   - Tools: Next OG
   - Deliverable: dynamic images for social sharing
4) Feature Flags & A/B Tests
   - Tools: Vercel Edge Config
   - Deliverable: controlled rollout for AI/3D features

### Tier D — Big Bets (High expense • High practicality • Hard)
1) Highlight Auto-generation
   - Tools: Runway (clip generation), CFBD/ESPN event triggers
   - Deliverable: automatic highlights per scoring play; opt-in sharing
2) Full Mascot Studio + 3D Generation
   - Tools: Spline editor, Meshy (3D generation), Appwrite Storage
   - Deliverable: editable 3D mascot with export limits by tier
3) Advanced Real-time Projections
   - Tools: CFBD/ESPN polling, Appwrite Functions, KV streaming
   - Deliverable: per-play projection updates and risk bands
4) Social Chat + AI Taunts (Moderated)
   - Tools: Realtime, Claude moderation layer
   - Deliverable: live chat channels with rivalry prompts

### Implementation Map (where to plug in)
- Draft Advisor/API: `app/api/draft/[leagueId]/status`, `app/api/draft/advice` (new), `components/draft/*`
- Notifications: Functions + `app/api/cron/*`, integrate with `components/draft/DraftNotifications.tsx`
- KV Caching: `app/api/players/games/rankings/*`, `app/api/cache/invalidate`
- Schedule: `app/api/leagues/schedule/route.ts`, trigger when league fills
- Admin/MCP: `app/api/mcp/route.ts`, `app/admin/*`
- Mascot: `app/team/[teamId]/page.tsx`, `vendor/awwwards-rig/*` (as module)
- Recaps/Trade Analyzer: `app/api/insights/*` (new), render in `app/dashboard/page.tsx`

### Suggested Roadmap (incremental)
1) Tier A items (2–3 weeks total)
2) Tier B items (3–5 weeks)
3) Tier C items (parallelizable; start with presets/thumbnails)
4) Tier D experiments behind flags


