# League and Team Entities

## Overview
This diagram shows the league and team management entities and their relationships.

## Primary Entities

### 1. Leagues Collection
- **Purpose**: Fantasy league configuration
- **Key Fields**:
  - `leagueName`: League name
  - `season`: Season year
  - `maxTeams`: Team limit
  - `gameMode`: All games vs conference
  - `draftType`: Snake vs auction
  - `commissionerAuthUserId`: League owner
- **Relationships**: One-to-Many with fantasy_teams, league_memberships

### 2. Fantasy Teams Collection
- **Purpose**: User teams
- **Key Fields**:
  - `leagueId`: League reference
  - `teamName`: Team name
  - `ownerAuthUserId`: Team owner
  - `draftPosition`: Draft order
  - `wins/losses`: Season record
- **Relationships**: Many-to-One with leagues, One-to-Many with draft_picks

### 3. League Memberships Collection
- **Purpose**: User-league relationships
- **Key Fields**:
  - `leagueId`: League reference
  - `authUserId`: User reference
  - `role`: User role (member/commissioner)
  - `status`: Membership status
- **Relationships**: Many-to-One with leagues, clients

### 4. Clients Collection
- **Purpose**: User authentication
- **Key Fields**:
  - `authUserId`: Appwrite user ID
  - `displayName`: User name
  - `email`: Email address
- **Relationships**: One-to-Many with league_memberships, draft_picks

## Entity Relationships
```
leagues (1) → (many) fantasy_teams
leagues (1) → (many) league_memberships
clients (1) → (many) league_memberships
fantasy_teams (1) → (many) draft_picks
```

