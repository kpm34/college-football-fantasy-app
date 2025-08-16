# Developer Tools & Extensions Setup

## ✅ Installed CLI Tools

### Core Development
- **GitHub CLI** (`gh`) - GitHub operations from terminal
- **Vercel CLI** (`vercel`) - Deploy and manage Vercel projects
- **pnpm** - Fast, disk space efficient package manager
- **Turbo** (`turbo`) - Monorepo build system
- **Act** (`act`) - Run GitHub Actions locally

### Code Quality & Formatting
- **Prettier** (`prettier`) - Code formatter
- **ESLint** (`eslint`) - JavaScript linter
- **npm-check-updates** (`ncu`) - Update package.json dependencies

### Testing & Debugging
- **Playwright** - Browser automation and testing
- **Lighthouse CI** (`lhci`) - Performance testing
- **ngrok** - Expose local servers to the internet
- **Sentry CLI** (`sentry-cli`) - Error tracking integration

### Deployment & Infrastructure
- **Netlify CLI** (`netlify`) - Deploy to Netlify
- **Railway CLI** (`railway`) - Deploy to Railway

### Development Utilities
- **nodemon** - Auto-restart Node.js apps
- **concurrently** - Run multiple commands concurrently
- **serve** - Static file serving
- **json-server** - Mock REST API
- **GitHub Copilot CLI** (`github-copilot-cli`) - AI pair programming

## 🤖 Claude API Integration (NEW!)

### Setup Complete
- **API Key**: Configured in `.env.local`
- **SDK**: `@anthropic-ai/sdk` installed
- **Models Available**: Opus, Sonnet 3.5, Haiku
- **Integration**: TypeScript library at `lib/claude.ts`
- **API Endpoint**: `/api/claude` for Next.js
- **React Hook**: `useClaude()` for frontend
- **CLI Tool**: Interactive Claude CLI at `scripts/claude-cli.js`

### Quick Claude Commands
```bash
# Run Claude CLI
node scripts/claude-cli.js

# CLI Commands
/code <description>  # Generate code
/review <file>       # Review code file
/explain <file>      # Explain code
/test <file>         # Generate tests
/docs <file>         # Generate documentation
```

### Claude Usage Examples
```typescript
// Using Claude in your app
import { generateText, generateCode, analyzeCode } from '@/lib/claude';

// Generate text
const response = await generateText('Explain React hooks');

// Generate code
const code = await generateCode('Create a user authentication hook', 'typescript');

// Analyze code
const review = await analyzeCode(yourCode, 'review');
```

## 🎨 Figma Dev Mode Integration (NEW!)

### Setup Complete
- **Figma Code Connect** - Installed globally
- **API Integration** - TypeScript library at `lib/figma.ts`
- **Sync Tool** - `scripts/figma-sync.js` for design-to-code sync
- **Config File** - `figma.config.json` for settings
- **Token Support** - Design tokens extraction

### Figma Setup Instructions
1. Get your Figma access token: https://www.figma.com/developers/api#access-tokens
2. Add to `.env.local`:
   ```
   FIGMA_ACCESS_TOKEN=your_token_here
   FIGMA_FILE_ID=your_file_id_here
   ```
3. Find your file ID in Figma URL: `figma.com/file/[FILE_ID]/name`

### Figma Commands
```bash
# Sync all design assets
node scripts/figma-sync.js all

# Sync specific elements
node scripts/figma-sync.js colors      # Sync color tokens
node scripts/figma-sync.js typography  # Sync text styles
node scripts/figma-sync.js components  # Generate components
node scripts/figma-sync.js assets      # Export images

# Code Connect (link components)
figma connect create
figma connect publish
```

### Figma Features
- **Design Tokens** - Auto-extract colors, typography, spacing
- **Component Generation** - Convert Figma components to React
- **Asset Export** - Export images and icons
- **Code Connect** - Link code to Figma designs
- **Dev Mode** - See CSS, measurements, assets in Figma
- **Style Dictionary** - Transform tokens to multiple formats

## 📦 Free Services to Add

