# College Football Fantasy Draft System

## Overview

A comprehensive real-time draft system for College Football Fantasy with Appwrite integration, featuring serpentine draft order, countdown timers, and live updates.

## Features

### 🏈 Core Draft Features
- **Real-time Updates**: Appwrite Realtime integration for live draft updates
- **Serpentine Draft Order**: Automatic reverse order on even rounds
- **Countdown Timer**: Configurable time limits with auto-pick functionality
- **Player Selection Modal**: Search, filter, and pick players with stats
- **Draft Board**: Visual representation of all picks by round
- **Draft Order Display**: Shows current turn and upcoming picks

### 🎨 UI/UX Features
- **Chrome Metallic Design**: Consistent with app theme
- **Responsive Layout**: Works on desktop and mobile
- **Loading States**: Smooth user experience during data fetching
- **Error Handling**: Graceful error recovery
- **Auto-pick**: Automatic selection when time expires

## File Structure

```
frontend/
├── app/draft/
│   ├── [leagueId]/
│   │   └── page.tsx          # Main draft page
│   └── test/
│       └── page.tsx          # Test page with mock data
├── components/draft/
│   ├── PickPlayerModal.tsx   # Player selection modal
│   ├── DraftBoard.tsx        # Draft board display
│   ├── DraftTimer.tsx        # Countdown timer
│   └── DraftOrder.tsx        # Draft order sidebar
├── types/
│   └── draft.ts              # TypeScript interfaces
└── lib/
    └── appwrite.ts           # Appwrite client configuration
```

## Components

### DraftPage (`app/draft/[leagueId]/page.tsx`)
Main draft page that orchestrates the entire draft experience.

**Props:**
- `params.leagueId`: League identifier
- `searchParams.userId`: Current user ID

**Features:**
- Real-time Appwrite subscription
- Draft state management
- Turn-based logic
- Auto-pick functionality

### PickPlayerModal
Modal for selecting players during draft.

**Props:**
- `isOpen`: Modal visibility
- `onClose`: Close handler
- `onPickPlayer`: Player selection handler
- `availablePlayers`: List of available players
- `loading`: Loading state

**Features:**
- Search by name/team
- Filter by position
- Sort by name/position/team
- Player stats display
- Eligibility indicators

### DraftBoard
Visual representation of all draft picks.

**Features:**
- Round-by-round display
- Serpentine order visualization
- Pick timestamps
- Position color coding
- Draft summary statistics

### DraftTimer
Countdown timer with auto-pick functionality.

**Features:**
- Visual countdown display
- Warning states (30s, 10s)
- Auto-pick trigger
- Turn status indicator

### DraftOrder
Sidebar showing draft order and upcoming picks.

**Features:**
- Current round/pick display
- Full draft order list
- Next 5 picks preview
- Draft settings summary

## Data Models

### Player
```typescript
interface Player {
  $id: string;
  name: string;
  position: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';
  team: string;
  conference: string;
  stats?: {
    passingYards?: number;
    rushingYards?: number;
    receivingYards?: number;
    touchdowns?: number;
    fieldGoals?: number;
    extraPoints?: number;
  };
  eligibility: boolean;
  imageUrl?: string;
}
```

### DraftPick
```typescript
interface DraftPick {
  $id: string;
  leagueId: string;
  round: number;
  pickNumber: number;
  userId: string;
  playerId: string;
  playerName: string;
  playerPosition: string;
  playerTeam: string;
  timestamp: string;
  timeRemaining?: number;
}
```

### League
```typescript
interface League {
  $id: string;
  name: string;
  ownerId: string;
  members: string[];
  settings: {
    maxTeams: number;
    draftTimeLimit: number;
    scoringType: 'PPR' | 'Standard' | 'HalfPPR';
    rosterSize: number;
  };
  status: 'drafting' | 'active' | 'completed';
  currentRound: number;
  currentPick: number;
  draftOrder: string[];
  createdAt: string;
}
```

## Appwrite Integration

### Collections
- `draft_picks`: Individual draft selections
- `leagues`: League configuration and state
- `players`: Available players for drafting

### Realtime Channels
- `databases.{databaseId}.collections.draft_picks.documents`: Live pick updates
- `databases.{databaseId}.collections.leagues.documents`: League state changes

### Key Operations
- `databases.createDocument()`: Record new picks
- `databases.listDocuments()`: Load draft history
- `databases.getDocument()`: Get league details
- `realtime.subscribe()`: Listen for live updates

## Usage

### Basic Draft Page
```typescript
// Navigate to draft page
/draft/{leagueId}?userId={currentUserId}
```

### Test Page
```typescript
// Test components with mock data
/draft/test
```

## Environment Variables

Required environment variables for Appwrite integration:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
```

## Styling

The draft system uses the existing chrome metallic theme:

- **Chrome Text**: `chrome-text` class for headings
- **Glass Cards**: `glass-card` class for containers
- **Chrome Buttons**: `chrome-button` class for actions
- **Position Colors**: Color-coded position badges

## Testing

Use the test page at `/draft/test` to:
- Verify component functionality
- Test timer behavior
- Check modal interactions
- Validate draft order logic

## Future Enhancements

- **Draft Rankings**: Pre-draft player rankings
- **Trade Picks**: Pick trading functionality
- **Draft Chat**: Real-time chat during draft
- **Draft History**: Complete draft replay
- **Mobile Optimization**: Enhanced mobile experience
- **Offline Support**: Draft continuation after disconnection 