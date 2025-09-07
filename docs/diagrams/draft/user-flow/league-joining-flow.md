# League Joining Flow

## Overview
This diagram shows how users discover and join existing fantasy leagues.

## User Flow Steps

### 1. League Discovery
- **Page**: `/leagues`
- **Filters**:
  - Season
  - Game mode
  - Draft type
  - Available spots
  - Public/Private

### 2. League Selection
- **Action**: Click on league
- **Page**: `/league/[id]/join`
- **Information Displayed**:
  - League details
  - Rules and settings
  - Current members
  - Available spots

### 3. Join Process
- **Public League**: Direct join
- **Private League**: Password required
- **Team Creation**:
  - Team name
  - Team abbreviation
  - Logo selection (optional)

### 4. Confirmation
- **API Call**: `POST /api/leagues/[id]/join`
- **Database Updates**:
  - `fantasy_teams` collection
  - `league_memberships` collection
- **Success**: Redirect to league dashboard

## Decision Points
- **Public vs Private**: Password requirement
- **League Full**: Waitlist or find another
- **Team Name**: Check for duplicates

## Error Scenarios
- **League Full**: Show waitlist option
- **Wrong Password**: Retry with error message
- **Duplicate Team Name**: Suggest alternatives
- **Server Error**: Retry mechanism

