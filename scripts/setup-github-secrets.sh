#!/bin/bash

# GitHub Secrets Setup Script
# This script helps you add all required secrets to your GitHub repository

echo "🏈 College Football Fantasy - GitHub Secrets Setup"
echo "=================================================="
echo ""
echo "This script will guide you through adding secrets to GitHub."
echo "You'll need to have the GitHub CLI (gh) installed."
echo ""

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Install it with: brew install gh"
    echo "Then run: gh auth login"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub."
    echo "Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is installed and authenticated"
echo ""

# Repository name
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "📦 Repository: $REPO"
echo ""

# Secrets to add
echo "Adding the following secrets:"
echo "----------------------------"

# CFBD_API_KEY
echo "1. CFBD_API_KEY"
gh secret set CFBD_API_KEY -b "YKG446gILGiO5q+OIgOClYsBO9ztbPfGyBBrz40V1c3LBshdTIbFjHzFcu6iOhGz"

# APPWRITE_ENDPOINT
echo "2. APPWRITE_ENDPOINT"
gh secret set APPWRITE_ENDPOINT -b "https://nyc.cloud.appwrite.io/v1"

# APPWRITE_PROJECT_ID
echo "3. APPWRITE_PROJECT_ID"
gh secret set APPWRITE_PROJECT_ID -b "college-football-fantasy-app"

# APPWRITE_DATABASE_ID
echo "4. APPWRITE_DATABASE_ID"
gh secret set APPWRITE_DATABASE_ID -b "college-football-fantasy"

# CRON_SECRET
echo "5. CRON_SECRET"
gh secret set CRON_SECRET -b "38d704539a1bfe18534afbee94d847c7b086a5c9f25c78c1dad0fd5296ba7a5f"

# Rotowire credentials
echo "6. ROTOWIRE_USERNAME"
gh secret set ROTOWIRE_USERNAME -b "kashpm2002@gmail.com"

echo "7. ROTOWIRE_PASSWORD_ENCRYPTED"
gh secret set ROTOWIRE_PASSWORD_ENCRYPTED -b "1eae963c008bcfb06244479b10624aa6:e515a145ac1d4032159867f3653f2fb9:d08ca9ab2786a54cac"

echo "8. ROTOWIRE_ENCRYPTION_KEY"
gh secret set ROTOWIRE_ENCRYPTION_KEY -b "6504df254dada38bb3beaa7719156924d277db36a0c3ad8953f5bcf569e3f92f"

echo ""
echo "⚠️  IMPORTANT: You still need to manually add:"
echo "   - APPWRITE_API_KEY (get from Appwrite Console)"
echo ""
echo "To add it manually, run:"
echo "gh secret set APPWRITE_API_KEY -b 'YOUR_API_KEY_HERE'"
echo ""

# List all secrets
echo "Current secrets in repository:"
echo "-----------------------------"
gh secret list

echo ""
echo "✅ GitHub secrets setup complete!"
echo ""
echo "Next steps:"
echo "1. Add APPWRITE_API_KEY when you have it"
echo "2. Test workflows by running: gh workflow run cfbd-sync-secure.yml"
echo "3. Monitor Actions tab in GitHub for results"
