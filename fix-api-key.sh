#!/bin/bash

echo "🔧 Fixing Appwrite API Key..."

# Create backup
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Fix the API key by combining the split lines
sed -i '' '/APPWRITE_API_KEY=/,/^[^bf]/ { /APPWRITE_API_KEY=/! { /^[^bf]/! { N; s/\n//; } } }' .env

echo "✅ API Key fixed!"
echo "📝 Backup created"

echo ""
echo "🔍 Verifying the fix..."
grep APPWRITE_API_KEY .env

echo ""
echo "🚀 Now test the connection:"
echo "cd src && npx ts-node scripts/test-appwrite-connection.ts" 