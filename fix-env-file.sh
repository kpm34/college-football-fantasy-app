#!/bin/bash

echo "🔧 Fixing .env file..."

# Create a backup
cp .env .env.backup

# Fix the API key by putting it on a single line
sed -i '' '/APPWRITE_API_KEY=/,/^[^bf]/ { /APPWRITE_API_KEY=/! { /^[^bf]/! { N; s/\n//; } } }' .env

echo "✅ .env file fixed!"
echo "📝 Backup created as .env.backup"
echo ""
echo "🔍 Checking the fix..."
grep APPWRITE_API_KEY .env

echo ""
echo "🚀 Now you can test the Appwrite connection!" 