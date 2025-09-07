# Draft State Management Flow

## Overview
This diagram shows how draft state is managed and synchronized across the system.

## State Components

### 1. Draft Configuration
- **Collection**: `drafts`
- **Fields**: League ID, draft type, settings, schedule
- **Purpose**: Static draft configuration

### 2. Real-time State
- **Collection**: `draft_states`
- **Fields**: Current turn, deadline, round, pick index
- **Purpose**: Live draft state (document security enabled)

### 3. Pick History
- **Collection**: `draft_picks`
- **Fields**: Player selections, timestamps, team assignments
- **Purpose**: Complete draft record

### 4. Event Log
- **Collection**: `draft_events`
- **Fields**: Event types, timestamps, payloads
- **Purpose**: Audit trail and debugging

## State Flow
```
User Action → Validation → State Update → Real-time Broadcast → UI Update
```

## State Transitions
1. **Pre-draft**: Draft scheduled, waiting to start
2. **Drafting**: Active draft in progress
3. **Paused**: Draft temporarily stopped
4. **Completed**: Draft finished, results available

## Synchronization
- **Real-time**: Appwrite Realtime channels
- **Caching**: Vercel KV for performance
- **Conflict Resolution**: Last-write-wins with validation
