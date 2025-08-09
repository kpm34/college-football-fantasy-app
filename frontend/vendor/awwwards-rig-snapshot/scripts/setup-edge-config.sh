#!/bin/bash

# Edge Config Setup Script
# This script helps set up Edge Config for local development

echo "🔧 Edge Config Setup"
echo "==================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install it with: npm i -g vercel"
    exit 1
fi

echo "📥 Pulling environment variables from Vercel..."
echo ""

# Pull development environment
echo "1. Pulling development environment..."
vercel env pull .env.local

# Ask if user wants preview/production envs
read -p "Do you want to pull preview environment? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel env pull .env.preview.local --environment=preview
    echo "✅ Preview environment pulled to .env.preview.local"
fi

read -p "Do you want to pull production environment? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel env pull .env.production.local --environment=production
    echo "✅ Production environment pulled to .env.production.local"
fi

echo ""
echo "🔍 Checking Edge Config..."

# Check if EDGE_CONFIG exists in .env.local
if grep -q "EDGE_CONFIG" .env.local 2>/dev/null; then
    echo "✅ EDGE_CONFIG found in .env.local"
    echo ""
    echo "📋 Next steps:"
    echo "1. Start dev server: npm run dev"
    echo "2. Test Edge Config: http://localhost:3000/api/edge-config"
else
    echo "⚠️  EDGE_CONFIG not found in .env.local"
    echo ""
    echo "📋 Setup instructions:"
    echo "1. Go to https://vercel.com/dashboard"
    echo "2. Select your project: awwwards-rig"
    echo "3. Go to Storage → Create Database → Edge Config"
    echo "4. Name it: 'app-config' or 'feature-flags'"
    echo "5. Connect it to your project"
    echo "6. Copy the connection string"
    echo "7. Add to Vercel Environment Variables:"
    echo "   - Go to Settings → Environment Variables"
    echo "   - Add EDGE_CONFIG with the connection string"
    echo "8. Run this script again to pull the updated env"
fi

echo ""
echo "✨ Setup complete!"