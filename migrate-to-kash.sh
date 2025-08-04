#!/bin/bash

# 🚀 Kash Organization Migration Script
# Usage: ./migrate-to-kash.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏈 Kash Organization Migration Script${NC}"
echo "=========================================="

# Check if environment variables are set
check_env_vars() {
    echo -e "${BLUE}🔍 Checking environment variables...${NC}"
    
    if [ -z "$NEW_APPWRITE_PROJECT_ID" ]; then
        echo -e "${RED}❌ NEW_APPWRITE_PROJECT_ID not set${NC}"
        echo "Please set your Kash project ID:"
        echo "export NEW_APPWRITE_PROJECT_ID=your_kash_project_id"
        return 1
    fi
    
    if [ -z "$NEW_APPWRITE_API_KEY" ]; then
        echo -e "${RED}❌ NEW_APPWRITE_API_KEY not set${NC}"
        echo "Please set your Kash API key:"
        echo "export NEW_APPWRITE_API_KEY=your_kash_api_key"
        return 1
    fi
    
    echo -e "${GREEN}✅ Environment variables set${NC}"
    return 0
}

# Test Kash connection
test_kash_connection() {
    echo -e "${BLUE}🧪 Testing Kash connection...${NC}"
    node src/scripts/test-kash-connection.js
    return $?
}

# Export current data
export_data() {
    echo -e "${BLUE}📤 Exporting current data...${NC}"
    node src/scripts/export-current-data.js
    return $?
}

# Import to Kash
import_to_kash() {
    echo -e "${BLUE}📥 Importing to Kash...${NC}"
    node src/scripts/import-to-kash.js
    return $?
}

# Update environment variables
update_env() {
    echo -e "${BLUE}⚙️  Updating environment variables...${NC}"
    
    # Backup current .env
    if [ -f ".env" ]; then
        cp .env .env.backup
        echo "✅ Backed up current .env to .env.backup"
    fi
    
    # Create new .env with Kash credentials
    cat > .env << EOF
# Kash Appwrite Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=$NEW_APPWRITE_PROJECT_ID
APPWRITE_API_KEY=$NEW_APPWRITE_API_KEY

# Keep existing variables
CFBD_API_KEY=${CFBD_API_KEY:-}
EOF
    
    echo "✅ Updated .env with Kash credentials"
}

# Deploy to production
deploy_app() {
    echo -e "${BLUE}🚀 Deploying to production...${NC}"
    ./deploy.sh deploy
    return $?
}

# Main migration process
main() {
    echo -e "${YELLOW}🎯 Starting Kash migration process...${NC}"
    echo ""
    
    # Step 1: Check environment variables
    if ! check_env_vars; then
        echo -e "${RED}❌ Environment variables not set. Please configure them first.${NC}"
        exit 1
    fi
    
    # Step 2: Test Kash connection
    if ! test_kash_connection; then
        echo -e "${RED}❌ Kash connection failed. Please check your credentials.${NC}"
        exit 1
    fi
    
    # Step 3: Export current data
    if ! export_data; then
        echo -e "${RED}❌ Data export failed.${NC}"
        exit 1
    fi
    
    # Step 4: Import to Kash
    if ! import_to_kash; then
        echo -e "${RED}❌ Data import failed.${NC}"
        exit 1
    fi
    
    # Step 5: Update environment variables
    update_env
    
    # Step 6: Deploy to production
    read -p "Deploy to production now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if ! deploy_app; then
            echo -e "${RED}❌ Deployment failed.${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️  Skipping deployment. Run './deploy.sh deploy' when ready.${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Kash migration completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Summary:${NC}"
    echo "✅ Environment variables configured"
    echo "✅ Kash connection tested"
    echo "✅ Data exported from old project"
    echo "✅ Data imported to Kash"
    echo "✅ Environment variables updated"
    echo ""
    echo -e "${BLUE}🌐 Your app is now using the Kash organization!${NC}"
    echo "Production URL: https://college-football-fantasy.vercel.app"
}

# Show help
show_help() {
    echo -e "${BLUE}📖 Kash Migration Help${NC}"
    echo ""
    echo "Usage: ./migrate-to-kash.sh"
    echo ""
    echo "Prerequisites:"
    echo "1. Create Kash organization project"
    echo "2. Set environment variables:"
    echo "   export NEW_APPWRITE_PROJECT_ID=your_kash_project_id"
    echo "   export NEW_APPWRITE_API_KEY=your_kash_api_key"
    echo ""
    echo "Steps:"
    echo "1. Test Kash connection"
    echo "2. Export current data"
    echo "3. Import to Kash"
    echo "4. Update environment variables"
    echo "5. Deploy to production"
    echo ""
    echo "For detailed instructions, see: KASH_MIGRATION_GUIDE.md"
}

# Handle command line arguments
case "${1:-}" in
    "help"|"-h"|"--help")
        show_help
        exit 0
        ;;
    "")
        main
        ;;
    *)
        echo -e "${RED}❌ Unknown option: $1${NC}"
        show_help
        exit 1
        ;;
esac 