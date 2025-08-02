# Appwrite Integration Guide

## 🚀 Overview

This guide covers the complete Appwrite integration for the College Football Fantasy App, including authentication, data management, real-time features, and deployment.

## 📋 Table of Contents

1. [Setup & Configuration](#setup--configuration)
2. [Authentication System](#authentication-system)
3. [Data Collections](#data-collections)
4. [API Integration](#api-integration)
5. [Real-time Features](#real-time-features)
6. [Error Handling](#error-handling)
7. [Security](#security)
8. [Deployment](#deployment)

## 🔧 Setup & Configuration

### Prerequisites
- Appwrite project with NYC region
- Project ID: `688ccd49002eacc6c020`
- API Key with appropriate permissions

### Environment Variables
```bash
# Appwrite Configuration
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=688ccd49002eacc6c020
APPWRITE_API_KEY=your-api-key-here

# Frontend Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=688ccd49002eacc6c020
```

### Client Configuration
```javascript
// Browser-compatible client
const client = new Appwrite.Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('688ccd49002eacc6c020');

// Node.js client (for backend)
const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('688ccd49002eacc6c020')
    .setKey('your-api-key');
```

## 🔐 Authentication System

### User Registration
```javascript
// Create new account
const response = await appwriteService.createAccount(email, password, name);

// Auto-login after registration
await appwriteService.createEmailSession(email, password);
const user = await appwriteService.getCurrentUser();
```

### User Login
```javascript
// Create email session
await appwriteService.createEmailSession(email, password);

// Get current user
const user = await appwriteService.getCurrentUser();
```

### Session Management
```javascript
// Check if user is logged in
const user = await appwriteService.getCurrentUser();
if (!user) {
    // Redirect to login
    window.location.href = '/login';
}
```

## 📊 Data Collections

### Required Collections

#### 1. Games Collection
```javascript
{
    "id": "games",
    "name": "Games",
    "attributes": [
        { "key": "week", "type": "integer", "required": true },
        { "key": "awayTeamId", "type": "string", "required": true },
        { "key": "homeTeamId", "type": "string", "required": true },
        { "key": "awayScore", "type": "integer", "default": 0 },
        { "key": "homeScore", "type": "integer", "default": 0 },
        { "key": "status", "type": "string", "default": "scheduled" },
        { "key": "gameTime", "type": "string" },
        { "key": "eligible", "type": "boolean", "default": false },
        { "key": "awayTeamConference", "type": "string" },
        { "key": "homeTeamConference", "type": "string" }
    ],
    "indexes": [
        { "key": "week", "type": "key", "attributes": ["week"] },
        { "key": "eligible", "type": "key", "attributes": ["eligible"] },
        { "key": "status", "type": "key", "attributes": ["status"] }
    ]
}
```

#### 2. Rankings Collection
```javascript
{
    "id": "rankings",
    "name": "AP Rankings",
    "attributes": [
        { "key": "rank", "type": "integer", "required": true },
        { "key": "teamId", "type": "string", "required": true },
        { "key": "name", "type": "string", "required": true },
        { "key": "conference", "type": "string" },
        { "key": "week", "type": "integer", "required": true },
        { "key": "points", "type": "integer" }
    ],
    "indexes": [
        { "key": "rank", "type": "key", "attributes": ["rank"] },
        { "key": "week", "type": "key", "attributes": ["week"] },
        { "key": "conference", "type": "key", "attributes": ["conference"] }
    ]
}
```

#### 3. Teams Collection
```javascript
{
    "id": "teams",
    "name": "Teams",
    "attributes": [
        { "key": "name", "type": "string", "required": true },
        { "key": "conference", "type": "string", "required": true },
        { "key": "abbreviation", "type": "string" },
        { "key": "logo", "type": "string" },
        { "key": "colors", "type": "string" } // JSON string
    ],
    "indexes": [
        { "key": "conference", "type": "key", "attributes": ["conference"] },
        { "key": "name", "type": "key", "attributes": ["name"] }
    ]
}
```

#### 4. Players Collection
```javascript
{
    "id": "players",
    "name": "Players",
    "attributes": [
        { "key": "name", "type": "string", "required": true },
        { "key": "teamId", "type": "string", "required": true },
        { "key": "position", "type": "string", "required": true },
        { "key": "number", "type": "integer" },
        { "key": "height", "type": "string" },
        { "key": "weight", "type": "integer" },
        { "key": "class", "type": "string" },
        { "key": "hometown", "type": "string" }
    ],
    "indexes": [
        { "key": "teamId", "type": "key", "attributes": ["teamId"] },
        { "key": "position", "type": "key", "attributes": ["position"] },
        { "key": "name", "type": "key", "attributes": ["name"] }
    ]
}
```

#### 5. Leagues Collection
```javascript
{
    "id": "leagues",
    "name": "Leagues",
    "attributes": [
        { "key": "name", "type": "string", "required": true },
        { "key": "creatorId", "type": "string", "required": true },
        { "key": "maxTeams", "type": "integer", "default": 12 },
        { "key": "scoringType", "type": "string", "default": "PPR" },
        { "key": "draftType", "type": "string", "default": "snake" },
        { "key": "status", "type": "string", "default": "active" },
        { "key": "createdAt", "type": "string", "required": true }
    ],
    "indexes": [
        { "key": "creatorId", "type": "key", "attributes": ["creatorId"] },
        { "key": "status", "type": "key", "attributes": ["status"] }
    ]
}
```

#### 6. Rosters Collection
```javascript
{
    "id": "rosters",
    "name": "Rosters",
    "attributes": [
        { "key": "leagueId", "type": "string", "required": true },
        { "key": "userId", "type": "string", "required": true },
        { "key": "teamName", "type": "string", "required": true },
        { "key": "starters", "type": "string" }, // JSON array of player IDs
        { "key": "bench", "type": "string" }, // JSON array of player IDs
        { "key": "ir", "type": "string" }, // JSON array of player IDs
        { "key": "createdAt", "type": "string", "required": true }
    ],
    "indexes": [
        { "key": "leagueId", "type": "key", "attributes": ["leagueId"] },
        { "key": "userId", "type": "key", "attributes": ["userId"] },
        { "key": "unique_roster", "type": "unique", "attributes": ["leagueId", "userId"] }
    ]
}
```

#### 7. Draft Picks Collection
```javascript
{
    "id": "draft_picks",
    "name": "Draft Picks",
    "attributes": [
        { "key": "leagueId", "type": "string", "required": true },
        { "key": "userId", "type": "string", "required": true },
        { "key": "playerId", "type": "string", "required": true },
        { "key": "pickNumber", "type": "integer", "required": true },
        { "key": "round", "type": "integer", "required": true },
        { "key": "timestamp", "type": "string", "required": true }
    ],
    "indexes": [
        { "key": "leagueId", "type": "key", "attributes": ["leagueId"] },
        { "key": "pickNumber", "type": "key", "attributes": ["pickNumber"] },
        { "key": "unique_pick", "type": "unique", "attributes": ["leagueId", "pickNumber"] }
    ]
}
```

## 🔌 API Integration

### Data Service Methods

#### Games
```javascript
// Get all games
const games = await appwriteService.getGames();

// Get games by week
const week1Games = await appwriteService.getGames(1);

// Get eligible games only
const eligibleGames = await appwriteService.getEligibleGames();
```

#### Rankings
```javascript
// Get AP Top 25
const rankings = await appwriteService.getRankings();
```

#### Teams
```javascript
// Get all teams
const teams = await appwriteService.getTeams();

// Get Power 4 teams only
const power4Teams = await appwriteService.getPower4Teams();
```

#### Players
```javascript
// Get all players
const players = await appwriteService.getPlayers();

// Get players by team
const teamPlayers = await appwriteService.getPlayers('teamId123');

// Get players by position
const qbs = await appwriteService.getPlayers(null, 'QB');
```

#### League Management
```javascript
// Create league
const league = await appwriteService.createLeague({
    name: 'Power 4 Elite League',
    creatorId: userId,
    maxTeams: 12,
    scoringType: 'PPR',
    draftType: 'snake'
});

// Get user's leagues
const userLeagues = await appwriteService.getLeagues(userId);
```

#### Roster Management
```javascript
// Get user's roster
const roster = await appwriteService.getRoster(leagueId, userId);

// Update roster
await appwriteService.updateRoster(rosterId, {
    starters: ['player1', 'player2', ...],
    bench: ['player3', 'player4', ...]
});
```

#### Draft Management
```javascript
// Get draft picks
const picks = await appwriteService.getDraftPicks(leagueId);

// Make a draft pick
await appwriteService.makeDraftPick(leagueId, userId, playerId, pickNumber);
```

## ⚡ Real-time Features

### Live Draft Updates
```javascript
// Subscribe to draft picks
const unsubscribe = appwriteService.subscribeToDraftPicks(leagueId, (pick) => {
    console.log('New draft pick:', pick);
    updateDraftBoard(pick);
});

// Unsubscribe when done
unsubscribe();
```

### Live Game Updates
```javascript
// Subscribe to game score updates
const unsubscribe = appwriteService.subscribeToGameUpdates((game) => {
    console.log('Game updated:', game);
    updateScoreboard(game);
});
```

## 🛡️ Error Handling

### Centralized Error Handler
```javascript
appwriteService.handleError(error) {
    console.error('Appwrite Error:', error);
    
    if (error.code === 401) {
        // Authentication error
        window.location.href = '/login';
    } else if (error.code === 403) {
        // Permission error
        alert('You do not have permission to perform this action.');
    } else if (error.code === 404) {
        // Not found error
        console.log('Resource not found');
    } else {
        // Other errors
        alert('An error occurred. Please try again.');
    }
}
```

### Try-Catch Pattern
```javascript
try {
    const data = await appwriteService.getGames();
    // Handle success
} catch (error) {
    appwriteService.handleError(error);
}
```

## 🔒 Security

### Permissions Setup
```javascript
// Collection permissions
const permissions = [
    Permission.read(Role.any()), // Public read
    Permission.create(Role.users()), // Users can create
    Permission.update(Role.users()), // Users can update
    Permission.delete(Role.users()) // Users can delete
];
```

### API Key Security
- Store API keys in environment variables
- Use different keys for different environments
- Rotate keys regularly
- Limit key permissions to minimum required

### Data Validation
```javascript
// Validate user input
function validateLeagueData(data) {
    if (!data.name || data.name.length < 3) {
        throw new Error('League name must be at least 3 characters');
    }
    if (data.maxTeams < 2 || data.maxTeams > 16) {
        throw new Error('League must have 2-16 teams');
    }
    return true;
}
```

## 🚀 Deployment

### Environment Setup
```bash
# Production environment variables
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=688ccd49002eacc6c020
APPWRITE_API_KEY=your-production-api-key

# Frontend environment variables
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=688ccd49002eacc6c020
```

### Vercel Deployment
```json
// vercel.json
{
  "framework": "nextjs",
  "env": {
    "APPWRITE_ENDPOINT": "https://nyc.cloud.appwrite.io/v1",
    "APPWRITE_PROJECT_ID": "688ccd49002eacc6c020",
    "APPWRITE_API_KEY": "@appwrite-api-key"
  }
}
```

### Health Checks
```javascript
// API health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        appwrite: 'connected'
    });
});
```

## 📝 Usage Examples

### Complete Login Flow
```javascript
class AuthFlow {
    async login(email, password) {
        try {
            await this.appwriteService.createEmailSession(email, password);
            const user = await this.appwriteService.getCurrentUser();
            
            // Redirect to dashboard
            window.location.href = '/league/dashboard';
        } catch (error) {
            this.appwriteService.handleError(error);
        }
    }
}
```

### League Dashboard
```javascript
class LeagueDashboard {
    async loadData() {
        const user = await this.appwriteService.getCurrentUser();
        const leagues = await this.appwriteService.getLeagues(user.$id);
        const games = await this.appwriteService.getGames(1);
        const rankings = await this.appwriteService.getRankings();
        
        this.updateUI(leagues, games, rankings);
    }
}
```

### Draft System
```javascript
class DraftSystem {
    async makePick(playerId) {
        const pick = await this.appwriteService.makeDraftPick(
            this.leagueId,
            this.userId,
            playerId,
            this.currentPick
        );
        
        // Real-time updates will automatically refresh the UI
    }
}
```

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure Appwrite endpoint is correct
   - Check API key permissions
   - Verify project ID

2. **Authentication Failures**
   - Check email/password format
   - Verify user exists in Appwrite
   - Check session expiration

3. **Real-time Connection Issues**
   - Verify WebSocket support
   - Check network connectivity
   - Ensure proper subscription setup

4. **Data Not Loading**
   - Check collection permissions
   - Verify query syntax
   - Check API key scopes

### Debug Mode
```javascript
// Enable debug logging
const client = new Appwrite.Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('688ccd49002eacc6c020')
    .setSelfSigned(true); // For debugging
```

## 📚 Additional Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite JavaScript SDK](https://appwrite.io/docs/references/cloud/client-web)
- [Appwrite Console](https://console.appwrite.io)
- [Community Support](https://appwrite.io/discord)

---

**Note**: This integration provides a complete foundation for the College Football Fantasy App. All data operations, authentication, and real-time features are handled through Appwrite's robust backend-as-a-service platform. 