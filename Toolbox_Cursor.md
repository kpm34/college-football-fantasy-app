# 🧰 Cursor AI Development Toolbox
*Complete development environment reference for Cursor AI*

## 🎯 Quick Access Commands for Cursor

### **Core Project Access**
```bash
"access appwrite" → Use /lib/appwrite.ts or /lib/appwrite-server.ts, database ID: college-football-fantasy
"access vercel" → Project: college-football-fantasy-app, team: kmp34s-projects, URL: https://cfbfantasy.app
"access github" → Repo: college-football-fantasy-app, main branch: main, use gh CLI for operations
"access dev" → Frontend: port 3001, backend: port 3000, build with npm run build
"access apis" → CFBD API key configured, endpoints in /app/api/ directory
"access database" → Collections: leagues, rosters, games, rankings, teams, college_players, player_stats, auctions, bids
```

### **AI Development Tools**
```bash
"use runway" → AI video generation: /lib/runway.ts (app), toolbox client: toolbox/packages/clients/src/runway.ts, API: /api/runway/create
"use openai" → Direct OpenAI client: /lib/openai.ts (text, images, embeddings)  
"use meshy" → 3D model generation: /vendor/awwwards-rig/src/lib/meshy.ts (app), toolbox client: toolbox/packages/clients/src/meshy.ts, API: /api/meshy/jobs
"use ffmpeg" → Local video processing: scripts/ffmpeg-helpers.js (requires FFmpeg installed)
"use claude" → Claude API integration: /lib/claude.ts, CLI: scripts/claude-cli.js
"check ai jobs" → Job polling status: /api/cron/poll-jobs, types: /types/jobs.ts
```

### **Development Tools**
```bash
"use figma" → Design sync: scripts/figma-sync.js, lib/figma.ts
"video workflow" → Complete video production: scripts/video-workflow.js
"run tests" → npm run typecheck, npm run lint, npx playwright test
"deploy" → vercel --prod, vercel env pull for env vars
"git operations" → gh pr create, gh issue list, standard git workflow
```

## 🛠️ Complete Tool Inventory

### **AI & Language Models**
- ✅ **Claude API** - Complete integration with Opus, Sonnet 3.5, Haiku models
  - Library: `/lib/claude.ts`
  - API Endpoint: `/api/claude/route.ts`
  - React Hook: `useClaude()` in `/hooks/useClaude.ts`
  - CLI Tool: `/scripts/claude-cli.js`
  
- ✅ **OpenAI Direct Client** - Separate from Vercel AI SDK
  - Library: `/lib/openai.ts`
  - Capabilities: Text generation, image analysis, image generation, embeddings, moderation
  - Classes: `OpenAIChat` for conversations
  
- ✅ **Runway AI** - Video generation
  - Libraries: `/lib/runway.ts` (app), `toolbox/packages/clients/src/runway.ts` (global)
  - API Route: `/api/runway/create`
  - Models: gen3, gen2
  
- ✅ **Meshy AI** - 3D model generation
  - Libraries: `/vendor/awwwards-rig/src/lib/meshy.ts` (app), `toolbox/packages/clients/src/meshy.ts` (global)
  - API Route: `/api/meshy/jobs`
  - Output: GLB files

### **Development & Build Tools**
- ✅ **Vercel CLI** (`vercel`) - Authenticated as kmp34
- ✅ **GitHub CLI** (`gh`) - Repository operations
- ✅ **pnpm** - Fast package manager
- ✅ **Turbo** (`turbo`) - Monorepo builds
- ✅ **Act** (`act`) - Run GitHub Actions locally
- ✅ **FFmpeg Local** - Video processing via `/scripts/ffmpeg-helpers.js`

### **Testing & Quality**
- ✅ **Playwright** - Browser testing (Chrome, Firefox, WebKit)
- ✅ **Lighthouse CI** (`lhci`) - Performance testing
- ✅ **ESLint** - JavaScript linting
- ✅ **Prettier** - Code formatting
- ✅ **npm-check-updates** (`ncu`) - Dependency updates

### **Design & Media Tools**
- ✅ **Complete Video Production Pipeline** - Professional video editing workflows
  - Main Tool: `/scripts/video-workflow.js`
  - Capabilities: Highlight reels, transitions, music mixing, social media formats
  - Features: 10 transition types, text animations, batch processing
  
- ✅ **Figma Integration** - Complete design-to-code pipeline
  - Library: `/lib/figma.ts`
  - Sync Tool: `/scripts/figma-sync.js`
  - Config: `/figma.config.json`
  - Code Connect: Component linking
  
- ✅ **Media Processing Suite**
  - FFmpeg: Advanced video/audio processing
  - SoX: Audio effects and transitions  
  - Blender: 3D animation and video editing
  
- ✅ **3D Graphics** - Three.js, React Three Fiber, Spline
  - Spline Constants: `/lib/spline-constants.ts`
  - 3D Viewer: `@splinetool/react-spline`

