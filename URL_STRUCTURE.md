# College Football Fantasy App - URL Structure

## Overview
This document outlines the organized URL structure for the College Football Fantasy App, designed for scalability and easy management.

## URL Organization

### 🏠 **Main Pages**
- `/` - Landing page (Home)
- `/about` - About page
- `/contact` - Contact page
- `/help` - Help & FAQ

### 🏈 **League Management**
- `/league/create` - Create new league
- `/league/join` - Join existing leagues
- `/league/manage` - Manage league settings
- `/league/dashboard` - League dashboard
- `/league/settings` - League settings
- `/league/[leagueId]` - Specific league page

### 🎯 **Draft System**
- `/draft/mock` - Mock draft simulator
- `/draft/snake` - Snake draft interface
- `/draft/auction` - Auction draft interface
- `/draft/[leagueId]` - Live draft for specific league
- `/auction/[leagueId]` - Live auction for specific league

### 👥 **Team Management**
- `/team/roster` - Team roster management
- `/team/lineup` - Weekly lineup setting
- `/team/[teamId]` - Specific team page
- `/team/[teamId]/roster` - Team roster
- `/team/[teamId]/lineup` - Team lineup

### 👤 **User Management**
- `/user/profile` - User profile
- `/user/leagues` - User's leagues
- `/user/settings` - User settings
- `/user/[userId]` - Specific user profile

### 📊 **Game & Data**
- `/games` - All games
- `/games/week/[week]` - Games by week
- `/games/eligible` - Eligible games only
- `/rankings` - AP Top 25 rankings
- `/teams` - All teams
- `/stats` - Player statistics

### 🏆 **Season & Playoffs**
- `/season/standings` - Season standings
- `/season/schedule` - Season schedule
- `/playoffs` - Playoff bracket
- `/championship` - Championship game

### 📱 **Mobile & API**
- `/api/*` - API endpoints
- `/mobile/*` - Mobile-specific pages
- `/admin/*` - Admin panel (future)

## URL Patterns

### **RESTful Patterns**
- `/resource` - List all resources
- `/resource/[id]` - Specific resource
- `/resource/[id]/subresource` - Nested resource

### **Action-based Patterns**
- `/action/type` - Perform specific action
- `/action/type/[id]` - Action on specific item

### **Feature-based Patterns**
- `/feature/subfeature` - Organized by feature
- `/feature/subfeature/[id]` - Specific feature item

## Benefits of This Structure

### **1. Scalability**
- Easy to add new features
- Clear separation of concerns
- Modular organization

### **2. SEO Friendly**
- Descriptive URLs
- Logical hierarchy
- Easy to understand

### **3. User Experience**
- Intuitive navigation
- Consistent patterns
- Easy to remember

### **4. Development**
- Clear routing logic
- Easy to maintain
- Organized codebase

## Implementation Notes

### **Current Implementation**
- Python server handles `/league/*` and `/draft/*` routes
- Static HTML files served from `frontend/league/`
- Mock data for testing

### **Future Implementation**
- Next.js App Router for dynamic routing
- Database-driven content
- User authentication
- Real-time features

### **File Organization**
```
frontend/
├── league/
│   ├── start-league.html      → /league/create
│   ├── join-league.html       → /league/join
│   ├── manage-league.html     → /league/manage
│   ├── league-dashboard.html  → /league/dashboard
│   └── league-settings.html   → /league/settings
├── draft/
│   ├── mock-draft.html        → /draft/mock
│   ├── snake-draft.html       → /draft/snake
│   └── auction-draft.html     → /draft/auction
├── team/
│   ├── team-roster.html       → /team/roster
│   └── team-lineup.html       → /team/lineup
└── user/
    ├── user-profile.html      → /user/profile
    └── user-leagues.html      → /user/leagues
```

## Navigation Structure

### **Main Navigation**
- Home
- Leagues
- Draft
- Games
- Rankings

### **User Menu**
- Profile
- My Leagues
- Settings
- Logout

### **League Menu**
- Dashboard
- Roster
- Lineup
- Standings
- Settings

This URL structure provides a solid foundation for scaling the College Football Fantasy App while maintaining excellent user experience and developer productivity. 