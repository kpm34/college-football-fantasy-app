import os
import json
import asyncio
import random
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Set
import httpx
import redis.asyncio as redis
from appwrite.client import Client
from appwrite.services.realtime import Realtime
from appwrite.services.functions import Functions

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Environment variables
CFBD_API_KEY = os.environ.get('CFBD_API_KEY')
APPWRITE_ENDPOINT = os.environ.get('APPWRITE_ENDPOINT')
APPWRITE_PROJECT_ID = os.environ.get('APPWRITE_PROJECT_ID')
APPWRITE_API_KEY = os.environ.get('APPWRITE_API_KEY')
APPWRITE_FUNCTIONS_ENDPOINT = os.environ.get('APPWRITE_FUNCTIONS_ENDPOINT')
APPWRITE_FUNCTIONS_KEY = os.environ.get('APPWRITE_FUNCTIONS_KEY')
REDIS_URL = os.environ.get('REDIS_URL')
FANTASY_SCORING_JSON = os.environ.get('FANTASY_SCORING_JSON', '{}')

# Target conferences
TARGET_CONFERENCES = {'SEC', 'ACC', 'Big 12', 'Big Ten'}

# Parse fantasy scoring rules
SCORING_RULES = json.loads(FANTASY_SCORING_JSON) if FANTASY_SCORING_JSON else {
    'passing_yards': 0.04,
    'passing_tds': 4,
    'interceptions': -2,
    'rushing_yards': 0.1,
    'rushing_tds': 6,
    'receiving_yards': 0.1,
    'receiving_tds': 6,
    'fumbles_lost': -2,
    'two_point_conversions': 2,
    'pat_made': 1,
    'fg_made_0_39': 3,
    'fg_made_40_49': 4,
    'fg_made_50_plus': 5
}

