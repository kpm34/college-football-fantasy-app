# API Request/Response Flows

## Overview
This diagram shows the typical request/response flows for draft system APIs.

## Draft Data Request Flow

### 1. Player Data Request
```
1. Client → GET /api/(frontend)/draft/players?position=QB&leagueId=123
2. API validates query parameters
3. API queries college_players collection with filters
4. API applies sorting and pagination
5. API returns paginated results with projections
6. Client renders player list
```

### 2. Pick Submission Flow
```
1. Client → POST /api/(backend)/drafts/[leagueId]/pick
2. API validates authentication and user permissions
3. API acquires KV lock (draft:{leagueId}:lock)
4. API validates pick eligibility (user's turn, player available)
5. API updates draft_picks collection
6. API updates draft_states collection
7. API publishes real-time event to Appwrite Realtime
8. API releases KV lock
9. API returns success response
10. Client receives real-time update via WebSocket
```

### 3. Autopick Flow
```
1. Vercel Cron → GET /api/(backend)/cron/draft-autopick
2. API queries expired drafts from draft_states
3. API selects best available player using projection algorithm
4. API applies autopick to draft_picks collection
5. API updates draft_states collection
6. API publishes real-time event
7. API returns processing results
```

## Error Handling Flows

### 4. Authentication Error
```
1. Client → API request without valid session
2. API returns 401 Unauthorized
3. Client redirects to login page
4. User authenticates
5. Client retries original request
```

### 5. Validation Error
```
1. Client → API request with invalid data
2. API validates input with Zod schema
3. API returns 400 Bad Request with validation details
4. Client displays error message to user
5. User corrects input and retries
```

### 6. Rate Limiting
```
1. Client → Multiple rapid API requests
2. API checks rate limit (KV cache)
3. API returns 429 Too Many Requests
4. Client implements exponential backoff
5. Client retries after delay
```

