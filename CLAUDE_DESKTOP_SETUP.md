# 🖥️ Claude Code Toolbox Desktop Setup Guide
*Export from Laptop to Desktop*

## Overview
This guide will help you replicate your Claude Code toolbox setup from your laptop to your desktop, including all tools, configurations, and integrations.

## Step 1: Install Claude Code CLI

### On Your Desktop:
```bash
# Install Claude Code globally
npm install -g @anthropic-ai/claude-code

# Or with specific Node version
nvm use 20
npm install -g @anthropic-ai/claude-code

# Verify installation
claude --version
```

## Step 2: Install Required CLI Tools

### Core Development Tools
```bash
# GitHub CLI
brew install gh
gh auth login

# Vercel CLI
npm install -g vercel
vercel login

# Package Managers
npm install -g pnpm
npm install -g turbo

# Local GitHub Actions
brew install act
```

### Code Quality Tools
```bash
npm install -g prettier
npm install -g eslint
npm install -g npm-check-updates
```

### Testing & Debugging
```bash
# Playwright
npm install -g playwright
npx playwright install  # Install browsers

# Lighthouse CI
npm install -g @lhci/cli

# ngrok
brew install ngrok

# Sentry CLI
npm install -g @sentry/cli
```

### Deployment Tools
```bash
npm install -g netlify-cli
npm install -g @railway/cli
```

### Utility Tools
```bash
npm install -g nodemon
npm install -g concurrently
npm install -g serve
npm install -g json-server
```

## Step 3: Clone Repository & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/kpm34/college-football-fantasy-app.git
cd college-football-fantasy-app/college-football-fantasy-app

# Install dependencies
npm install

# Install global packages used in project
npm install -g @anthropic-ai/sdk
npm install -g @figma/code-connect
```

## Step 4: Setup Environment Variables

### Create `.env.local` file with these variables:
```env
# Appwrite Configuration
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=college-football-fantasy-app
APPWRITE_API_KEY=[YOUR_API_KEY]
APPWRITE_DATABASE_ID=college-football-fantasy

# Frontend Public Variables
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=college-football-fantasy-app
NEXT_PUBLIC_APPWRITE_DATABASE_ID=college-football-fantasy

# Collection Names
NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS=auctions
NEXT_PUBLIC_APPWRITE_COLLECTION_BIDS=bids
NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFTED_PLAYERS=rosters
NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES=games
NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES=leagues
NEXT_PUBLIC_APPWRITE_COLLECTION_MATCHUPS=lineups
NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS=college_players
NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_STATS=player_stats
NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS=rankings
NEXT_PUBLIC_APPWRITE_COLLECTION_TEAMS=teams
NEXT_PUBLIC_APPWRITE_COLLECTION_USERS=users

# APIs
CFBD_API_KEY=[YOUR_KEY]
CFBD_API_KEY_BACKUP=[YOUR_BACKUP_KEY]
AI_GATEWAY_API_KEY=[YOUR_KEY]
AI_GATEWAY_URL=https://ai-gateway.vercel.sh/v1/ai
ANTHROPIC_API_KEY=[YOUR_CLAUDE_KEY]

# Inngest (Background Jobs)
INNGEST_EVENT_KEY=[YOUR_KEY]
INNGEST_SIGNING_KEY=[YOUR_KEY]

# Edge Config (Feature Flags)
EDGE_CONFIG=[YOUR_CONFIG]

# External APIs (optional)
ODDS_API_KEY=your_key_here
ROTOWIRE_API_KEY=your_key_here

# Figma (optional)
FIGMA_ACCESS_TOKEN=[YOUR_TOKEN]
FIGMA_FILE_ID=[YOUR_FILE_ID]

# Development
SEASON_YEAR=2025
NEXT_DISABLE_FAST_REFRESH=true
```

### Pull Vercel Environment Variables:
```bash
# Login to Vercel
vercel login

# Link to project
vercel link

# Pull environment variables
vercel env pull
```

## Step 5: Configure MCP (Model Context Protocol)

### Create MCP Configuration Directory:
```bash
mkdir -p ~/Library/Application\ Support/Claude
```

### Create `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/YOUR_USERNAME/college-football-fantasy-app"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_TOKEN"
      }
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"],
      "env": {
        "PUPPETEER_ALLOWED_DOMAINS": "localhost,*.vercel.app"
      }
    }
  }
}
```

Save this to: `~/Library/Application Support/Claude/claude_desktop_config.json`

## Step 6: Setup VS Code / Cursor Extensions

### Install Required Extensions:
1. **Claude Code** - Anthropic.claude-code
2. **Prettier** - esbenp.prettier-vscode
3. **ESLint** - dbaeumer.vscode-eslint
4. **Tailwind CSS IntelliSense** - bradlc.vscode-tailwindcss
5. **Figma for VS Code** - figma.figma-vscode-extension

### VS Code Settings:
```json
{
  "claude.apiKey": "YOUR_ANTHROPIC_API_KEY",
  "claude.model": "claude-3-5-sonnet-20241022",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"]
}
```

## Step 7: Configure Git & GitHub

```bash
# Set git config
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Authenticate GitHub CLI
gh auth login

