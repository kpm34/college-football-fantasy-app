# Cursor Quick Access Commands

This file contains quick reference commands for accessing various tools and APIs in this project.

## Appwrite Access

### API Access
```bash
# Environment variables needed
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=college-football-fantasy-app
APPWRITE_API_KEY=[configured]
APPWRITE_DATABASE_ID=college-football-fantasy
```

### CLI Commands
```bash
# Install Appwrite CLI
npm install -g appwrite-cli

# Login to Appwrite
appwrite login

# Set project
appwrite client setProject college-football-fantasy-app

# List databases
appwrite databases list

# List collections
appwrite databases listCollections --databaseId college-football-fantasy

# Get collection
appwrite databases getCollection --databaseId college-football-fantasy --collectionId [collection-id]
```

### SDK Access Files
- **Client Config**: `/lib/appwrite.ts`
- **Server Config**: `/lib/appwrite-server.ts`
- **Alternative Config**: `/lib/config/appwrite.config.ts`

### Quick Access Command for Cursor
```
"access appwrite" → Project already initialized. Use /lib/appwrite.ts for client-side operations or /lib/appwrite-server.ts for server-side operations. Database ID: college-football-fantasy. Collections: leagues, rosters, games, rankings, teams, college_players, player_stats, auctions, bids, lineups, users. Config files: appwrite.json, appwrite.config.json exist.
```

## Vercel Access

### API Access
```bash
# Environment variables
VERCEL_TOKEN=[your-token]
```

### CLI Commands
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
vercel link

# Deploy
vercel --prod

# Check deployments
vercel ls

# View logs
vercel logs

# Environment variables
vercel env ls
vercel env add
vercel env rm

# Pull environment
vercel pull
```

### Project Info
- **Team**: kpm34s-projects
- **Project**: college-football-fantasy-app
- **Production URL**: https://cfbfantasy.app
- **Preview URLs**: https://college-football-fantasy-fz3de5a3k-kpm34s-projects.vercel.app

### Quick Access Command for Cursor
```
"access vercel" → Use vercel CLI commands. Project: college-football-fantasy-app under team kpm34s-projects. Production URL: https://cfbfantasy.app. Use 'vercel logs' for debugging, 'vercel env ls' for environment variables.
```

## GitHub Access

### Repository Info
- **Repository**: college-football-fantasy-app
- **Main Branch**: main
- **Current Branch**: main

### Git Commands
```bash
# Check status
git status

# View branches
git branch -a

# Create new branch
git checkout -b feature/branch-name

# Push to origin
git push origin branch-name

# Create PR (with GitHub CLI)
gh pr create --title "Title" --body "Description"

# View PRs
gh pr list

# View issues
gh issue list
```

### GitHub CLI Commands
```bash
# Install GitHub CLI
brew install gh

# Login
gh auth login

# Repository operations
gh repo view
gh repo clone

# Pull request operations
gh pr create
gh pr list
gh pr checkout [number]
gh pr merge [number]

# Issue operations
gh issue create
gh issue list
gh issue view [number]
```

### Quick Access Command for Cursor
```
"access github" → Repository: college-football-fantasy-app. Main branch: main. Use 'gh pr create' for pull requests, 'gh issue create' for issues. Standard git workflow: checkout -b, commit, push, create PR.
```

## Common Development Commands

### Project Setup
```bash
# Install dependencies
npm install

# Start development servers
npm run dev          # Next.js frontend (port 3001)
npm run server       # Express backend (port 3000)

# Build and test
npm run build
npm run typecheck
npm run lint
```

### Data Management
```bash
# Sync data from APIs
npm run sync-data

# Run tests
npm test
```

### Quick Access Command for Cursor
```
"access dev environment" → Frontend runs on port 3001 (npm run dev), backend on port 3000 (npm run server). Use npm run build, npm run typecheck, npm run lint for code quality. npm run sync-data for API data syncing.
```

## AI Development Toolbox

### AI Assistant Tools Access
```bash
# Quick access commands for AI tools
"use runway" → AI video generation: /lib/runway.ts, API: /api/runway/create
"use openai" → Direct OpenAI client: /lib/openai.ts (text, images, embeddings)  
"use meshy" → 3D model generation: /vendor/awwwards-rig/src/lib/meshy.ts, API: /api/meshy/jobs
"use ffmpeg" → Local video processing: scripts/ffmpeg-helpers.js (requires FFmpeg installed)
"check ai jobs" → Job polling status: /api/cron/poll-jobs, types: /types/jobs.ts
```

### AI Tool Examples
```typescript
// Runway video generation
import { createRunwayJob } from '@/lib/runway';
const { jobId } = await createRunwayJob({ prompt: "Football highlights", model: 'gen3' });

// OpenAI direct access
import { generateText, analyzeImage } from '@/lib/openai';
const text = await generateText("Explain this code");
const analysis = await analyzeImage(imgUrl, "What's in this image?");

// Meshy 3D generation  
import { createMeshyJob } from '@/vendor/awwwards-rig/src/lib/meshy';
const { jobId } = await createMeshyJob({ prompt: "Low-poly stadium" });
```

### Local FFmpeg Usage
```bash
# Convert video (local development only)
node scripts/ffmpeg-helpers.js convert input.mov output.mp4 --quality high

# Compress video
node scripts/ffmpeg-helpers.js compress large.mp4 small.mp4 --target-size 10

# Extract frames
node scripts/ffmpeg-helpers.js extract-frames video.mp4 frames/ --fps 1
```

### Environment Variables for AI Tools
```bash
RUNWAY_API_KEY=your-runway-key-here
OPENAI_API_KEY=your-openai-key-here
MESHY_API_KEY=your-meshy-key-here
CRON_SECRET=secure-cron-secret
```

## Combined Quick Reference

### For Cursor AI Assistant
When you need to access:

1. **"access appwrite"** → Use `/lib/appwrite.ts` or `/lib/appwrite-server.ts`, database ID: `college-football-fantasy`
2. **"access vercel"** → Project: `college-football-fantasy-app`, team: `kmp34s-projects`, URL: `https://cfbfantasy.app`
3. **"access github"** → Repo: `college-football-fantasy-app`, main branch: `main`, use `gh` CLI for operations
4. **"access dev"** → Frontend: port 3001, backend: port 3000, build with `npm run build`
5. **"access apis"** → CFBD API key configured, endpoints in `/app/api/` directory
6. **"access database"** → Collections: leagues, rosters, games, rankings, teams, college_players, player_stats, auctions, bids
7. **"use ai tools"** → Runway videos, OpenAI text/images, Meshy 3D, FFmpeg local processing

### Environment Files
- **Local**: `.env.local`
- **Production**: `.env.production.local`
- **Vercel**: Use `vercel env` commands

### Key Directories
- **API Routes**: `/app/api/`
- **Components**: `/components/`
- **Utilities**: `/lib/`
- **Types**: `/types/`
- **Backend**: `/src/`

---

## Usage Examples

```bash
# Example: Deploy to production
vercel --prod

# Example: Check Appwrite collections
appwrite databases listCollections --databaseId college-football-fantasy

# Example: Create GitHub PR
gh pr create --title "Add new feature" --body "Description of changes"

# Example: Sync latest data
npm run sync-data

# Example: Check build status
npm run build && npm run typecheck && npm run lint
```

This file serves as your quick reference for instructing Cursor on how to access and work with your project's tools and services.