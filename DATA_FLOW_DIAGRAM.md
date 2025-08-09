# Data Flow Diagram - APIs to Frontend Pages

## 🔄 Complete Data Flow Architecture (Updated Aug 9, 2025)

```mermaid
graph TB
    %% External APIs
    subgraph "External APIs"
        CFBD[CFBD API ✅]
        ESPN[ESPN API]
        ODDS[OddsAPI.io]
        ROTO[Rotowire]
    end
    
    %% ETL Layer
    subgraph "ETL/Scrapers"
        SEEDER[Big 12 Seeder ✅]
        ETL[ETL Worker]
        LIVE[Live Score Worker]
        RANK[Rankings Refresh]
        PROJ[Projection Service]
    end
    
    %% Data Storage
    subgraph "Data Storage"
        AW[(Appwrite DB ✅)]
        REDIS[(Redis Cache)]
    end
    
    %% API Routes
    subgraph "Next.js API Routes"
        PAPI[/api/players/draftable ✅]
        DAPI[/api/draft/status ✅]
        LAPI[/api/leagues]
    end
    
    %% Frontend Pages
    subgraph "Frontend Pages"
        HOME[League Home]
        CREATE[Create League ✅]
        TEAMS[Teams Page]
        SCORE[Scoreboard]
        DRAFT[Draft Page]
        STATS[Player Stats]
    end
    
    %% Data Flow Connections
    CFBD --> SEEDER
    ODDS --> SEEDER
    ROTO --> SEEDER
    
    SEEDER --> AW
    CFBD --> ETL
    CFBD --> RANK
    ESPN --> LIVE
    
    ETL --> AW
    RANK --> AW
    LIVE --> REDIS
    
    AW --> PAPI
    AW --> DAPI
    AW --> LAPI
    
    PAPI --> DRAFT
    DAPI --> DRAFT
    LAPI --> HOME
    LAPI --> CREATE
    
    AW --> TEAMS
    AW --> SCORE
    AW --> STATS
    %% Test page removed in cleanup
    
    REDIS -.->|Real-time| SCORE
    AW -.->|Subscriptions| HOME
    AW -.->|Subscriptions| DRAFT
```

## 📊 Data Collections to Frontend Mapping

### 🏠 **League Home Page**
```
Required Data:
├── leagues (Appwrite)
│   └── League settings, scoring rules
├── teams (Appwrite)
│   └── Team names, owners, records
├── rankings (Appwrite)
│   └── AP Top-25 display
└── transactions (Appwrite)
    └── Recent activity feed

API Sources:
├── CFBD → Rankings → Appwrite
└── User Actions → Transactions → Appwrite
```

### 👥 **Teams Page**
```
Required Data:
├── teams (Appwrite)
│   └── Team information
├── rosters (Appwrite)
│   └── Current player lineup
├── players (Appwrite)
│   └── Player details
└── player_stats (Appwrite)
    └── Performance metrics

API Sources:
├── CFBD → Players → ETL → Appwrite
└── ESPN → Live Stats → Redis → Sync → Appwrite
```

### 📊 **Scoreboard Page**
```
Required Data:
├── games (Appwrite)
│   └── Game schedules and scores
├── player_stats (Appwrite)
│   └── Real-time performance
├── rosters (Appwrite)
│   └── Active lineups
└── teams (Appwrite)
    └── Fantasy points totals

API Sources:
├── ESPN → Live Scores → Redis
├── Redis → Sync Service → Appwrite
└── Scoring Engine → Fantasy Points → Appwrite
```

### 🎯 **Draft Page**
```
Required Data:
├── players (Appwrite)
│   └── Available players
├── draft_picks (Appwrite)
│   └── Pick history
├── teams (Appwrite)
│   └── Draft order
└── leagues (Appwrite)
    └── Draft settings

API Sources:
├── CFBD → Players → ETL → Appwrite
└── User Actions → Draft Picks → Appwrite
```

### 📈 **Player Stats Page**
```
Required Data:
├── players (Appwrite)
│   └── Player information
├── player_stats (Appwrite)
│   └── Historical stats
├── games (Appwrite)
│   └── Game context
└── rankings (Appwrite)
    └── Team rankings

API Sources:
├── CFBD → Stats → ETL → Appwrite
└── ESPN → Box Scores → Live Worker → Appwrite
```

## 🔗 Critical Data Links

### 1. **ID Mapping Flow**
```
External ID (CFBD/ESPN) → ID Mapping Service → Internal UUID (Appwrite)
```

