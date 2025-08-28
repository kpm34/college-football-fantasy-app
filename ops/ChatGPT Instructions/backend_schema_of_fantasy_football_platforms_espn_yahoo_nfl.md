# Backend & Schema of Fantasy Football Platforms (ESPN, Yahoo, NFL)

> A pragmatic, engineering-focused overview of how the major fantasy platforms structure **drafts** and **rosters**, with example schemas you can adapt for CFB.

---

## 1) Executive Takeaways (what consistently works at scale)

1. **Server‑owned draft engine.** The server decides who’s on the clock, the deadline, and executes picks (including autopick). Clients are passive views.
2. **One authoritative state document per league.** Keep a single, small, frequently-updated snapshot (e.g., `draft_states[leagueId]`). All clients subscribe to this.
3. **Append‑only picks log.** Every pick is an immutable record (`draft_picks`). On restart or for late joiners, rebuild the board from the log + latest state.
4. **Idempotency & uniqueness.** Idempotency keys on pick mutations; unique constraints on `(leagueId, pick)` and `(leagueId, playerId)` to prevent double-picks.
5. **Server time, not client time.** Broadcast `serverNow` and `deadlineAt`. Clients render countdown using offset; no local clock authority.
6. **Post‑draft materialization.** When the draft completes, write final team rosters to the roster store in one authoritative pass.

These patterns show up (explicitly or implicitly) across ESPN, Yahoo, and NFL Fantasy.

---

## 2) ESPN Fantasy (high‑level)

**Architecture & behavior**

- Enterprise web stack with a relational core, heavy caching, and push/streaming updates for real‑time experiences.
- Live draft: strict server turn order; client UI updates as events stream. Autopick uses a user’s pre‑ranked queue when the timer expires.

**Data model (in practice)**

- Core entities: **League**, **Team**, **Player**, **DraftPick**, **Roster**, **Transaction**.
- Derived/document views expose different facets (rosters, draft detail, settings). A single request can include multiple views for one league.

**Implications for schema**

- A normalized relational model with event logs (picks, transactions) + a live state snapshot scales cleanly.
- Treat season/league IDs as first‑class partition keys.

---

## 3) Yahoo Fantasy (high‑level)

**Architecture & behavior**

- Resource‑oriented public API (OAuth). Clear resource graph: Game → League → Team → Roster/Transactions/DraftResults.
- Live draft supports snake/auction. Server enforces order/timer; autopick from user queue if needed.

**Data model (reflected in API)**

- **League** has `draft_status`, settings, teams.
- **Team** belongs to a league; can have co‑managers.
- **Roster** is a team’s players (current or by week); **DraftResults** list pick order, team, player, and (for auctions) cost.
- **Transactions** capture adds/drops/trades with timestamps and waiver logic.

**Implications for schema**

- Use composite keys and stable resource identifiers (e.g., `gameKey.leagueId.teamId`).
- Persist draft results separately from rosters; don’t infer one from the other at query time.

---

## 4) NFL Fantasy (high‑level)

**Architecture & behavior**

- Partner/private API in most eras; standard live draft features with server‑owned timers and autopick.
- Weekly lineup locking/roster states; matchups computed from starters per week.

**Data model**

- **League**, **Team**, **Player**, **DraftPick**, **Roster**, **Matchup**, **Transaction**.
- Weekly lineup state implies either a `Lineup` table (teamId, week, slot, playerId) or an equivalent weekly snapshot.

**Implications for schema**

- Separate “owned players” (season‑long) from “starting lineup” (per‑week). Store both.

---

## 5) Reference Draft Engine Schema (drop‑in pattern)

### 5.1 Authoritative draft state (one doc per league)

```json
// collection: draft_states, docId = <leagueId>
{
  "_id": "<leagueId>",
  "version": 7,                      // optimistic concurrency
  "phase": "scheduled | drafting | paused | complete | canceled | failed",
  "onClockTeamId": "team_123",      // id used everywhere else
  "round": 3,
  "pickIndex": 25,                   // overall pick number (1..N)
  "picksPerRound": 12,
  "deadlineAt": "2025-08-28T18:05:00Z",
  "lastPickId": "f1d3-...-uuid",    // Idempotency-Key of last accepted pick
  "serverNow": "2025-08-28T18:04:02Z"
}
```

### 5.2 Append‑only picks

