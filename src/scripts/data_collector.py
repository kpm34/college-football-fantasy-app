#!/usr/bin/env python3
"""
College Football Fantasy Data Collector
Follows the 4-step process for collecting player data:

Step 1: CollegeFootballData /roster?team=... → Official player list + IDs
Step 2: CFBD /player/stats?year=2024&team=... → Last-season stats
Step 3: Compute fantasy points (standard scoring) → rank inside each team/position
Step 4: Persist the N best per spec (2 QB, 3 RB, ...) into players collection
"""

import os
import json
import requests
import logging
from datetime import datetime
from typing import Dict, List, Optional
import time

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuration
CFBD_API_KEY = os.getenv('CFBD_API_KEY', '')
APPWRITE_ENDPOINT = os.getenv('APPWRITE_ENDPOINT', 'https://cloud.appwrite.io/v1')
APPWRITE_PROJECT_ID = os.getenv('APPWRITE_PROJECT_ID', '688ccd49002eacc6c020')
APPWRITE_API_KEY = os.getenv('APPWRITE_API_KEY', '')

# Power 4 Teams (SEC, ACC, Big 12, Big Ten)
POWER_4_TEAMS = {
    'SEC': [
        'Alabama', 'Arkansas', 'Auburn', 'Florida', 'Georgia', 'Kentucky',
        'LSU', 'Mississippi State', 'Missouri', 'Ole Miss', 'South Carolina',
        'Tennessee', 'Texas A&M', 'Vanderbilt'
    ],
    'ACC': [
        'Boston College', 'Clemson', 'Duke', 'Florida State', 'Georgia Tech',
        'Louisville', 'Miami (FL)', 'NC State', 'North Carolina', 'Pittsburgh',
        'Syracuse', 'Virginia', 'Virginia Tech', 'Wake Forest'
    ],
    'Big 12': [
        'Baylor', 'BYU', 'Cincinnati', 'Houston', 'Iowa State', 'Kansas',
        'Kansas State', 'Oklahoma', 'Oklahoma State', 'TCU', 'Texas',
        'Texas Tech', 'UCF', 'West Virginia'
    ],
    'Big Ten': [
        'Illinois', 'Indiana', 'Iowa', 'Maryland', 'Michigan', 'Michigan State',
        'Minnesota', 'Nebraska', 'Northwestern', 'Ohio State', 'Penn State',
        'Purdue', 'Rutgers', 'Wisconsin'
    ]
}

# Position limits per team
POSITION_LIMITS = {
    'QB': 2,
    'RB': 3,
    'WR': 4,
    'TE': 2,
    'K': 1,
    'DEF': 1
}

