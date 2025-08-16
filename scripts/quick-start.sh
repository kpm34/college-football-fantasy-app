#!/bin/bash

# Quick Start Script for College Football Fantasy App
# Run this after setting up your API keys

echo "🚀 College Football Fantasy App - Quick Start"
echo "=============================================="

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}1. Testing all integrations...${NC}"
node scripts/test-integrations.js

echo -e "\n${CYAN}2. Available tools and commands:${NC}"
echo -e "${GREEN}Development:${NC}"
echo "  npm run dev                  # Start Next.js development server"
echo "  npm run server               # Start Express backend" 
echo "  npm run build                # Production build"

echo -e "\n${GREEN}AI Tools:${NC}"
echo "  node scripts/claude-cli.js   # Interactive Claude AI assistant"
echo "  node scripts/figma-sync.js   # Sync designs from Figma"

echo -e "\n${GREEN}Code Quality:${NC}"
echo "  npm run lint                 # Run ESLint"
echo "  npm run typecheck            # TypeScript checking"
echo "  npm run format               # Format code with Prettier"

echo -e "\n${GREEN}Testing:${NC}"
echo "  npm test                     # Run tests"
echo "  node scripts/test-integrations.js  # Test all APIs"

echo -e "\n${GREEN}Database:${NC}"
echo "  npm run schema:sync          # Sync Appwrite schema"
echo "  npm run migrate:auth-users   # Migrate auth users"

echo -e "\n${GREEN}Deployment:${NC}"
echo "  vercel                       # Deploy preview"
echo "  vercel --prod               # Deploy to production"

echo -e "\n${CYAN}3. Quick setup verification:${NC}"

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local file exists${NC}"
else
    echo -e "${RED}❌ .env.local file missing${NC}"
    echo -e "${YELLOW}   Run: cp .env.example .env.local${NC}"
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${RED}❌ Dependencies not installed${NC}"
    echo -e "${YELLOW}   Run: npm install${NC}"
fi

# Check if key directories exist
if [ -d "components/figma" ] && [ -d "styles" ]; then
    echo -e "${GREEN}✅ Required directories created${NC}"
else
    echo -e "${YELLOW}⚪ Creating required directories...${NC}"
    mkdir -p components/figma styles
    echo -e "${GREEN}✅ Directories created${NC}"
fi

echo -e "\n${CYAN}4. Ready to start development!${NC}"
echo -e "${GREEN}Try these commands:${NC}"
echo -e "  ${BLUE}node scripts/claude-cli.js${NC}     # Chat with Claude AI"
echo -e "  ${BLUE}npm run dev${NC}                    # Start development"
echo -e "  ${BLUE}vercel dev${NC}                     # Start with Vercel environment"

echo -e "\n${CYAN}For help:${NC}"
echo -e "  • Read CLAUDE_TOOLBOX.md for complete reference"
echo -e "  • Read QUICK_START.md for setup instructions" 
echo -e "  • Check DEV_TOOLS.md for all available tools"

echo -e "\n🎉 Happy coding!"