# Claude Code Project Context
Last Updated: 2025-08-09

## Project Overview
**Name**: awwwards-rig  
**Type**: Next.js 15 + Three.js/R3F Interactive Web Application  
**Deployment**: Vercel (Project ID: `prj_AaZ4ZNmwDlFppXtCgW4aRUHIRQMg`)  
**Production URL**: https://awwwards-rig.vercel.app/  
**Framework**: Next.js with App Router, TypeScript, Tailwind CSS

## Tech Stack
- **Runtime**: Node.js 18-22 (specified in package.json engines)
- **Framework**: Next.js 15.4.6 with App Router
- **3D Graphics**: Three.js, React Three Fiber, Drei, Postprocessing
- **Animation**: Framer Motion, GSAP, Lenis (smooth scroll)
- **Styling**: Tailwind CSS v4, CSS Modules
- **Type Safety**: TypeScript 5.x
- **AI Integration**: Vercel AI SDK (ai package)
- **Testing**: (To be configured)
- **CI/CD**: GitHub Actions + Vercel

## Project Structure
```
awwwards-rig/
├── MEMORY/                    # Session notes & context for AI assistants
│   ├── README.md             # Memory folder overview
│   └── 2025-08-09.md         # Today's session notes
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # API routes
│   │   │   └── cron/         # Scheduled jobs
│   │   ├── scene/            # 3D scene components
│   │   │   ├── Scene.tsx     # Main WebGL scene
│   │   │   ├── FootballModel.tsx
│   │   │   └── useScrollProgressBasic.ts
│   │   ├── playground/       # Experimental route
│   │   └── providers/        # Context providers
│   ├── hooks/                # Custom React hooks
│   │   ├── useScrollProgress.ts
│   │   └── useAssetExists.ts
│   ├── lib/                  # Utilities
│   └── styles/               # Global styles
├── public/                   # Static assets
│   ├── models/               # 3D models (.glb)
│   ├── textures/             # Texture files
│   └── football/             # Football-specific assets
├── vercel.json               # Vercel configuration
├── package.json              # Dependencies & scripts
└── CLAUDE.md                 # This file (AI context)
```

## Key Commands & Scripts
```bash
# Development
npm run dev                   # Start dev server (http://localhost:3000)
npm run build                 # Production build
npm run start                 # Start production server
npm run preview               # Preview on Vercel

# Code Quality
npm run typecheck             # TypeScript type checking
npm run lint                  # ESLint checks
npm run lint:fix              # Auto-fix linting issues

# Deployment
npm run deploy                # Deploy to Vercel production
vercel                        # Deploy preview
vercel --prod                 # Deploy to production

# Git Hooks (via Husky)
# Pre-commit: Runs lint-staged (lint + typecheck on staged files)
```

## Environment Variables
```bash
# Vercel (auto-injected)
VERCEL_ENV                    # development | preview | production
VERCEL_URL                    # Deployment URL
VERCEL_GIT_COMMIT_SHA         # Current commit hash

# Vercel AI Gateway (recommended for production)
AI_GATEWAY_URL                # https://gateway.vercel.app
AI_GATEWAY_API_KEY            # Gateway API key
AI_PROVIDER_PRIMARY           # anthropic/messages
AI_PROVIDER_FALLBACK          # openai/chat.completions

# AI/LLM (direct access)
OPENAI_API_KEY                # OpenAI API key
ANTHROPIC_API_KEY             # Claude API key

# Edge Config / KV Storage
EDGE_CONFIG                   # Edge config connection string
KV_REST_API_URL              # KV store REST API URL
KV_REST_API_TOKEN            # KV store access token

# Analytics (optional)
NEXT_PUBLIC_GA_ID             # Google Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID

# Development
NEXT_DISABLE_FAST_REFRESH    # true - prevents WebGL context loss in dev
```

## Current Features
1. **3D Scene Integration**: Full-screen WebGL scene with React Three Fiber
2. **Smooth Scrolling**: Lenis-based smooth scroll with progress tracking
3. **Performance Optimizations**:
   - Adaptive DPR for WebGL
   - Performance monitoring
   - Context loss handling
   - Reduced multisampling
4. **Edge Config Feature Flags**:
   - WebGL quality control (low/medium/high/ultra)
   - API kill switches for instant disable
   - A/B testing for hero variants
   - Dynamic AI model/provider switching
   - Maintenance mode toggle