```json
// collection: draft_picks, docId = p_<leagueId>_<pickIndex>
{
  "_id": "p_leagueA_025",
  "leagueId": "leagueA",
  "teamId": "team_123",
  "playerId": "player_987",
  "round": 3,
  "pick": 25,                        // overall pick number
  "timestamp": "2025-08-28T18:04:30Z"
}
```

**Indexes / constraints**

- Unique `(leagueId, pick)`
- Unique `(leagueId, playerId)`

### 5.3 League configuration (single source of config truth)

```json
// collection: leagues
{
  "_id": "leagueA",
  "name": "My League",
  "phase": "scheduled | drafting | paused | complete | canceled | failed",
  "draftDate": "2025-08-28T17:30:00Z",
  "pickTimeSeconds": 60,
  "draftOrder": ["team_101", "team_123", "BOT-3", "team_204", "team_305", ...]
}
```

### 5.4 Rosters (post‑draft materialization)

```json
// collection: rosters  (one per team per league)
{
  "_id": "leagueA_team_123",
  "leagueId": "leagueA",
  "teamId": "team_123",
  "players": ["player_987", "player_654", ...],
  "seededAt": "2025-08-28T18:40:00Z"
}
```

### 5.5 Weekly lineups (optional but recommended)

```json
// collection: lineups (one doc per team per league per week)
{
  "_id": "leagueA_team_123_week_1",
  "leagueId": "leagueA",
  "teamId": "team_123",
  "week": 1,
  "slots": [
    { "slot": "QB", "playerId": "player_987" },
    { "slot": "RB", "playerId": "player_654" },
    { "slot": "FLEX", "playerId": "player_321" }
  ],
  "lockedAt": "2025-09-01T17:59:59Z"
}
```

---

## 6) Minimal Server APIs (behavioral contract)

- `POST /drafts/{leagueId}/start`

  - Seeds `draft_states` from `leagues.draftOrder`, sets `phase='drafting'`, `onClockTeamId`, and first `deadlineAt`.

- `POST /drafts/{leagueId}/pick`

  - Headers: `Idempotency-Key: <uuid>`
  - Body: `{ teamId, playerId }`
  - Server validates on‑clock & deadline, checks uniqueness, appends to `draft_picks`, bumps `draft_states` atomically.

- `POST /drafts/{leagueId}/pause` / `/resume`

  - Toggle `phase` and freeze/unfreeze timer.

- `GET /drafts/{leagueId}/state`

  - Returns current `draft_states` + `serverNow` (for client offset).

- **Cron watchdog** (e.g., Vercel Cron)

  - Every 1–2 minutes: if `deadlineAt < now` and `phase='drafting'`, autopick via the same pick path.

---

## 7) Roster Storage & Updates (after draft)

- **Materialize once** at end of draft: group `draft_picks` by `teamId` and write to `rosters`.
- **Transactions** (free agents, waivers, trades) append to a `transactions` log and update `rosters` accordingly.
- **Weekly lineups** are separate from owned rosters; lock per kickoff rules.

---

## 8) Pitfalls these schemas avoid

- **Split brain:** One state doc per league prevents divergent views.
- **Double picks:** Deterministic IDs + uniqueness + idempotency.
- **Stalled drafts:** Server‑side cron guarantees progress even with no clients.
- **Clock drift:** Clients render against `serverNow`/`deadlineAt` only.
- **Hard restarts:** Rebuild board from `draft_picks` anytime; state is just a snapshot.

---

## 9) Mapping to College Football Fantasy

- **Player pool**: `college_players` replaces NFL `players`; keep identical key usage.
- **Teams**: keep a stable fantasy team ID and use it consistently across `leagues.draftOrder`, `draft_states.onClockTeamId`, `draft_picks.teamId`, `rosters.teamId`.
- **Schedule/weeks**: CFB has irregular bye weeks; drive `lineups.lockedAt` off actual kickoff timestamps per game.
- **Positions/eligibility**: encode roster slots (QB, RB, WR, TE, FLEX, etc.) centrally; validate at pick time and lineup submission.

---

## 10) Quick Implementation Checklist

-

---

### Final Note

This document abstracts proven behaviors from major platforms into concrete schemas and endpoints you can adopt directly. It is intentionally implementation‑agnostic (fits Appwrite, SQL, or NoSQL) while preserving the invariants that keep drafts **fast, correct, and resilient** at scale.

