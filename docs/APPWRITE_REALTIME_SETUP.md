# 🔄 Appwrite Realtime Implementation

## Overview
Appwrite Realtime has been implemented for live draft updates, providing instant synchronization across all connected clients.

## What's Been Built

### 1. **Realtime Hook** (`hooks/useDraftRealtime.ts`)
- Manages WebSocket connection to Appwrite
- Subscribes to draft picks and league updates
- Handles automatic reconnection
- Tracks connection status
- Calculates who's on the clock (with snake draft support)

### 2. **Draft Timer Component** (`components/draft/DraftTimer.tsx`)
- Countdown timer with visual warnings
- Auto-pick when timer expires
- Resets on each new pick
- Color-coded states (green → orange → red)

### 3. **Realtime Status Component** (`components/draft/DraftRealtimeStatus.tsx`)
- Shows connection status
- Displays who's currently picking
- Lists recent picks
- Real-time updates as picks happen

### 4. **Enhanced Draft Room** (`app/draft/[leagueId]/realtime/page.tsx`)
- Live draft board
- Instant pick updates
- No page refresh needed
- Synced across all users

## How It Works

### Subscription Setup
```typescript
const unsubscribe = client.subscribe(
  [
    `databases.${DATABASE_ID}.collections.${COLLECTIONS.DRAFT_PICKS}.documents`,
    `databases.${DATABASE_ID}.collections.${COLLECTIONS.LEAGUES}.documents.${leagueId}`
  ],
  (response) => {
    // Handle realtime events
  }
);
```

### Event Types
- `*.create` - New draft pick made
- `*.update` - Pick or league updated
- `*.delete` - Pick removed (undo)

### Snake Draft Logic
```typescript
const pickIndex = (currentPick - 1) % draftOrder.length;
const isSnakeRound = currentRound % 2 === 0;
const actualIndex = isSnakeRound 
  ? draftOrder.length - 1 - pickIndex 
  : pickIndex;
```

## Testing the Implementation

1. **Open Multiple Browser Windows**
   - Log in as different users
   - Join the same draft room
   - Make picks and watch them appear instantly

2. **Test Connection Status**
   - Check the green "Connected" indicator
   - Disconnect internet briefly
   - Watch it reconnect automatically

3. **Test Timer**
   - Let timer run down
   - Verify auto-pick functionality
   - Check timer reset on new picks

## Performance Optimizations

1. **Minimal Re-renders**
   - Only affected components update
   - No full page refreshes

2. **Efficient Subscriptions**
   - Subscribe only to needed channels
   - Unsubscribe on component unmount

3. **Optimistic Updates**
   - Show pick immediately
   - Sync with server in background

## Next Steps

### Enable for More Features:
1. **Live Scoring** - Real-time point updates
2. **Trade Notifications** - Instant trade alerts
3. **Chat Messages** - Live league chat
4. **Lineup Changes** - See opponent moves

### Additional Improvements:
1. Add sound notifications for picks
2. Desktop notifications for your turn
3. Offline queue for picks
4. Spectator mode for non-participants

## Usage in Other Components

```typescript
// Subscribe to any collection
const unsubscribe = client.subscribe(
  `databases.${DATABASE_ID}.collections.${COLLECTION_NAME}.documents`,
  (response) => {
    console.log('Realtime update:', response);
  }
);

// Clean up
return () => unsubscribe();
```

## Troubleshooting

### Not Receiving Updates?
1. Check console for WebSocket errors
2. Verify collection permissions (read access needed)
3. Ensure valid session/authentication

### Connection Issues?
1. Check network connectivity
2. Verify Appwrite endpoint is accessible
3. Look for CORS errors in console

### Performance Issues?
1. Limit subscription scope
2. Debounce rapid updates
3. Use React.memo for components
