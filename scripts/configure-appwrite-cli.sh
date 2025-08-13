#!/bin/bash

# Configure Appwrite platforms using CLI
echo "Configuring Appwrite platforms for production domains..."

# Check if appwrite CLI is installed
if ! command -v appwrite &> /dev/null; then
    echo "Appwrite CLI not found. Installing..."
    npm install -g appwrite-cli
fi

# Login to Appwrite (this will prompt for credentials if not already logged in)
echo "Logging in to Appwrite..."
appwrite login

# Add web platforms for all production domains
DOMAINS=(
    "cfbfantasy.app"
    "www.cfbfantasy.app"
    "collegefootballfantasy.app"
    "www.collegefootballfantasy.app"
    "*.vercel.app"
    "localhost"
    "localhost:3000"
    "localhost:3001"
)

PROJECT_ID="college-football-fantasy-app"

for domain in "${DOMAINS[@]}"
do
    echo "Adding platform: $domain"
    
    # Create a safe platform ID (alphanumeric only)
    PLATFORM_ID=$(echo "$domain" | sed 's/[^a-zA-Z0-9]/-/g')
    
    appwrite projects createPlatform \
        --projectId="$PROJECT_ID" \
        --type="web" \
        --name="$domain" \
        --hostname="$domain" \
        || echo "Platform might already exist: $domain"
done

echo "✨ Platform configuration complete!"
echo "Clear your browser cache and try accessing the site again."
