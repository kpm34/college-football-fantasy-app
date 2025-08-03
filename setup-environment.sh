#!/bin/bash

echo "🚀 Setting up College Football Fantasy App Environment"
echo "=================================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
fi

# Check if frontend/.env.local exists
if [ ! -f frontend/.env.local ]; then
    echo "❌ frontend/.env.local not found!"
    echo "Creating with Appwrite config..."
    cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Appwrite Configuration (public - safe for client-side)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=688ccd49002eacc6c020
EOF
    echo "✅ Created frontend/.env.local"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
if [ -f package.json ]; then
    npm install
fi

cd frontend
if [ -f package.json ]; then
    npm install
fi
cd ..

# Display current configuration
echo ""
echo "📋 Current Configuration:"
echo "========================"
echo "Appwrite Endpoint: $(grep APPWRITE_ENDPOINT .env | cut -d '=' -f2)"
echo "Appwrite Project: $(grep APPWRITE_PROJECT_ID .env | cut -d '=' -f2)"
echo "Database ID: college-football-fantasy"

# Check API keys
echo ""
echo "🔑 API Keys Status:"
cfbd_key=$(grep CFBD_API_KEY .env | head -1 | cut -d '=' -f2)
if [[ "$cfbd_key" == "your_key_here" ]] || [[ -z "$cfbd_key" ]]; then
    echo "❌ CFBD_API_KEY not configured - Get from https://collegefootballdata.com"
else
    echo "✅ CFBD_API_KEY configured"
fi

odds_key=$(grep ODDS_API_KEY .env | cut -d '=' -f2)
if [[ "$odds_key" == "your_key_here" ]] || [[ -z "$odds_key" ]]; then
    echo "⚠️  ODDS_API_KEY not configured (optional) - Get from https://the-odds-api.com"
else
    echo "✅ ODDS_API_KEY configured"
fi

# Instructions
echo ""
echo "📝 Next Steps:"
echo "============="
echo "1. Start the frontend development server:"
echo "   cd frontend && npm run dev"
echo ""
echo "2. Test Appwrite connection:"
echo "   npm run test-appwrite"
echo ""
echo "3. Seed data (requires CFBD API key):"
echo "   npm run seed-big12"
echo ""
echo "4. Access the app:"
echo "   - Main site: http://localhost:3001"
echo "   - Test page: http://localhost:3001/test-appwrite"
echo ""
echo "5. Deploy to Vercel:"
echo "   cd frontend && vercel --prod"
echo ""
echo "✨ Setup complete!"