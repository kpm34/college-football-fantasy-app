# College Football Fantasy App - Comprehensive Project Map

## 🚀 Live Deployment
- **Production URL**: https://college-football-fantasy-fz3de5a3k-kpm34s-projects.vercel.app
- **Platform**: Vercel
- **Status**: Successfully deployed and operational

## 📁 Project Structure (Root-Level Next.js)

```
college-football-fantasy-app/
├── app/                          # Next.js 15 App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/           # Email/password login
│   │   │   ├── signup/          # User registration
│   │   │   ├── oauth/           # OAuth providers (Google, Apple)
│   │   │   └── user/            # Current user endpoint
│   │   ├── leagues/             # League management
│   │   │   ├── [leagueId]/      # Individual league operations
│   │   │   ├── create/          # Create new league
│   │   │   ├── my-leagues/      # User's leagues
│   │   │   └── search/          # Search leagues
│   │   ├── draft/               # Draft operations
│   │   │   └── [leagueId]/      
│   │   │       ├── pick/        # Make draft pick
│   │   │       └── status/      # Draft status
│   │   ├── cfbd/                # College Football Data API
│   │   ├── rotowire/            # RotoWire integration
│   │   └── mcp/                 # Model Context Protocol
│   ├── (pages)/                 # Application pages
│   │   ├── page.tsx             # Home/Landing
│   │   ├── login/               # Login page
│   │   ├── signup/              # Registration page
│   │   ├── dashboard/           # User dashboard
│   │   ├── league/              # League pages
│   │   │   ├── create/          # Create league form
│   │   │   ├── join/            # Join league
│   │   │   └── [leagueId]/      # League details
│   │   ├── draft/               # Draft pages
│   │   │   ├── mock/            # Mock draft practice
│   │   │   └── [leagueId]/      # Live draft room
│   │   └── conference-showcase/ # Conference teams display
│   └── layout.tsx               # Root layout with providers
├── components/                   # React components
│   ├── draft/                   # Draft-specific components
│   │   ├── DraftBoard.tsx       # Main draft board
│   │   ├── DraftTimer.tsx       # Draft clock
│   │   ├── PlayerComparisonModal.tsx
│   │   └── PlayerResearchModal.tsx
│   ├── auction/                 # Auction draft components
│   ├── features/                 # Feature components
│   │   ├── conferences/         # Conference displays
│   │   └── games/               # Game components
│   ├── layouts/                 # Layout components
│   └── ui/                      # UI primitives
├── lib/                          # Utilities and configs
│   ├── appwrite.ts              # Appwrite client setup
│   ├── appwrite-server.ts       # Server-side Appwrite
│   ├── api/                     # API client utilities
│   ├── hooks/                   # React hooks
│   └── utils/                   # Helper functions
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts               # Authentication hook
│   └── useDraftKeyboardNavigation.ts
├── scripts/                      # Utility scripts
│   ├── check-leagues.js         # Database verification
│   ├── sync-appwrite-schema.ts  # Schema synchronization
│   ├── generate-icons.js        # Icon generation
│   └── rotowire-sync-league.mjs # RotoWire data sync
├── types/                        # TypeScript definitions
├── public/                       # Static assets
└── configuration files           # Config files

## 🔑 Key Features Implemented

### Authentication System
- **Email/Password**: Traditional login with Appwrite
- **OAuth Integration**: Google and Apple sign-in
- **Session Management**: HTTP-only cookies for security
- **Protected Routes**: Middleware-based route protection

### League Management
- **Create League**: Custom league creation with settings
- **Join League**: Via invite code or search
- **League Dashboard**: Team standings, matchups, transactions
- **Commissioner Tools**: League administration features

### Draft System
- **Snake Draft**: Traditional snake draft implementation
- **Auction Draft**: Bidding system with budgets
- **Mock Draft**: Practice drafts with AI
- **Draft Board**: Real-time draft tracking
- **Player Research**: Stats and projections integration

### Data Integration
- **CFBD API**: College football statistics
- **RotoWire**: Player news and projections
- **Appwrite Database**: Primary data storage
- **Real-time Updates**: WebSocket connections for live data

## 🗄️ Database Schema (Appwrite)

### Collections
1. **users**: User profiles and authentication
2. **leagues**: League configurations and settings
3. **teams**: Team rosters and records
4. **players**: Player data from all conferences
5. **draft_picks**: Draft history and selections
6. **transactions**: Trades, adds, drops
7. **matchups**: Weekly matchups and scores
8. **scoring**: Player scoring by week

### Current Data
- **Existing League**: "Jawn League" (ID: 6894db4a0001ad84e4b0)
- **Commissioner**: Kash Maheshwari (ID: 6894d6f3002932df1fdf)
- **Status**: Pre-draft, scheduled for Aug 17, 2025

## 🔧 Environment Configuration

### Required Environment Variables
```env
# Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=college-football-fantasy-app
NEXT_PUBLIC_APPWRITE_DATABASE_ID=college-football-fantasy
APPWRITE_API_KEY=[your-api-key]

