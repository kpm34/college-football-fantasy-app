# Core Draft Entities

## Overview
This diagram shows the primary draft-related database entities and their relationships.

## Primary Entities

### 1. Drafts Collection
- **Purpose**: Main draft configuration
- **Key Fields**:
  - `leagueId`: Reference to league
  - `draftStatus`: Current status
  - `type`: Snake or auction
  - `clockSeconds`: Time per pick
  - `startTime`: Scheduled start
- **Relationships**: One-to-One with draft_states

### 2. Draft States Collection
- **Purpose**: Real-time draft state
- **Key Fields**:
  - `draftId`: Reference to draft
  - `onClockTeamId`: Current team
  - `deadlineAt`: Pick deadline
  - `round`: Current round
  - `pickIndex`: Current pick
- **Relationships**: One-to-One with drafts

### 3. Draft Picks Collection
- **Purpose**: Individual selections
- **Key Fields**:
  - `leagueId`: League reference
  - `playerId`: Player reference
  - `fantasyTeamId`: Team reference
  - `round`: Round number
  - `pick`: Pick number
- **Relationships**: Many-to-One with drafts, players, teams

### 4. Draft Events Collection
- **Purpose**: Event logging
- **Key Fields**:
  - `draftId`: Draft reference
  - `type`: Event type
  - `timestamp`: Event time
  - `payloadJson`: Event data
- **Relationships**: Many-to-One with drafts

## Entity Relationships
```
drafts (1) → (1) draft_states
drafts (1) → (many) draft_picks
drafts (1) → (many) draft_events
```

