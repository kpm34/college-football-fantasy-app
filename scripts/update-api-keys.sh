#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# New API keys
NEW_PRIMARY_KEY="standard_aab226bb45e4cb9ee0349c9ff0fda2df9124a993f75c1182c78900929f96e1d48756d968594825a571ce273d2adad954aad78d2c152c4f39eb4a53785fc51bbabeccd4734ae28d5cb227d5bc2d77fa20c6522812042924c44296eca173526891c9ad19c66ad34a29035dcbca611d6703189cf95a7575cc085afe363466478891"
OLD_KEY="standard_aab226bb45e4cb9ee0349c9ff0fda2df9124a993f75c1182c78900929f96e1d48756d968594825a571ce273d2adad954aad78d2c152c4f39eb4a53785fc51bbabeccd4734ae28d5cb227d5bc2d77fa20c6522812042924c44296eca173526891c9ad19c66ad34a29035dcbca611d6703189cf95a7575cc085afe363466478891"

echo -e "${YELLOW}🔄 Starting API key update process...${NC}"
echo ""

# Update all JavaScript files that use the old key directly
echo -e "${YELLOW}📝 Updating JavaScript files...${NC}"
JS_FILES=$(find . -name "*.js" -not -path "./node_modules/*" -not -path "./venv/*" -not -path "./.next/*" -exec grep -l "$OLD_KEY" {} \; 2>/dev/null)
if [ -n "$JS_FILES" ]; then
    echo "$JS_FILES" | while read file; do
        echo -e "  Updating: $file"
        sed -i '' "s|$OLD_KEY|$NEW_PRIMARY_KEY|g" "$file"
    done
    echo -e "${GREEN}✅ JavaScript files updated${NC}"
else
    echo -e "${GREEN}✅ No JavaScript files needed updating${NC}"
fi
echo ""

# Update TypeScript files
echo -e "${YELLOW}📝 Updating TypeScript files...${NC}"
TS_FILES=$(find . -name "*.ts" -not -path "./node_modules/*" -not -path "./venv/*" -not -path "./.next/*" -exec grep -l "$OLD_KEY" {} \; 2>/dev/null)
if [ -n "$TS_FILES" ]; then
    echo "$TS_FILES" | while read file; do
        echo -e "  Updating: $file"
        sed -i '' "s|$OLD_KEY|$NEW_PRIMARY_KEY|g" "$file"
    done
    echo -e "${GREEN}✅ TypeScript files updated${NC}"
else
    echo -e "${GREEN}✅ No TypeScript files needed updating${NC}"
fi
echo ""

# Update shell scripts
echo -e "${YELLOW}📝 Updating shell scripts...${NC}"
SH_FILES=$(find . -name "*.sh" -not -path "./node_modules/*" -not -path "./venv/*" -exec grep -l "$OLD_KEY" {} \; 2>/dev/null)
if [ -n "$SH_FILES" ]; then
    echo "$SH_FILES" | while read file; do
        echo -e "  Updating: $file"
        sed -i '' "s|$OLD_KEY|$NEW_PRIMARY_KEY|g" "$file"
    done
    echo -e "${GREEN}✅ Shell scripts updated${NC}"
else
    echo -e "${GREEN}✅ No shell scripts needed updating${NC}"
fi
echo ""

# Create/update .env.local with the new key
echo -e "${YELLOW}📄 Creating .env.local with new API key...${NC}"
cat > .env.local << EOF
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=college-football-fantasy-app
NEXT_PUBLIC_APPWRITE_DATABASE_ID=college-football-fantasy
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=college-football-fantasy-app
DATABASE_ID=college-football-fantasy
APPWRITE_API_KEY=$NEW_PRIMARY_KEY

# Collection IDs
NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES=leagues
NEXT_PUBLIC_APPWRITE_COLLECTION_TEAMS=teams
NEXT_PUBLIC_APPWRITE_COLLECTION_ROSTERS=rosters
NEXT_PUBLIC_APPWRITE_COLLECTION_LINEUPS=lineups
NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES=games
NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS=players
NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS=rankings
NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITY_LOG=activity_log
NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_PICKS=draft_picks
NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTION_BIDS=auction_bids
NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTION_SESSIONS=auction_sessions
NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_PROJECTIONS=player_projections
NEXT_PUBLIC_APPWRITE_COLLECTION_USERS=users
NEXT_PUBLIC_APPWRITE_COLLECTION_COLLEGE_PLAYERS=college_players
EOF
echo -e "${GREEN}✅ .env.local created${NC}"
echo ""

# Update Vercel environment variables
echo -e "${YELLOW}🔧 Updating Vercel environment variables...${NC}"
if command -v vercel &> /dev/null; then
    echo -e "  Removing old API key from Vercel..."
    vercel env rm APPWRITE_API_KEY production --yes 2>/dev/null || true
    vercel env rm APPWRITE_API_KEY preview --yes 2>/dev/null || true
    vercel env rm APPWRITE_API_KEY development --yes 2>/dev/null || true
    
    echo -e "  Adding new API key to Vercel..."
    # Use printf to avoid issues with echo and pipes
    printf "%s" "$NEW_PRIMARY_KEY" | vercel env add APPWRITE_API_KEY production --yes 2>/dev/null
    printf "%s" "$NEW_PRIMARY_KEY" | vercel env add APPWRITE_API_KEY preview --yes 2>/dev/null
    printf "%s" "$NEW_PRIMARY_KEY" | vercel env add APPWRITE_API_KEY development --yes 2>/dev/null
    
    echo -e "${GREEN}✅ Vercel environment variables updated${NC}"
else
    echo -e "${RED}⚠️  Vercel CLI not found${NC}"
    echo -e "${YELLOW}Please update APPWRITE_API_KEY manually in Vercel dashboard:${NC}"
    echo -e "  1. Go to https://vercel.com/dashboard"
    echo -e "  2. Select your project"
    echo -e "  3. Go to Settings → Environment Variables"
    echo -e "  4. Update APPWRITE_API_KEY with the new key"
fi
echo ""

echo -e "${GREEN}🎉 API KEY UPDATE COMPLETE! 🎉${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "  1. ${YELLOW}Commit changes:${NC} git add -A && git commit -m 'Update to new Appwrite API key'"
echo -e "  2. ${YELLOW}Push to deploy:${NC} git push origin main"
echo -e "  3. ${YELLOW}Test the key:${NC} node scripts/add-scoring-rules-field.js"
echo ""
echo -e "${GREEN}✨ Script finished successfully!${NC}"

# Exit with success code
exit 0
