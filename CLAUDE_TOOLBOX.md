# 🧰 Claude Toolbox - Complete Development Environment Reference
*Last Updated: January 2025*

## 📋 Start of Session Checklist
When Claude reads this file at the beginning of a session, it will know:
1. All available tools and integrations
2. Project-specific configurations
3. API keys and services ready to use
4. Development workflows and commands
5. File locations and project structure

---

## 🤖 Claude API Integration
- **Status**: ✅ CONFIGURED
- **API Key**: Available in `.env.local`
- **Models**: claude-3-opus, claude-3-5-sonnet, claude-3-haiku
- **Library**: `/lib/claude.ts`
- **API Endpoint**: `/api/claude/route.ts`
- **React Hook**: `useClaude()` in `/frontend/hooks/useClaude.ts`
- **CLI Tool**: `/scripts/claude-cli.js`

### Quick Claude Commands
```bash
node scripts/claude-cli.js        # Interactive Claude CLI
/code <description>               # Generate code
/review <file>                    # Review code
/explain <file>                   # Explain code
/test <file>                      # Generate tests
```

---

## 🎨 Figma Integration
- **Status**: ✅ CONFIGURED
- **Tools**: Figma Code Connect, API integration, Sync tools
- **Library**: `/lib/figma.ts`
- **Sync Script**: `/scripts/figma-sync.js`
- **Config**: `/figma.config.json`

### Figma Commands
```bash
node scripts/figma-sync.js all      # Sync everything
node scripts/figma-sync.js colors   # Sync color tokens
node scripts/figma-sync.js components # Generate React components
figma connect create                 # Create Code Connect
```

**Required ENV Variables**:
```
FIGMA_ACCESS_TOKEN=your_token
FIGMA_FILE_ID=your_file_id
```

---

## 🔧 MCP (Model Context Protocol) Tools

### Built-in Claude Code Tools
- **File Operations**: Read, Write, Edit, MultiEdit, NotebookEdit
- **Search**: Grep, Glob, LS
- **Web**: WebFetch, WebSearch
- **Shell**: Bash, BashOutput, KillBash
- **Task Management**: TodoWrite, ExitPlanMode
- **IDE**: mcp__ide__getDiagnostics, mcp__ide__executeCode

### Configured MCP Servers
1. **Appwrite** - Database operations (CONFIGURED)
2. **GitHub** - GitHub Copilot integration
3. **Filesystem** - File system access
4. **Postgres** - Database operations
5. **Memory** - Persistent memory storage
6. **Brave Search** - Web search (needs API key)
7. **Puppeteer** - Browser automation

**Config Location**: `/docs/MCP_CONFIG.json`

---

## 🛠️ Installed CLI Tools

### Core Development
- ✅ **GitHub CLI** (`gh`) - GitHub operations
- ✅ **Vercel CLI** (`vercel`) - Deployment (user: kpm34)
- ✅ **pnpm** - Fast package manager
- ✅ **Turbo** (`turbo`) - Monorepo builds
- ✅ **Act** (`act`) - Run GitHub Actions locally

### Code Quality
- ✅ **Prettier** - Code formatting
- ✅ **ESLint** - JavaScript linting
- ✅ **npm-check-updates** (`ncu`) - Update dependencies

### Testing & Debugging
- ✅ **Playwright** - Browser testing (Chrome, Firefox, WebKit installed)
- ✅ **Lighthouse CI** (`lhci`) - Performance testing
- ✅ **ngrok** - Tunnel local servers
- ✅ **Sentry CLI** (`sentry-cli`) - Error tracking

### Deployment
- ✅ **Netlify CLI** (`netlify`) - Alternative deployment
- ✅ **Railway CLI** (`railway`) - Backend hosting
- ✅ **Vercel CLI** (`vercel`) - Primary deployment

### Utilities
- ✅ **nodemon** - Auto-restart Node apps
- ✅ **concurrently** - Run multiple commands
- ✅ **serve** - Static file server
- ✅ **json-server** - Mock REST API
- ✅ **GitHub Copilot CLI** - AI assistance

---

## 🗄️ Database & Backend

### Appwrite (Primary)
- **Status**: ✅ CONFIGURED & PAID
- **Endpoint**: https://nyc.cloud.appwrite.io/v1
- **Project ID**: college-football-fantasy-app
- **Database ID**: college-football-fantasy
- **API Key**: Available in `.env.local`
- **Collections**: players, teams, leagues, games, rankings, etc.

### Available Free Alternatives
- PlanetScale - Serverless MySQL
- Upstash - Serverless Redis
- Neon - Serverless Postgres
- Supabase - Open source Firebase alternative

---

## 📦 NPM Packages Installed

### AI & Language Models
- `@anthropic-ai/sdk` - Claude API
- `ai` - Vercel AI SDK
- `langchain` - LLM framework
- `@langchain/anthropic` - Anthropic integration

### Figma & Design
- `@figma/code-connect` - Code linking
- `figma-js` - Figma API client
- `@figma/plugin-typings` - TypeScript types
- `figma-transformer` - Design token transformer
- `style-dictionary` - Token management