### **Utilities**
- ✅ **ngrok** - Local server tunneling
- ✅ **nodemon** - Auto-restart Node apps
- ✅ **concurrently** - Multi-command execution
- ✅ **serve** - Static file serving
- ✅ **json-server** - Mock REST API
- ✅ **Sentry CLI** (`sentry-cli`) - Error tracking

## 🗄️ Database & Backend

### **Appwrite (Primary - PAID)**
- **Status**: ✅ CONFIGURED & AUTHENTICATED
- **Endpoint**: https://nyc.cloud.appwrite.io/v1
- **Project ID**: college-football-fantasy-app
- **Database ID**: college-football-fantasy
- **Collections**: 
  - `leagues` - Fantasy leagues
  - `rosters` - Team rosters (was teams)
  - `college_players` - Player database
  - `player_stats` - Weekly stats
  - `games` - Game schedule/scores
  - `rankings` - AP Top 25
  - `auctions` - Auction drafts
  - `bids` - Auction bid history
  - `lineups` - Weekly lineups
  - `users` - User accounts
  - `activity_log` - User activities

### **Free Alternative Options** (if needed)
- PlanetScale - Serverless MySQL
- Upstash - Serverless Redis
- Neon - Serverless Postgres
- Supabase - Open source Firebase alternative

## 🔧 MCP (Model Context Protocol) Integration

### **Available MCP Servers**
- ✅ **Appwrite MCP** - Full database CRUD operations
- ✅ **Filesystem MCP** - File system operations within project
- ✅ **Memory MCP** - Persistent memory across sessions
- ✅ **Git MCP** - Repository operations
- ✅ **GitHub MCP** - GitHub API operations
- ✅ **Brave Search MCP** - Web search (needs API key)
- ✅ **Puppeteer MCP** - Browser automation

### **Claude Code Built-in Tools**
- File Operations: Read, Write, Edit, MultiEdit, NotebookEdit
- Search: Grep, Glob, LS
- Web: WebFetch, WebSearch
- Shell: Bash, BashOutput, KillBash
- Task Management: TodoWrite, ExitPlanMode

### **Configuration Files**
- `.mcp.json` - Project MCP servers
- `docs/MCP_CONFIG.json` - Comprehensive MCP config
- `cursor.config.json` - Cursor AI configuration

## 🚀 Development Commands

### **Project Setup**
```bash
npm install                    # Install dependencies
npm run dev                    # Next.js dev server (port 3001)
npm run server                 # Express backend (port 3000)
npm run build                  # Production build
npm run typecheck              # TypeScript checking
npm run lint                   # ESLint checks
npm run lint:fix              # Auto-fix linting
```

### **AI Tool Commands**
```bash
# Claude CLI
node scripts/claude-cli.js
/code <description>           # Generate code
/review <file>                # Review code
/explain <file>               # Explain code
/test <file>                  # Generate tests

# Figma Sync
node scripts/figma-sync.js all        # Sync everything
node scripts/figma-sync.js colors     # Sync colors
node scripts/figma-sync.js components # Generate components
figma connect create                  # Create Code Connect

# FFmpeg (Local)
node scripts/ffmpeg-helpers.js convert input.mov output.mp4 --quality high
node scripts/ffmpeg-helpers.js compress large.mp4 small.mp4 --target-size 10
node scripts/ffmpeg-helpers.js extract-frames video.mp4 frames/ --fps 1
node scripts/ffmpeg-helpers.js thumbnail video.mp4 thumb.jpg --time 00:00:05
```

### **Git & Deployment**
```bash
# GitHub Operations
gh auth status                # Check auth
gh pr create                  # Create PR
gh issue list                 # List issues
gh repo view --web           # Open in browser

# Vercel Deployment
vercel                        # Deploy preview
vercel --prod                 # Deploy production
vercel env pull              # Pull environment variables
vercel logs --follow         # View logs
```

### **Testing & Quality**
```bash
npx playwright test          # Run browser tests
lhci autorun                 # Lighthouse CI
prettier --write .           # Format all files
eslint . --fix              # Fix linting issues
ncu -u                       # Update dependencies
```

## 🌐 Environment Variables

### **Required (Configured)**
```bash
# Appwrite
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=college-football-fantasy-app
APPWRITE_API_KEY=[configured]
APPWRITE_DATABASE_ID=college-football-fantasy

# APIs
CFBD_API_KEY=[configured]
AI_GATEWAY_API_KEY=[configured]
ANTHROPIC_API_KEY=[configured]
```

### **AI Tools (Optional)**
```bash
# AI Development Tools
RUNWAY_API_KEY=[configured]
OPENAI_API_KEY=your-openai-key-here
MESHY_API_KEY=[configured]
CRON_SECRET=secure-cron-secret

# Design Tools
FIGMA_ACCESS_TOKEN=your-figma-token-here
FIGMA_FILE_ID=your-figma-file-id-here

# External Services
GITHUB_PERSONAL_ACCESS_TOKEN=your-github-token-here
BRAVE_API_KEY=your-brave-api-key-here
```

## 📁 Project Structure