### 2. **Live Score Flow**
```
ESPN API → Live Worker → Redis Pub/Sub → Sync Service → Appwrite Realtime → Frontend
```

### 3. **Draft Flow**
```
User Selection → Draft Pick → Roster Update → Team Score Calculation
```

### 4. **Transaction Flow**
```
User Action → Transaction Log → Roster Update → Score Recalculation
```

## 🚨 Data Verification Points

### **Before Deployment:**
1. ✅ All Appwrite collections created
2. ✅ ID mappings populated
3. ✅ Sample data in each collection
4. ✅ API endpoints tested
5. ✅ Real-time subscriptions working

### **During Operation:**
1. 📊 Monitor sync latency (< 5 seconds)
2. 📊 Check ID mapping success rate (> 99%)
3. 📊 Verify data completeness
4. 📊 Track API response times
5. 📊 Monitor error rates

## 🛠️ Testing Commands

```bash
# 1. Verify all data links
npx ts-node src/scripts/verify-data-links.ts

# 2. Test specific page data
curl https://your-app.vercel.app/api/teams
curl https://your-app.vercel.app/api/rankings
curl https://your-app.vercel.app/api/games

# 3. Check Appwrite collections
# Use Appwrite Console or SDK to verify data

# 4. Test real-time updates
# Open browser console and check WebSocket connections
```

## 📱 Frontend Integration Checklist

### **League Home**
- [ ] Fetch leagues from Appwrite
- [ ] Display rankings from rankings collection
- [ ] Show recent transactions
- [ ] Real-time league updates

### **Teams Page**
- [ ] Load team rosters
- [ ] Display player stats
- [ ] Calculate fantasy points
- [ ] Show team standings

### **Scoreboard**
- [ ] Real-time game scores
- [ ] Live fantasy point updates
- [ ] Player performance tracking
- [ ] Score animations

### **Draft Page**
- [ ] Available players list
- [ ] Draft timer sync
- [ ] Pick notifications
- [ ] Auto-draft functionality

### **Player Stats**
- [ ] Historical performance
- [ ] Season statistics
- [ ] Matchup analysis
- [ ] Trend charts

## 🎯 Success Criteria

1. **Data Freshness**
   - Rankings: Updated weekly
   - Live scores: < 30 second delay
   - Player stats: Real-time during games

2. **Data Accuracy**
   - ID mappings: 100% accurate
   - Fantasy points: Matches scoring rules
   - Transactions: Atomic and consistent

3. **Performance**
   - Page load: < 3 seconds
   - API response: < 100ms
   - Real-time updates: < 5 seconds

This diagram ensures all data flows correctly from external APIs through your backend services to the frontend pages where users interact with the data.

## 🔌 **Current Integration Status** (Aug 3, 2025)

### ✅ **Completed Integrations**
1. **CFBD API Authentication**
   - Primary API Key: Working
   - Backup API Key: Working
   - Endpoints tested and verified

2. **Appwrite Connection**
   - Frontend connected via environment variables
   - Server-side helper created (`appwrite-server.ts`)
   - Test page available at `/test-appwrite`

3. **API Routes**
   - `/api/players/draftable`: Connected to Appwrite with fallback
   - `/api/draft/[leagueId]/status`: Connected to Appwrite with fallback
   - All routes handle missing data gracefully

4. **Frontend Features**
   - League Creation: Saves to Appwrite
   - Draft Page: Ready for Appwrite data
   - Test Page: Verifies connections

5. **Data Collection Scripts**
   - Big 12 Seeder: Updated with correct endpoints
   - Ensemble projection system: Framework ready
   - Mock data generator: Available as fallback

### ⚠️ **Pending Tasks**
1. **Appwrite Collections**
   - Need to create `college_players` collection
   - Schema defined in `appwrite-schema.json`

2. **Data Population**
   - Big 12 Seeder ready to run
   - Waiting for collection creation

3. **Additional API Keys** (Optional)
   - OddsAPI.io for Vegas lines
   - Rotowire for injury data

4. **Vercel Deployment**
   - Add environment variables to Vercel
   - Deploy updated API routes

### 🚀 **Quick Start Commands**
```bash
# Test Appwrite connection
npm run test-appwrite

# Run Big 12 seeder (after creating collection)
python3 src/scripts/seed_big12_draftboard.py

# Start frontend dev server
cd frontend && npm run dev

# Access test page
open http://localhost:3001/test-appwrite
```