# Auction System Entities

## Overview
This diagram shows the auction draft system entities and their relationships.

## Primary Entities

### 1. Auctions Collection
- **Purpose**: Auction draft configuration
- **Key Fields**:
  - `leagueId`: League reference
  - `draftId`: Draft reference
  - `playerId`: Player being auctioned
  - `status`: Auction status (active, closed, won)
  - `winnerTeamId`: Winning team
  - `winningBid`: Final bid amount
- **Relationships**: Many-to-One with leagues, drafts, college_players, fantasy_teams

### 2. Bids Collection
- **Purpose**: Auction bid tracking
- **Key Fields**:
  - `auctionId`: Auction reference
  - `playerId`: Player reference
  - `teamId`: Bidding team
  - `amount`: Bid amount
  - `timestamp`: Bid time
  - `isWinning`: Current winning bid flag
- **Relationships**: Many-to-One with auctions, college_players, fantasy_teams

### 3. Fantasy Teams (Auction Context)
- **Additional Fields for Auction**:
  - `auctionBudgetTotal`: Total budget ($200)
  - `auctionBudgetRemaining`: Remaining budget
- **Relationships**: One-to-Many with bids

## Auction Flow
```
1. Player nominated → auctions collection
2. Teams place bids → bids collection
3. Highest bid wins → auctions.winnerTeamId updated
4. Budget deducted → fantasy_teams.auctionBudgetRemaining updated
```

## Entity Relationships
```
drafts (1) → (many) auctions
auctions (1) → (many) bids
college_players (1) → (1) auctions
fantasy_teams (1) → (many) bids
```

