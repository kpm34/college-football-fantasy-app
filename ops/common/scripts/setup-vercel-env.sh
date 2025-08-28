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

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_FANTASY_TEAMS=fantasy_teams"
echo "fantasy_teams" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_FANTASY_TEAMS production
echo "fantasy_teams" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_FANTASY_TEAMS preview  
echo "fantasy_teams" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_FANTASY_TEAMS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES=leagues"
echo "leagues" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES production
echo "leagues" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES preview  
echo "leagues" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_COLLEGE_PLAYERS=college_players"
echo "college_players" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_COLLEGE_PLAYERS production
echo "college_players" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_COLLEGE_PLAYERS preview  
echo "college_players" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_COLLEGE_PLAYERS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES=games"
echo "games" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES production
echo "games" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES preview  
echo "games" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS=rankings"
echo "rankings" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS production
echo "rankings" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS preview  
echo "rankings" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_EVENTS=draft_events"
echo "draft_events" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_EVENTS production
echo "draft_events" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_EVENTS preview  
echo "draft_events" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_EVENTS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_STATES=draft_states"
echo "draft_states" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_STATES production
echo "draft_states" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_STATES preview  
echo "draft_states" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_STATES development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_ROSTER_SLOTS=roster_slots"
echo "roster_slots" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_ROSTER_SLOTS production
echo "roster_slots" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_ROSTER_SLOTS preview  
echo "roster_slots" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_ROSTER_SLOTS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_SCHOOLS=schools"
echo "schools" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_SCHOOLS production
echo "schools" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_SCHOOLS preview  
echo "schools" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_SCHOOLS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_CLIENTS=clients"
echo "clients" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_CLIENTS production
echo "clients" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_CLIENTS preview  
echo "clients" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_CLIENTS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUE_MEMBERSHIPS=league_memberships"
echo "league_memberships" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUE_MEMBERSHIPS production
echo "league_memberships" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUE_MEMBERSHIPS preview  
echo "league_memberships" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUE_MEMBERSHIPS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_LINEUPS=lineups"
echo "lineups" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_LINEUPS production
echo "lineups" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_LINEUPS preview  
echo "lineups" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_LINEUPS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_MATCHUPS=matchups"
echo "matchups" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_MATCHUPS production
echo "matchups" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_MATCHUPS preview  
echo "matchups" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_MATCHUPS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_STATS=player_stats"
echo "player_stats" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_STATS production
echo "player_stats" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_STATS preview  
echo "player_stats" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_STATS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_PROJECTIONS=projections"
echo "projections" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_PROJECTIONS production
echo "projections" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_PROJECTIONS preview  
echo "projections" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_PROJECTIONS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_MODEL_RUNS=model_runs"
echo "model_runs" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_MODEL_RUNS production
echo "model_runs" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_MODEL_RUNS preview  
echo "model_runs" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_MODEL_RUNS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_TRANSACTIONS=transactions"
echo "transactions" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_TRANSACTIONS production
echo "transactions" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_TRANSACTIONS preview  
echo "transactions" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_TRANSACTIONS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS=auctions"
echo "auctions" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS production
echo "auctions" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS preview  
echo "auctions" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_BIDS=bids"
echo "bids" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_BIDS production
echo "bids" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_BIDS preview  
echo "bids" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_BIDS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITY_LOG=activity_log"
echo "activity_log" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITY_LOG production
echo "activity_log" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITY_LOG preview  
echo "activity_log" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITY_LOG development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_INVITES=invites"
echo "invites" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_INVITES production
echo "invites" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_INVITES preview  
echo "invites" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_INVITES development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_MESHY_JOBS=meshy_jobs"
echo "meshy_jobs" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_MESHY_JOBS production
echo "meshy_jobs" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_MESHY_JOBS preview  
echo "meshy_jobs" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_MESHY_JOBS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_MODEL_VERSIONS=model_versions"
echo "model_versions" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_MODEL_VERSIONS production
echo "model_versions" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_MODEL_VERSIONS preview  
echo "model_versions" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_MODEL_VERSIONS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_MIGRATIONS=migrations"
echo "migrations" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_MIGRATIONS production
echo "migrations" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_MIGRATIONS preview  
echo "migrations" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_MIGRATIONS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFTS=drafts"
echo "drafts" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFTS production
echo "drafts" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFTS preview  
echo "drafts" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFTS development

echo "Setting NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_PICKS=draft_picks"
echo "draft_picks" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_PICKS production
echo "draft_picks" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_PICKS preview  
echo "draft_picks" | vercel env add NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_PICKS development

echo "✅ Vercel environment variables updated successfully!"
echo "📋 Variables set:"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_FANTASY_TEAMS=fantasy_teams"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES=leagues"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_COLLEGE_PLAYERS=college_players"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES=games"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS=rankings"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_EVENTS=draft_events"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_STATES=draft_states"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_ROSTER_SLOTS=roster_slots"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_SCHOOLS=schools"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_CLIENTS=clients"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUE_MEMBERSHIPS=league_memberships"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_LINEUPS=lineups"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_MATCHUPS=matchups"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_STATS=player_stats"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_PROJECTIONS=projections"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_MODEL_RUNS=model_runs"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_TRANSACTIONS=transactions"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS=auctions"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_BIDS=bids"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITY_LOG=activity_log"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_INVITES=invites"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_MESHY_JOBS=meshy_jobs"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_MODEL_VERSIONS=model_versions"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_MIGRATIONS=migrations"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFTS=drafts"
echo "  NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_PICKS=draft_picks"

echo ""
echo "💡 Next steps:"
echo "1. Deploy to apply changes: vercel --prod"
echo "2. Verify variables: vercel env ls"