### Development
- `zod` - Schema validation
- `dotenv` - Environment variables
- `dotenv-cli` - CLI for env files

---

## 🚀 Quick Commands Reference

### Development
```bash
npm run dev                  # Start Next.js (port 3001)
npm run server              # Start Express backend (port 3000)
npm run build               # Production build
npm run lint                # Run ESLint
npm run typecheck           # TypeScript checking
vercel dev                  # Vercel dev environment
```

### Git & GitHub
```bash
gh auth status              # Check GitHub auth
gh pr create               # Create pull request
gh issue list              # List issues
gh repo clone              # Clone repository
```

### Deployment
```bash
vercel                     # Deploy preview
vercel --prod             # Deploy production
vercel env pull           # Pull env variables
netlify deploy            # Deploy to Netlify
railway up                # Deploy to Railway
```

### Testing & Quality
```bash
npx playwright test        # Run Playwright tests
lhci autorun              # Run Lighthouse CI
prettier --write .        # Format all files
eslint . --fix           # Fix linting issues
ncu -u                   # Update dependencies
```

### Utilities
```bash
ngrok http 3001          # Expose local server
turbo run build          # Turbo build
act                      # Run GitHub Actions locally
serve dist               # Serve static files
json-server db.json      # Mock API server
```

---

## 🌐 Environment Variables

### Required
```env
# Appwrite
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=college-football-fantasy-app
APPWRITE_API_KEY=[configured]
APPWRITE_DATABASE_ID=college-football-fantasy

# Claude API
ANTHROPIC_API_KEY=[configured]

# APIs
CFBD_API_KEY=[configured]
AI_GATEWAY_API_KEY=[configured]
```

### Optional
```env
# Figma
FIGMA_ACCESS_TOKEN=[get from figma.com/developers]
FIGMA_FILE_ID=[from figma file URL]

# External APIs
ODDS_API_KEY=[optional]
ROTOWIRE_API_KEY=[optional]
```

---

## 📁 Project Structure
```
/college-football-fantasy-app/
├── frontend/                 # Next.js 15 app
│   ├── app/                 # App Router
│   │   ├── api/            # API routes
│   │   └── [pages]/        # Page components
│   ├── components/          # React components
│   ├── hooks/              # Custom hooks (including useClaude)
│   └── lib/                # Utilities (claude.ts, figma.ts, appwrite.ts)
├── src/                     # Backend source
├── scripts/                 # Utility scripts
│   ├── claude-cli.js       # Claude interactive CLI
│   └── figma-sync.js       # Figma sync tool
├── docs/                    # Documentation
│   ├── MCP_CONFIG.json     # MCP configuration
│   └── MCP_SETUP_GUIDE.md  # MCP documentation
├── CLAUDE.md               # Project context
├── DEV_TOOLS.md            # Developer tools reference
└── CLAUDE_TOOLBOX.md       # This file

```

---

## 🎯 Key Features Available

### AI-Powered Development
- Code generation with Claude
- Code review and optimization
- Documentation generation
- Test generation
- Interactive CLI for AI assistance

### Design-to-Code Pipeline
- Figma component sync
- Design token extraction
- Auto-generate React components
- CSS variable generation
- Asset export automation

### Database Operations
- Appwrite SDK configured
- Collections for all game data
- User authentication ready
- Real-time subscriptions available

### Testing & Quality
- Playwright for E2E testing
- Lighthouse for performance
- ESLint/Prettier for code quality
- Type checking with TypeScript

### Deployment & CI/CD
- Vercel for hosting
- GitHub Actions ready
- Multiple deployment options
- Environment variable management

---

## 💡 Best Practices for Claude

1. **Always check this toolbox** at session start
2. **Use TodoWrite** for task management
3. **Verify file paths** before operations
4. **Check environment variables** in `.env.local`
5. **Run tests** after significant changes
6. **Use appropriate tools** for each task:
   - Grep/Glob for searching
   - Read before Edit
   - MultiEdit for multiple changes
   - Task tool for complex searches

---

## 🔗 Important Links

- **Production**: https://cfbfantasy.app
- **Vercel Dashboard**: https://vercel.com/kpm34s-projects
- **Appwrite Console**: https://cloud.appwrite.io/console/project-college-football-fantasy-app
- **GitHub Repo**: Check with `gh repo view --web`
- **Figma API Tokens**: https://www.figma.com/developers/api#access-tokens

---

## 🚨 Important Notes

1. **Appwrite is PAID** - Primary database, don't look for alternatives
2. **Port 3001** - Default for Next.js dev (3000 might be in use)
3. **Node 18-22** - Required version range
4. **Vercel CLI** - Already authenticated as kpm34
5. **GitHub CLI** - Configured and ready
6. **Claude API** - Full access with all models

---

## 📝 Session Start Command for Claude

When starting a new session, Claude should:
1. Read this CLAUDE_TOOLBOX.md file
2. Check CLAUDE.md for project context
3. Verify environment with `vercel env pull`
4. Use TodoWrite for task planning
5. Utilize all available tools effectively

---

*This toolbox contains everything Claude needs to be maximally effective in development sessions.*