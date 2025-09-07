# Player Selection Flow

## Overview
This diagram shows how users browse, filter, and select players during the draft.

## User Flow Steps

### 1. Player Browsing
- **Interface**: Player list with filters
- **Filters Available**:
  - Position (QB, RB, WR, TE, K)
  - Conference (SEC, ACC, Big 12, Big Ten)
  - Team (specific college team)
  - Search (player name)
- **Sorting Options**:
  - Projected points
  - Team
  - Name
  - ADP (Average Draft Position)

### 2. Player Details
- **Action**: Click on player
- **Information Displayed**:
  - Projected fantasy points
  - Team information
  - Previous season stats
  - Depth chart position
  - Injury status

### 3. Selection Process
- **Queue Option**: Add to draft queue
- **Direct Pick**: Select player immediately
- **Confirmation**: Confirm pick selection

### 4. Pick Submission
- **Validation**: Check if user's turn
- **API Call**: `POST /api/drafts/[leagueId]/pick`
- **Real-time Update**: Broadcast to all users
- **Turn Advance**: Move to next team

## Decision Points
- **User's Turn**: Can pick vs must wait
- **Player Available**: Already drafted vs available
- **Time Remaining**: Enough time vs timeout risk

## Error Scenarios
- **Not User's Turn**: Show "Wait for your turn" message
- **Player Already Drafted**: Remove from list, show error
- **Time Expired**: Autopick triggered
- **Network Error**: Retry pick submission

