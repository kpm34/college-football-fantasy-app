#!/bin/bash

echo "Deploying to Vercel with root directory..."

# Create a temporary vercel.json with correct settings
cat > vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
EOF

# Deploy with explicit settings
vercel deploy --prod \
  --build-env SKIP_ENV_VALIDATION=true \
  --yes \
  --no-clipboard \
  || echo "Deployment failed. Please update project settings at https://vercel.com/kpm34s-projects/college-football-fantasy-app/settings"

echo "Visit: https://vercel.com/kpm34s-projects/college-football-fantasy-app/settings"
echo "Update the Root Directory setting to: ./ (or leave it empty)"
echo "Then run: vercel --prod"