### AI & Design Tools
1. **Claude (Anthropic)** - ✅ CONFIGURED with API key
2. **Figma Dev Mode** - ✅ CONFIGURED with sync tools
3. **Cursor** - AI-powered code editor (installed)
4. **Spline** - 3D design tool (web-based)
5. **Meshy** - 3D model generation (web-based)
6. **v0.dev** - UI component generation by Vercel

### Database & Backend
1. **Appwrite** - Backend as a Service (already configured)
2. **PlanetScale** - Serverless MySQL (free tier)
3. **Upstash** - Serverless Redis (free tier)
4. **Neon** - Serverless Postgres (free tier)

### Monitoring & Analytics
1. **Vercel Analytics** - Built into Vercel
2. **Posthog** - Product analytics (free tier)
3. **LogRocket** - Session replay (free tier)
4. **Checkly** - API monitoring (free tier)

### Authentication & Security
1. **Clerk** - Authentication (free tier)
2. **Auth0** - Authentication (free tier)
3. **Snyk** - Security scanning (free tier)

### CI/CD & DevOps
1. **GitHub Actions** - CI/CD (free for public repos)
2. **Chromatic** - Visual testing for Storybook
3. **Codecov** - Code coverage reporting

## 🎯 Quick Commands Reference

```bash
# Development
npm run dev                    # Start Next.js dev server
vercel dev                     # Start Vercel dev environment
ngrok http 3001               # Expose local server

# Code Quality
prettier --write .            # Format all files
eslint . --fix               # Fix linting issues
ncu -u                       # Update dependencies

# Testing
npx playwright test          # Run Playwright tests
lhci autorun                 # Run Lighthouse CI

# Deployment
vercel                       # Deploy to Vercel (preview)
vercel --prod               # Deploy to production
netlify deploy              # Deploy to Netlify

# Git & GitHub
gh pr create                # Create pull request
gh issue list              # List issues
gh repo clone              # Clone repository

# Utilities
turbo run build            # Build with Turbo
act                        # Run GitHub Actions locally
railway up                 # Deploy to Railway
```

## 🚀 VS Code Extensions (Free)

Install these extensions in VS Code for enhanced development:

1. **GitHub Copilot** - AI pair programming
2. **Prettier** - Code formatter
3. **ESLint** - Linting
4. **Tailwind CSS IntelliSense** - Tailwind autocomplete
5. **Thunder Client** - API testing
6. **GitLens** - Git supercharged
7. **Error Lens** - Inline error highlighting
8. **Import Cost** - Display import sizes
9. **Better Comments** - Colorized comments
10. **TODO Highlight** - Highlight TODOs

## 🔧 Browser Extensions

1. **React Developer Tools**
2. **Redux DevTools**
3. **Wappalyzer** - Identify technologies
4. **JSON Viewer**
5. **Lighthouse** - Performance auditing

## 📝 Configuration Files

Create these config files in your project root:

### .prettierrc
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### .eslintrc.json
```json
{
  "extends": ["next/core-web-vitals", "prettier"],
  "rules": {
    "react/no-unescaped-entities": "off"
  }
}
```

## 🎨 Free Resources

### Icons & Images
- **Heroicons** - Beautiful hand-crafted SVG icons
- **Unsplash** - Free stock photos
- **Pexels** - Free stock photos and videos
- **unDraw** - Open-source illustrations

### Fonts
- **Google Fonts** - Free web fonts
- **Fontsource** - Self-host open source fonts

### UI Libraries
- **shadcn/ui** - Copy-paste React components
- **Headless UI** - Unstyled, accessible UI components
- **Radix UI** - Low-level UI primitives

### Animation
- **Framer Motion** - Production-ready animation library
- **Lottie** - Render After Effects animations
- **Auto-Animate** - Zero-config animation utility

## 💡 Pro Tips

1. Use `npx` for one-time commands to avoid global installs
2. Set up aliases in your shell for frequently used commands
3. Use `vercel env pull` to sync environment variables
4. Configure Husky for pre-commit hooks
5. Use GitHub Codespaces for cloud development (free tier)

## 🔄 Keep Tools Updated

```bash
# Update global npm packages
npm update -g

# Update Homebrew packages
brew update && brew upgrade

# Update VS Code extensions
code --list-extensions | xargs -L 1 code --install-extension
```

---

*Last updated: January 2025*