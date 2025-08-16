#!/bin/bash

# Claude Code Toolbox Export Script
# This script exports your Claude Code setup for transfer to another machine

echo "🚀 Claude Code Toolbox Export Script"
echo "====================================="
echo ""

# Create export directory
EXPORT_DIR="claude-toolbox-export-$(date +%Y%m%d)"
mkdir -p "$EXPORT_DIR"

echo "📦 Creating export bundle in: $EXPORT_DIR"
echo ""

# Export environment variables template (without sensitive values)
echo "📝 Creating environment template..."
if [ -f .env.local ]; then
  cat .env.local | sed 's/=.*$/=[REPLACE_WITH_YOUR_VALUE]/' > "$EXPORT_DIR/env-template.txt"
  echo "   ✓ Environment template created"
else
  echo "   ⚠️  No .env.local found"
fi

if [ -f .env.production.local ]; then
  cat .env.production.local | sed 's/=.*$/=[REPLACE_WITH_YOUR_VALUE]/' > "$EXPORT_DIR/env-production-template.txt"
  echo "   ✓ Production environment template created"
fi

# Export list of global npm packages
echo "📦 Listing global npm packages..."
npm list -g --depth=0 > "$EXPORT_DIR/global-npm-packages.txt" 2>/dev/null
echo "   ✓ Global packages list created"

# Export VS Code extensions if available
echo "🔧 Checking for VS Code extensions..."
if command -v code &> /dev/null; then
  code --list-extensions > "$EXPORT_DIR/vscode-extensions.txt"
  echo "   ✓ VS Code extensions list created"
elif command -v cursor &> /dev/null; then
  cursor --list-extensions > "$EXPORT_DIR/cursor-extensions.txt" 2>/dev/null
  echo "   ✓ Cursor extensions list created"
fi

# Copy important configuration files
echo "📄 Copying configuration files..."
FILES_TO_COPY=(
  "CLAUDE.md"
  "CLAUDE_TOOLBOX.md"
  "CLAUDE_DESKTOP_SETUP.md"
  "DATA_FLOW.md"
  "DEV_TOOLS.md"
  "ENVIRONMENT_VARIABLES.md"
  "package.json"
  "figma.config.json"
  "appwrite.json"
  "vercel.json"
  "tsconfig.json"
  ".prettierrc.json"
)

for file in "${FILES_TO_COPY[@]}"; do
  if [ -f "$file" ]; then
    cp "$file" "$EXPORT_DIR/"
    echo "   ✓ Copied $file"
  fi
done

# Copy scripts directory
if [ -d "scripts" ]; then
  cp -r scripts "$EXPORT_DIR/"
  echo "   ✓ Copied scripts directory"
fi

# Copy docs directory
if [ -d "docs" ]; then
  cp -r docs "$EXPORT_DIR/"
  echo "   ✓ Copied docs directory"
fi

# Export brew packages (macOS)
if command -v brew &> /dev/null; then
  echo "🍺 Listing Homebrew packages..."
  brew list > "$EXPORT_DIR/brew-packages.txt"
  echo "   ✓ Homebrew packages list created"
fi

# Create setup verification script
echo "✅ Creating verification script..."
cat > "$EXPORT_DIR/verify-setup.sh" << 'VERIFY_EOF'
#!/bin/bash

echo "🔍 Verifying Claude Code Toolbox Setup..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node version
if command -v node &> /dev/null; then
  echo -e "${GREEN}✓${NC} Node Version: $(node --version)"
else
  echo -e "${RED}✗${NC} Node NOT installed"
fi

# Check npm packages
if command -v npm &> /dev/null; then
  echo -e "${GREEN}✓${NC} NPM Version: $(npm --version)"
else
  echo -e "${RED}✗${NC} NPM NOT installed"
fi

# Check CLI tools
echo ""
echo "Checking CLI tools:"
tools=("claude" "gh" "vercel" "pnpm" "turbo" "prettier" "eslint" "playwright" "ngrok" "netlify" "nodemon" "concurrently" "serve")
for tool in "${tools[@]}"; do
  if command -v $tool &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} $tool installed"
  else
    echo -e "  ${RED}✗${NC} $tool NOT installed"
  fi
done

# Check environment variables
echo ""
echo "Checking environment:"
if [ -f .env.local ]; then
  echo -e "  ${GREEN}✓${NC} .env.local exists"
else
  echo -e "  ${RED}✗${NC} .env.local NOT found"
fi

# Check git config
echo ""
echo "Git configuration:"
if [ -n "$(git config user.name)" ]; then
  echo -e "  ${GREEN}✓${NC} Git User: $(git config user.name)"
else
  echo -e "  ${RED}✗${NC} Git user.name NOT set"
fi

if [ -n "$(git config user.email)" ]; then
  echo -e "  ${GREEN}✓${NC} Git Email: $(git config user.email)"
else
  echo -e "  ${RED}✗${NC} Git user.email NOT set"
fi

# Check GitHub auth
echo ""
echo "Authentication status:"
if gh auth status &> /dev/null; then
  echo -e "  ${GREEN}✓${NC} GitHub CLI authenticated"
