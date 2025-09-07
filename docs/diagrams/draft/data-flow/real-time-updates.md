# Real-time Updates Flow

## Overview
This diagram shows how real-time updates are handled in the draft system.

## Update Components

### 1. Appwrite Realtime
- **Channels**: `draft-{leagueId}`
- **Events**: pick_made, turn_changed, draft_started, draft_ended
- **Subscriptions**: Frontend components subscribe to changes

### 2. Vercel KV Caching
- **Keys**: `draft:{leagueId}:lock`
- **Purpose**: Prevent race conditions
- **TTL**: 30 seconds

### 3. Event Types
- **Pick Made**: Player selected by team
- **Turn Changed**: Turn advanced to next team
- **Draft Started**: Draft initialization
- **Draft Ended**: Draft completion
- **Autopick**: Automatic pick executed

## Update Flow
```
Database Change → Event Generation → Real-time Broadcast → Client Update
```

## Processing Steps
1. **State Change**: Database update occurs
2. **Event Creation**: Generate real-time event
3. **Channel Broadcast**: Send to subscribed clients
4. **Client Processing**: Update UI components
5. **State Sync**: Ensure consistency

## Error Handling
- **Connection Loss**: Automatic reconnection
- **Message Loss**: State synchronization on reconnect
- **Conflict Resolution**: Server-side validation

