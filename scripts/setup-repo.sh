#!/bin/bash

# Repository Setup Script
# Run this after cloning the repository to set up the development environment

set -e

echo "🏈 College Football Fantasy App - Repository Setup"
echo "================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the repository root directory"
    exit 1
fi

# Check Node.js version
echo "📋 Checking Node.js version..."
NODE_VERSION=$(node --version 2>/dev/null || echo "not found")
if [ "$NODE_VERSION" = "not found" ]; then
    echo "❌ Node.js not found. Please install Node.js 18 or higher"
    exit 1
else
    echo "✅ Node.js version: $NODE_VERSION"
fi

# Install dependencies
echo "📦 Installing dependencies..."
if command -v pnpm &> /dev/null; then
    echo "   Using pnpm..."
    pnpm install
elif command -v yarn &> /dev/null; then
    echo "   Using yarn..."
    yarn install
else
    echo "   Using npm..."
    npm install
fi

# Check for .env.local
echo "🔧 Checking environment configuration..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. You'll need to create this file with:"
    echo "   - ANTHROPIC_API_KEY (for Claude integration)"
    echo "   - APPWRITE_* variables (for database)"
    echo "   - FIGMA_ACCESS_TOKEN (optional, for design sync)"
    echo ""
    echo "   See CLAUDE_TOOLBOX.md for the complete list of environment variables"
else
    echo "✅ .env.local found"
fi

# Verify key commands
echo "🧪 Verifying setup..."

# Check if build works
echo "   Testing build..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build successful"
else
    echo "⚠️  Build had issues - check dependencies"
fi

# Check TypeScript
echo "   Testing TypeScript..."
if npm run typecheck > /dev/null 2>&1; then
    echo "✅ TypeScript check passed"
else
    echo "⚠️  TypeScript issues found - run 'npm run typecheck' for details"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. 📖 Read CLAUDE_TOOLBOX.md for all available tools and commands"
echo "2. 🔑 Configure .env.local with your API keys (see CLAUDE.md)"
echo "3. 🏃 Start development: npm run dev"
echo "4. 🧪 Run tests: npm test"
echo "5. 🏈 Test join league: node scripts/test-join-league.js"
echo ""
echo "📚 Key files to review:"
echo "   - CLAUDE_TOOLBOX.md    (Complete development toolkit reference)"
echo "   - CLAUDE.md            (Project context and configuration)"
echo "   - DEV_TOOLS.md         (All installed developer tools)"
echo ""
echo "Happy coding! 🚀"