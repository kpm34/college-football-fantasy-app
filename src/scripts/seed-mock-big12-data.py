#!/usr/bin/env python3
"""
Mock Big 12 Data Seeder
Seeds Appwrite with sample Big 12 players for testing
"""

import os
import json
import requests
import logging
from datetime import datetime
import random

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuration
APPWRITE_ENDPOINT = os.getenv('APPWRITE_ENDPOINT', 'https://nyc.cloud.appwrite.io/v1')
APPWRITE_PROJECT_ID = os.getenv('APPWRITE_PROJECT_ID', '688ccd49002eacc6c020')
APPWRITE_API_KEY = os.getenv('APPWRITE_API_KEY', '')

# Big 12 Teams
BIG12_TEAMS = [
    {"name": "Oklahoma State", "id": "okst"},
    {"name": "Texas", "id": "tex"},
    {"name": "Kansas", "id": "ku"},
    {"name": "Kansas State", "id": "ksu"},
    {"name": "TCU", "id": "tcu"},
    {"name": "Baylor", "id": "bay"},
    {"name": "Texas Tech", "id": "ttu"},
    {"name": "Iowa State", "id": "isu"},
    {"name": "West Virginia", "id": "wvu"},
    {"name": "Cincinnati", "id": "cin"},
    {"name": "Houston", "id": "hou"},
    {"name": "UCF", "id": "ucf"},
    {"name": "BYU", "id": "byu"},
    {"name": "Colorado", "id": "col"},
    {"name": "Arizona", "id": "ari"},
    {"name": "Arizona State", "id": "asu"},
    {"name": "Utah", "id": "utah"}
]

# Sample player names
FIRST_NAMES = ["Jackson", "Ethan", "Mason", "Noah", "William", "James", "Oliver", "Lucas", "Henry", "Alexander"]
LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Martinez", "Wilson"]

# Position distributions per team
POSITION_DISTRIBUTION = {
    "QB": 2,
    "RB": 3,
    "WR": 4,
    "TE": 2,
    "K": 1
}