# Setup SSH key for GitHub (if not already done)
ssh-keygen -t ed25519 -C "your.email@example.com"
cat ~/.ssh/id_ed25519.pub
# Add this key to GitHub: https://github.com/settings/keys
```

## Step 8: Setup Appwrite CLI (Optional)

```bash
# Install Appwrite CLI
npm install -g appwrite

# Login to Appwrite
appwrite login

# Init project
appwrite init project

# Select existing project: college-football-fantasy-app
```

## Step 9: Verify Installation

### Run Verification Script:
```bash
# Create verification script
cat > verify-setup.sh << 'EOF'
#!/bin/bash

echo "🔍 Verifying Claude Code Toolbox Setup..."
echo ""

# Check Node version
echo "✓ Node Version: $(node --version)"

# Check npm packages
echo "✓ NPM Version: $(npm --version)"

# Check CLI tools
tools=("claude" "gh" "vercel" "pnpm" "turbo" "prettier" "eslint" "playwright" "ngrok" "netlify")
for tool in "${tools[@]}"; do
  if command -v $tool &> /dev/null; then
    echo "✓ $tool installed"
  else
    echo "✗ $tool NOT installed"
  fi
done

# Check environment variables
if [ -f .env.local ]; then
  echo "✓ .env.local exists"
else
  echo "✗ .env.local NOT found"
fi

# Check git config
echo "✓ Git User: $(git config user.name)"
echo "✓ Git Email: $(git config user.email)"

# Check GitHub auth
if gh auth status &> /dev/null; then
  echo "✓ GitHub CLI authenticated"
else
  echo "✗ GitHub CLI NOT authenticated"
fi

# Check Vercel auth
if vercel whoami &> /dev/null; then
  echo "✓ Vercel CLI authenticated"
else
  echo "✗ Vercel CLI NOT authenticated"
fi

echo ""
echo "🎉 Setup verification complete!"
EOF

chmod +x verify-setup.sh
./verify-setup.sh
```

## Step 10: Test the Setup

```bash
# Test Claude Code
claude --help

# Test development server
npm run dev

# Test Claude interactive CLI
node scripts/claude-cli.js

# Test Figma sync (if configured)
node scripts/figma-sync.js

# Test deployment
vercel --prod --dry-run
```

## Quick Transfer Script

Save this as `export-toolbox.sh` on your laptop:
```bash
#!/bin/bash

# Export environment variables (without sensitive data)
echo "Exporting configuration..."
cat .env.local | sed 's/=.*/=YOUR_VALUE_HERE/' > env-template.txt

# Export installed global packages
echo "Listing global packages..."
npm list -g --depth=0 > global-packages.txt

# Export VS Code extensions
if command -v code &> /dev/null; then
  code --list-extensions > vscode-extensions.txt
fi

# Create transfer bundle
tar -czf claude-toolbox-export.tar.gz \
  env-template.txt \
  global-packages.txt \
  vscode-extensions.txt \
  CLAUDE.md \
  TOOLBOX_CLAUDE.md \
  scripts/claude-cli.js \
  scripts/figma-sync.js \
  figma.config.json

echo "✅ Export complete: claude-toolbox-export.tar.gz"
echo "Transfer this file to your desktop and extract it"
```

## Troubleshooting

### Issue: Claude Code not found
```bash
# Reinstall with specific Node version
nvm use 20
npm install -g @anthropic-ai/claude-code
```

### Issue: Permission denied errors
```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

### Issue: Vercel login issues
```bash
# Clear Vercel auth and re-login
vercel logout
vercel login
```

### Issue: Environment variables not loading
```bash
# Ensure .env.local is in the correct directory
pwd  # Should be in college-football-fantasy-app/college-football-fantasy-app
ls -la .env.local  # Check file exists
```

## Important Files to Transfer

From your laptop's project directory, copy these files to your desktop:
1. `.env.local` (contains all API keys)
2. `.env.production.local` (production environment)
3. `CLAUDE.md` (project context)
4. `TOOLBOX_CLAUDE.md` (MCP integration guide)
5. `TOOLBOX_CURSOR.md` (Cursor AI environment guide)
5. `figma.config.json` (if using Figma)
6. `scripts/claude-cli.js` (Claude CLI tool)
7. `scripts/figma-sync.js` (Figma sync tool)

## Final Checklist

- [ ] Claude Code CLI installed and working
- [ ] All required CLI tools installed
- [ ] Repository cloned and dependencies installed
- [ ] Environment variables configured
- [ ] MCP configured (if using Claude desktop app)
- [ ] VS Code/Cursor extensions installed
- [ ] Git and GitHub configured
- [ ] Vercel CLI authenticated
- [ ] Development server runs successfully
- [ ] Can deploy to Vercel

## Support Resources

- **Claude Code Docs**: https://docs.anthropic.com/en/docs/claude-code
- **Vercel Dashboard**: https://vercel.com/kpm34s-projects
- **Appwrite Console**: https://cloud.appwrite.io/console
- **GitHub Repo**: https://github.com/kpm34/college-football-fantasy-app

---

*Once setup is complete, your desktop will have the exact same Claude Code toolbox capabilities as your laptop!*