#!/bin/bash

# AUTO-GENERATED VERCEL ENVIRONMENT SETUP
# Generated from schema/schema.ts
# Sets up all collection environment variables in Vercel

echo "🌍 Setting up Vercel environment variables from schema..."

# Remove old/deprecated variables first
echo "🗑️ Removing deprecated variables..."
vercel env rm NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTION_SESSIONS production --yes 2>/dev/null || true
vercel env rm NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTION_SESSIONS preview --yes 2>/dev/null || true
vercel env rm NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTION_SESSIONS development --yes 2>/dev/null || true
vercel env rm NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTION_BIDS production --yes 2>/dev/null || true
vercel env rm NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTION_BIDS preview --yes 2>/dev/null || true
vercel env rm NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTION_BIDS development --yes 2>/dev/null || true
vercel env rm NEXT_PUBLIC_APPWRITE_COLLECTION_USER_TEAMS production --yes 2>/dev/null || true
vercel env rm NEXT_PUBLIC_APPWRITE_COLLECTION_USER_TEAMS preview --yes 2>/dev/null || true
vercel env rm NEXT_PUBLIC_APPWRITE_COLLECTION_USER_TEAMS development --yes 2>/dev/null || true
vercel env rm NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_PICKS production --yes 2>/dev/null || true
vercel env rm NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_PICKS preview --yes 2>/dev/null || true
vercel env rm NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_PICKS development --yes 2>/dev/null || true
vercel env rm NEXT_PUBLIC_APPWRITE_COLLECTION_TRANSACTIONS production --yes 2>/dev/null || true
vercel env rm NEXT_PUBLIC_APPWRITE_COLLECTION_TRANSACTIONS preview --yes 2>/dev/null || true
vercel env rm NEXT_PUBLIC_APPWRITE_COLLECTION_TRANSACTIONS development --yes 2>/dev/null || true
vercel env rm NEXT_PUBLIC_APPWRITE_COLLECTION_SCORING production --yes 2>/dev/null || true
vercel env rm NEXT_PUBLIC_APPWRITE_COLLECTION_SCORING preview --yes 2>/dev/null || true
vercel env rm NEXT_PUBLIC_APPWRITE_COLLECTION_SCORING development --yes 2>/dev/null || true
vercel env rm NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS production --yes 2>/dev/null || true
vercel env rm NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS preview --yes 2>/dev/null || true
vercel env rm NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS development --yes 2>/dev/null || true

echo "✨ Adding modern schema variables..."

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_COLLEGE_PLAYERS=college_players"
echo "college_players" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_COLLEGE_PLAYERS production
echo "college_players" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_COLLEGE_PLAYERS preview  
echo "college_players" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_COLLEGE_PLAYERS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_TEAMS=teams"
echo "teams" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_TEAMS production
echo "teams" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_TEAMS preview  
echo "teams" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_TEAMS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES=games"
echo "games" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES production
echo "games" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES preview  
echo "games" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS=rankings"
echo "rankings" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS production
echo "rankings" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS preview  
echo "rankings" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_USER_TEAMS=user_teams"
echo "user_teams" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_USER_TEAMS production
echo "user_teams" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_USER_TEAMS preview  
echo "user_teams" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_USER_TEAMS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES=leagues"
echo "leagues" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES production
echo "leagues" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES preview  
echo "leagues" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_LINEUPS=lineups"
echo "lineups" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_LINEUPS production
echo "lineups" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_LINEUPS preview  
echo "lineups" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_LINEUPS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_MATCHUPS=matchups"
echo "matchups" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_MATCHUPS production
echo "matchups" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_MATCHUPS preview  
echo "matchups" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_MATCHUPS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFTS=drafts"
echo "drafts" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFTS production
echo "drafts" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFTS preview  
echo "drafts" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFTS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_PICKS=draft_picks"
echo "draft_picks" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_PICKS production
echo "draft_picks" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_PICKS preview  
echo "draft_picks" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_PICKS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS=auctions"
echo "auctions" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS production
echo "auctions" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS preview  
echo "auctions" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_BIDS=bids"
echo "bids" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_BIDS production
echo "bids" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_BIDS preview  
echo "bids" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_BIDS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_STATS=player_stats"
echo "player_stats" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_STATS production
echo "player_stats" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_STATS preview  
echo "player_stats" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_STATS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_MODEL_INPUTS=model_inputs"
echo "model_inputs" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_MODEL_INPUTS production
echo "model_inputs" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_MODEL_INPUTS preview  
echo "model_inputs" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_MODEL_INPUTS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_USERS=users"
echo "users" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_USERS production
echo "users" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_USERS preview  
echo "users" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_USERS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITY_LOG=activity_log"
echo "activity_log" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITY_LOG production
echo "activity_log" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITY_LOG preview  
echo "activity_log" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITY_LOG development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_DEPTH_CHARTS=player_depth_charts"
echo "player_depth_charts" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_DEPTH_CHARTS production
echo "player_depth_charts" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_DEPTH_CHARTS preview  
echo "player_depth_charts" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_DEPTH_CHARTS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_TEAM_CONTEXT=team_context"
echo "team_context" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_TEAM_CONTEXT production
echo "team_context" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_TEAM_CONTEXT preview  
echo "team_context" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_TEAM_CONTEXT development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_INGESTION_LOG=ingestion_log"
echo "ingestion_log" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_INGESTION_LOG production
echo "ingestion_log" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_INGESTION_LOG preview  
echo "ingestion_log" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_INGESTION_LOG development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_MANUAL_OVERRIDES=manual_overrides"
echo "manual_overrides" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_MANUAL_OVERRIDES production
echo "manual_overrides" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_MANUAL_OVERRIDES preview  
echo "manual_overrides" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_MANUAL_OVERRIDES development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_DATA_SOURCE_REGISTRY=data_source_registry"
echo "data_source_registry" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_DATA_SOURCE_REGISTRY production
echo "data_source_registry" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_DATA_SOURCE_REGISTRY preview  
echo "data_source_registry" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_DATA_SOURCE_REGISTRY development

echo "✅ Vercel environment variables updated successfully!"
echo "📋 Variables set:"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_COLLEGE_PLAYERS=college_players"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_TEAMS=teams"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES=games"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS=rankings"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_USER_TEAMS=user_teams"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES=leagues"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_LINEUPS=lineups"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_MATCHUPS=matchups"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFTS=drafts"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_PICKS=draft_picks"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS=auctions"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_BIDS=bids"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_STATS=player_stats"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_MODEL_INPUTS=model_inputs"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_USERS=users"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITY_LOG=activity_log"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_DEPTH_CHARTS=player_depth_charts"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_TEAM_CONTEXT=team_context"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_INGESTION_LOG=ingestion_log"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_MANUAL_OVERRIDES=manual_overrides"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_DATA_SOURCE_REGISTRY=data_source_registry"

echo ""
echo "💡 Next steps:"
echo "1. Deploy to apply changes: vercel --prod"
echo "2. Verify variables: vercel env ls"
