#!/bin/bash

echo "🚀 College Football Fantasy App - Vercel Deployment Script"
echo "========================================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: vercel.json not found. Are you in the project root?"
    exit 1
fi

# Check if frontend exists
if [ ! -d "frontend" ]; then
    echo "❌ Error: frontend directory not found."
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found. Creating from template..."
    cp .env.example .env.local
    echo "📝 Please edit .env.local with your API keys before deploying!"
    echo "Press Enter to continue or Ctrl+C to cancel..."
    read
fi

# Deploy to Vercel
echo "🔄 Deploying to Vercel..."
echo "Choose deployment type:"
echo "1) Development (preview)"
echo "2) Production"
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo "Deploying to development..."
        vercel
        ;;
    2)
        echo "Deploying to production..."
        vercel --prod
        ;;
    *)
        echo "Invalid choice. Deploying to development..."
        vercel
        ;;
esac

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Set environment variables in Vercel dashboard"
echo "2. Verify API endpoints are working"
echo "3. Check cron job configuration"
echo "4. Test the application"