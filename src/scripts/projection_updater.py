#!/usr/bin/env python3
"""
College Football Fantasy Projection Updater
Automated script to update weekly projections and season totals

Formula: proj_fantasy_pts = pace * share * ppa
- pace = plays_per_game(team) from CFBD stats
- share = usage_rate(player,pos) from last year's data
- ppa = predicted_points * multiplier[pos] from odds data

Runs every 12 hours via GitHub Actions cron
"""

import os
import json
import requests
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import time

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuration
CFBD_API_KEY = os.getenv('CFBD_API_KEY', '')
ODDS_API_KEY = os.getenv('ODDS_API_KEY', '')
APPWRITE_ENDPOINT = os.getenv('APPWRITE_ENDPOINT', 'https://cloud.appwrite.io/v1')
APPWRITE_PROJECT_ID = os.getenv('APPWRITE_PROJECT_ID', '688ccd49002eacc6c020')
APPWRITE_API_KEY = os.getenv('APPWRITE_API_KEY', '')

# Fantasy point multipliers by position
POSITION_MULTIPLIERS = {
    'QB': {
        'passing_yards': 0.04,
        'passing_touchdowns': 4.0,
        'interceptions': -2.0,
        'rushing_yards': 0.1,
        'rushing_touchdowns': 6.0
    },
    'RB': {
        'rushing_yards': 0.1,
        'rushing_touchdowns': 6.0,
        'receiving_yards': 0.1,
        'receiving_touchdowns': 6.0,
        'receptions': 1.0  # PPR
    },
    'WR': {
        'receiving_yards': 0.1,
        'receiving_touchdowns': 6.0,
        'receptions': 1.0  # PPR
    },
    'TE': {
        'receiving_yards': 0.1,
        'receiving_touchdowns': 6.0,
        'receptions': 1.0  # PPR
    },
    'K': {
        'field_goals': 3.0,
        'extra_points': 1.0
    },
    'DEF': {
        'sacks': 1.0,
        'interceptions': 2.0,
        'fumble_recoveries': 2.0,
        'safeties': 2.0,
        'touchdowns': 6.0,
        'points_allowed_0': 10.0,
        'points_allowed_1_6': 7.0,
        'points_allowed_7_13': 4.0,
        'points_allowed_14_20': 1.0,
        'points_allowed_21_27': 0.0,
        'points_allowed_28_34': -1.0,
        'points_allowed_35_plus': -4.0
    }
}

