#!/bin/bash

# 🚀 College Football Fantasy App - Deployment Script
# Usage: ./deploy.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Current production URL
PRODUCTION_URL="https://college-football-fantasy.vercel.app"

echo -e "${BLUE}🏈 College Football Fantasy App - Deployment Script${NC}"
echo "=================================================="

case "$1" in
    "deploy")
        echo -e "${GREEN}🚀 Deploying to production...${NC}"
        npx vercel --prod --yes
        echo -e "${GREEN}✅ Deployment complete!${NC}"
        echo -e "${BLUE}🌐 Your app is live at: ${PRODUCTION_URL}${NC}"
        ;;
    
    "dev")
        echo -e "${YELLOW}🔧 Deploying to development...${NC}"
        npx vercel --yes
        echo -e "${GREEN}✅ Development deployment complete!${NC}"
        ;;
    
    "status")
        echo -e "${BLUE}📊 Checking deployment status...${NC}"
        vercel project ls
        echo ""
        echo -e "${BLUE}📋 Recent deployments:${NC}"
        vercel ls
        ;;
    
    "clean")
        echo -e "${YELLOW}🧹 Cleaning up old deployments...${NC}"
        echo "Current deployments:"
        vercel ls
        echo ""
        echo -e "${RED}⚠️  To remove a deployment, use:${NC}"
        echo "vercel remove --yes [deployment-url]"
        ;;
    
    "test")
        echo -e "${BLUE}🧪 Running local tests...${NC}"
        cd frontend
        echo "Building project..."
        npm run build
        echo -e "${GREEN}✅ Build successful!${NC}"
        cd ..
        ;;
    
    "dev-server")
        echo -e "${BLUE}🖥️  Starting development server...${NC}"
        cd frontend
        npm run dev
        ;;
    
    "check")
        echo -e "${BLUE}🔍 Checking project status...${NC}"
        echo "1. Production URL: ${PRODUCTION_URL}"
        echo "2. Project structure:"
        ls -la
        echo ""
        echo "3. Frontend package.json:"
        cat frontend/package.json | grep -E '"name"|"version"'
        ;;
    
    "help"|"")
        echo -e "${BLUE}📖 Available commands:${NC}"
        echo ""
        echo -e "${GREEN}./deploy.sh deploy${NC}    - Deploy to production"
        echo -e "${GREEN}./deploy.sh dev${NC}       - Deploy to development"
        echo -e "${GREEN}./deploy.sh status${NC}    - Check deployment status"
        echo -e "${GREEN}./deploy.sh clean${NC}     - List deployments for cleanup"
        echo -e "${GREEN}./deploy.sh test${NC}      - Run local build test"
        echo -e "${GREEN}./deploy.sh dev-server${NC} - Start development server"
        echo -e "${GREEN}./deploy.sh check${NC}     - Check project status"
        echo -e "${GREEN}./deploy.sh help${NC}      - Show this help"
        echo ""
        echo -e "${BLUE}📋 Quick Reference:${NC}"
        echo "Production URL: ${PRODUCTION_URL}"
        echo "Conference Showcase: ${PRODUCTION_URL}/conference-showcase"
        echo "Test Colors: ${PRODUCTION_URL}/test-colors"
        ;;
    
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo "Use './deploy.sh help' for available commands"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}📚 For detailed documentation, see: DEPLOYMENT_GUIDE.md${NC}"