# Fantasy point multipliers
FANTASY_MULTIPLIERS = {
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

class DataCollector:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'X-Appwrite-Project': APPWRITE_PROJECT_ID,
            'X-Appwrite-Key': APPWRITE_API_KEY,
            'Content-Type': 'application/json'
        })
        
    def get_team_roster(self, team: str) -> List[Dict]:
        """Step 1: Get official player list + IDs from CFBD"""
        try:
            url = "https://api.collegefootballdata.com/roster"
            params = {
                'team': team,
                'year': 2025  # Current season
            }
            if CFBD_API_KEY:
                params['key'] = CFBD_API_KEY
                
            response = self.session.get(url, params=params)
            response.raise_for_status()
            roster = response.json()
            
            logger.info(f"Retrieved {len(roster)} players from {team} roster")
            return roster
            
        except Exception as e:
            logger.error(f"Error getting roster for {team}: {e}")
            return []
    
    def get_player_stats(self, team: str, year: int = 2024) -> List[Dict]:
        """Step 2: Get last-season stats from CFBD"""
        try:
            url = "https://api.collegefootballdata.com/stats/player/season"
            params = {
                'year': year,
                'team': team
            }
            if CFBD_API_KEY:
                params['key'] = CFBD_API_KEY
                
            response = self.session.get(url, params=params)
            response.raise_for_status()
            stats = response.json()
            
            logger.info(f"Retrieved {len(stats)} player stats from {team} ({year})")
            return stats
            
        except Exception as e:
            logger.error(f"Error getting stats for {team}: {e}")
            return []
    
    def calculate_fantasy_points(self, player_stats: Dict, position: str) -> float:
        """Step 3: Compute fantasy points using standard scoring"""
        try:
            multipliers = FANTASY_MULTIPLIERS.get(position, {})
            fantasy_points = 0.0
            
            if position == 'QB':
                # Passing stats
                fantasy_points += player_stats.get('passingYards', 0) * multipliers['passing_yards']
                fantasy_points += player_stats.get('passingTouchdowns', 0) * multipliers['passing_touchdowns']
                fantasy_points += player_stats.get('interceptions', 0) * multipliers['interceptions']
                
                # Rushing stats
                fantasy_points += player_stats.get('rushingYards', 0) * multipliers['rushing_yards']
                fantasy_points += player_stats.get('rushingTouchdowns', 0) * multipliers['rushing_touchdowns']
                
            elif position in ['RB', 'WR', 'TE']:
                # Rushing stats
                fantasy_points += player_stats.get('rushingYards', 0) * multipliers['rushing_yards']
                fantasy_points += player_stats.get('rushingTouchdowns', 0) * multipliers['rushing_touchdowns']
                
                # Receiving stats
                fantasy_points += player_stats.get('receivingYards', 0) * multipliers['receiving_yards']
                fantasy_points += player_stats.get('receivingTouchdowns', 0) * multipliers['receiving_touchdowns']
                fantasy_points += player_stats.get('receptions', 0) * multipliers['receptions']
                
            elif position == 'K':
                fantasy_points += player_stats.get('fieldGoals', 0) * multipliers['field_goals']
                fantasy_points += player_stats.get('extraPoints', 0) * multipliers['extra_points']
                
            elif position == 'DEF':
                fantasy_points += player_stats.get('sacks', 0) * multipliers['sacks']
                fantasy_points += player_stats.get('interceptions', 0) * multipliers['interceptions']
                fantasy_points += player_stats.get('fumbleRecoveries', 0) * multipliers['fumble_recoveries']
                fantasy_points += player_stats.get('safeties', 0) * multipliers['safeties']
                fantasy_points += player_stats.get('touchdowns', 0) * multipliers['touchdowns']
                
                # Points allowed (simplified)
                points_allowed = player_stats.get('pointsAllowed', 0)
                if points_allowed == 0:
                    fantasy_points += multipliers['points_allowed_0']
                elif points_allowed <= 6:
                    fantasy_points += multipliers['points_allowed_1_6']
                elif points_allowed <= 13:
                    fantasy_points += multipliers['points_allowed_7_13']
                elif points_allowed <= 20:
                    fantasy_points += multipliers['points_allowed_14_20']
                elif points_allowed <= 27:
                    fantasy_points += multipliers['points_allowed_21_27']
                elif points_allowed <= 34:
                    fantasy_points += multipliers['points_allowed_28_34']
                else:
                    fantasy_points += multipliers['points_allowed_35_plus']
            
            return round(fantasy_points, 1)
            
        except Exception as e:
            logger.error(f"Error calculating fantasy points: {e}")
            return 0.0
    
    def map_position(self, cfbd_position: str) -> str:
        """Map CFBD position to fantasy position"""
        position_mapping = {
            'QB': 'QB',
            'RB': 'RB',
            'WR': 'WR',
            'TE': 'TE',
            'K': 'K',
            'PK': 'K',
            'DL': 'DEF',
            'DE': 'DEF',
            'DT': 'DEF',
            'LB': 'DEF',
            'DB': 'DEF',
            'CB': 'DEF',
            'S': 'DEF'
        }
        return position_mapping.get(cfbd_position, 'DEF')
    
    def get_conference(self, team: str) -> str:
        """Get conference for a team"""
        for conference, teams in POWER_4_TEAMS.items():
            if team in teams:
                return conference
        return 'Other'
    
    def rank_players_by_position(self, players: List[Dict], team: str) -> Dict[str, List[Dict]]:
        """Rank players by position and take top N per position"""
        try:
            # Group players by position
            position_groups = {}
            for player in players:
                position = self.map_position(player.get('position', 'DEF'))
                if position not in position_groups:
                    position_groups[position] = []
                position_groups[position].append(player)
            
            # Rank and limit by position
            ranked_players = {}
            for position, players_list in position_groups.items():
                # Sort by fantasy points (descending)
                players_list.sort(key=lambda p: p.get('fantasy_points', 0), reverse=True)
                
                # Take top N per position
                limit = POSITION_LIMITS.get(position, 1)
                ranked_players[position] = players_list[:limit]
                
                logger.info(f"{team} - {position}: Top {len(ranked_players[position])} players selected")
            
            return ranked_players
            
        except Exception as e:
            logger.error(f"Error ranking players for {team}: {e}")
            return {}
    
    def create_player_document(self, player: Dict, team: str, conference: str) -> Dict:
        """Create player document for Appwrite"""
        try:
            return {
                'player_id': player.get('id'),
                'name': player.get('name', ''),
                'pos': player.get('fantasy_position', 'DEF'),
                'team': team,
                'conference': conference,
                'draft_tier': player.get('draft_tier', 1),
                'bye_week': player.get('bye_week', 0),
                'eligibility': True,
                'stats': {
                    'games': player.get('games', 0),
                    'fantasy_points': player.get('fantasy_points', 0),
                    'last_season_stats': player.get('last_season_stats', {})
                },
                'season_projection': {
                    'player_id': player.get('id'),
                    'proj_pts_total': player.get('fantasy_points', 0),
                    'ceiling': player.get('fantasy_points', 0) * 1.2,
                    'floor': player.get('fantasy_points', 0) * 0.8,
                    'risk': 'medium',
                    'confidence': 75,
                    'notes': f"Based on {player.get('games', 0)} games in 2024",
                    'last_updated': datetime.utcnow().isoformat()
                },
                'risk_assessment': {
                    'injury_risk': 'low',
                    'depth_chart_risk': 'low',
                    'schedule_risk': 'medium',
                    'overall_risk': 'medium',
                    'risk_factors': []
                },
                'last_updated': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error creating player document: {e}")
            return {}
    
    def save_players_to_appwrite(self, players: List[Dict]) -> bool:
        """Step 4: Save players to Appwrite players collection"""
        try:
            url = f"{APPWRITE_ENDPOINT}/databases/college_fantasy/collections/players/documents"
            
            success_count = 0
            for player in players:
                try:
                    # Check if player already exists
                    existing_url = f"{APPWRITE_ENDPOINT}/databases/college_fantasy/collections/players/documents"
                    params = {
                        'queries': [
                            f'equal("player_id", "{player["player_id"]}")'
                        ]
                    }
                    
                    response = self.session.get(existing_url, params=params)
                    response.raise_for_status()
                    existing_data = response.json()
                    
                    if existing_data.get('documents'):
                        # Update existing
                        doc_id = existing_data['documents'][0]['$id']
                        update_url = f"{url}/{doc_id}"
                        response = self.session.put(update_url, json=player)
                    else:
                        # Create new
                        response = self.session.post(url, json=player)
                    
                    response.raise_for_status()
                    success_count += 1
                    
                except Exception as e:
                    logger.error(f"Error saving player {player.get('name', 'Unknown')}: {e}")
                    continue
                
                # Rate limiting
                time.sleep(0.1)
            
            logger.info(f"Successfully saved {success_count}/{len(players)} players to Appwrite")
            return success_count > 0
            
        except Exception as e:
            logger.error(f"Error saving players to Appwrite: {e}")
            return False
    
    def collect_team_data(self, team: str) -> List[Dict]:
        """Collect and process data for a single team"""
        try:
            logger.info(f"Collecting data for {team}")
            
            # Step 1: Get roster
            roster = self.get_team_roster(team)
            if not roster:
                return []
            
            # Step 2: Get stats
            stats = self.get_player_stats(team, 2024)
            stats_dict = {player['name']: player for player in stats}
            
            # Step 3: Calculate fantasy points and rank
            players_with_stats = []
            for player in roster:
                player_name = player.get('name', '')
                player_stats = stats_dict.get(player_name, {})
                
                # Calculate fantasy points
                position = self.map_position(player.get('position', 'DEF'))
                fantasy_points = self.calculate_fantasy_points(player_stats, position)
                
                # Create enhanced player object
                enhanced_player = {
                    **player,
                    'fantasy_position': position,
                    'fantasy_points': fantasy_points,
                    'last_season_stats': player_stats,
                    'games': player_stats.get('games', 0)
                }
                
                players_with_stats.append(enhanced_player)
            
            # Rank players by position
            conference = self.get_conference(team)
            ranked_players = self.rank_players_by_position(players_with_stats, team)
            
            # Create final player documents
            final_players = []
            for position, players_list in ranked_players.items():
                for player in players_list:
                    player_doc = self.create_player_document(player, team, conference)
                    if player_doc:
                        final_players.append(player_doc)
            
            logger.info(f"Processed {len(final_players)} draftable players from {team}")
            return final_players
            
        except Exception as e:
            logger.error(f"Error collecting data for {team}: {e}")
            return []
    
    def run_collection(self):
        """Main collection function"""
        logger.info("Starting data collection for Power 4 teams")
        
        try:
            all_players = []
            
            # Collect data for all Power 4 teams
            for conference, teams in POWER_4_TEAMS.items():
                logger.info(f"Processing {conference} teams")
                
                for team in teams:
                    team_players = self.collect_team_data(team)
                    all_players.extend(team_players)
                    
                    # Rate limiting between teams
                    time.sleep(1)
            
            # Save all players to Appwrite
            if all_players:
                success = self.save_players_to_appwrite(all_players)
                if success:
                    logger.info(f"✅ Data collection completed successfully. Processed {len(all_players)} players.")
                    return True
                else:
                    logger.error("❌ Failed to save players to Appwrite")
                    return False
            else:
                logger.error("❌ No players collected")
                return False
                
        except Exception as e:
            logger.error(f"Error in data collection: {e}")
            return False

def main():
    """Main entry point"""
    collector = DataCollector()
    
    success = collector.run_collection()
    
    if success:
        logger.info("✅ Data collection completed successfully")
        exit(0)
    else:
        logger.error("❌ Data collection failed")
        exit(1)

if __name__ == "__main__":
    main() 