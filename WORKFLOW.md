# Development Workflow

## 🏗️ Project Structure

```
college-football-fantasy-app/
│
├── frontend/                    # Next.js 15 Application
│   ├── app/                    # App Router & API Routes
│   │   ├── api/               # Backend API endpoints
│   │   ├── auction/           # Auction draft UI
│   │   ├── draft/             # Snake draft UI
│   │   ├── league/            # League management
│   │   └── conference-showcase/ # Conference displays
│   ├── components/            # React components
│   │   ├── auction/          # Auction-specific
│   │   ├── draft/            # Draft-specific
│   │   └── ui/               # Shared UI components
│   ├── lib/                   # Utilities & configs
│   ├── types/                 # TypeScript definitions
│   └── vendor/                # External code
│       └── awwwards-rig/      # (Future 3D - not active)
│
├── src/                        # Backend Services
│   ├── services/              # Business logic
│   ├── scripts/               # Data management
│   └── config/                # API configurations
│
├── confrence rosters/          # Team roster data
│
└── Configuration Files
    ├── .env                    # Environment variables
    ├── .cursorrules           # Cursor AI config
    ├── CLAUDE.md              # Claude Code context
    ├── cursor.config.json     # Tool configurations
    └── README.md              # Project overview
```

## 🔄 Development Workflow

### 1️⃣ Initial Setup
```bash
# Clone repository
git clone [repo-url]
cd college-football-fantasy-app

# Install dependencies
npm run install:all

# Configure environment
cp .env frontend/.env.local

# Start development
npm run dev
```

### 2️⃣ Feature Development

#### Core Features
- **Draft System**: `app/draft/`
- **Auction System**: `app/auction/`
- **League Management**: `app/league/`
- **Locker Room**: `app/league/[leagueId]/locker-room/`
- **API Endpoints**: `app/api/`
- **Data Services**: `lib/services/`

### 3️⃣ Testing Flow
```bash
# Type checking
npm run typecheck

# Linting
npm run lint:fix

# Build test
npm run build

# Local preview
npm run dev
```

### 4️⃣ Deployment Flow
```bash
# Commit changes
git add .
git commit -m "feat: your feature"

# Push to branch
git push origin feature/your-feature

# Preview deployment
vercel

# Production deployment (after merge)
vercel --prod
```

## 📊 Data Flow

### API Layer
```
frontend/app/api/
├── cfbd/          → College Football Data
├── leagues/       → League management
├── draft/         → Draft operations
├── players/       → Player data
└── rotowire/      → Injury/news data
```

### Database (Appwrite)
```
Collections:
├── leagues        → Fantasy leagues
├── college_players → Player database
├── games          → Game schedules
├── rankings       → AP Top 25
├── rosters        → Drafted players
├── lineups        → Weekly lineups
└── player_stats   → Statistics
```

## 🔌 Integration Points

### External APIs
- **CFBD**: College football statistics
- **ESPN**: Live scores (planned)
- **AI Gateway**: Claude/GPT for insights

### Appwrite Database
- Project: `college-football-fantasy-app`
- Database: `college-football-fantasy`
- Real-time subscriptions available

### Roster Schema & Guardrails
- Persist per-league roster schema on create: `POST /api/leagues/create` → `rosterSchema { rb, wr, benchSize }`
- Enforce caps by mode:
  - Conference: RB ≤ 2, WR ≤ 5
  - Power-4: WR ≤ 6
- Locker room derives slots from schema and enforces bench capacity client-side

### Locker Room Interaction Model
- Drag-and-drop (native) for:
  - Bench → Slot (eligibility required)
  - Slot → Slot (swap with dual eligibility check)
  - Slot → Bench (respects bench size)
- MOVE (click) flow mirrors ESPN behavior for accessibility and mobile support
- Guardrail toasts/messages displayed for incompatible moves and full bench

### Vercel Services
- **Edge Config**: Feature flags
- **KV Storage**: Caching (optional)
- **Analytics**: Performance monitoring

## 🚀 Performance Best Practices

### Code Splitting
```typescript
// Dynamic imports for heavy components
const DraftBoard = dynamic(() => import('@/components/draft/DraftBoard'))
```

### Image Optimization
```typescript
import Image from 'next/image'
// Use Next.js Image component for optimization
```

### API Caching
- Use Edge Config for static data
- Implement proper cache headers
- Consider ISR for semi-static pages

## 🐛 Common Issues & Solutions

### Build Failures
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Environment Issues
```bash
# Refresh from Vercel
vercel pull --yes --environment=production
```

### Type Errors
```bash
# Check types
npm run typecheck

# Fix common issues
npm run lint:fix
```

## 📈 Monitoring

### Development
- Browser DevTools
- React Developer Tools
- Network tab for API calls

### Production
- Vercel Analytics
- Function logs: `vercel logs`
- Error tracking (if configured)

## 🎯 Current Focus Areas

1. **Core Fantasy Features**
   - Draft systems (snake & auction)
   - League management
   - Scoring engine
   - Live updates

2. **Data Integration**
   - CFBD API for stats
   - Real-time game updates
   - Player eligibility rules

3. **User Experience**
   - Responsive design and mobile ergonomics
   - Fast page loads
   - Intuitive navigation
   - Drag-and-drop with keyboard accessible MOVE fallback

4. **Upcoming UX Enhancements**
   - Migrate to react-dnd for richer drag previews and smoother interactions
   - Visual slot highlighting and swap previews
   - Undo/redo for roster edits

## 📝 Code Standards

### TypeScript
- Use strict mode
- Define all prop types
- Avoid `any` type

### React
- Functional components
- Custom hooks for logic
- Proper error boundaries

### API Design
- RESTful endpoints
- Proper status codes
- Error handling

---

**Last Updated**: 2025-08-09
**Focus**: Core fantasy football functionality