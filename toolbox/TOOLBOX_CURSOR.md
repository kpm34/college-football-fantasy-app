# 🎯 Cursor AI Toolbox - Development Environment Guide

## Quick Access Commands

### Core Project
```bash
"access appwrite" → Database operations via lib/appwrite.ts
"access vercel" → Deployment and environment management
"access github" → Repository operations with gh CLI
"access dev" → Local development on port 3001
"access apis" → CFBD and other API integrations
"access database" → Appwrite collections and operations
```

### AI Development Tools
```bash
"use runway" → Video generation at /lib/runway.ts
"use openai" → Text/image AI at /lib/openai.ts  
"use meshy" → 3D generation at /vendor/awwwards-rig/src/lib/meshy.ts
"use claude" → Code assistance at /lib/claude.ts
"use ffmpeg" → Video processing at scripts/ffmpeg-helpers.js
"check ai jobs" → Job polling at /api/cron/poll-jobs
```

### Development Tools
```bash
"use figma" → Design sync with scripts/figma-sync.js
"video workflow" → Production pipeline at scripts/video-workflow.js
"run tests" → Execute npm run typecheck, lint, playwright
"deploy" → vercel --prod for production deployment
"git operations" → GitHub CLI commands (gh pr, gh issue)
```

## 🛠️ Environment Configuration

### Required Environment Variables
```bash
# Core Configuration (in .env.local)
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=college-football-fantasy-app
APPWRITE_DATABASE_ID=college-football-fantasy
APPWRITE_API_KEY=standard_aab226bb45e4cb9ee0349c9ff0fda2df9124a993f75c1182c78900929f96e1d48756d968594825a571ce273d2adad954aad78d2c152c4f39eb4a53785fc51bbabeccd4734ae28d5cb227d5bc2d77fa20c6522812042924c44296eca173526891c9ad19c66ad34a29035dcbca611d6703189cf95a7575cc085afe363466478891

# API Keys
CFBD_API_KEY=[configured]
AI_GATEWAY_API_KEY=[configured]
ANTHROPIC_API_KEY=[configured]

# Optional AI Tools
RUNWAY_API_KEY=[configured]
OPENAI_API_KEY=[needs credits]
MESHY_API_KEY=[configured]
FIGMA_ACCESS_TOKEN=[optional]
```

## 📁 Project Structure

```
college-football-fantasy-app/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   │   ├── runway/          # Video generation
│   │   ├── meshy/           # 3D generation
│   │   ├── claude/          # AI assistance
│   │   └── leagues/         # Core app APIs
│   └── [pages]/             # Page components
├── components/               # React components
├── lib/                     # Utilities & integrations
│   ├── appwrite.ts          # Database client
│   ├── claude.ts            # Claude AI wrapper
│   ├── openai.ts            # OpenAI client
│   └── runway.ts            # Runway wrapper
├── scripts/                 # Utility scripts
│   ├── video-workflow.js    # Video production
│   ├── figma-sync.js        # Design sync
│   └── ffmpeg-helpers.js    # Video processing
├── types/                   # TypeScript types
├── schema/                  # Database schema (SSOT)
└── toolbox/                 # Global toolbox packages
```

## 🚀 Common Development Commands

### Development Server
```bash
npm run dev                  # Start Next.js (port 3001)
npm run build               # Production build
npm run typecheck           # TypeScript checking
npm run lint                # ESLint checks
npm run lint:fix            # Auto-fix linting
```

### Schema Management (SSOT)
```bash
# Generate everything from Single Source of Truth
npm run generate:all

# Sync schema to Appwrite
npx tsx scripts/sync-appwrite-simple.ts

# Seed Appwrite database
node schema/generators/seed-appwrite.ts

# Validate schema consistency
npx tsx scripts/validate-ssot-schema.ts

# Run schema guards
npx tsx scripts/guards/validate-ssot-integrity.ts
npx tsx scripts/guards/forbid-legacy-collections.ts
```

### Deployment
```bash
vercel                      # Deploy preview
vercel --prod              # Deploy production
vercel env pull            # Pull environment variables
vercel logs --follow       # View logs
vercel alias set [url] cfbfantasy.app  # Set production alias
```

### Git Operations
```bash
gh auth status             # Check GitHub auth
gh pr create              # Create pull request
gh issue list             # List issues
gh run list --limit 5     # View workflow runs
gh run view <id> --log-failed  # Debug failed runs
```

### Testing
```bash
npx playwright test       # Browser tests
npm run test:e2e         # End-to-end tests
lhci autorun             # Lighthouse performance
act                      # Run GitHub Actions locally
```

## 🎨 AI & Media Tools

### Video Production Pipeline
```bash
# Create highlight reel
node scripts/video-workflow.js create-highlight \
  --input "clip1.mp4,clip2.mp4" \
  --music "bg-music.mp3" \
  --transition slideright \
  --output "highlights.mp4"

# Social media optimization
node scripts/video-workflow.js social \
  --input "raw-video.mp4" \
  --format instagram \
  --music "trending-audio.mp3"
```