```
college-football-fantasy-app/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   │   ├── runway/create/   # Runway video generation (toolbox client also available)
│   │   ├── meshy/jobs/      # Meshy 3D generation (toolbox client also available)
│   │   ├── cron/poll-jobs/  # Job status polling
│   │   ├── claude/          # Claude API
│   │   └── [others]/        # Other API routes
│   └── [pages]/             # Page components
├── components/               # React components
├── hooks/                   # Custom hooks (useClaude, etc.)
├── lib/                     # Utilities & integrations
│   ├── claude.ts           # Claude API wrapper
│   ├── openai.ts           # OpenAI direct client
│   ├── runway.ts           # Runway AI wrapper
│   ├── figma.ts            # Figma integration
│   ├── appwrite.ts         # Appwrite client
│   └── appwrite-server.ts  # Appwrite server
├── types/                   # TypeScript definitions
│   └── jobs.ts             # AI job types
├── scripts/                 # Utility scripts
│   ├── claude-cli.js       # Interactive Claude CLI
│   ├── figma-sync.js       # Figma sync tool
│   └── ffmpeg-helpers.js   # Local video processing
├── vendor/                  # Submodules
│   └── awwwards-rig/       # 3D graphics submodule
├── docs/                    # Documentation
│   └── MCP_CONFIG.json     # MCP configuration
└── [config files]          # Various configs
```

## 🎯 Usage Examples

### **AI Tool Integration**
```typescript
// Runway video generation
import { createRunwayJob, pollRunwayJob } from '@/lib/runway';
const { jobId } = await createRunwayJob({ 
  prompt: "Football highlights reel", 
  model: 'gen3',
  duration: 30 
});

// OpenAI operations
import { generateText, analyzeImage, OpenAIChat } from '@/lib/openai';
const text = await generateText("Explain React Server Components");
const analysis = await analyzeImage(imageUrl, "What's in this screenshot?");
const chat = new OpenAIChat("You are a code reviewer");

// Claude operations  
import { generateCode, analyzeCode, ClaudeChat } from '@/lib/claude';
const code = await generateCode("Create a user auth hook", "typescript");
const review = await analyzeCode(existingCode, "review");

// Meshy 3D generation
import { createMeshyJob, pollMeshyJob } from '@/vendor/awwwards-rig/src/lib/meshy';
const { jobId } = await createMeshyJob({ 
  prompt: "Low-poly football stadium",
  textureStyle: 'stylized'
});
```

### **Development Workflow**
```typescript
// Use with React hooks
import { useClaude } from '@/hooks/useClaude';

function CodeGenerator() {
  const { generateCode, loading } = useClaude();
  
  const handleGenerate = async () => {
    const code = await generateCode("Create a login form");
    // Use generated code
  };
}

// Job status monitoring (automatic via cron)
// Jobs are polled every 5 minutes at /api/cron/poll-jobs
// Status updates stored in database automatically
```

## 🔗 Important Links & Resources

- **Production**: https://cfbfantasy.app
- **Vercel Dashboard**: https://vercel.com/kmp34s-projects/college-football-fantasy-app
- **Appwrite Console**: https://cloud.appwrite.io/console/project-college-football-fantasy-app
- **GitHub Repo**: Check with `gh repo view --web`
- **Figma API Tokens**: https://www.figma.com/developers/api#access-tokens
- **Claude API**: https://console.anthropic.com/
- **OpenAI API**: https://platform.openai.com/api-keys
- **Runway API**: https://app.runwayml.com/
- **Meshy API**: https://www.meshy.ai/

## ⚡ Quick Troubleshooting

### **Common Issues**
```bash
# Port conflicts
lsof -i :3001 && kill -9 [PID]

# Clear caches
rm -rf .next node_modules package-lock.json
npm install

# Environment issues
vercel env pull
SKIP_ENV_VALIDATION=true npm run build

# Test API connections
curl http://localhost:3001/api/health
node -e "console.log(require('./lib/openai').isOpenAIAvailable())"

# Verify tools
node scripts/claude-cli.js
node scripts/ffmpeg-helpers.js --help
```

### **MCP Issues**
- Restart Cursor after MCP config changes
- Check `.mcp.json` and `docs/MCP_CONFIG.json` are aligned
- Verify API keys are set correctly
- Test MCP tools via direct API calls first

## 🚨 Important Notes

1. **Appwrite is PAID** - Primary database, configured and working
2. **Port 3001** - Default for Next.js dev (3000 often in use)
3. **Node 18-22** - Required version range
4. **Vercel CLI** - Already authenticated as kmp34
5. **GitHub CLI** - Configured and ready
6. **AI APIs** - All major providers integrated (Claude, OpenAI, Runway, Meshy)
7. **FFmpeg** - Local only, not exposed as public API routes
8. **Job Polling** - Automatic via cron every 5 minutes

---

## 📋 Session Checklist for Cursor

When starting development:
1. ✅ Check environment variables are loaded
2. ✅ Verify Appwrite connection
3. ✅ Test build process (`npm run typecheck`)
4. ✅ Confirm API routes are working
5. ✅ Use appropriate tools for each task
6. ✅ Follow existing code patterns and conventions

*This toolbox contains everything Cursor AI needs for effective development assistance across all project domains.*