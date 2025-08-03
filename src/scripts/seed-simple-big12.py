#!/usr/bin/env python3
"""
Simplified Big 12 Seeder
Focuses on getting player data into Appwrite
"""

import os
import requests
import logging
from datetime import datetime
from collections import defaultdict
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuration
CFBD_API_KEY = os.getenv('CFBD_API_KEY', '')
APPWRITE_ENDPOINT = os.getenv('APPWRITE_ENDPOINT', 'https://nyc.cloud.appwrite.io/v1')
APPWRITE_PROJECT_ID = os.getenv('APPWRITE_PROJECT_ID', '688ccd49002eacc6c020')
APPWRITE_API_KEY = os.getenv('APPWRITE_API_KEY', '')

# Big 12 Teams
BIG12_TEAMS = [
    "Texas", "Oklahoma State", "Kansas", "Kansas State", 
    "TCU", "Baylor", "Texas Tech", "Iowa State",
    "West Virginia", "Cincinnati", "Houston", "UCF",
    "BYU", "Colorado", "Arizona", "Arizona State", "Utah"
]

# Fantasy scoring
SCORING = {
    'pass_yd': 1/25,
    'pass_td': 4,
    'rush_yd': 1/10,
    'rush_td': 6,
    'rec_yd': 1/10,
    'rec_td': 6,
    'receptions': 1.0
}

