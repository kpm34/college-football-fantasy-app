# College Football Fantasy App - Product Requirements Document (PRD)

## 1. Product & Compliance Foundations

### 1.1 Executive Summary

A college football fantasy sports platform focused exclusively on the Power 4 conferences (Big 12, ACC, Big Ten, and SEC) with unique gameplay mechanics that emphasize high-stakes matchups and conference rivalries.

### 1.2 Product Goals

- **Primary Goal**: Create an engaging fantasy football platform that capitalizes on the intensity of conference play and marquee matchups
- **Secondary Goals**:
  - Simplify fantasy football by focusing on meaningful games only
  - Build a community around Power 4 conference rivalries
  - Provide real-time scoring and comprehensive commissioner tools
  - Ensure full compliance with NCAA regulations and state gambling laws

### 1.3 User Personas

#### Commissioner
- **Role**: League administrator who sets up and manages leagues
- **Needs**: 
  - Easy league setup with customizable scoring
  - Tools to manage disputes and trades
  - Real-time monitoring capabilities
  - Automated rule enforcement
- **Pain Points**: Complex administration, manual score corrections, rule violations

#### Owner
- **Role**: Active fantasy player who manages a team
- **Needs**:
  - Intuitive draft experience
  - Clear player eligibility indicators
  - Real-time scoring updates
  - Mobile access for lineup changes
- **Pain Points**: Missing lineup deadlines, understanding eligibility rules, delayed scoring

#### Guest
- **Role**: Non-registered visitor exploring the platform
- **Needs**:
  - View public leagues and scores
  - Understand gameplay mechanics
  - Easy registration process
- **Pain Points**: Confusing rules, unclear value proposition

### 1.4 Success Metrics

- **Daily Active Users (DAU)**: Target 50,000 DAU during peak season
- **User Retention**: 
  - Week 1 to Week 2: 80%
  - Season-long: 60%
- **Engagement Metrics**:
  - Trades per week per league: 2.5
  - Lineup changes per owner per week: 3
  - Mobile vs Desktop usage: 60/40 split
- **Revenue Metrics** (if applicable):
  - Premium league conversion rate: 15%
  - Average revenue per user (ARPU): $25/season

### 1.5 Core Gameplay Rules

#### 1.5.1 Conference Restrictions
- **Covered Conferences**: Big 12, ACC, Big Ten, SEC only
- **Player Pool**: Only players from these four conferences are draftable
- **No cross-conference restrictions**: Owners can draft players from any/all four conferences

#### 1.5.2 Season Structure
- **Regular Season Only**: 12-game regular season
- **Excluded Games**: 
  - Conference championship games
  - Bowl games
  - College Football Playoff games
- **Fantasy Playoffs**: Weeks 10-12 (configurable by commissioner)

#### 1.5.3 Player Eligibility Rules
Players can only be started when their upcoming game meets ONE of these criteria:
1. **AP Top-25 Opponent**: The player's team is facing an opponent ranked in the current AP Top-25 poll
2. **Conference Game**: The game is within the player's own conference (e.g., SEC vs SEC)

**Examples**:
- ✅ Alabama (SEC) player vs #15 Tennessee (SEC) - Eligible (both Top-25 AND conference game)
- ✅ Florida (SEC) player vs LSU (SEC) - Eligible (conference game)
- ✅ Michigan (Big Ten) player vs #8 Ohio State (Big Ten) - Eligible (Top-25 opponent)
- ❌ Georgia (SEC) player vs UAB (Conference USA) - Not eligible
- ❌ Texas (SEC) player vs Rice (AAC) - Not eligible

### 1.6 Technical Requirements

#### 1.6.1 Platform Support
- Web application (responsive design)
- iOS native app
- Android native app
- API for third-party integrations

#### 1.6.2 Performance Requirements
- Page load time: < 2 seconds
- Live score update latency: < 30 seconds
- 99.9% uptime during game days

#### 1.6.3 Compliance Requirements
- NCAA name, image, likeness (NIL) compliance
- State-by-state gambling law compliance
- Age verification (18+ or 21+ depending on jurisdiction)
- COPPA compliance for data collection

### 1.7 Data Requirements

#### 1.7.1 Required Data Points
- Team schedules and conference affiliations
- Weekly AP Top-25 rankings
- Real-time game scores and player statistics
- Player rosters and depth charts
- Injury reports

#### 1.7.2 Update Frequencies
- AP Rankings: Weekly (typically Tuesday)
- Game scores: Real-time during games
- Player stats: Real-time during games
- Rosters: Daily during season

### 1.8 MVP Feature Set

1. **User Management**
   - Registration/login with email verification
   - Password reset functionality
   - User profiles with team history

2. **League Management**
   - Create custom leagues (8-12 teams)
   - Scoring system configuration
   - Draft scheduling

3. **Draft Room**
   - Snake draft support
   - Auto-draft functionality
   - Player eligibility indicators

4. **Roster Management**
   - Starting lineup submission
   - Eligibility validation
   - Bench management

5. **Live Scoring**
   - Real-time score updates
   - Play-by-play tracking
   - Push notifications for scoring plays

6. **Commissioner Tools**
   - Manual score adjustments
   - Trade approval/veto
   - League message board

### 1.9 Future Enhancements (Post-MVP)
- Dynasty league support
- Keeper leagues
- Daily fantasy contests
- Advanced analytics and projections
- Social features (trash talk, GIFs)
- Cryptocurrency prize pools
- AI-powered trade suggestions