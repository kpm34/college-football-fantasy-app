#!/bin/bash

# Appwrite CORS Configuration Script
# This script adds production domains to your Appwrite project

ENDPOINT="https://nyc.cloud.appwrite.io/v1"
PROJECT_ID="college-football-fantasy-app"
API_KEY="standard_c63261941dc9ffcd31b7dbd5ba6706c0335d4543d78630ebe88a0e6899b770f334e22d032aa0e709c24ea84e8c907d314881a1408beb6f61db97d94e614333e004e353d078791d02f26581741c9ed454fc6d9bb2d2414dfed0d8b68c5b957f3fc2fad22ff87ceadad110c9bdb34a98ee1071c46952ab142d7580a83e3db8186b"

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
