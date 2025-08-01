# College Football Fantasy API Documentation

## 🚀 Running the Server

```bash
npm run server
```

The API will start on `http://localhost:3000`

## 📍 Available Endpoints

### General

#### GET /
Returns API information and available endpoints

#### GET /health
Health check endpoint with service status

### Games

#### GET /api/games
Get current week's Power 4 games
- Returns: Array of games with scores, status, and teams

#### GET /api/games/week/:week
Get games for a specific week
- Parameters: 
  - `week` (1-15)
  - `year` (optional, defaults to current year)

#### GET /api/games/eligible
Get only games where players are eligible to be started
- Returns: Games with eligibility reasons (AP Top-25 or conference game)

#### GET /api/games/:gameId
Get detailed stats for a specific game

### Teams

#### GET /api/teams
Get all Power 4 teams grouped by conference
- Returns: Teams from SEC, ACC, Big 12, and Big Ten

#### GET /api/teams/:teamId/roster
Get roster for a specific team

### Rankings

#### GET /api/rankings
Get current AP Top 25 rankings

#### GET /api/rankings/week/:week
Get rankings for a specific week

#### GET /api/rankings/team/:teamName
Check if a specific team is ranked

### Eligibility

#### GET /api/eligibility/check
Check if a game is eligible for fantasy play
- Query params: `playerTeam`, `opponentTeam`

#### GET /api/eligibility/report
Get full eligibility report for current week

#### GET /api/eligibility/team/:teamName
Get all eligible games for a specific team

## 🔥 Example Usage

### Get Current Games
```bash
curl http://localhost:3000/api/games
```

### Check Team Ranking
```bash
curl http://localhost:3000/api/rankings/team/Ohio%20State
```

### Get Eligible Games
```bash
curl http://localhost:3000/api/games/eligible
```

### Check Game Eligibility
```bash
curl "http://localhost:3000/api/eligibility/check?playerTeam=Alabama&opponentTeam=Tennessee"
```

## 🛡️ Features

- **Automatic Caching**: Reduces API calls to ESPN/CFBD
- **Rate Limiting**: Prevents hitting API limits
- **Live Updates**: Game scores update every 30 seconds
- **Free Data**: Works without any paid APIs
- **Power 4 Focus**: Only includes SEC, ACC, Big 12, and Big Ten

## 🏗️ Next Steps

1. Add user authentication
2. Create database for leagues and rosters
3. Build draft system
4. Implement scoring engine
5. Add WebSocket support for real-time updates