5. **Routes**:
   - `/` - Homepage with sticky 3D scene
   - `/playground` - Experimental features & motion cards
   - `/scene` - Dedicated scene view
6. **API Routes**:
   - `/api/ai` - AI chat with Vercel Gateway
   - `/api/cron/nightly` - Scheduled task (7 AM UTC daily)

## Known Issues & Fixes
1. **WebGL Context Loss**: Handled via webglcontextlost events
2. **StrictMode Double Init**: Fixed Lenis double RAF in development
3. **Type Issues**: Leva controls types resolved
4. **Performance**: Reduced DPR, disabled multisampling for stability

## Vercel Configuration
```json
{
  "framework": "nextjs",
  "functions": {
    "api/**": {
      "runtime": "nodejs20.x",
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "crons": [
    { "path": "/api/cron/nightly", "schedule": "0 7 * * *" }
  ]
}
```

## Edge Config Setup

### Creating Edge Config Store
1. Go to [Vercel Dashboard](https://vercel.com) → Storage → Create Database → Edge Config
2. Name it (e.g., `awwwards-rig-flags`)
3. Connect to your project
4. Copy the connection string to `EDGE_CONFIG` env var

### Default Feature Flags
```json
{
  "enableWebGL": true,
  "webglQuality": "high",
  "enablePostProcessing": true,
  "maxDPR": 2,
  "enableAIChat": true,
  "aiProvider": "anthropic",
  "aiModel": "claude-3-5-sonnet-20241022",
  "maxTokens": 1024,
  "heroVariant": "3d",
  "colorScheme": "auto",
  "enableAnalytics": true,
  "enableErrorReporting": true,
  "maintenanceMode": false,
  "apiRateLimitMultiplier": 1
}
```

### Usage in Code
```typescript
// Single import for all feature flag needs
import { 
  useFeatureFlags,    // React hook for flags
  useABTest,          // A/B testing hook
  useWebGLConfig,     // WebGL config hook
  getFlag,            // Server-side single flag
  getAllFlags,        // Server-side all flags
  getAIConfig         // AI configuration
} from '@/lib/feature-flags'

// React component example
const { flags, loading } = useFeatureFlags() // All flags
const { flags: webgl } = useFeatureFlags('enableWebGL') // Single flag

// Server-side example (middleware/API)
const maintenanceMode = await getFlag('maintenanceMode')
```

### Files
- `/src/lib/feature-flags.ts` - Consolidated feature flag system
- `/MEMORY/edge-config-template.json` - Template for Vercel dashboard

## MCP (Model Context Protocol) Support
Claude Code supports MCP tools if configured. Current available:
- File system operations (Read, Write, Edit, MultiEdit)
- Web fetching and searching
- Task management (TodoWrite)
- Git operations
- IDE diagnostics (if VS Code extension active)

## GitHub Actions Workflow (To Configure)
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run build
```

## AI Assistant Instructions
When working on this project:

1. **Performance First**: Always consider WebGL performance implications
2. **Type Safety**: Ensure all TypeScript types are properly defined
3. **Responsive Design**: Test on mobile, tablet, and desktop viewports
4. **3D Optimizations**: Use instancing, LOD, and texture compression
5. **Accessibility**: Maintain ARIA labels and keyboard navigation
6. **Code Style**: Follow existing patterns in neighboring files
7. **Testing**: Add tests for new features (once configured)
8. **Documentation**: Update MEMORY folder with significant changes

## Quick Debugging
```bash
# Check build errors
npm run build

# Type checking
npm run typecheck

# Lint issues
npm run lint

# Vercel logs
vercel logs

# Check deployment
vercel ls

# Environment info
vercel env ls
```

## Session Context
- Team: kpm34s-projects
- Latest deployment: Check https://awwwards-rig.vercel.app/
- Git branch: main
- Node version: 18-22 (check package.json engines)

## Links & Resources
- [Vercel Dashboard](https://vercel.com/kpm34s-projects/awwwards-rig)
- [Next.js Docs](https://nextjs.org/docs)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Claude Code Docs](https://docs.anthropic.com/en/docs/claude-code)

---
*This file should be updated whenever significant architectural changes occur.*