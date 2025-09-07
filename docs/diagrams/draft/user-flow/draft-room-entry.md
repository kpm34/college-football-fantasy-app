# Draft Room Entry Flow

## Overview
This diagram shows how users enter and initialize the draft room experience.

## User Flow Steps

### 1. Draft Room Access
- **Button**: "DRAFT ROOM" button
- **Visibility Logic**:
  - Gray: Scheduled (not yet available)
  - Blue: Commissioner preview
  - Orange: In window (1 hour before)
  - Green: Draft active
- **Click Action**: Navigate to `/draft/[leagueId]`

### 2. Initial Load
- **Page Load**: `/draft/[leagueId]`
- **Engine Detection**: Determine v1 vs v2 engine
- **Data Loading**:
  - League configuration
  - Team list
  - Recent picks
  - Current draft state

### 3. Real-time Connection
- **WebSocket**: Establish Appwrite Realtime connection
- **Channel**: Subscribe to `draft-{leagueId}`
- **State Sync**: Load current draft state

### 4. Interface Rendering
- **Draft Information**:
  - Current round/pick
  - Time remaining
  - Team on the clock
  - Draft order
- **Player Pool**: Load available players
- **User Team**: Show current picks and needs

## Decision Points
- **Engine Version**: v1 vs v2 interface
- **Draft Status**: Pre-draft vs active vs completed
- **User Role**: Commissioner vs member

## Error Scenarios
- **League Not Found**: 404 error page
- **Not Authorized**: Redirect to login
- **Draft Not Started**: Show waiting message
- **Connection Failed**: Retry with fallback

