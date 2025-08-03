# College Football Fantasy App - Workflow Map

## 🎯 **CURRENT PROJECT STATUS**
**Last Updated**: August 2, 2025
**Status**: ✅ **LIVE & DEPLOYED**
**URL**: https://college-football-fantasy-app.vercel.app

## 🚀 **DEPLOYMENT STATUS**
- ✅ **Vercel Deployment**: Successfully deployed and working
- ✅ **Alias Configured**: `college-football-fantasy-app.vercel.app` → Latest deployment
- ✅ **All Pages Working**: Create/Join League, Draft Board, Team Management
- ✅ **API Endpoints**: All backend APIs functional with sample data

## 📁 **CLEANED PROJECT STRUCTURE**

### **Root Directory**
```
college-football-fantasy-app/
├── frontend/                    # Next.js 15 Frontend (MAIN APP)
├── src/                        # Backend services & data collection
├── api/                        # Python API endpoints
├── workers/                    # Background workers
├── appwrite-schema.json        # Database schema
├── vercel.json                 # Deployment config
└── [Documentation Files]
```

### **Frontend Structure** (Working)
```
frontend/
├── app/                        # Next.js App Router
│   ├── page.tsx               # Landing page
│   ├── league/
│   │   ├── create/page.tsx    # Create league
│   │   ├── join/page.tsx      # Join league
│   │   └── [leagueId]/page.tsx # League home
│   ├── draft/
│   │   ├── [leagueId]/page.tsx # Draft interface
│   │   └── [leagueId]/draft-board/page.tsx # Draft board
│   ├── team/[teamId]/page.tsx # Team management
│   ├── scoreboard/page.tsx    # League scoreboard
│   ├── standings/page.tsx     # League standings
│   └── api/                   # API routes
├── components/                 # React components
│   ├── draft/                 # Draft components
│   ├── auction/               # Auction components
│   ├── ui/                    # UI components
│   └── features/              # Feature components
├── types/                     # TypeScript types
├── lib/                       # Utilities & config
└── public/                    # Static assets
```

## 🔧 **TECHNICAL STACK**

### **Frontend**
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Vercel

### **Backend**
- **Database**: Appwrite (NYC region)
- **APIs**: Python FastAPI + Express.js
- **Data Sources**: ESPN API, CollegeFootballData API

### **Key Features**
- ✅ League Creation & Management
- ✅ User-Friendly Drafting System
- ✅ Team Management Interface
- ✅ Real-time Updates (Appwrite)
- ✅ Mobile Responsive Design

## 📋 **WORKING FEATURES**

### **1. League Management**
- ✅ Create new leagues (ESPN-style interface)
- ✅ Join public/private leagues
- ✅ League home dashboard
- ✅ Member management

### **2. Drafting System**
- ✅ Smart draft helper with recommendations
- ✅ Player filtering and search
- ✅ Real-time draft board
- ✅ Team needs analysis
- ✅ **NEW**: Ensemble projection system with multi-source data

### **3. Team Management**
- ✅ Roster management
- ✅ Player stats and projections
- ✅ Waiver wire integration
- ✅ Weekly lineup management

### **4. League Features**
- ✅ Scoreboard with matchups
- ✅ Standings and playoff picture
- ✅ League activity tracking

### **5. Data Collection & Projections**
- ✅ **NEW**: Big 12 Draft Board Seeder with ensemble data sources
- ✅ CFBD historical data integration
- ✅ Vegas odds integration (point spreads & totals)
- ✅ SP+ metrics framework (placeholder)
- ✅ Injury data framework (placeholder)
- ✅ Automated GitHub Actions workflows

## 🗄️ **DATABASE COLLECTIONS**

### **Appwrite Collections**
- `leagues` - League information
- `fantasy_teams` - User teams
- `college_teams` - College team data
- `college_players` - Player data
- `player_stats` - Player statistics
- `draft_picks` - Draft selections
- `auction_sessions` - Auction data
- `activity_log` - League activity
- `players` - Draftable players (Big 12)
- `weekly_projections` - Weekly fantasy projections
- `season_projection` - Season-long projections
- `meta` - Processing metadata and data source info

