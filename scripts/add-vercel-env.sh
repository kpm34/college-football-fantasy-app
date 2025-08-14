#!/bin/bash

echo "🏈 Adding environment variables to Vercel..."

# Rotowire credentials
vercel env add ROTOWIRE_USERNAME production < <(echo "kashpm2002@gmail.com")
vercel env add ROTOWIRE_PASSWORD_ENCRYPTED production < <(echo "1eae963c008bcfb06244479b10624aa6:e515a145ac1d4032159867f3653f2fb9:d08ca9ab2786a54cac")
vercel env add ROTOWIRE_ENCRYPTION_KEY production < <(echo "6504df254dada38bb3beaa7719156924d277db36a0c3ad8953f5bcf569e3f92f")

# CFBD API Key (server-side only)
echo "⚠️  Add CFBD_API_KEY manually from GitHub workflow"
echo "⚠️  Add APPWRITE_API_KEY manually from your Appwrite dashboard"

echo "✅ Rotowire environment variables added to Vercel"
