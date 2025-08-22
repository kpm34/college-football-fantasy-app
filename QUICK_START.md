# 🚀 Quick Start Guide

## For New Contributors & Developers

### 1. Clone the Repository
```bash
git clone https://github.com/kpm34/college-football-fantasy-app.git
cd college-football-fantasy-app
```

### 2. Automated Setup
```bash
# Run the setup script (does everything for you)
chmod +x scripts/setup-repo.sh
./scripts/setup-repo.sh
```

### 3. Configure Environment
```bash
# Copy the template and fill in your API keys
cp .env.example .env.local

# Edit .env.local with your actual API keys:
# - ANTHROPIC_API_KEY (required for Claude AI)
# - APPWRITE_* variables (required for database)
# - FIGMA_ACCESS_TOKEN (optional for design sync)
```

### 4. Start Development
```bash
# Start the development server
npm run dev

# In another terminal, start the backend (if needed)
npm run server
```

### 5. Verify Everything Works
```bash
# Test the join league feature
node scripts/test-join-league.js

# Run type checking
npm run typecheck

# Run linting
npm run lint
```

## 📖 Essential Reading

1. **[TOOLBOX_CLAUDE.md](./TOOLBOX_CLAUDE.md)** - MCP integration for Claude Code
2. **[TOOLBOX_CURSOR.md](./TOOLBOX_CURSOR.md)** - Development environment for Cursor AI
2. **[CLAUDE.md](./CLAUDE.md)** - Project context and configuration
3. **[DEV_TOOLS.md](./DEV_TOOLS.md)** - All installed developer tools

## 🔑 API Keys You'll Need

### Required
- **Anthropic Claude API**: https://console.anthropic.com/
- **Appwrite Database**: Already configured (use existing project)

### Optional
- **Figma API**: https://www.figma.com/developers/api#access-tokens
- **CFBD API**: https://collegefootballdata.com/

## 🎯 Quick Commands

```bash
# Development
npm run dev                 # Start Next.js dev server
npm run server             # Start Express backend
npm run build              # Production build

# Database
node scripts/sync-appwrite-schema.js    # Sync database schema
node scripts/test-join-league.js        # Test join functionality
node scripts/cleanup-test-data.js       # Clean test data

# AI Tools
node ops/claude-ops/claude-cli.js       # Interactive Claude CLI
node scripts/figma-sync.js all          # Sync Figma designs

# Quality
npm run lint               # Code linting
npm run typecheck         # TypeScript checking
```

## 🏈 College Football Fantasy Features

- **Power 4 Conferences**: SEC, ACC, Big 12, Big Ten only
- **Large Leagues**: Up to 24 teams (more players than NFL)
- **Unique Scoring**: Players only score vs AP Top-25 or in conference games
- **12-Week Season**: Regular season only, no playoffs/bowls

## 💡 Pro Tips

1. **Use the Claude CLI** for code generation and review
2. **Sync with Figma** for design-to-code workflows
3. **Test thoroughly** with the join league test suite
4. **Read the toolbox** - everything you need is documented

---

**Welcome to the most advanced college football fantasy platform!** 🏈🚀