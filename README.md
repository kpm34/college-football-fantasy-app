# College Football Fantasy App

Fantasy football platform exclusively for Power 4 conferences with unique eligibility rules.

## 🏈 Features

- **Power 4 Conferences Only**: SEC, ACC, Big 12, Big Ten
- **Unique Eligibility Rules**: Players only eligible vs AP Top-25 teams or in conference games
- **12-Week Regular Season**: No playoffs or bowls
- **Draft Systems**: Snake draft with timer and auto-pick, Auction draft with bidding
- **Real-time Scoring**: Live updates via ESPN/CFBD APIs
- **3D Visualizations**: Spline and Three.js for immersive UI
- **Progressive Web App**: Offline support with service worker

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.4.5 with App Router, TypeScript, Tailwind CSS
- **3D Graphics**: Three.js, React Three Fiber, Spline
- **Animation**: GSAP, Framer Motion, Lenis, Anime.js
- **Backend**: Appwrite BaaS, Express.js + TypeScript
- **Database**: Appwrite (NYC) - Project: `college-football-fantasy-app`
- **AI Integration**: Vercel AI SDK, Anthropic Claude, Chrome AI
- **Data Sources**: College Football Data API (CFBD), ESPN API
- **Deployment**: Vercel with Edge Functions

## 🚀 Getting Started

### Prerequisites
- Node.js 18-22
- npm or yarn
- Vercel CLI (for deployment)

### Installation
```bash
# Install all dependencies
npm run install:all

# Or install separately
npm install           # Root dependencies
cd frontend && npm install  # Frontend dependencies
```

### Environment Setup
1. Copy `.env` to `frontend/.env.local`
2. Update with your API keys (all variables configured in `.env`)
3. Key variables:
   - `APPWRITE_PROJECT_ID=college-football-fantasy-app`
   - `CFBD_API_KEY` - Configured
   - `AI_GATEWAY_API_KEY` - Configured

### Development
```bash
# Start development server
npm run dev          # Frontend on port 3001

# Run backend server
npm run server       # Express server on port 3000

# Other commands
npm run build        # Production build
npm run lint         # Run linting
npm run typecheck    # TypeScript checking
npm run format       # Code formatting
```

## 📁 Project Structure

```
/
├── frontend/               # Next.js 15 application
│   ├── app/               # App Router pages and API routes
│   ├── components/        # React components
│   ├── lib/              # Utilities and configurations
│   └── types/            # TypeScript definitions
├── src/                   # Backend source code
│   ├── services/         # Business logic
│   └── scripts/          # Data management
├── vendor/awwwards-rig/   # 3D graphics submodule
└── confrence rosters/     # Team roster data
```

## 🔗 Production URLs

- https://cfbfantasy.app
- https://www.cfbfantasy.app
- https://collegefootballfantasy.app
- https://www.collegefootballfantasy.app

## 🤖 AI & Tool Integration

### Cursor AI
- Configuration: `.cursorrules`
- Context: `CLAUDE.md`
- Config: `cursor.config.json`

### Claude Code (MCP)
- File operations
- Web fetching
- Task management
- Git operations

### Vercel
- Edge Config for feature flags
- KV storage for caching
- Analytics monitoring
- AI Gateway for LLM routing

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start Next.js dev server
npm run server           # Start Express backend

# Deployment
npm run preview          # Vercel preview
npm run deploy           # Production deployment

# Data Management
npm run sync-data        # Sync from APIs
npm run test-appwrite    # Test database connection

# Code Quality
npm run lint:fix         # Fix linting issues
npm run format           # Format with Prettier
npm run typecheck        # TypeScript checking
```

## 🔐 Environment Variables

See `.env` file for complete list. Key variables:
- Appwrite configuration
- CFBD API keys
- AI Gateway settings
- Edge Config token
- Inngest background jobs

## 📄 License

Private - All rights reserved

## 🤝 Contributing

This is a private project. For access, contact the repository owner.

---

Built with ❤️ for college football fans