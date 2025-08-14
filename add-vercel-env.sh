#!/bin/bash

# Add all collection environment variables to Vercel

echo "Adding collection environment variables to Vercel..."

# Collections (aligned with lib/appwrite.ts)
vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES production <<< "leagues"
vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_TEAMS production <<< "teams"
vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFTED_PLAYERS production <<< "rosters"
vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_MATCHUPS production <<< "matchups"
vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES production <<< "games"
vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS production <<< "college_players"
vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS production <<< "rankings"
vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITY_LOG production <<< "activity_log"
vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_PICKS production <<< "draft_picks"
vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTION_BIDS production <<< "auction_bids"
vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTION_SESSIONS production <<< "auction_sessions"
vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_PROJECTIONS production <<< "player_projections"
vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_USERS production <<< "users"

echo "Environment variables added successfully!"
