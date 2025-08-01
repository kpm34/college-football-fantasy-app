# College Football Fantasy App - Project Memory

## 🎯 Project Mission
Build a fantasy football platform exclusively for Power 4 conferences with unique eligibility rules that make every game matter.

## 📊 Current Architecture

```
college-football-fantasy-app/
├── src/
│   ├── api/               # Express.js API
│   │   ├── server.ts      # Main server file
│   │   └── routes/        # API endpoints
│   ├── services/
│   │   ├── appwrite-data-service.ts  # Appwrite integration
│   │   ├── eligibility-checker.ts    # Game eligibility logic
│   │   └── live-updates.ts           # Real-time updates
│   ├── types/             # TypeScript interfaces
│   └── utils/             # Helpers (cache, rate-limiter)
├── frontend/              # Next.js app
│   ├── app/              # App router pages
│   ├── components/       # React components
│   └── SPLINE-GUIDE.md   # 3D integration guide
└── scripts/              # Data sync & setup scripts
```

## 🔑 Key Business Rules

1. **Conference Restrictions**
   - Only SEC, ACC, Big 12, and Big Ten teams
   - No cross-conference restrictions for drafting

2. **Player Eligibility**
   - Can only start players in games vs AP Top-25 teams
   - OR in conference games (e.g., SEC vs SEC)
   - 12-week regular season only

3. **Scoring System**
   - PPR (Point Per Reception) default
   - Live scoring every 30 seconds
   - Commissioner adjustable settings

## 🛠️ Tech Decisions Made

### Backend
- **Express.js**: RESTful API with TypeScript
- **Appwrite**: BaaS for database, auth, real-time
- **Data Sources**: ESPN (free) primary, CFBD backup
- **Caching**: In-memory cache, planning Redis

### Frontend  
- **Next.js 15**: App router, server components
- **Spline**: 3D visualizations and interactions
- **Tailwind CSS**: Utility-first styling
- **Cursor AI**: Development acceleration

### Infrastructure
- **Appwrite Cloud NYC**: Database and auth
- **GitHub**: Version control
- **Scheduled Syncs**: Games (5min), Rankings (Tuesdays)

## 📝 Implementation Status

### ✅ Completed
1. Project requirements document (PRD)
2. Express API with all core endpoints
3. Appwrite database setup (NYC region)
4. Data sync from ESPN/CFBD
5. Eligibility checking logic
6. Frontend scaffold with Spline

### 🚧 In Progress
- User authentication system
- League management APIs

### 📋 Upcoming
1. User registration/login (Appwrite Auth)
2. League creation and invites
3. Snake draft implementation
4. Roster management
5. Weekly lineup submission
6. Live scoring engine
7. Trade system
8. Waiver wire

## 🔗 Key URLs & Credentials

- **GitHub**: https://github.com/kpm34/college-football-fantasy-app
- **Appwrite Project**: NYC region, ID: 688ccd49002eacc6c020
- **API**: http://localhost:3000
- **Frontend**: http://localhost:3001

## 💡 Design Patterns

1. **Service Layer**: All data access through services
2. **Type Safety**: Full TypeScript coverage
3. **Error Handling**: Try-catch with proper logging
4. **Rate Limiting**: Prevent API throttling
5. **Caching Strategy**: Minimize external API calls

## 🎨 UI/UX Concepts

1. **3D Elements** (via Spline):
   - Animated stadium for homepage
   - 3D draft board experience
   - Trophy room for winners
   - Live game field visualization

2. **Color Scheme**:
   - Dark theme (gray-900 to black gradient)
   - Yellow accents (#facc15)
   - Conference colors for teams

3. **Key Pages**:
   - Landing (with 3D hero)
   - Dashboard (user leagues)
   - Draft room
   - Roster management
   - Live scoring
   - League standings

## 🐛 Known Issues & Solutions

1. **ESPN API Rate Limits**: 
   - Solution: Cache aggressively, use Appwrite as primary

2. **Rankings Storage**: 
   - Fixed: JSON stringify for array storage

3. **Region Mismatch**:
   - Fixed: Use NYC endpoint for Appwrite

## 📚 Helpful Commands

```bash
# Start backend API
npm run server

# Start frontend
cd frontend && npm run dev

# Sync data from ESPN/CFBD
npm run sync-data

# Check Appwrite data
npx ts-node src/scripts/check-data.ts

# Run API tests
npm test
```

## 🤝 Team Notes

- Using Cursor AI for frontend development
- Spline for 3D visualizations
- Focus on Power 4 conferences only
- Emphasis on "elite matchups only" positioning

---

Last Updated: 2025-08-01