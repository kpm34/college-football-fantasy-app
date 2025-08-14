#!/bin/bash

# Appwrite CORS Configuration Script
# This script adds production domains to your Appwrite project

ENDPOINT="https://nyc.cloud.appwrite.io/v1"
PROJECT_ID="college-football-fantasy-app"
API_KEY="standard_aab226bb45e4cb9ee0349c9ff0fda2df9124a993f75c1182c78900929f96e1d48756d968594825a571ce273d2adad954aad78d2c152c4f39eb4a53785fc51bbabeccd4734ae28d5cb227d5bc2d77fa20c6522812042924c44296eca173526891c9ad19c66ad34a29035dcbca611d6703189cf95a7575cc085afe363466478891"

echo "🔧 Configuring Appwrite CORS..."
echo ""

# Function to add a platform
add_platform() {
    local name=$1
    local hostname=$2
    local platform_id=$(echo "$hostname" | sed 's/[^a-zA-Z0-9]//g')
    
    echo "Adding platform: $hostname"
    
    curl -X POST "$ENDPOINT/projects/$PROJECT_ID/platforms" \
        -H "X-Appwrite-Project: $PROJECT_ID" \
        -H "X-Appwrite-Key: $API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"type\": \"web\",
            \"name\": \"$name\",
            \"hostname\": \"$hostname\"
        }" \
        --silent \
        --show-error \
        || echo "  ⚠️  Platform might already exist or API key lacks permissions"
    
    echo ""
}

# Add all production domains
add_platform "CFB Fantasy Main" "cfbfantasy.app"
add_platform "CFB Fantasy WWW" "www.cfbfantasy.app"
add_platform "College Football Fantasy" "collegefootballfantasy.app"
add_platform "College Football Fantasy WWW" "www.collegefootballfantasy.app"
add_platform "Vercel Preview" "*.vercel.app"
add_platform "Localhost" "localhost"
add_platform "Localhost 3000" "localhost:3000"
add_platform "Localhost 3001" "localhost:3001"

echo "✨ Configuration attempt complete!"
echo ""
echo "If you see permission errors above, please:"
echo "1. Go to https://nyc.cloud.appwrite.io/console/project-college-football-fantasy-app/settings/platforms"
echo "2. Add the platforms manually"
echo ""
echo "Next steps:"
echo "1. Clear your browser cache"
echo "2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)"
echo "3. Visit https://cfbfantasy.app"