### Figma Design Sync
```bash
node scripts/figma-sync.js all        # Sync everything
node scripts/figma-sync.js colors     # Sync design tokens
node scripts/figma-sync.js components # Generate components
```

### Claude CLI
```bash
node scripts/claude-cli.js
/code <description>        # Generate code
/review <file>            # Review code
/explain <file>           # Explain code
/test <file>              # Generate tests
```

## 🗄️ Database Collections

### Appwrite Collections
- `leagues` - Fantasy leagues configuration
- `rosters` - Team rosters and players
- `college_players` - Player database
- `player_stats` - Weekly statistics
- `games` - Game schedule and scores
- `rankings` - AP Top 25 rankings
- `auctions` - Auction draft sessions
- `bids` - Auction bid history
- `lineups` - Weekly lineups
- `users` - User accounts
- `activity_log` - User activity tracking

### Collection Access Pattern
```typescript
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';

// Query example
const leagues = await databases.listDocuments(
  'college-football-fantasy',
  'leagues',
  [Query.equal('status', 'active')]
);
```

## 🔧 Development Utilities

### Available CLI Tools
- **Vercel CLI** - Deployment and environment management
- **GitHub CLI** (`gh`) - Repository operations
- **pnpm** - Fast package manager
- **Turbo** - Monorepo builds
- **Act** - Local GitHub Actions testing
- **FFmpeg** - Video processing (local only)
- **Playwright** - Browser testing
- **Lighthouse CI** - Performance testing

### Toolbox Packages
Located in `toolbox/`:
- `packages/clients` - AI provider clients (Claude, OpenAI, Runway, Meshy)
- `packages/agent` - Task planning and execution
- `packages/cli` - Toolbox CLI utilities

Build toolbox:
```bash
cd toolbox && pnpm install && pnpm -w build
```

## ⚡ Quick Troubleshooting

### Port Conflicts
```bash
lsof -i :3001 && kill -9 [PID]
```

### Clear Caches
```bash
rm -rf .next node_modules package-lock.json
npm install
```

### Environment Issues
```bash
vercel env pull
SKIP_ENV_VALIDATION=true npm run build
```

### Test Connections
```bash
# API health check
curl http://localhost:3001/api/health

# Appwrite connection
curl https://nyc.cloud.appwrite.io/v1/health

# Check environment
node -e "console.log(process.env.APPWRITE_API_KEY ? '✅ Key set' : '❌ Key missing')"
```

## 📊 Project Status

### ✅ Configured & Working
- Next.js development server (port 3001)
- Appwrite database (NYC region)
- Vercel deployment (authenticated)
- GitHub CLI integration
- TypeScript with strict mode
- ESLint and Prettier
- Schema-driven architecture (SSOT)

### 🎯 Key Features
- Single Source of Truth schema (`schema/zod-schema.ts`)
- Auto-generated types from schema
- Mock draft system with real-time updates
- League management with invites
- Player projections and rankings
- Auction and snake draft support

### 🔗 Important URLs
- **Production**: https://cfbfantasy.app
- **Vercel Dashboard**: https://vercel.com/kpm34s-projects/college-football-fantasy-app
- **Appwrite Console**: https://nyc.cloud.appwrite.io/console/project-college-football-fantasy-app
- **GitHub Repo**: kpm34/college-football-fantasy-app

## 📋 Development Checklist

Before Starting:
1. ✅ Pull latest code: `git pull origin main`
2. ✅ Install dependencies: `npm install`
3. ✅ Check environment: `vercel env pull`
4. ✅ Verify types: `npm run typecheck`

Before Committing:
1. ✅ Lint code: `npm run lint:fix`
2. ✅ Check types: `npm run typecheck`
3. ✅ Test locally: `npm run dev`
4. ✅ Update docs if needed

Before Deploying:
1. ✅ Build locally: `npm run build`
2. ✅ Run tests: `npm run test`
3. ✅ Deploy preview: `vercel`
4. ✅ Deploy production: `vercel --prod`

## 🚨 Important Notes

### Schema Management (SSOT)
- **Single Source of Truth**: `schema/zod-schema.ts` defines everything
- **Required Attributes**: Cannot have defaults in Appwrite
  - Either make optional and set defaults in code
  - Or always supply values at creation time
- **Generate Types**: Run `npm run generate:all` after schema changes

### Development Tips
- Port 3001 is default for Next.js (3000 often in use)
- Node 18-22 required
- Vercel CLI already authenticated as kpm34
- GitHub CLI configured and ready
- FFmpeg is local only, not exposed as API

---

**Related Files**:
- `CURSOR_COMMANDS.md` - Quick command reference
- `TOOLBOX_CLAUDE.md` - MCP integration for Claude Code
- `CLAUDE.md` - Project context and configuration