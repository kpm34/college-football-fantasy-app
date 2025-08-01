# 🚀 Cursor AI Prompts for College Football Fantasy App

Copy and paste these prompts into Cursor to quickly build features!

## 🏈 Game Components

### 1. Games List Component
```
Create a GamesList component that:
- Fetches games from our API using /lib/api.ts
- Shows games in a responsive grid
- Highlights eligible games with a golden border
- Shows live scores with green text
- Uses dark theme with Tailwind
- Has loading and error states
```

### 2. Live Game Tracker
```
Create a LiveGameTracker component that:
- Polls /api/games every 30 seconds for live games
- Shows score updates with animations
- Displays game clock and quarter
- Has a pulsing indicator for games in progress
- Uses our Game type from lib/api.ts
```

## 🏆 Rankings & Eligibility

### 3. AP Rankings Display
```
Create an APRankings component that:
- Fetches current rankings from /api/rankings
- Shows rank, team name, and conference
- Highlights Power 4 teams (SEC, ACC, Big 12, Big Ten)
- Has a search filter
- Uses a table layout with hover effects
```

### 4. Eligibility Checker
```
Create an EligibilityChecker component that:
- Has two dropdowns for selecting teams
- Calls /api/eligibility/check
- Shows if the matchup is eligible and why
- Displays with green checkmark or red X
- Uses our Team type for dropdowns
```

## 🎨 Spline 3D Components

### 5. 3D Hero Section
```
Update the homepage hero to:
- Load a Spline scene with proper error handling
- Have the 3D scene as a background (opacity 0.5)
- Keep text content in front with z-index
- Add a loading shimmer effect
- Make it responsive on mobile
```

### 6. 3D Conference Logos
```
Create a ConferenceLogos3D component that:
- Displays 4 floating 3D logos using Spline
- Rotates continuously
- Is clickable to filter teams by conference
- Has hover effects
- Falls back to 2D logos if 3D fails to load
```

## 🔐 Authentication

### 7. Login/Register Form
```
Create an AuthForm component that:
- Has tabs for Login and Register
- Integrates with Appwrite auth
- Shows password requirements
- Has social login buttons (styled but not functional yet)
- Uses Tailwind forms plugin styling
- Redirects to dashboard on success
```

### 8. User Dashboard
```
Create a Dashboard page that:
- Shows user's leagues in cards
- Has a "Create League" button
- Shows upcoming games for user's players
- Displays current week number
- Has a sidebar with navigation
```

## 📊 League Features

### 9. Create League Form
```
Create a CreateLeagueForm that:
- Has fields for league name, size, scoring type
- Sets draft date with a date picker
- Generates a shareable invite code
- Shows league settings preview
- Submits to our backend (stub for now)
```

### 10. Draft Board
```
Create a DraftBoard component that:
- Shows a grid of available players
- Has filters by position and team
- Shows player eligibility status
- Has a timer component
- Updates in real-time (use mock data)
- Integrates with Spline for 3D effects
```

## 🛠️ Utility Components

### 11. Error Boundary
```
Create an ErrorBoundary component that:
- Catches React errors
- Shows a football-themed error page
- Has a "Return to Home" button
- Logs errors to console
- Uses our dark theme
```

### 12. Loading Skeleton
```
Create a GameSkeleton component that:
- Matches the shape of our Game cards
- Has animated shimmer effect
- Can show multiple skeletons
- Uses Tailwind's animate-pulse
- Accepts a count prop
```

## 💡 Pro Tips for Cursor

1. **Reference files**: Use @ to reference files
   - "@/lib/api.ts can you update this to add league endpoints?"

2. **Multi-file edits**: Ask to update multiple files
   - "Update both the API and the component to add pagination"

3. **Style consistency**: Always mention Tailwind and dark theme
   - "Make sure to use our dark theme colors from globals.css"

4. **Type safety**: Ask for proper TypeScript types
   - "Make sure all props have proper TypeScript interfaces"

5. **Context awareness**: Reference our project structure
   - "Following our pattern in /components, create a new feature"

## 🎯 Full Page Prompts

### Homepage Redesign
```
Redesign the homepage to have:
1. Spline 3D hero section with animated stadium
2. Feature cards with hover animations
3. Live games ticker at the top
4. Conference filter buttons
5. Call-to-action for creating/joining leagues
6. Footer with links
Use our existing API from lib/api.ts and dark theme
```

### Complete Dashboard
```
Create a full dashboard page with:
1. Sidebar with user info and navigation
2. Main area showing user's leagues
3. Upcoming games for user's players
4. Quick stats (wins, losses, points)
5. Notifications panel
6. Mobile responsive with collapsible sidebar
```

---

Remember: The more specific you are with Cursor, the better the results!