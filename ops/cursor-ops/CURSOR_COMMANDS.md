# Cursor Commands Reference

## 🎯 Schema Management (SSOT)
```bash
# Generate everything from Single Source of Truth
npm run generate:all

# Sync schema to Appwrite
npx tsx ops/common/scripts/sync-appwrite-simple.ts

# Seed Appwrite database (collections/attributes/indexes)
node schema/generators/seed-appwrite.ts

# Validate schema integrity
npx tsx ops/common/scripts/validate-ssot-schema.ts

# Run schema guards
npx tsx ops/common/scripts/guards/validate-ssot-integrity.ts
npx tsx ops/common/scripts/guards/forbid-legacy-collections.ts
```

## 🚀 Development Commands
```bash
# Development server
npm run dev                  # Start Next.js (port 3001)
npm run build               # Production build
npm run typecheck           # TypeScript checking
npm run lint                # ESLint checks
npm run lint:fix            # Auto-fix linting issues

# Testing
npx playwright test         # Browser tests
npm run test:e2e           # End-to-end tests
act                        # Run GitHub Actions locally
```

## 📦 Deployment
```bash
# Vercel deployment
vercel                      # Deploy preview
vercel --prod              # Deploy production
vercel env pull            # Pull environment variables
vercel logs --follow       # View logs
vercel alias set [url] cfbfantasy.app  # Set production alias

# Environment management
vercel env add [key] production  # Add env variable
vercel env rm [key] production   # Remove env variable
vercel env ls                    # List all env variables
```

## 🗄️ Database Operations
```bash
# Appwrite health check
curl https://nyc.cloud.appwrite.io/v1/health

# Data sync
npm run sync-data           # Sync from APIs to Appwrite
node ops/common/scripts/setup-appwrite-indexes.ts  # Setup DB indexes

# Collections management
npx tsx ops/common/scripts/list-all-collections.ts  # List all collections
npx tsx ops/common/scripts/export-complete-database.ts  # Export database
```

## 🐙 Git & GitHub
```bash
# GitHub CLI
gh auth status              # Check authentication
gh pr create               # Create pull request
gh issue list              # List issues
gh run list --limit 5      # View workflow runs
gh run view <id> --log-failed  # Debug failed runs
gh workflow list           # List all workflows
gh workflow run <name>     # Trigger workflow

# Git operations
git pull origin main       # Pull latest changes
git push origin main       # Push changes
git status                 # Check status
git add -A && git commit -m "message"  # Commit all changes
```

## 🔧 Troubleshooting
```bash
# Port conflicts
lsof -i :3001 && kill -9 [PID]

# Clear caches
rm -rf .next node_modules package-lock.json
npm install

# Type errors during build
SKIP_ENV_VALIDATION=true npm run build

# Test API endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/games

# Check environment
node -e "console.log(process.env.APPWRITE_API_KEY ? '✅ Key set' : '❌ Key missing')"
```

## 📊 Admin Operations
```bash
# Player management
npx tsx ops/common/scripts/admin/dedupe/players.ts  # Remove duplicate players
npx tsx ops/common/scripts/admin/players/refresh.ts  # Refresh player data
npx tsx ops/common/scripts/admin/players/retire.ts   # Mark players as retired

# League management
npx tsx ops/common/scripts/admin/leagues/sync-members.ts  # Sync league members

# Pipeline status
npx tsx ops/common/scripts/admin/pipeline-status.ts  # Check pipeline status
```

## 🎨 AI & Media Tools
```bash
# Claude CLI
node ops/claude-ops/claude-cli.js
# Commands: /code, /review, /explain, /test

# Figma sync
node ops/common/scripts/figma-sync.js all        # Sync everything
node scripts/figma-sync.js colors     # Sync design tokens
node scripts/figma-sync.js components # Generate components

# Video workflow
node ops/common/scripts/video-workflow.js create-highlight --input "clips" --output "highlight.mp4"
node ops/common/scripts/video-workflow.js social --input "video.mp4" --format instagram

# FFmpeg helpers
node ops/common/scripts/ffmpeg-helpers.js convert input.mov output.mp4 --quality high
node scripts/ffmpeg-helpers.js compress large.mp4 small.mp4 --target-size 10
```

## 🔑 Quick Access Patterns
```bash
"access appwrite" → lib/appwrite.ts
"access vercel" → vercel CLI commands
"access github" → gh CLI commands
"access database" → Appwrite collections
"access apis" → CFBD, ESPN integrations
"use runway" → lib/runway.ts
"use openai" → lib/openai.ts
"use meshy" → vendor/awwwards-rig/src/lib/meshy.ts
"use claude" → lib/claude.ts
```

## ⚠️ Important Notes

### Schema (SSOT) Rules:
- **Single Source of Truth**: `schema/zod-schema.ts` defines everything
- **Required attributes**: Cannot have defaults in Appwrite
  - Make optional and set defaults in code, OR
  - Always supply values at creation time
- **After schema changes**: Always run `npm run generate:all`

### Development Tips:
- Port 3001 is default (3000 often in use)
- Node 18-22 required
- Vercel CLI authenticated as kpm34
- GitHub CLI configured with token
- FFmpeg is local only, not exposed as API

### File References:
- Schema definition: `schema/zod-schema.ts`
- Types: `types/database.types.ts`
- API routes: `app/api/`
- Components: `components/`
- Utilities: `lib/`

---

**Related Documentation:**
- `TOOLBOX_CURSOR.md` - Complete Cursor environment guide
- `TOOLBOX_CLAUDE.md` - MCP integration for Claude Code
- `.cursorrules` - AI assistant rules and patterns