# Appwrite Setup Guide for College Football Fantasy App

## 1. Create Appwrite Account

1. Go to [Appwrite Cloud](https://cloud.appwrite.io)
2. Sign up for a free account
3. Create a new project named "College Football App"

## 2. Get Your Credentials

1. In your project dashboard, go to **Settings**
2. Copy your **Project ID**
3. Go to **API Keys** and create a new API key with these scopes:
   - `databases.read`
   - `databases.write`
   - `collections.read`
   - `collections.write`
   - `documents.read`
   - `documents.write`
   - `users.read`
   - `users.write`
   - `teams.read`
   - `teams.write`

## 3. Update .env File

```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id_here
APPWRITE_API_KEY=your_api_key_here
```

## 4. Create Database Structure

In the Appwrite Console:

### Create Database
1. Go to **Databases**
2. Create a new database named `college-football-fantasy`

### Create Collections

Create these collections with the following attributes:

#### 1. `games` Collection
- `season` (integer, required)
- `week` (integer, required)
- `seasonType` (string, required)
- `startDate` (datetime, required)
- `homeTeam` (string, required)
- `homeConference` (string)
- `homePoints` (integer, default: 0)
- `awayTeam` (string, required)
- `awayConference` (string)
- `awayPoints` (integer, default: 0)
- `status` (string, required)
- `period` (integer)
- `clock` (string)
- `isConferenceGame` (boolean)
- `lastUpdated` (datetime)

**Indexes:**
- `week_index` on `week`
- `season_index` on `season`
- `status_index` on `status`

#### 2. `rankings` Collection
- `season` (integer, required)
- `week` (integer, required)
- `poll` (string, required)
- `rankings` (string[], required) - JSON array of ranking objects
- `lastUpdated` (datetime)

**Indexes:**
- `week_season_index` on `week, season`

#### 3. `teams` Collection
- `school` (string, required)
- `mascot` (string)
- `abbreviation` (string)
- `conference` (string, required)
- `conferenceId` (integer)
- `color` (string)
- `altColor` (string)
- `logo` (url)
- `lastUpdated` (datetime)

**Indexes:**
- `conference_index` on `conference`

#### 4. `leagues` Collection
- `name` (string, required)
- `commissioner` (string, required) - User ID
- `season` (integer, required)
- `scoringType` (string, default: "PPR")
- `maxTeams` (integer, default: 12)
- `draftDate` (datetime)
- `status` (string, default: "pre-draft")

#### 5. `rosters` Collection
- `leagueId` (string, required)
- `userId` (string, required)
- `teamName` (string, required)
- `players` (string[]) - Array of player IDs
- `wins` (integer, default: 0)
- `losses` (integer, default: 0)
- `ties` (integer, default: 0)

#### 6. `lineups` Collection
- `rosterId` (string, required)
- `week` (integer, required)
- `starters` (string[]) - Array of player IDs
- `bench` (string[]) - Array of player IDs
- `points` (float, default: 0)

## 5. Set Permissions

For each collection, set these permissions:

### Public Access (for game data):
- `games`: Read access for "Any"
- `rankings`: Read access for "Any"
- `teams`: Read access for "Any"

### Authenticated Users:
- `leagues`: Create, Read for "Users"
- `rosters`: Create, Read, Update for "Users" (document level)
- `lineups`: Create, Read, Update for "Users" (document level)

## 6. Enable Realtime

For live score updates:
1. Go to each collection
2. Enable **Realtime** for:
   - `games` (for score updates)
   - `lineups` (for live fantasy scoring)

## 7. Test the Connection

Run this command to test:
```bash
npm run test-appwrite
```

## 8. Start Syncing Data

To populate your database with initial data:
```bash
npm run sync-data
```

This will:
- Import all Power 4 teams
- Fetch current week games
- Get latest AP rankings
- Set up scheduled syncs

## Features Enabled by Appwrite

✅ **Authentication** - User registration and login
✅ **Database** - Store games, teams, leagues, rosters
✅ **Realtime** - Live score updates via WebSocket
✅ **Teams** - League management
✅ **Storage** - Team logos and user avatars
✅ **Functions** - Serverless scoring calculations

## Next Steps

1. Create user authentication flows
2. Build league management APIs
3. Implement draft system
4. Add real-time scoring updates