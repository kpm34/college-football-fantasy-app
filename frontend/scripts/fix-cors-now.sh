#!/bin/bash

# Appwrite configuration
ENDPOINT="https://nyc.cloud.appwrite.io/v1"
PROJECT_ID="college-football-fantasy-app"
API_KEY="standard_c63261941dc9ffcd31b7dbd5ba6706c0335d4543d78630ebe88a0e6899b770f334e22d032aa0e709c24ea84e8c907d314881a1408beb6f61db97d94e614333e004e353d078791d02f26581741c9ed454fc6d9bb2d2414dfed0d8b68c5b957f3fc2fad22ff87ceadad110c9bdb34a98ee1071c46952ab142d7580a83e3db8186b"

echo "🔧 Fixing CORS configuration for cfbfantasy.app..."

# Function to add a platform
add_platform() {
    local hostname=$1
    local name=$2
    local platform_id=$(echo "$hostname" | sed 's/[^a-zA-Z0-9]/-/g')
    
    echo "Adding platform: $hostname..."
    
    curl -X POST "${ENDPOINT}/projects/${PROJECT_ID}/platforms" \
        -H "X-Appwrite-Project: ${PROJECT_ID}" \
        -H "X-Appwrite-Key: ${API_KEY}" \
        -H "Content-Type: application/json" \
        -d "{
            \"type\": \"web\",
            \"name\": \"${name}\",
            \"hostname\": \"${hostname}\"
        }" 2>/dev/null
    
    echo ""
}

# Add all production domains
add_platform "cfbfantasy.app" "CFB Fantasy Main"
add_platform "www.cfbfantasy.app" "CFB Fantasy WWW"
add_platform "collegefootballfantasy.app" "College Football Fantasy Main"
add_platform "www.collegefootballfantasy.app" "College Football Fantasy WWW"
add_platform "*.vercel.app" "Vercel Preview"
add_platform "localhost" "Localhost"
add_platform "localhost:3000" "Localhost 3000"
add_platform "localhost:3001" "Localhost 3001"

echo "✅ CORS configuration updated!"
echo ""
echo "Next steps:"
echo "1. Clear your browser cache (Cmd+Shift+R)"
echo "2. Visit https://cfbfantasy.app"
echo "3. Try logging in again"
