#!/bin/bash

echo "🚀 College Football Fantasy App - Token-based Vercel Deployment"
echo "=============================================================="

# Check if token is provided as argument or environment variable
VERCEL_TOKEN=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im1yay00MzAyZWMxYjY3MGY0OGE5OGFkNjFkYWRlNGEyM2JlNyJ9.eyJpc3MiOiJodHRwczovL29pZGMudmVyY2VsLmNvbS9rcG0zNHMtcHJvamVjdHMiLCJzdWIiOiJvd25lcjprcG0zNHMtcHJvamVjdHM6cHJvamVjdDpjb2xsZWdlLWZvb3RiYWxsLWZhbnRhc3ktYXBwOmVudmlyb25tZW50OmRldmVsb3BtZW50Iiwic2NvcGUiOiJvd25lcjprcG0zNHMtcHJvamVjdHM6cHJvamVjdDpjb2xsZWdlLWZvb3RiYWxsLWZhbnRhc3ktYXBwOmVudmlyb25tZW50OmRldmVsb3BtZW50IiwiYXVkIjoiaHR0cHM6Ly92ZXJjZWwuY29tL2twbTM0cy1wcm9qZWN0cyIsIm93bmVyIjoia3BtMzRzLXByb2plY3RzIiwib3duZXJfaWQiOiJ0ZWFtX2o0eUZlVHNEbWZTRzBjQ2w3ZHduMnczYiIsInByb2plY3QiOiJjb2xsZWdlLWZvb3RiYWxsLWZhbnRhc3ktYXBwIiwicHJvamVjdF9pZCI6InByal95bUQyamVXaVdoYlRyeER2TGZLVjRnZGdkOHFEIiwiZW52aXJvbm1lbnQiOiJkZXZlbG9wbWVudCIsInVzZXJfaWQiOiJxamZHekJZZ2JBaFdEV05nQXpta3JPY0IiLCJuYmYiOjE3NTQ2MjcyOTYsImlhdCI6MTc1NDYyNzI5NiwiZXhwIjoxNzU0NjcwNDk2fQ.ZzySQ9WK57hiUCXok4C57Lm4hWXNKtIaf6131CR7ebhKaSShEF3L_xNKvo3Ie4KYj7NmawU7afKCZ8eOxnqp9PMjTEs3itVSdsl0679GdAruQJpJDmxi6lmc4hEVTbgn5JW7wJHr2ZEX1k_8-lSMRoOxMNSX724EmJbOVyU0Wdo3Bzw12MHBz1A9EAcO9rnU2Gdq9sNdetgnVT01SqLKWGcC8TTWq8Y8qVQ5f4O6hfMRyArxxgrE_pzfhtQxmW5nm9h3tPOyuhiNhFAr2hPdHW_qJowVozupfsJImSswF3l5Gv2Y6PHw6mvAMZAgBKLH5EZ0su52WRChOUan-k06YA

if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Error: Vercel token not provided"
    echo ""
    echo "Usage:"
    echo "  Option 1: ./deploy-with-token.sh YOUR_VERCEL_TOKEN"
    echo "  Option 2: VERCEL_TOKEN=your_token ./deploy-with-token.sh"
    echo "  Option 3: Set VERCEL_TOKEN in .env.local"
    echo ""
    echo "Get your token from: https://vercel.com/account/tokens"
    exit 1
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

# Set deployment options
PROJECT_NAME="college-football-fantasy-app"
TEAM_ID="" # Leave empty for personal account, or add your team ID

echo "🔄 Starting deployment..."
echo "Choose deployment type:"
echo "1) Development (preview)"
echo "2) Production"
read -p "Enter choice (1 or 2): " choice

# Base command with token
BASE_CMD="vercel --token $VERCEL_TOKEN --yes"

# Add team ID if provided
if [ ! -z "$TEAM_ID" ]; then
    BASE_CMD="$BASE_CMD --scope $TEAM_ID"
fi

case $choice in
    1)
        echo "📤 Deploying to development..."
        DEPLOYMENT_URL=$($BASE_CMD --name $PROJECT_NAME)
        ;;
    2)
        echo "📤 Deploying to production..."
        DEPLOYMENT_URL=$($BASE_CMD --prod --name $PROJECT_NAME)
        ;;
    *)
        echo "Invalid choice. Deploying to development..."
        DEPLOYMENT_URL=$($BASE_CMD --name $PROJECT_NAME)
        ;;
esac

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Deployment URL: $DEPLOYMENT_URL"
    echo ""
    echo "Next steps:"
    echo "1. Set environment variables at: https://vercel.com/dashboard/project/$PROJECT_NAME/settings/environment-variables"
    echo "2. Test API endpoints:"
    echo "   - $DEPLOYMENT_URL/api/eligibility/123456/1"
    echo "3. Verify cron job in Vercel dashboard"
else
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi