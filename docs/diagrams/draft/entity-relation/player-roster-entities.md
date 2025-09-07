# Player and Roster Entities

## Overview
This diagram shows the player data and roster management entities and their relationships.

## Primary Entities

### 1. College Players Collection
- **Purpose**: Player database
- **Key Fields**:
  - `name`: Player name
  - `position`: Position (QB, RB, WR, TE, K)
  - `team`: College team
  - `conference`: Conference
  - `fantasyPoints`: Projected points
  - `eligible`: Draft eligibility
- **Relationships**: One-to-Many with draft_picks, roster_slots

### 2. Roster Slots Collection
- **Purpose**: Team roster positions
- **Key Fields**:
  - `fantasyTeamId`: Team reference
  - `playerId`: Player reference
  - `position`: Position slot
  - `acquiredVia`: How acquired (draft, waiver, trade)
- **Relationships**: Many-to-One with fantasy_teams, college_players

### 3. Schools Collection
- **Purpose**: College information
- **Key Fields**:
  - `name`: School name
  - `conference`: Conference
  - `abbreviation`: School abbreviation
  - `logoUrl`: School logo
- **Relationships**: One-to-Many with college_players

### 4. Player Stats Collection
- **Purpose**: Performance data
- **Key Fields**:
  - `playerId`: Player reference
  - `gameId`: Game reference
  - `week`: Week number
  - `season`: Season year
  - `fantasyPoints`: Actual points scored
- **Relationships**: Many-to-One with college_players

## Entity Relationships
```
college_players (1) → (many) draft_picks
college_players (1) → (many) roster_slots
college_players (1) → (many) player_stats
schools (1) → (many) college_players
fantasy_teams (1) → (many) roster_slots
```