## 🚀 **DEPLOYMENT COMMANDS**

### **Local Development**
```bash
cd frontend
npm run dev          # Start frontend (port 3001)
```

### **Production Deployment**
```bash
cd frontend
vercel --prod        # Deploy to Vercel
```

### **Database Management**
```bash
# Appwrite CLI commands
appwrite projects list
appwrite databases list
appwrite collections list
```

## 📊 **DATA FLOW**

### **Current Data Sources**
1. **ESPN API** - Team rosters, basic stats
2. **CollegeFootballData API** - Detailed player stats, historical pace data
3. **OddsAPI.io** - Vegas odds (point spreads & totals)
4. **SP+ Metrics** - Bill Connelly's efficiency ratings (framework)
5. **Rotowire** - Injury data (framework)
6. **Appwrite** - User data, league data, real-time updates

### **Data Collection Process**
1. **Big 12 Seeder**: Collect team rosters and historical stats from CFBD
2. **Ensemble Projections**: Combine multiple data sources for accurate projections
3. **Weekly Updates**: Automated projection updates via GitHub Actions
4. **Store in Appwrite**: Players, projections, and metadata
5. **Serve to Frontend**: Via API routes with real-time updates

## 🔄 **DEVELOPMENT WORKFLOW**

### **1. Feature Development**
- Create feature branch
- Develop in frontend directory
- Test locally with `npm run dev`
- Deploy with `vercel --prod`

### **2. Data Updates**
- Run data collection scripts in `src/`
- Update Appwrite collections
- Test API endpoints
- Deploy frontend changes

### **3. Bug Fixes**
- Identify issue in Vercel logs
- Fix in local development
- Test thoroughly
- Deploy fix

## 📝 **IMPORTANT FILES**

### **Configuration**
- `frontend/package.json` - Dependencies
- `vercel.json` - Deployment config
- `frontend/lib/appwrite.ts` - Database config
- `appwrite-schema.json` - Database schema

### **Key Components**
- `frontend/app/page.tsx` - Landing page
- `frontend/components/draft/DraftHelper.tsx` - Draft assistance
- `frontend/app/api/players/draftable/route.ts` - Player API
- `frontend/types/player.types.ts` - Type definitions
- `src/scripts/seed_big12_draftboard.py` - Enhanced Big 12 seeder
- `src/scripts/projection_updater.py` - Weekly projection updates
- `src/scripts/data_collector.py` - Data collection service
- `.github/workflows/big12-seeder.yml` - Automated seeding workflow

## 🎯 **NEXT STEPS**

### **Immediate Priorities**
1. ✅ **Deployment** - COMPLETED
2. ✅ **Core Features** - COMPLETED
3. 🔄 **Data Integration** - In Progress
4. 🔄 **User Authentication** - Planned
5. 🔄 **Real-time Features** - Planned

### **Future Enhancements**
- User authentication system
- Advanced draft strategies
- Mobile app development
- Advanced analytics
- Social features

## 🚨 **TROUBLESHOOTING**

### **Common Issues**
1. **Build Errors**: Check TypeScript types in `frontend/types/`
2. **API Errors**: Verify Appwrite collections in `appwrite-schema.json`
3. **Deployment Issues**: Check `vercel.json` configuration
4. **Data Issues**: Run data collection scripts in `src/`

### **Useful Commands**
```bash
# Check deployment status
vercel ls

# View build logs
vercel inspect [deployment-url] --logs

# Update alias
vercel alias set [deployment-url] [alias]

# Check Appwrite status
appwrite projects list
```

## 📞 **SUPPORT**

### **Documentation**
- `API-DOCS.md` - API documentation
- `APPWRITE-SETUP.md` - Database setup
- `VERCEL_DEPLOYMENT_GUIDE.md` - Deployment guide

### **Key URLs**
- **Live App**: https://college-football-fantasy-app.vercel.app
- **Vercel Dashboard**: https://vercel.com/kpm34s-projects/college-football-fantasy-app
- **Appwrite Console**: https://cloud.appwrite.io/console

---

**Last Cleanup**: August 2, 2025 - Removed broken files, duplicates, and updated structure
**Status**: ✅ Production Ready