class ProjectionUpdater:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'X-Appwrite-Project': APPWRITE_PROJECT_ID,
            'X-Appwrite-Key': APPWRITE_API_KEY,
            'Content-Type': 'application/json'
        })
        
    def get_team_pace(self, team_id: str, year: int = 2024) -> float:
        """Get team's plays per game from CFBD API"""
        try:
            url = f"https://api.collegefootballdata.com/stats/player/season"
            params = {
                'year': year,
                'team': team_id,
                'category': 'plays'
            }
            if CFBD_API_KEY:
                params['key'] = CFBD_API_KEY
                
            response = self.session.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data:
                total_plays = sum(player.get('stat', 0) for player in data)
                games_played = len(set(player.get('gameId', 0) for player in data))
                return total_plays / games_played if games_played > 0 else 70.0  # Default pace
            return 70.0  # Default if no data
            
        except Exception as e:
            logger.error(f"Error getting team pace for {team_id}: {e}")
            return 70.0  # Default pace
    
    def get_player_usage_share(self, player_id: str, position: str) -> float:
        """Get player's usage share from last year's data"""
        try:
            # Query Appwrite for player's historical usage
            url = f"{APPWRITE_ENDPOINT}/databases/college_fantasy/collections/player_stats/documents"
            params = {
                'queries': [
                    f'equal("player_id", "{player_id}")',
                    'equal("season", 2024)'
                ]
            }
            
            response = self.session.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data.get('documents'):
                # Calculate usage share based on position
                player_stats = data['documents'][0]
                if position == 'QB':
                    # QB usage is typically 100% when they play
                    return 1.0
                elif position in ['RB', 'WR', 'TE']:
                    # Calculate touch/target share
                    touches = player_stats.get('rushing_attempts', 0) + player_stats.get('receptions', 0)
                    team_touches = player_stats.get('team_total_touches', 100)  # Default
                    return min(touches / team_touches, 0.4) if team_touches > 0 else 0.1
                else:
                    return 0.1  # Default for K/DEF
            
            return 0.1  # Default usage share
            
        except Exception as e:
            logger.error(f"Error getting usage share for player {player_id}: {e}")
            return 0.1  # Default usage share
    
    def get_odds_data(self, team: str, opponent: str) -> Dict:
        """Get betting odds data for game prediction"""
        try:
            if not ODDS_API_KEY:
                logger.warning("No odds API key provided, using default predictions")
                return {
                    'team_implied_points': 28.0,
                    'opponent_implied_points': 24.0,
                    'over_under': 52.0,
                    'spread': 4.0
                }
            
            # This would integrate with an odds API like OddsAPI.io
            # For now, return default predictions
            return {
                'team_implied_points': 28.0,
                'opponent_implied_points': 24.0,
                'over_under': 52.0,
                'spread': 4.0
            }
            
        except Exception as e:
            logger.error(f"Error getting odds data: {e}")
            return {
                'team_implied_points': 28.0,
                'opponent_implied_points': 24.0,
                'over_under': 52.0,
                'spread': 4.0
            }
    
    def calculate_weekly_projection(self, player: Dict, week: int, opponent: str) -> Dict:
        """Calculate weekly fantasy projection using the exact formula:
        proj_pts_week = (
            base_usage(player, pos)          # touches or target share
            × pace_factor(team, opp)         # plays per game adjustment
            × team_implied_pts(opp_line)     # from Vegas O/U & spread
            × fantasy_multiplier(pos)        # 1 pt/10 yd, 6 per TD, etc.
        ) ± injury_dampener
        """
        try:
            position = player.get('pos', 'QB')
            team = player.get('team', '')
            
            # Get base usage (touches or target share)
            base_usage = self.get_player_usage_share(player.get('player_id', ''), position)
            
            # Get pace factor (plays per game adjustment)
            pace_factor = self.get_team_pace(team) / 70.0  # Normalize to 70 plays per game
            
            # Get team implied points from Vegas odds
            odds_data = self.get_odds_data(team, opponent)
            team_implied_pts = odds_data['team_implied_points']
            
            # Get fantasy multiplier for position
            fantasy_multiplier = self.get_fantasy_multiplier(position)
            
            # Apply formula
            proj_pts_week = base_usage * pace_factor * team_implied_pts * fantasy_multiplier
            
            # Apply injury dampener
            injury_status = player.get('injury_status', 'healthy')
            if injury_status != 'healthy':
                proj_pts_week *= 0.7  # 30% reduction for injured players
            
            # Apply adjustments
            is_conf_game = self.is_conference_game(team, opponent)
            is_top25_opp = self.is_top25_opponent(opponent)
            
            # Conference game bonus
            if is_conf_game:
                proj_fantasy_pts *= 1.1
            
            # Top 25 opponent adjustment
            if is_top25_opp:
                proj_fantasy_pts *= 0.9  # Slightly harder matchup
            
            # Injury adjustment
            injury_status = player.get('injury_status', 'healthy')
            if injury_status != 'healthy':
                proj_fantasy_pts *= 0.7
            
            return {
                'player_id': player.get('player_id'),
                'week': week,
                'opponent': opponent,
                'is_conf_game': is_conf_game,
                'is_top25_opp': is_top25_opp,
                'proj_fantasy_pts': round(proj_fantasy_pts, 1),
                'pace': round(pace, 1),
                'share': round(share, 3),
                'ppa': round(ppa, 1),
                'confidence': 75,  # Default confidence
                'notes': f"Based on {team} vs {opponent} - {odds_data['over_under']} O/U",
                'last_updated': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error calculating projection for player {player.get('name', 'Unknown')}: {e}")
            return None
    
    def is_conference_game(self, team: str, opponent: str) -> bool:
        """Check if game is a conference game"""
        # This would check against conference data
        # For now, return True for Power 4 teams
        power4_teams = ['Alabama', 'Georgia', 'Ohio State', 'Michigan', 'Texas', 'Oklahoma']
        return team in power4_teams and opponent in power4_teams
    
    def is_top25_opponent(self, opponent: str) -> bool:
        """Check if opponent is in AP Top 25"""
        # This would check against current rankings
        # For now, return False
        return False
    
    def get_all_players(self) -> List[Dict]:
        """Get all draftable players from Appwrite"""
        try:
            url = f"{APPWRITE_ENDPOINT}/databases/college_fantasy/collections/players/documents"
            params = {
                'queries': [
                    'equal("eligibility", true)'
                ]
            }
            
            response = self.session.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            return data.get('documents', [])
            
        except Exception as e:
            logger.error(f"Error getting players: {e}")
            return []
    
    def get_weekly_schedule(self, week: int) -> Dict[str, str]:
        """Get weekly schedule to determine opponents"""
        try:
            # This would fetch from CFBD API or Appwrite
            # For now, return sample schedule
            return {
                'Alabama': 'Texas A&M',
                'Georgia': 'Florida',
                'Ohio State': 'Michigan',
                'Texas': 'Oklahoma'
            }
            
        except Exception as e:
            logger.error(f"Error getting schedule for week {week}: {e}")
            return {}
    
    def update_weekly_projection(self, projection: Dict) -> bool:
        """Upsert weekly projection to Appwrite"""
        try:
            url = f"{APPWRITE_ENDPOINT}/databases/college_fantasy/collections/weekly_projections/documents"
            
            # Check if projection already exists
            existing_url = f"{APPWRITE_ENDPOINT}/databases/college_fantasy/collections/weekly_projections/documents"
            params = {
                'queries': [
                    f'equal("player_id", "{projection["player_id"]}")',
                    f'equal("week", {projection["week"]})'
                ]
            }
            
            response = self.session.get(existing_url, params=params)
            response.raise_for_status()
            existing_data = response.json()
            
            if existing_data.get('documents'):
                # Update existing
                doc_id = existing_data['documents'][0]['$id']
                update_url = f"{url}/{doc_id}"
                response = self.session.put(update_url, json=projection)
            else:
                # Create new
                response = self.session.post(url, json=projection)
            
            response.raise_for_status()
            return True
            
        except Exception as e:
            logger.error(f"Error updating weekly projection: {e}")
            return False
    
    def update_season_projection(self, player_id: str) -> bool:
        """Re-aggregate season projection from weekly projections"""
        try:
            # Get all weekly projections for player
            url = f"{APPWRITE_ENDPOINT}/databases/college_fantasy/collections/weekly_projections/documents"
            params = {
                'queries': [
                    f'equal("player_id", "{player_id}")'
                ]
            }
            
            response = self.session.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if not data.get('documents'):
                return False
            
            weekly_projections = data['documents']
            
            # Calculate season totals
            total_proj_pts = sum(p.get('proj_fantasy_pts', 0) for p in weekly_projections)
            ceiling = max(p.get('proj_fantasy_pts', 0) for p in weekly_projections) * 12  # Best week * 12
            floor = min(p.get('proj_fantasy_pts', 0) for p in weekly_projections) * 12  # Worst week * 12
            
            # Determine risk level
            variance = sum((p.get('proj_fantasy_pts', 0) - total_proj_pts/len(weekly_projections))**2 for p in weekly_projections)
            risk = 'high' if variance > 50 else 'medium' if variance > 20 else 'low'
            
            season_projection = {
                'player_id': player_id,
                'proj_pts_total': round(total_proj_pts, 1),
                'ceiling': round(ceiling, 1),
                'floor': round(floor, 1),
                'risk': risk,
                'confidence': 80,
                'notes': f"Based on {len(weekly_projections)} weekly projections",
                'last_updated': datetime.utcnow().isoformat()
            }
            
            # Upsert season projection
            season_url = f"{APPWRITE_ENDPOINT}/databases/college_fantasy/collections/season_projection/documents"
            
            # Check if exists
            existing_response = self.session.get(season_url, params={'queries': [f'equal("player_id", "{player_id}")']})
            existing_data = existing_response.json()
            
            if existing_data.get('documents'):
                doc_id = existing_data['documents'][0]['$id']
                update_url = f"{season_url}/{doc_id}"
                response = self.session.put(update_url, json=season_projection)
            else:
                response = self.session.post(season_url, json=season_projection)
            
            response.raise_for_status()
            return True
            
        except Exception as e:
            logger.error(f"Error updating season projection for player {player_id}: {e}")
            return False
    
    def run_update(self, week: int = 1):
        """Main update function"""
        logger.info(f"Starting projection update for week {week}")
        
        try:
            # Get all players
            players = self.get_all_players()
            logger.info(f"Found {len(players)} players to update")
            
            # Get weekly schedule
            schedule = self.get_weekly_schedule(week)
            
            # Update weekly projections
            updated_count = 0
            for player in players:
                team = player.get('team', '')
                opponent = schedule.get(team, 'TBD')
                
                if opponent != 'TBD':
                    projection = self.calculate_weekly_projection(player, week, opponent)
                    if projection and self.update_weekly_projection(projection):
                        updated_count += 1
                        
                        # Update season projection
                        self.update_season_projection(player.get('player_id'))
                
                # Rate limiting
                time.sleep(0.1)
            
            logger.info(f"Updated {updated_count} weekly projections")
            
            # Update meta information
            meta = {
                'generated_at': datetime.utcnow().isoformat(),
                'source_sha': 'projection-updater-v1.0',
                'data_sources': ['CFBD', 'OddsAPI', 'Appwrite'],
                'confidence_score': 85
            }
            
            logger.info("Projection update completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error in projection update: {e}")
            return False

def main():
    """Main entry point"""
    updater = ProjectionUpdater()
    
    # Get current week (you might want to calculate this based on season start)
    current_week = 1
    
    success = updater.run_update(current_week)
    
    if success:
        logger.info("✅ Projection update completed successfully")
        exit(0)
    else:
        logger.error("❌ Projection update failed")
        exit(1)

if __name__ == "__main__":
    main() 