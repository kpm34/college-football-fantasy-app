# College Football Fantasy App

A fantasy sports platform focused on the Power 4 conferences (Big 12, ACC, Big Ten, SEC) with unique eligibility rules based on AP Top 25 rankings and conference matchups.

## 🏈 Features

- **Conference Focus**: Covers only Big 12, ACC, Big Ten, and SEC
- **12-Week Regular Season**: No conference titles, bowls, or playoffs
- **Unique Eligibility Rules**: Players can only be started when facing:
  - An AP Top-25 ranked opponent, OR
  - A conference opponent (same conference game)
- **Free Data Sources**: Uses ESPN's public API and CollegeFootballData API
- **Real-time Updates**: Live scoring with 30-second polling intervals
- **Smart Caching**: Reduces API calls and improves performance
- **Rate Limiting**: Prevents API throttling

## 🚀 Quick Start

1. **Clone the repository**
```bash
git clone [your-repo-url]
cd college-football-fantasy-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Get a free CFBD API key** (optional but recommended)
   - Go to https://collegefootballdata.com
   - Sign up for a free account
   - Copy your API key
   - Update `.env` file:
```
CFBD_API_KEY=your_actual_key_here
```

4. **Run the test suite**
```bash
npm test
```

## 📁 Project Structure

```
college-football-fantasy-app/
├── src/
│   ├── types/          # TypeScript interfaces
│   ├── services/       # Core services
│   │   ├── data-service.ts      # ESPN & CFBD API integration
│   │   ├── eligibility-checker.ts # Player eligibility logic
│   │   └── live-updates.ts      # Real-time game updates
│   ├── utils/          # Utilities
│   │   ├── rate-limiter.ts      # API rate limiting
│   │   └── cache.ts             # Data caching
│   └── test-services.ts         # Test all services
├── PRD.md              # Product Requirements Document
├── data-sources-integration.md  # API documentation
└── README.md           # This file
```

## 🛠️ Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run tests in development mode (TypeScript)
- `npm test` - Run the test suite
- `npm start` - Run compiled JavaScript
- `npm run clean` - Clean build directory

## 📊 Data Sources

### ESPN Public API (Primary - No Auth)
- Live scores and game information
- Team rosters and schedules
- No authentication required
- 60 requests/minute rate limit

### CollegeFootballData API (Free Tier)
- AP Top 25 rankings
- Historical data and statistics
- Free API key required
- 120 requests/minute rate limit

## 🎮 Eligibility Rules

Players are eligible to start only when their game meets these criteria:

1. **AP Top-25 Opponent**: Facing a team ranked in the current AP Top-25 poll
2. **Conference Game**: Playing within their own conference

Examples:
- ✅ Alabama (SEC) vs #15 Tennessee (SEC) - Eligible (both Top-25 AND conference)
- ✅ Florida (SEC) vs LSU (SEC) - Eligible (conference game)
- ✅ Michigan (Big Ten) vs #8 Ohio State (Big Ten) - Eligible (Top-25)
- ❌ Georgia (SEC) vs UAB (C-USA) - Not eligible
- ❌ Texas (SEC) vs Rice (AAC) - Not eligible

## 🔧 Development

### TypeScript Configuration
The project uses TypeScript with strict mode enabled. Configuration is in `tsconfig.json`.

### Environment Variables
Create a `.env` file in the root directory:
```
CFBD_API_KEY=your_key_here
```

### Testing
Run the test suite to verify all services are working:
```bash
npm test
```

## 📈 Next Steps

1. **Frontend Development**: Build React/Vue/Angular UI
2. **Backend API**: Create Express/NestJS API server
3. **Database**: Set up PostgreSQL for user data
4. **Authentication**: Implement user auth system
5. **Draft System**: Build snake draft functionality
6. **Scoring Engine**: Implement PPR scoring calculations
7. **Mobile Apps**: Create iOS/Android apps

## 📝 License

ISC

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request