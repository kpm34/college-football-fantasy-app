# Page Audit Report - December 2024

## Overview
This report identifies duplicate and potentially obsolete pages in the app directory.

## Duplicate Pages Found

### 1. Conference Showcase Pages
- **Active**: `/conference-showcase` - Used by main page navigation
- **Duplicate**: `/conference-showcase-2` - Not linked anywhere
- **Recommendation**: DELETE `/conference-showcase-2`

### 2. Scoreboard Pages  
- **Fantasy Scoreboard (league)**: `/league/[leagueId]/scoreboard` - Shows fantasy matchups for the league
- **CFB Scoreboard (global)**: `/scoreboard` - Shows real-world CFB games for the current week
- **Recommendation**: KEEP BOTH (serve different purposes)

### 3. Standings Pages
- **League Standings**: `/league/[leagueId]/standings` - Standings within a specific league  
- **Global Standings**: `/standings` - Conference-wide or national team standings
- **Recommendation**: KEEP BOTH (different scopes)

### 4. Draft Pages
- **Main draft page**: `/draft/[leagueId]/page.tsx` - Primary draft interface
- **Duplicate draft-room**: `/draft/[leagueId]/draft-room/page.tsx` - Identical content
- **Draft board**: `/draft/[leagueId]/draft-board/page.tsx` - May be different view
- **Realtime draft**: `/draft/[leagueId]/realtime/page.tsx` - May be for live updates
- **Recommendation**: 
  - DELETE `/draft/[leagueId]/draft-room` (duplicate)
  - INVESTIGATE `/draft/[leagueId]/draft-board` and `/draft/[leagueId]/realtime` before deciding

### 5. Test Pages
- `/test-cors` - Development testing page
- `/test-sentry` - Error monitoring test page  
- **Recommendation**: KEEP for now (useful for development/debugging)

## Pages to Keep
- All `/admin/*` pages - Administrative functions
- `/account/settings` - User settings
- `/auction/[leagueId]` - Auction draft feature
- `/dashboard` - User dashboard
- `/invite/[leagueId]` - League invitations
- `/launch` - App launch/landing page
- All `/league/*` pages (except duplicates noted above)
- `/login` and `/signup` - Authentication
- `/offline` - PWA offline page
- `/draft/mock` - Mock draft practice

## Action Items
1. Delete confirmed duplicates
2. Investigate draft subdirectory pages before deletion
3. Update any navigation that might reference deleted pages
4. Run build to ensure no broken imports
