# College Football Fantasy Auction System

## Overview

A comprehensive real-time auction draft system for College Football Fantasy with Appwrite integration, featuring live bidding, budget management, and auction house functionality.

## Features

### 🏈 Core Auction Features
- **Real-time Bidding**: Live auction updates via Appwrite Realtime
- **Budget Management**: Track team budgets and spending
- **Auction Timer**: Configurable countdown with auto-sell functionality
- **Bid History**: Complete tracking of all bids and auction activity
- **Player Nominations**: Nominate players for auction
- **Pass Functionality**: Skip players you don't want to bid on

### 🎨 UI/UX Features
- **Chrome Metallic Design**: Consistent with app theme
- **Responsive Layout**: Works on desktop and mobile
- **Live Updates**: Real-time bid notifications
- **Budget Visualization**: Progress bars and spending indicators
- **Auction Status**: Clear indication of auction state

## File Structure

```
frontend/
├── app/auction/
│   ├── [leagueId]/
│   │   └── page.tsx          # Main auction page
│   └── test/
│       └── page.tsx          # Test page with mock data
├── components/auction/
│   ├── AuctionModal.tsx      # Bidding modal
│   ├── AuctionBoard.tsx      # Auction display board
│   ├── AuctionTimer.tsx      # Countdown timer
│   ├── TeamBudgets.tsx       # Budget management
│   └── BidHistory.tsx        # Bid history display
├── types/
│   └── auction.ts            # TypeScript interfaces
└── lib/
    └── appwrite.ts           # Appwrite client configuration
```

## Components

### AuctionPage (`app/auction/[leagueId]/page.tsx`)
Main auction page that orchestrates the entire auction experience.

**Props:**
- `params.leagueId`: League identifier
- `searchParams.userId`: Current user ID

**Features:**
- Real-time Appwrite subscription
- Auction state management
- Budget tracking
- Bid placement and passing

### AuctionModal
Modal for placing bids during auction.

**Props:**
- `isOpen`: Modal visibility
- `onClose`: Close handler
- `onBid`: Bid placement handler
- `onPass`: Pass handler
- `currentPlayer`: Current auction player
- `userBudget`: User's budget information
- `minBid`: Minimum bid amount
- `loading`: Loading state

**Features:**
- Quick bid buttons
- Custom bid input
- Budget validation
- Pass functionality

### AuctionBoard
Visual representation of current auction and available players.

**Features:**
- Current player display
- Player statistics
- Available players list
- Position breakdown
- Auction session info

### AuctionTimer
Countdown timer with auction status.

**Features:**
- Visual countdown display
- Current bid display
- Leading bidder indicator
- Warning states

### TeamBudgets
Sidebar showing all team budgets and spending.

**Features:**
- Budget progress bars
- Spending indicators
- League summary statistics
- Current bidder highlighting

### BidHistory
Real-time bid history and auction activity.

**Features:**
- Current player bid history
- Bid statistics
- Recent activity feed
- Timestamp tracking

## Data Models

### AuctionPlayer
```typescript
interface AuctionPlayer extends Player {
  startingBid: number;
  currentBid: number;
  currentBidder: string | null;
  auctionStatus: 'pending' | 'active' | 'sold' | 'passed';
  timeRemaining: number;
  minBidIncrement: number;
}
```

### AuctionBid
```typescript
interface AuctionBid {
  $id: string;
  leagueId: string;
  playerId: string;
  playerName: string;
  playerPosition: string;
  playerTeam: string;
  bidAmount: number;
  bidderId: string;
  bidderName: string;
  timestamp: string;
  auctionId: string;
}
```

### AuctionSession
```typescript
interface AuctionSession {
  $id: string;
  leagueId: string;
  status: 'pending' | 'active' | 'completed';
  currentPlayerId: string | null;
  currentBidAmount: number;
  currentBidderId: string | null;
  timeRemaining: number;
  minBidIncrement: number;
  totalBudget: number;
  createdAt: string;
  updatedAt: string;
}
```

### TeamBudget
```typescript
interface TeamBudget {
  userId: string;
  teamName: string;
  totalBudget: number;
  spentBudget: number;
  remainingBudget: number;
  playersOwned: number;
  maxPlayers: number;
}
```

## Appwrite Integration

### Collections
- `auction_sessions`: Auction session state and configuration
- `auction_bids`: Individual bid records
- `team_budgets`: Team budget tracking
- `players`: Available players for auction

### Realtime Channels
- `databases.{databaseId}.collections.auction_bids.documents`: Live bid updates
- `databases.{databaseId}.collections.auction_sessions.documents`: Session state changes

### Key Operations
- `databases.createDocument()`: Record new bids
- `databases.updateDocument()`: Update player auction status
- `databases.listDocuments()`: Load bid history and budgets
- `realtime.subscribe()`: Listen for live updates

## Usage

### Basic Auction Page
```typescript
// Navigate to auction page
/auction/{leagueId}?userId={currentUserId}
```

### Test Page
```typescript
// Test components with mock data
/auction/test
```

## Auction Flow

1. **Player Nomination**: Commissioner or system nominates a player
2. **Auction Start**: Player goes up for auction with starting bid
3. **Bidding Phase**: Teams place bids in real-time
4. **Timer Countdown**: Countdown timer for each bid
5. **Auction End**: Player sold to highest bidder or passed
6. **Budget Update**: Winning team's budget is updated
7. **Next Player**: Process repeats until all players are auctioned

## Budget Management

- **Total Budget**: Each team starts with $200 (configurable)
- **Bid Validation**: Cannot bid more than remaining budget
- **Budget Tracking**: Real-time updates of spent/remaining amounts
- **Visual Indicators**: Progress bars and color coding

## Timer System

- **Default Timer**: 60 seconds per bid (configurable)
- **Warning States**: 30s (yellow), 10s (red)
- **Auto-sell**: Player sold to highest bidder when timer expires
- **Bid Extension**: Timer resets when new bid is placed

## Styling

The auction system uses the existing chrome metallic theme:

- **Chrome Text**: `chrome-text` class for headings
- **Glass Cards**: `glass-card` class for containers
- **Chrome Buttons**: `chrome-button` class for actions
- **Position Colors**: Color-coded position badges
- **Budget Colors**: Green (well-funded), Yellow (moderate), Red (low)

## Testing

Use the test page at `/auction/test` to:
- Verify component functionality
- Test timer behavior
- Check bid placement
- Validate budget calculations
- Test auction flow

## Future Enhancements

- **Player Nominations**: Allow teams to nominate players
- **Auction Settings**: Configurable timer and budget settings
- **Auction Chat**: Real-time chat during auction
- **Auction History**: Complete auction replay
- **Mobile Optimization**: Enhanced mobile experience
- **Offline Support**: Auction continuation after disconnection
- **Proxy Bidding**: Set maximum bids automatically
- **Auction Pause**: Pause/resume functionality 