class MockBig12Seeder:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'X-Appwrite-Project': APPWRITE_PROJECT_ID,
            'X-Appwrite-Key': APPWRITE_API_KEY,
            'Content-Type': 'application/json'
        })
        self.database_id = 'college-football-fantasy'
        self.collection_id = 'college_players'
        
    def generate_player(self, team, position, depth_rank):
        """Generate a mock player with realistic stats"""
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        
        # Base fantasy points by position and depth
        base_points = {
            "QB": [280, 220, 150],
            "RB": [240, 180, 120],
            "WR": [200, 160, 120, 80],
            "TE": [150, 100],
            "K": [120]
        }
        
        fantasy_points = base_points.get(position, [100])[min(depth_rank-1, len(base_points.get(position, [100]))-1)]
        fantasy_points += random.randint(-20, 20)  # Add some variance
        
        player = {
            "espnId": f"mock-{team['id']}-{position}-{depth_rank}",
            "cfbdId": f"mock-{team['id']}-{position}-{depth_rank}",
            "firstName": first_name,
            "lastName": last_name,
            "displayName": f"{first_name} {last_name}",
            "jersey": str(random.randint(1, 99)),
            "position": self.get_position_name(position),
            "fantasyPosition": position,
            "team": team['name'],
            "teamId": team['id'],
            "conference": "Big 12",
            "height": f"{random.randint(5, 6)}'{random.randint(8, 11)}\"",
            "weight": random.randint(180, 250),
            "class": random.choice(["Freshman", "Sophomore", "Junior", "Senior"]),
            "depthChartPosition": depth_rank,
            "isStarter": depth_rank == 1,
            "eligibleForWeek": True,
            "injuryStatus": "healthy" if random.random() > 0.1 else random.choice(["questionable", "doubtful"]),
            "injuryNotes": "" if random.random() > 0.1 else "Minor injury concern",
            "seasonStats": json.dumps(self.generate_season_stats(position)),
            "weeklyProjections": json.dumps(self.generate_weekly_projections(position, fantasy_points)),
            "fantasyPoints": float(fantasy_points),
            "lastUpdated": datetime.now().isoformat(),
            "dataSource": "Mock Data"
        }
        
        return player
    
    def get_position_name(self, pos):
        """Get full position name"""
        names = {
            "QB": "Quarterback",
            "RB": "Running Back", 
            "WR": "Wide Receiver",
            "TE": "Tight End",
            "K": "Kicker"
        }
        return names.get(pos, pos)
    
    def generate_season_stats(self, position):
        """Generate mock season stats by position"""
        if position == "QB":
            return {
                "games": 12,
                "passing": {
                    "attempts": random.randint(300, 500),
                    "completions": random.randint(200, 350),
                    "yards": random.randint(2500, 4000),
                    "touchdowns": random.randint(15, 35),
                    "interceptions": random.randint(5, 15),
                    "rating": random.uniform(120, 170)
                }
            }
        elif position == "RB":
            return {
                "games": 12,
                "rushing": {
                    "attempts": random.randint(100, 250),
                    "yards": random.randint(500, 1500),
                    "touchdowns": random.randint(5, 15),
                    "yardsPerCarry": random.uniform(4.0, 7.0)
                },
                "receiving": {
                    "targets": random.randint(20, 60),
                    "receptions": random.randint(15, 45),
                    "yards": random.randint(100, 400),
                    "touchdowns": random.randint(0, 5),
                    "yardsPerReception": random.uniform(6.0, 12.0)
                }
            }
        elif position == "WR":
            return {
                "games": 12,
                "receiving": {
                    "targets": random.randint(60, 120),
                    "receptions": random.randint(40, 90),
                    "yards": random.randint(500, 1200),
                    "touchdowns": random.randint(4, 12),
                    "yardsPerReception": random.uniform(10.0, 18.0)
                }
            }
        elif position == "TE":
            return {
                "games": 12,
                "receiving": {
                    "targets": random.randint(40, 80),
                    "receptions": random.randint(25, 60),
                    "yards": random.randint(300, 800),
                    "touchdowns": random.randint(2, 8),
                    "yardsPerReception": random.uniform(8.0, 15.0)
                }
            }
        elif position == "K":
            return {
                "games": 12,
                "kicking": {
                    "fieldGoals": random.randint(15, 25),
                    "fieldGoalAttempts": random.randint(18, 30),
                    "extraPoints": random.randint(30, 50),
                    "extraPointAttempts": random.randint(32, 52)
                }
            }
        return {}
    
    def generate_weekly_projections(self, position, season_total):
        """Generate weekly projections"""
        projections = []
        avg_per_week = season_total / 12
        
        opponents = ["Rice", "UTEP", "Nevada", "San Jose State", "Tulsa", "Memphis", 
                    "Navy", "Temple", "UAB", "North Texas", "UTSA", "SMU"]
        
        for week in range(1, 13):
            variance = random.uniform(0.7, 1.3)
            projected = avg_per_week * variance
            
            projections.append({
                "week": week,
                "opponent": random.choice(opponents),
                "projectedPoints": round(projected, 1),
                "confidence": random.choice(["high", "medium", "low"]),
                "notes": "Mock projection"
            })
        
        return projections
    
    def create_collection_if_not_exists(self):
        """Check if collection exists and create if needed"""
        try:
            # Try to get the collection
            url = f"{APPWRITE_ENDPOINT}/databases/{self.database_id}/collections/{self.collection_id}"
            response = self.session.get(url)
            
            if response.status_code == 404:
                logger.info("Collection doesn't exist, creating it...")
                # Collection creation would go here
                return False
            elif response.status_code == 200:
                logger.info("Collection exists!")
                return True
            else:
                logger.error(f"Error checking collection: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error checking collection: {e}")
            return False
    
    def seed_players(self):
        """Seed mock players for all Big 12 teams"""
        logger.info("Starting Big 12 mock data seeding...")
        
        if not self.create_collection_if_not_exists():
            logger.error("Collection doesn't exist. Please create it first.")
            return
        
        total_players = 0
        
        for team in BIG12_TEAMS:
            logger.info(f"Creating players for {team['name']}...")
            
            for position, count in POSITION_DISTRIBUTION.items():
                for depth_rank in range(1, count + 1):
                    player = self.generate_player(team, position, depth_rank)
                    
                    try:
                        url = f"{APPWRITE_ENDPOINT}/databases/{self.database_id}/collections/{self.collection_id}/documents"
                        response = self.session.post(url, json={
                            "documentId": f"{team['id']}-{position}-{depth_rank}",
                            "data": player
                        })
                        
                        if response.status_code in [201, 200]:
                            logger.info(f"✅ Created {player['displayName']} ({position}) for {team['name']}")
                            total_players += 1
                        else:
                            logger.error(f"❌ Failed to create player: {response.status_code} - {response.text}")
                            
                    except Exception as e:
                        logger.error(f"Error creating player: {e}")
        
        logger.info(f"\n✅ Seeding complete! Created {total_players} players.")

if __name__ == "__main__":
    seeder = MockBig12Seeder()
    seeder.seed_players()