class LiveGameWorker:
    def __init__(self):
        self.redis_client = None
        self.appwrite_client = None
        self.http_client = None
        self.tracked_games: Dict[str, Dict] = {}
        self.player_stats_cache: Dict[str, Dict] = {}
        self.backoff_times: Dict[str, float] = {}
        
    async def setup(self):
        """Initialize all connections"""
        # Redis connection
        self.redis_client = await redis.from_url(REDIS_URL, decode_responses=True)
        
        # Appwrite client
        self.appwrite_client = Client()
        self.appwrite_client.set_endpoint(APPWRITE_ENDPOINT)
        self.appwrite_client.set_project(APPWRITE_PROJECT_ID)
        self.appwrite_client.set_key(APPWRITE_API_KEY)
        
        # HTTP client with retries
        self.http_client = httpx.AsyncClient(
            timeout=30.0,
            limits=httpx.Limits(max_keepalive_connections=5)
        )
        
    async def cleanup(self):
        """Cleanup connections"""
        if self.redis_client:
            await self.redis_client.close()
        if self.http_client:
            await self.http_client.aclose()
    
    def is_sleep_time(self) -> bool:
        """Check if we should sleep (midnight to 8 AM ET)"""
        et_now = datetime.now(timezone(timedelta(hours=-5)))  # ET timezone
        return 0 <= et_now.hour < 8
    
    async def fetch_todays_games(self) -> List[Dict]:
        """Fetch today's games from CFBD API"""
        today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
        
        headers = {
            'Authorization': f'Bearer {CFBD_API_KEY}',
            'Accept': 'application/json'
        }
        
        try:
            # Get current week
            week_url = f'https://api.collegefootballdata.com/calendar?year={datetime.now().year}'
            week_resp = await self.http_client.get(week_url, headers=headers)
            week_data = week_resp.json()
            
            current_week = None
            for week in week_data:
                if week['firstGameStart'] <= today <= week['lastGameStart']:
                    current_week = week['week']
                    break
            
            if not current_week:
                logger.warning(f"No games found for today {today}")
                return []
            
            # Get games for current week
            games_url = f'https://api.collegefootballdata.com/games?year={datetime.now().year}&week={current_week}'
            games_resp = await self.http_client.get(games_url, headers=headers)
            games = games_resp.json()
            
            # Filter for today's games in target conferences
            todays_games = []
            for game in games:
                game_date = game.get('start_date', '').split('T')[0]
                home_conf = game.get('home_conference', '')
                away_conf = game.get('away_conference', '')
                
                if game_date == today and (home_conf in TARGET_CONFERENCES or away_conf in TARGET_CONFERENCES):
                    todays_games.append(game)
                    logger.info(f"Tracking game: {game['away_team']} @ {game['home_team']}")
            
            return todays_games
            
        except Exception as e:
            logger.error(f"Error fetching CFBD games: {e}")
            return []
    
    def map_to_espn_id(self, cfbd_game: Dict) -> Optional[str]:
        """Map CFBD game to ESPN event ID"""
        # ESPN uses a different ID system, we'll need to search by teams and date
        # This is a simplified mapping - in production you'd want a more robust solution
        home_team = cfbd_game.get('home_team', '').lower().replace(' ', '')
        away_team = cfbd_game.get('away_team', '').lower().replace(' ', '')
        game_date = cfbd_game.get('start_date', '').split('T')[0].replace('-', '')
        
        # Generate a composite key for caching
        return f"{game_date}_{away_team}_{home_team}"
    
    async def fetch_espn_boxscore(self, game_id: str) -> Optional[Dict]:
        """Fetch ESPN boxscore data"""
        # ESPN API endpoint (this is a simplified example)
        # In production, you'd need to handle ESPN's actual API structure
        url = f"https://site.api.espn.com/apis/site/v2/sports/football/college-football/summary?event={game_id}"
        
        # Check backoff
        if game_id in self.backoff_times:
            if datetime.now().timestamp() < self.backoff_times[game_id]:
                return None
        
        try:
            response = await self.http_client.get(url)
            
            if response.status_code == 403:
                # Implement exponential backoff
                backoff = self.backoff_times.get(game_id, 30)
                backoff = min(backoff * 2, 300)  # Max 5 minutes
                self.backoff_times[game_id] = datetime.now().timestamp() + backoff
                logger.warning(f"403 error for {game_id}, backing off for {backoff}s")
                return None
            
            if response.status_code == 200:
                # Clear backoff on success
                self.backoff_times.pop(game_id, None)
                return response.json()
                
        except Exception as e:
            logger.error(f"Error fetching ESPN data for {game_id}: {e}")
            
        return None
    
    def extract_player_stats(self, boxscore: Dict) -> Dict[str, Dict]:
        """Extract individual player statistics from boxscore"""
        player_stats = {}
        
        # Parse boxscore structure (simplified - ESPN has complex structure)
        if 'boxscore' in boxscore and 'players' in boxscore['boxscore']:
            for team in boxscore['boxscore']['players']:
                for category in team.get('statistics', []):
                    stat_type = category.get('name', '')
                    
                    for player in category.get('athletes', []):
                        player_id = player.get('athlete', {}).get('id')
                        player_name = player.get('athlete', {}).get('displayName')
                        
                        if not player_id:
                            continue
                        
                        if player_id not in player_stats:
                            player_stats[player_id] = {
                                'name': player_name,
                                'stats': {}
                            }
                        
                        # Map ESPN stats to our scoring categories
                        if stat_type == 'passing':
                            stats = player.get('stats', [])
                            if len(stats) >= 3:
                                player_stats[player_id]['stats']['passing_yards'] = int(stats[1] or 0)
                                player_stats[player_id]['stats']['passing_tds'] = int(stats[2] or 0)
                                
                        elif stat_type == 'rushing':
                            stats = player.get('stats', [])
                            if len(stats) >= 3:
                                player_stats[player_id]['stats']['rushing_yards'] = int(stats[2] or 0)
                                player_stats[player_id]['stats']['rushing_tds'] = int(stats[3] or 0)
                                
                        elif stat_type == 'receiving':
                            stats = player.get('stats', [])
                            if len(stats) >= 3:
                                player_stats[player_id]['stats']['receiving_yards'] = int(stats[2] or 0)
                                player_stats[player_id]['stats']['receiving_tds'] = int(stats[3] or 0)
        
        return player_stats
    
    def calculate_fantasy_points(self, stats: Dict) -> float:
        """Calculate fantasy points based on stats"""
        points = 0.0
        
        for stat_name, value in stats.items():
            if stat_name in SCORING_RULES:
                points += value * SCORING_RULES[stat_name]
        
        return round(points, 2)
    
    async def update_player_deltas(self, game_id: str, current_stats: Dict[str, Dict]):
        """Calculate and store player stat deltas in Redis"""
        deltas = []
        
        for player_id, player_data in current_stats.items():
            # Get previous stats from Redis
            cache_key = f"player_stats:{game_id}:{player_id}"
            previous_data = await self.redis_client.get(cache_key)
            
            if previous_data:
                previous_stats = json.loads(previous_data)
                
                # Calculate deltas
                stat_deltas = {}
                for stat_name, current_value in player_data['stats'].items():
                    previous_value = previous_stats.get('stats', {}).get(stat_name, 0)
                    if current_value != previous_value:
                        stat_deltas[stat_name] = current_value - previous_value
                
                if stat_deltas:
                    # Calculate fantasy point delta
                    current_points = self.calculate_fantasy_points(player_data['stats'])
                    previous_points = self.calculate_fantasy_points(previous_stats.get('stats', {}))
                    
                    delta = {
                        'player_id': player_id,
                        'player_name': player_data['name'],
                        'stat_deltas': stat_deltas,
                        'fantasy_points_delta': round(current_points - previous_points, 2),
                        'total_fantasy_points': current_points,
                        'timestamp': datetime.now(timezone.utc).isoformat()
                    }
                    deltas.append(delta)
            
            # Update cache with current stats
            await self.redis_client.setex(
                cache_key,
                86400,  # 24 hour TTL
                json.dumps(player_data)
            )
        
        return deltas
    
    async def publish_updates(self, game_id: str, deltas: List[Dict]):
        """Publish updates to Appwrite Realtime"""
        if not deltas:
            return
        
        try:
            # Use Appwrite Functions to publish to Realtime
            functions = Functions(self.appwrite_client)
            
            payload = {
                'channel': 'score_updates',
                'event': 'player_stats_update',
                'data': {
                    'game_id': game_id,
                    'updates': deltas,
                    'timestamp': datetime.now(timezone.utc).isoformat()
                }
            }
            
            # Execute a function to publish to Realtime
            # You'll need to create this function in Appwrite
            await functions.create_execution(
                function_id='publish_realtime',
                data=json.dumps(payload)
            )
            
            logger.info(f"Published {len(deltas)} updates for game {game_id}")
            
        except Exception as e:
            logger.error(f"Error publishing to Appwrite: {e}")
    
    async def poll_game(self, game_id: str):
        """Poll a single game for updates"""
        boxscore = await self.fetch_espn_boxscore(game_id)
        if not boxscore:
            return
        
        # Extract player stats
        current_stats = self.extract_player_stats(boxscore)
        
        # Calculate deltas
        deltas = await self.update_player_deltas(game_id, current_stats)
        
        # Publish updates
        if deltas:
            await self.publish_updates(game_id, deltas)
    
    async def run_polling_cycle(self):
        """Run one polling cycle for all tracked games"""
        tasks = []
        
        for game_id in self.tracked_games:
            # Add jitter ±4 seconds
            jitter = random.uniform(-4, 4)
            await asyncio.sleep(max(0, jitter))
            
            task = asyncio.create_task(self.poll_game(game_id))
            tasks.append(task)
        
        # Wait for all polling tasks to complete
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
    
    async def run(self):
        """Main worker loop"""
        await self.setup()
        
        try:
            while True:
                # Check if we should sleep
                if self.is_sleep_time():
                    logger.info("Sleep time (midnight-8AM ET), pausing...")
                    await asyncio.sleep(3600)  # Check every hour
                    continue
                
                # Refresh game list every hour
                if not self.tracked_games or datetime.now().minute == 0:
                    logger.info("Refreshing game list...")
                    cfbd_games = await self.fetch_todays_games()
                    
                    self.tracked_games = {}
                    for game in cfbd_games:
                        espn_id = self.map_to_espn_id(game)
                        if espn_id:
                            self.tracked_games[espn_id] = game
                    
                    logger.info(f"Tracking {len(self.tracked_games)} games")
                
                if self.tracked_games:
                    # Run polling cycle
                    await self.run_polling_cycle()
                    
                    # Wait 15 seconds before next cycle
                    await asyncio.sleep(15)
                else:
                    # No games to track, wait 5 minutes
                    logger.info("No games to track, waiting...")
                    await asyncio.sleep(300)
                    
        except KeyboardInterrupt:
            logger.info("Shutting down...")
        finally:
            await self.cleanup()

async def main():
    """Entry point"""
    worker = LiveGameWorker()
    await worker.run()

if __name__ == "__main__":
    asyncio.run(main())