class SimpleBig12Seeder:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {CFBD_API_KEY}',
            'Accept': 'application/json'
        })
        self.appwrite_session = requests.Session()
        self.appwrite_session.headers.update({
            'X-Appwrite-Project': APPWRITE_PROJECT_ID,
            'X-Appwrite-Key': APPWRITE_API_KEY,
            'Content-Type': 'application/json'
        })
        
    def get_team_players(self, team):
        """Get all players and their stats for a team"""
        logger.info(f"Getting players for {team}")
        
        # Get player stats
        url = 'https://api.collegefootballdata.com/stats/player/season'
        params = {
            'year': 2024,
            'team': team,
            'seasonType': 'regular'
        }
        
        try:
            response = self.session.get(url, params=params)
            response.raise_for_status()
            stats = response.json()
            
            # Aggregate stats by player
            players = defaultdict(lambda: {
                'stats': defaultdict(float),
                'info': {}
            })
            
            for stat in stats:
                player_id = stat['playerId']
                player_name = stat['player']
                
                # Store player info
                if not players[player_id]['info']:
                    players[player_id]['info'] = {
                        'id': player_id,
                        'name': player_name,
                        'team': team,
                        'position': stat.get('position', 'Unknown'),
                        'conference': 'Big 12'
                    }
                
                # Aggregate stats
                stat_type = stat['statType']
                stat_value = float(stat['stat']) if stat['stat'] else 0
                players[player_id]['stats'][stat_type] = stat_value
            
            return players
            
        except Exception as e:
            logger.error(f"Error getting players for {team}: {e}")
            return {}
    
    def calculate_fantasy_points(self, player_data):
        """Calculate fantasy points based on stats"""
        stats = player_data['stats']
        points = 0
        
        # Passing
        points += stats.get('YDS', 0) * SCORING['pass_yd']
        points += stats.get('TD', 0) * SCORING['pass_td']
        
        # Rushing (CAR = carries)
        if 'CAR' in stats:
            rush_yards = stats.get('YDS', 0)
            points += rush_yards * SCORING['rush_yd']
            points += stats.get('TD', 0) * SCORING['rush_td']
        
        # Receiving
        if 'REC' in stats:
            points += stats.get('YDS', 0) * SCORING['rec_yd']
            points += stats.get('TD', 0) * SCORING['rec_td']
            points += stats.get('REC', 0) * SCORING['receptions']
        
        return round(points, 2)
    
    def determine_fantasy_position(self, position, stats):
        """Determine fantasy position based on position and stats"""
        # Map positions to fantasy positions
        position_map = {
            'QB': 'QB',
            'RB': 'RB',
            'WR': 'WR',
            'TE': 'TE',
            'K': 'K',
            'PK': 'K'
        }
        
        # Direct mapping
        if position in position_map:
            return position_map[position]
        
        # Check stats to determine position
        if stats.get('COMPLETIONS', 0) > 0:
            return 'QB'
        elif stats.get('CAR', 0) > stats.get('REC', 0):
            return 'RB'
        elif stats.get('REC', 0) > 0:
            return 'WR'
        elif stats.get('FGM', 0) > 0:
            return 'K'
        else:
            return 'Other'
    
    def create_player_document(self, player_data):
        """Create document for Appwrite"""
        info = player_data['info']
        stats = player_data['stats']
        
        fantasy_pos = self.determine_fantasy_position(info['position'], stats)
        fantasy_points = self.calculate_fantasy_points(player_data)
        
        # Only include fantasy-relevant positions
        if fantasy_pos not in ['QB', 'RB', 'WR', 'TE', 'K']:
            return None
        
        # Create season stats summary
        season_stats = {}
        if fantasy_pos == 'QB':
            season_stats = {
                'games': 12,
                'passing': {
                    'completions': int(stats.get('COMPLETIONS', 0)),
                    'attempts': int(stats.get('ATT', 0)),
                    'yards': int(stats.get('YDS', 0)),
                    'touchdowns': int(stats.get('TD', 0)),
                    'interceptions': int(stats.get('INT', 0))
                }
            }
        elif fantasy_pos == 'RB':
            season_stats = {
                'games': 12,
                'rushing': {
                    'attempts': int(stats.get('CAR', 0)),
                    'yards': int(stats.get('YDS', 0)),
                    'touchdowns': int(stats.get('TD', 0))
                },
                'receiving': {
                    'receptions': int(stats.get('REC', 0)),
                    'yards': int(stats.get('YDS', 0)),
                    'touchdowns': int(stats.get('TD', 0))
                }
            }
        elif fantasy_pos in ['WR', 'TE']:
            season_stats = {
                'games': 12,
                'receiving': {
                    'receptions': int(stats.get('REC', 0)),
                    'yards': int(stats.get('YDS', 0)),
                    'touchdowns': int(stats.get('TD', 0))
                }
            }
        
        # Split name into first and last
        name_parts = info['name'].split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        return {
            'espnId': info['id'],
            'cfbdId': info['id'],
            'firstName': first_name,
            'lastName': last_name,
            'displayName': info['name'],
            'jersey': '',
            'position': info['position'],
            'fantasyPosition': fantasy_pos,
            'team': info['team'],
            'teamId': info['team'].lower().replace(' ', '_'),
            'conference': 'Big 12',
            'height': '',
            'weight': 0,
            'class': '',
            'depthChartPosition': 1,
            'isStarter': fantasy_points > 50,
            'eligibleForWeek': True,
            'injuryStatus': 'healthy',
            'injuryNotes': '',
            'seasonStats': str(season_stats),
            'weeklyProjections': '[]',
            'fantasyPoints': fantasy_points,
            'lastUpdated': datetime.now().isoformat(),
            'dataSource': 'CFBD'
        }
    
    def save_to_appwrite(self, player_doc):
        """Save player to Appwrite"""
        try:
            url = f"{APPWRITE_ENDPOINT}/databases/college-football-fantasy/collections/college_players/documents"
            
            document_id = f"{player_doc['teamId']}_{player_doc['cfbdId']}"
            
            response = self.appwrite_session.post(url, json={
                'documentId': document_id,
                'data': player_doc
            })
            
            if response.status_code in [201, 200]:
                logger.info(f"✅ Saved {player_doc['displayName']} ({player_doc['fantasyPosition']}) - {player_doc['fantasyPoints']} pts")
                return True
            else:
                logger.error(f"❌ Failed to save {player_doc['displayName']}: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error saving player: {e}")
            return False
    
    def seed_big12(self):
        """Main seeding process"""
        logger.info("Starting Big 12 seeding...")
        
        total_saved = 0
        
        for team in BIG12_TEAMS:
            players = self.get_team_players(team)
            
            # Sort by fantasy points and save top players
            player_list = []
            for player_id, player_data in players.items():
                doc = self.create_player_document(player_data)
                if doc and doc['fantasyPoints'] > 0:
                    player_list.append(doc)
            
            # Sort by fantasy points
            player_list.sort(key=lambda x: x['fantasyPoints'], reverse=True)
            
            # Save top players by position
            position_counts = defaultdict(int)
            position_limits = {'QB': 3, 'RB': 5, 'WR': 6, 'TE': 3, 'K': 2}
            
            for player in player_list:
                pos = player['fantasyPosition']
                if position_counts[pos] < position_limits.get(pos, 0):
                    if self.save_to_appwrite(player):
                        total_saved += 1
                        position_counts[pos] += 1
        
        logger.info(f"\n✅ Seeding complete! Saved {total_saved} players.")

if __name__ == "__main__":
    seeder = SimpleBig12Seeder()
    seeder.seed_big12()