# External APIs
CFBD_API_KEY=[optional]
ROTOWIRE_API_KEY=[optional]

# OAuth (if enabled)
GOOGLE_CLIENT_ID=[optional]
GOOGLE_CLIENT_SECRET=[optional]
APPLE_CLIENT_ID=[optional]
APPLE_TEAM_ID=[optional]
APPLE_KEY_ID=[optional]
APPLE_PRIVATE_KEY=[optional]

# Security
JWT_SECRET=[32+ character secret]
```

## 🚢 Deployment Configuration

### Vercel Settings
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Root Directory**: `/` (project root)

### Build Process
1. Install dependencies
2. Sync Appwrite schema (postinstall)
3. Generate icon placeholders
4. Build Next.js application
5. Deploy to Vercel edge network

## 🛠️ Development Workflow

### Local Development
```bash
npm install          # Install dependencies
npm run dev         # Start development server
```

### Database Management
```bash
npm run sync:appwrite  # Sync database schema
node scripts/check-leagues.js  # Verify league data
```

### Deployment
```bash
vercel --prod       # Deploy to production
```

## 📊 Current Project State

### Completed
- ✅ Frontend restructured to root directory
- ✅ All dependencies resolved
- ✅ Appwrite integration working
- ✅ Authentication system operational
- ✅ League creation and management
- ✅ Draft system implemented
- ✅ Successfully deployed to Vercel

### Known Issues
- Team display in dashboard needs refinement
- Team creation flow may need adjustment
- Some API routes may need error handling improvements

### Next Steps
1. Fix team creation/display in leagues
2. Complete draft functionality testing
3. Implement live scoring system
4. Add more comprehensive error handling
5. Enhance UI/UX based on user feedback

## 🔄 Recent Changes (Aug 13, 2025)

### Major Merge Completed
- Merged local changes with remote GitHub repository
- Restructured project from `/frontend` subdirectory to root
- Consolidated package.json dependencies
- Updated all import paths
- Fixed build errors and missing dependencies
- Successfully deployed merged version

### Configuration Updates
- Updated Vercel environment variables
- Synced Appwrite schema
- Fixed authentication flow
- Verified database connections

## 📝 Important Notes

### For Future Sessions
1. **Project is now at root level** - No more `/frontend` directory
2. **All features are merged** - OAuth, projections, mock draft all included
3. **Environment variables are set** on Vercel
4. **"Jawn League" exists** in the database and is accessible
5. **Authentication works** but team creation/display needs attention

### Quick Commands Reference
```bash
# Check league data
node scripts/check-leagues.js

# Update Vercel env vars
./scripts/update-vercel-env.sh

# Deploy to production
vercel --prod

# View logs
vercel logs
```

## 🔗 Important URLs

- **Production App**: https://college-football-fantasy-fz3de5a3k-kpm34s-projects.vercel.app
- **Vercel Dashboard**: https://vercel.com/kpm34s-projects/college-football-fantasy-app
- **Appwrite Console**: https://nyc.cloud.appwrite.io/console/project-college-football-fantasy-app
- **GitHub Repository**: [Your GitHub repo URL]

---

*Last Updated: August 13, 2025*
*Version: 1.0.0 (Post-Merge)*