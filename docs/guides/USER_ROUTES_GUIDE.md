# College Football Fantasy App - User Routes Guide

This guide provides a complete overview of all user-facing pages in the College Football Fantasy App. These are the URLs that users can navigate to directly in their browser.

## Public Pages (No Login Required)

### Homepage & Marketing
- **`/`** - Homepage with app overview and features
- **`/launch`** - Launch page with early access information
- **`/conference-showcase`** - Browse all Power 4 conference teams
- **`/projection-showcase`** - View player projections and rankings

### Authentication
- **`/login`** - Sign in to your account
- **`/signup`** - Create a new account
- **`/login/oauth-success`** - OAuth callback page (automatic redirect)

### Help & Resources
- **`/videos`** - Video tutorial library
- **`/videos/guide`** - Getting started video guide
- **`/videos/[program]`** - Team-specific video content (e.g., `/videos/alabama`)
- **`/offline`** - Offline fallback page

## Dashboard Pages (Login Required)

### Main Dashboard
- **`/dashboard`** - Your personal dashboard with league overview

### Account Management
- **`/account/settings`** - Update profile and preferences

### Global Views
- **`/scoreboard`** - Live scores across all leagues
- **`/standings`** - Overall standings and leaderboards

## League Management

### Creating & Joining
- **`/league/create`** - Create a new fantasy league
- **`/league/join`** - Browse and join existing leagues
- **`/invite/[leagueId]`** - Accept league invitation (e.g., `/invite/abc123`)

### League Pages
- **`/league/[leagueId]`** - League home page (e.g., `/league/my-league-123`)
- **`/league/[leagueId]/locker-room`** - Manage your team roster
- **`/league/[leagueId]/schedule`** - View matchup schedule
- **`/league/[leagueId]/scoreboard`** - Live league scores
- **`/league/[leagueId]/standings`** - League standings
- **`/league/[leagueId]/commissioner`** - Commissioner tools (commissioners only)

## Draft Pages

### Live Drafts
- **`/draft/[leagueId]`** - Enter live draft room (e.g., `/draft/my-league-123`)

### Mock Drafts
- **`/draft/mock`** - Set up a practice mock draft
- **`/mock-draft/[draftId]`** - Mock draft room (e.g., `/mock-draft/mock-123`)
- **`/mock-draft/[draftId]/results`** - View mock draft results

## Admin Pages (Admin Access Only)

### Admin Dashboard
- **`/admin`** - Admin control panel
- **`/admin/cache-status`** - Monitor cache performance
- **`/admin/sync-status`** - Data synchronization status
- **`/admin/sec-survey`** - SEC player survey tool

### Project Visualization
- **`/admin/project-map`** - Interactive project structure
- **`/admin/project-map/[root]`** - Navigate project folders
- **`/admin/project-map/[root]/[group]`** - Drill into specific areas
- **`/admin/project-map/[root]/[group]/[sub]`** - Detailed component views
- **`/admin/project-map/app/[group]`** - Application structure

## URL Patterns Explained

### Dynamic Routes
Routes with `[brackets]` are dynamic and accept different values:
- `[leagueId]` - Your league's unique identifier
- `[draftId]` - Draft session identifier
- `[program]` - College team name (e.g., alabama, ohio-state)
- `[root]`, `[group]`, `[sub]` - Project navigation paths

### Examples
- League page: `/league/power4-dynasty-2025`
- Draft room: `/draft/power4-dynasty-2025`
- Team video: `/videos/georgia`
- Invitation: `/invite/power4-dynasty-2025`

## Navigation Tips

1. **Bookmarks**: Save your league URLs for quick access
2. **Share Links**: Use invite links to bring friends to your league
3. **Direct Access**: Most pages can be accessed directly if you know the URL
4. **Protected Routes**: Dashboard and league pages require login
5. **Mobile Friendly**: All pages work on mobile devices

## Common User Flows

### New User
1. Start at `/` (homepage)
2. Click "Sign Up" → `/signup`
3. After signup → `/dashboard`
4. Create or join league → `/league/create` or `/league/join`

### Returning User
1. Go to `/login`
2. Sign in → `/dashboard`
3. Select league → `/league/[your-league-id]`
4. Draft day → `/draft/[your-league-id]`

### Invited User
1. Receive invite link → `/invite/[leagueId]`
2. Sign up/login if needed
3. Automatically join league → `/league/[leagueId]`

## Need Help?
- Check out `/videos/guide` for a complete walkthrough
- Visit `/videos` for topic-specific tutorials
- Contact support through the app's help section