else
  echo -e "  ${RED}✗${NC} GitHub CLI NOT authenticated"
fi

# Check Vercel auth
if vercel whoami &> /dev/null; then
  echo -e "  ${GREEN}✓${NC} Vercel CLI authenticated ($(vercel whoami 2>/dev/null))"
else
  echo -e "  ${RED}✗${NC} Vercel CLI NOT authenticated"
fi

echo ""
echo "🎉 Setup verification complete!"
VERIFY_EOF

chmod +x "$EXPORT_DIR/verify-setup.sh"
echo "   ✓ Verification script created"

# Create quick install script
echo "🚀 Creating quick install script..."
cat > "$EXPORT_DIR/quick-install.sh" << 'INSTALL_EOF'
#!/bin/bash

echo "🚀 Claude Code Toolbox Quick Install"
echo "===================================="
echo ""

# Install Node.js via nvm if not present
if ! command -v node &> /dev/null; then
  echo "📦 Installing Node.js via nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  nvm install 20
  nvm use 20
fi

echo "📦 Installing global npm packages..."

# Core packages
npm install -g @anthropic-ai/claude-code

# CLI tools
npm install -g vercel netlify-cli @railway/cli
npm install -g pnpm turbo
npm install -g prettier eslint npm-check-updates
npm install -g nodemon concurrently serve json-server
npm install -g @sentry/cli
npm install -g playwright @lhci/cli

echo ""
echo "🍺 Installing Homebrew packages (macOS)..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  # Install Homebrew if not present
  if ! command -v brew &> /dev/null; then
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  fi
  
  brew install gh act ngrok
fi

echo ""
echo "🔧 Setting up Playwright browsers..."
npx playwright install

echo ""
echo "✅ Quick install complete!"
echo "Next steps:"
echo "1. Clone the repository"
echo "2. Copy your .env.local file"
echo "3. Run 'npm install' in the project directory"
echo "4. Configure GitHub CLI: gh auth login"
echo "5. Configure Vercel CLI: vercel login"
INSTALL_EOF

chmod +x "$EXPORT_DIR/quick-install.sh"
echo "   ✓ Quick install script created"

# Create README for the export
echo "📚 Creating README..."
cat > "$EXPORT_DIR/README.md" << 'README_EOF'
# Claude Code Toolbox Export

This export contains everything needed to replicate your Claude Code development environment on another machine.

## Contents

- `env-template.txt` - Template of your .env.local file (add your actual API keys)
- `global-npm-packages.txt` - List of globally installed npm packages
- `vscode-extensions.txt` or `cursor-extensions.txt` - List of editor extensions
- `brew-packages.txt` - List of Homebrew packages (macOS)
- Configuration files (CLAUDE.md, package.json, etc.)
- `scripts/` - Utility scripts including claude-cli.js
- `docs/` - Documentation and MCP configuration

## Quick Setup

1. **Run the quick install script:**
   ```bash
   ./quick-install.sh
   ```

2. **Clone the repository:**
   ```bash
   git clone https://github.com/kpm34/college-football-fantasy-app.git
   cd college-football-fantasy-app/college-football-fantasy-app
   ```

3. **Copy your environment variables:**
   - Use `env-template.txt` as a guide
   - Create `.env.local` with your actual API keys

4. **Install project dependencies:**
   ```bash
   npm install
   ```

5. **Verify the setup:**
   ```bash
   ./verify-setup.sh
   ```

## Manual Setup

For detailed step-by-step instructions, see `CLAUDE_DESKTOP_SETUP.md`

## Important Files

- **CLAUDE_DESKTOP_SETUP.md** - Complete setup guide
- **CLAUDE_TOOLBOX.md** - Full toolbox reference
- **CLAUDE.md** - Project context
- **quick-install.sh** - Automated installation script
- **verify-setup.sh** - Setup verification script

## Support

If you encounter any issues, refer to the troubleshooting section in CLAUDE_DESKTOP_SETUP.md
README_EOF
echo "   ✓ README created"

# Create the archive
echo ""
echo "📦 Creating compressed archive..."
cd ..
tar -czf "$EXPORT_DIR.tar.gz" "$EXPORT_DIR"
cd - > /dev/null

echo "   ✓ Archive created: $EXPORT_DIR.tar.gz"

# Final summary
echo ""
echo "========================================="
echo "✅ Export Complete!"
echo ""
echo "📦 Export bundle created: $EXPORT_DIR/"
echo "🗜️  Compressed archive: $EXPORT_DIR.tar.gz"
echo ""
echo "📋 Next steps:"
echo "1. Transfer $EXPORT_DIR.tar.gz to your desktop"
echo "2. Extract: tar -xzf $EXPORT_DIR.tar.gz"
echo "3. Run: cd $EXPORT_DIR && ./quick-install.sh"
echo "4. Follow the setup instructions in README.md"
echo ""
echo "🔐 Remember to securely transfer your API keys!"
echo "   Your .env.local file contains sensitive data"
echo "========================================="