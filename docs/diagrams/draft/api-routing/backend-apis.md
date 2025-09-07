# Backend API Routes

## Overview
This diagram shows the backend-only API routes for draft system management.

## Draft Management APIs

### 1. Draft Data API
- **Route**: `/api/(backend)/drafts/[leagueId]/data`
- **Method**: GET
- **Purpose**: Fetch consolidated draft data
- **Returns**: League config, teams, picks, current state
- **Authentication**: Required (cookie-based)
- **Data Sources**: leagues, fantasy_teams, draft_picks, draft_states

### 2. Draft Start API
- **Route**: `/api/(backend)/drafts/[leagueId]/start`
- **Method**: POST
- **Purpose**: Initialize draft state
- **Authentication**: Commissioner only
- **Updates**: draft_states, drafts collections
- **Side Effects**: Real-time events, draft order assignment

## Cron Job APIs

### 3. Draft Autopick API
- **Route**: `/api/(backend)/cron/draft-autopick`
- **Method**: GET
- **Purpose**: Process expired draft turns
- **Authentication**: Vercel Cron or Bearer token
- **Trigger**: Every minute
- **Logic**: Find expired drafts → Select best player → Apply pick

### 4. Draft Order Assignment API
- **Route**: `/api/(backend)/cron/assign-draft-orders`
- **Method**: GET
- **Purpose**: Assign random draft order
- **Authentication**: Vercel Cron or Bearer token
- **Trigger**: When draft starts
- **Updates**: fantasy_teams.draftPosition

### 5. Draft Start API
- **Route**: `/api/(backend)/cron/start-drafts`
- **Method**: GET
- **Purpose**: Start scheduled drafts
- **Authentication**: Vercel Cron or Bearer token
- **Trigger**: Every 5 minutes
- **Logic**: Find drafts with startTime <= now → Start draft

## Data Sync APIs

### 6. Data Sync API
- **Route**: `/api/(backend)/sync`
- **Method**: POST/GET
- **Purpose**: Sync external data
- **Authentication**: Admin only
- **Data Sources**: CFBD API, EA ratings, depth charts
- **Updates**: college_players, projections

