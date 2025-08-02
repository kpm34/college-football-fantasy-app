# 🗺️ College Football Fantasy App - Workflow Map

## 📁 File Structure & Data Flow

```
college-football-fantasy-app/
│
├── 📂 frontend/                    
│   ├── 📂 app/                     
│   │   ├── 📄 page.tsx             → Landing Page
│   │   ├── 📂 draft/               
│   │   │   └── [leagueId]/         
│   │   │       └── 📄 page.tsx     → Draft Interface
│   │   └── 📂 auction/             
│   │       └── [leagueId]/         
│   │           └── 📄 page.tsx     → Auction Draft
│   │
│   ├── 📂 components/              
│   │   ├── 📂 draft/               → Draft components
│   │   ├── 📂 auction/             → Auction components
│   │   └── 📂 features/            → Feature components
│   │
│   ├── 📂 lib/                     
│   │   ├── 📄 api.ts               → API client config
│   │   └── 📄 appwrite.ts          → Appwrite client
│   │
│   └── 📄 package.json             → Frontend dependencies
│
├── 📂 api/                         
│   ├── 📄 rankings_refresh.py      → Updates AP Top-25 (Vercel Cron)
│   ├── 📄 eligibility.py           → Player eligibility API
│   └── 📄 requirements.txt         → Python dependencies
│
├── 📂 src/                         
│   ├── 📂 api/                     
│   │   ├── 📄 server.ts            → Express API server
│   │   └── 📂 routes/              
│   │       ├── 📄 games.ts         → /api/games
│   │       ├── 📄 teams.ts         → /api/teams
│   │       ├── 📄 rankings.ts      → /api/rankings
│   │       └── 📄 eligibility.ts   → /api/eligibility
│   │
│   ├── 📂 services/                
│   │   ├── 📄 appwrite-data-service.ts  → Appwrite queries
│   │   ├── 📄 eligibility-checker.ts    → Eligibility logic
│   │   └── 📄 live-updates.ts           → Live score updates
│   │
│   └── 📂 scripts/                 
│       ├── 📄 resolve-data-conflicts.ts → Creates missing collections
│       └── 📄 verify-data-links.ts      → Verifies data flow
│
├── 📂 workers/                     
│   ├── 📄 live_worker.py           → ESPN live score scraper
│   └── 📄 Dockerfile               → Worker container
│
├── 📄 vercel.json                  → Deployment config
├── 📄 DATA_FLOW_CONFLICTS.md       → Conflict analysis
└── 📄 scoring.py                   → Fantasy scoring engine
```

## 🔄 Data Workflows

### 1️⃣ **Rankings Update Workflow**
```
CFBD API
    ↓
📄 api/rankings_refresh.py (Cron: Tuesdays 6AM)
    ↓
Appwrite [rankings] collection
    ↓
📄 src/services/appwrite-data-service.ts
    ↓
📄 src/api/routes/rankings.ts
    ↓
Frontend Pages
```

### 2️⃣ **Live Game Workflow**
```
ESPN API
    ↓
📄 workers/live_worker.py (15s polling)
    ↓
Redis Cache
    ↓
❌ Missing: Redis → Appwrite sync
    ↓
Appwrite [games, player_stats] collections
    ↓
📄 src/services/live-updates.ts
    ↓
Scoreboard Page
```

### 3️⃣ **Draft Workflow**
```
📄 frontend/app/draft/[leagueId]/page.tsx
    ↓
📄 frontend/lib/appwrite.ts
    ↓
Appwrite [players, draft_picks] collections
    ↓
❌ Missing: Player data population
    ↓
📄 frontend/components/draft/DraftBoard.tsx
```

### 4️⃣ **Player Eligibility Workflow**
```
User Selection
    ↓
📄 api/eligibility.py
    ↓
Appwrite [player_game_eligibility] collection
    ↓
Returns eligible/ineligible status
```

### 5️⃣ **Fantasy Scoring Workflow**
```
Player Stats (from ESPN)
    ↓
📄 scoring.py (calc_points function)
    ↓
Appwrite [player_stats] collection
    ↓
Team total calculation
    ↓
Leaderboard display
```

## 🚦 Workflow Status

### ✅ Working Workflows
- Rankings refresh (CFBD → Appwrite)
- Basic API endpoints (games, teams, rankings)
- Frontend routing

### ⚠️ Partially Working
- Live game updates (missing sync)
- Eligibility checks (missing data)

### ❌ Broken Workflows
- Player data population
- Draft system (no players)
- Fantasy scoring (no stats)
- User authentication
- League management

## 🔧 Fix Order

1. **Run collection creation**
   ```bash
   npx ts-node src/scripts/resolve-data-conflicts.ts
   ```

2. **Populate player data**
   - Create ETL from CFBD → players collection
   - Add ID mapping

3. **Connect live updates**
   - Build Redis → Appwrite sync in live_worker.py
   - Update player_stats in real-time

4. **Enable draft system**
   - Ensure players collection has data
   - Test draft pick flow

5. **Implement scoring**
   - Connect scoring.py to player_stats
   - Calculate team totals

## 📊 Data Dependencies

```
Frontend Pages          Required Collections
─────────────          ──────────────────
/                      None (static)
/draft/[id]       →    players, teams, leagues, draft_picks
/auction/[id]     →    players, teams, leagues, auction_bids
/teams            →    teams, players, rosters
/scoreboard       →    games, player_stats, rosters
/league/[id]      →    leagues, teams, transactions
```

## 🎯 Quick Reference

**Add new API endpoint:**
1. Create route in `src/api/routes/`
2. Add to `src/api/server.ts`
3. Update frontend API calls

**Add new collection:**
1. Update `src/scripts/resolve-data-conflicts.ts`
2. Run the script
3. Update TypeScript types

**Deploy changes:**
1. Push to main branch
2. Vercel auto-deploys
3. Check logs at vercel.com