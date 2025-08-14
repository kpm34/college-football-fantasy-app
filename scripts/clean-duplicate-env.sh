#!/bin/bash

echo "🧹 Cleaning up duplicate environment variables in Vercel..."

# Remove old duplicate environment variables
OLD_VARS=(
    "NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTION_SESSIONS"
    "NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTION_BIDS"
    "NEXT_PUBLIC_APPWRITE_COLLECTION_LINEUPS"
    "NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITY_LOG"
    "NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_PICKS"
    "NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_PROJECTIONS"
    "NEXT_PUBLIC_APPWRITE_COLLECTION_ROSTERS"
)

for VAR in "${OLD_VARS[@]}"; do
    echo "Removing $VAR from all environments..."
    vercel env rm "$VAR" production -y 2>/dev/null || true
    vercel env rm "$VAR" preview -y 2>/dev/null || true  
    vercel env rm "$VAR" development -y 2>/dev/null || true
done

echo "✅ Cleanup complete!"

