#!/usr/bin/env python3
"""
Big Ten Conference Draft Board Seeder
Creates comprehensive Big Ten team and player data for the fantasy app
"""

import json
import requests
import os
from datetime import datetime
from typing import Dict, List, Any

# Big Ten Teams (18 teams as of 2024)
BIG_TEN_TEAMS = {
    "Illinois": {
        "name": "Illinois Fighting Illini",
        "abbreviation": "ILL",
        "conference": "Big Ten",
        "division": "West",
        "location": "Champaign, IL",
        "stadium": "Memorial Stadium",
        "capacity": 60670,
        "colors": ["#E84A27", "#13294B"],
        "mascot": "Fighting Illini",
        "coach": "Bret Bielema",
        "established": 1890
    },
    "Indiana": {
        "name": "Indiana Hoosiers",
        "abbreviation": "IND",
        "conference": "Big Ten",
        "division": "East",
        "location": "Bloomington, IN",
        "stadium": "Memorial Stadium",
        "capacity": 52656,
        "colors": ["#990000", "#FFFFFF"],
        "mascot": "Hoosiers",
        "coach": "Curt Cignetti",
        "established": 1887
    },
    "Iowa": {
        "name": "Iowa Hawkeyes",
        "abbreviation": "IOWA",
        "conference": "Big Ten",
        "division": "West",
        "location": "Iowa City, IA",
        "stadium": "Kinnick Stadium",
        "capacity": 69250,
        "colors": ["#000000", "#FFCD00"],
        "mascot": "Hawkeyes",
        "coach": "Kirk Ferentz",
        "established": 1889
    },
    "Maryland": {
        "name": "Maryland Terrapins",
        "abbreviation": "MD",
        "conference": "Big Ten",
        "division": "East",
        "location": "College Park, MD",
        "stadium": "SECU Stadium",
        "capacity": 54000,
        "colors": ["#E31837", "#FFD700", "#000000"],
        "mascot": "Terrapins",
        "coach": "Mike Locksley",
        "established": 1892
    },
    "Michigan": {
        "name": "Michigan Wolverines",
        "abbreviation": "MICH",
        "conference": "Big Ten",
        "division": "East",
        "location": "Ann Arbor, MI",
        "stadium": "Michigan Stadium",
        "capacity": 107601,
        "colors": ["#00274C", "#FFCB05"],
        "mascot": "Wolverines",
        "coach": "Sherrone Moore",
        "established": 1879
    },
    "Michigan State": {
        "name": "Michigan State Spartans",
        "abbreviation": "MSU",
        "conference": "Big Ten",
        "division": "East",
        "location": "East Lansing, MI",
        "stadium": "Spartan Stadium",
        "capacity": 75005,
        "colors": ["#18453B", "#FFFFFF"],
        "mascot": "Spartans",
        "coach": "Jonathan Smith",
        "established": 1885
    },
    "Minnesota": {
        "name": "Minnesota Golden Gophers",
        "abbreviation": "MINN",
        "conference": "Big Ten",
        "division": "West",
        "location": "Minneapolis, MN",
        "stadium": "Huntington Bank Stadium",
        "capacity": 50805,
        "colors": ["#7A0019", "#FFC72A"],
        "mascot": "Golden Gophers",
        "coach": "P.J. Fleck",
        "established": 1882
    },
    "Nebraska": {
        "name": "Nebraska Cornhuskers",
        "abbreviation": "NEB",
        "conference": "Big Ten",
        "division": "West",
        "location": "Lincoln, NE",
        "stadium": "Memorial Stadium",
        "capacity": 85458,
        "colors": ["#E31837", "#FFFFFF"],
        "mascot": "Cornhuskers",
        "coach": "Matt Rhule",
        "established": 1890
    },
    "Northwestern": {
        "name": "Northwestern Wildcats",
        "abbreviation": "NW",
        "conference": "Big Ten",
        "division": "West",
        "location": "Evanston, IL",
        "stadium": "Ryan Field",
        "capacity": 47130,
        "colors": ["#4E2A84", "#FFFFFF"],
        "mascot": "Wildcats",
        "coach": "David Braun",
        "established": 1876
    },
    "Ohio State": {
        "name": "Ohio State Buckeyes",
        "abbreviation": "OSU",
        "conference": "Big Ten",
        "division": "East",
        "location": "Columbus, OH",
        "stadium": "Ohio Stadium",
        "capacity": 102780,
        "colors": ["#BB0000", "#666666"],
        "mascot": "Buckeyes",
        "coach": "Ryan Day",
        "established": 1890
    },
    "Oregon": {
        "name": "Oregon Ducks",
        "abbreviation": "ORE",
        "conference": "Big Ten",
        "division": "West",
        "location": "Eugene, OR",
        "stadium": "Autzen Stadium",
        "capacity": 54000,
        "colors": ["#154733", "#FEE123"],
        "mascot": "Ducks",
        "coach": "Dan Lanning",
        "established": 1894
    },
    "Penn State": {
        "name": "Penn State Nittany Lions",
        "abbreviation": "PSU",
        "conference": "Big Ten",
        "division": "East",
        "location": "University Park, PA",
        "stadium": "Beaver Stadium",
        "capacity": 106572,
        "colors": ["#041E42", "#FFFFFF"],
        "mascot": "Nittany Lions",
        "coach": "James Franklin",
        "established": 1887
    },
    "Purdue": {
        "name": "Purdue Boilermakers",
        "abbreviation": "PUR",
        "conference": "Big Ten",
        "division": "West",
        "location": "West Lafayette, IN",
        "stadium": "Ross-Ade Stadium",
        "capacity": 57236,
        "colors": ["#CEB888", "#000000"],
        "mascot": "Boilermakers",
        "coach": "Ryan Walters",
        "established": 1887
    },
    "Rutgers": {
        "name": "Rutgers Scarlet Knights",
        "abbreviation": "RUTG",
        "conference": "Big Ten",
        "division": "East",
        "location": "Piscataway, NJ",
        "stadium": "SHI Stadium",
        "capacity": 52172,
        "colors": ["#CC0033", "#000000"],
        "mascot": "Scarlet Knights",
        "coach": "Greg Schiano",
        "established": 1869
    },
    "UCLA": {
        "name": "UCLA Bruins",
        "abbreviation": "UCLA",
        "conference": "Big Ten",
        "division": "West",
        "location": "Los Angeles, CA",
        "stadium": "Rose Bowl",
        "capacity": 88817,
        "colors": ["#2774AE", "#FFD100"],
        "mascot": "Bruins",
        "coach": "DeShaun Foster",
        "established": 1919
    },
    "USC": {
        "name": "USC Trojans",
        "abbreviation": "USC",
        "conference": "Big Ten",
        "division": "West",
        "location": "Los Angeles, CA",
        "stadium": "Los Angeles Memorial Coliseum",
        "capacity": 77500,
        "colors": ["#990000", "#FFC72A"],
        "mascot": "Trojans",
        "coach": "Lincoln Riley",
        "established": 1888
    },
    "Washington": {
        "name": "Washington Huskies",
        "abbreviation": "WASH",
        "conference": "Big Ten",
        "division": "West",
        "location": "Seattle, WA",
        "stadium": "Husky Stadium",
        "capacity": 70138,
        "colors": ["#4B2E83", "#B7A57A"],
        "mascot": "Huskies",
        "coach": "Jedd Fisch",
        "established": 1889
    },
    "Wisconsin": {
        "name": "Wisconsin Badgers",
        "abbreviation": "WIS",
        "conference": "Big Ten",
        "division": "West",
        "location": "Madison, WI",
        "stadium": "Camp Randall Stadium",
        "capacity": 80321,
        "colors": ["#C5050C", "#FFFFFF"],
        "mascot": "Badgers",
        "coach": "Luke Fickell",
        "established": 1889
    }
}

# Sample Big Ten Players (Top players from each team)
BIG_TEN_PLAYERS = {
    "Michigan": [
        {"name": "J.J. McCarthy", "position": "QB", "year": "Junior", "rating": 95},
        {"name": "Blake Corum", "position": "RB", "year": "Senior", "rating": 94},
        {"name": "Donovan Edwards", "position": "RB", "year": "Junior", "rating": 92},
        {"name": "Roman Wilson", "position": "WR", "year": "Senior", "rating": 91},
        {"name": "Colston Loveland", "position": "TE", "year": "Sophomore", "rating": 90}
    ],
    "Ohio State": [
        {"name": "Kyle McCord", "position": "QB", "year": "Junior", "rating": 93},
        {"name": "TreVeyon Henderson", "position": "RB", "year": "Junior", "rating": 94},
        {"name": "Marvin Harrison Jr.", "position": "WR", "year": "Junior", "rating": 96},
        {"name": "Emeka Egbuka", "position": "WR", "year": "Junior", "rating": 92},
        {"name": "Cade Stover", "position": "TE", "year": "Senior", "rating": 89}
    ],
    "Penn State": [
        {"name": "Drew Allar", "position": "QB", "year": "Sophomore", "rating": 91},
        {"name": "Nicholas Singleton", "position": "RB", "year": "Sophomore", "rating": 93},
        {"name": "Kaytron Allen", "position": "RB", "year": "Sophomore", "rating": 90},
        {"name": "KeAndre Lambert-Smith", "position": "WR", "year": "Junior", "rating": 88},
        {"name": "Theo Johnson", "position": "TE", "year": "Senior", "rating": 87}
    ],
    "Iowa": [
        {"name": "Cade McNamara", "position": "QB", "year": "Senior", "rating": 85},
        {"name": "Leshon Williams", "position": "RB", "year": "Senior", "rating": 86},
        {"name": "Kaleb Brown", "position": "WR", "year": "Sophomore", "rating": 84},
        {"name": "Luke Lachey", "position": "TE", "year": "Senior", "rating": 88},
        {"name": "Cooper DeJean", "position": "DB", "year": "Junior", "rating": 92}
    ],
    "Wisconsin": [
        {"name": "Tanner Mordecai", "position": "QB", "year": "Senior", "rating": 87},
        {"name": "Braelon Allen", "position": "RB", "year": "Junior", "rating": 92},
        {"name": "Will Pauling", "position": "WR", "year": "Junior", "rating": 85},
        {"name": "Tucker Ashcraft", "position": "TE", "year": "Freshman", "rating": 82},
        {"name": "Hunter Wohler", "position": "S", "year": "Junior", "rating": 89}
    ],
    "Oregon": [
        {"name": "Bo Nix", "position": "QB", "year": "Senior", "rating": 94},
        {"name": "Bucky Irving", "position": "RB", "year": "Junior", "rating": 91},
        {"name": "Troy Franklin", "position": "WR", "year": "Junior", "rating": 93},
        {"name": "Tez Johnson", "position": "WR", "year": "Senior", "rating": 88},
        {"name": "Patrick Herbert", "position": "TE", "year": "Senior", "rating": 85}
    ],
    "USC": [
        {"name": "Caleb Williams", "position": "QB", "year": "Junior", "rating": 96},
        {"name": "Marshawn Lloyd", "position": "RB", "year": "Senior", "rating": 89},
        {"name": "Tahj Washington", "position": "WR", "year": "Senior", "rating": 87},
        {"name": "Brenden Rice", "position": "WR", "year": "Senior", "rating": 86},
        {"name": "Lake McRee", "position": "TE", "year": "Sophomore", "rating": 83}
    ],
    "Washington": [
        {"name": "Michael Penix Jr.", "position": "QB", "year": "Senior", "rating": 95},
        {"name": "Dillon Johnson", "position": "RB", "year": "Senior", "rating": 88},
        {"name": "Rome Odunze", "position": "WR", "year": "Junior", "rating": 94},
        {"name": "Jalen McMillan", "position": "WR", "year": "Junior", "rating": 91},
        {"name": "Jack Westover", "position": "TE", "year": "Senior", "rating": 84}
    ]
}

# Appwrite Configuration
APPWRITE_ENDPOINT = "https://nyc.cloud.appwrite.io/v1"
APPWRITE_PROJECT_ID = "688ccd49002eacc6c020"
APPWRITE_API_KEY = os.getenv("APPWRITE_API_KEY", "")

# Collection IDs
TEAMS_COLLECTION_ID = "teams"
PLAYERS_COLLECTION_ID = "college_players"
GAMES_COLLECTION_ID = "games"

def create_appwrite_client():
    """Create Appwrite client for database operations"""
    try:
        from appwrite.client import Client
        from appwrite.services.databases import Databases
        
        client = Client()
        client.set_endpoint(APPWRITE_ENDPOINT)
        client.set_project(APPWRITE_PROJECT_ID)
        client.set_key(APPWRITE_API_KEY)
        
        return Databases(client)
    except ImportError:
        print("❌ Appwrite Python SDK not installed. Install with: pip install appwrite")
        return None

def seed_big_ten_teams(databases):
    """Seed Big Ten teams into Appwrite"""
    print("🏈 Seeding Big Ten teams to Appwrite...")
    
    for team_name, team_data in BIG_TEN_TEAMS.items():
        try:
            # Create team document
            team_doc = {
                "name": team_data["name"],
                "abbreviation": team_data["abbreviation"],
                "conference": team_data["conference"],
                "division": team_data["division"],
                "location": team_data["location"],
                "stadium": team_data["stadium"],
                "capacity": team_data["capacity"],
                "colors": team_data["colors"],
                "mascot": team_data["mascot"],
                "coach": team_data["coach"],
                "established": team_data["established"],
                "conference_id": "big_ten",
                "power_4": True,
                "created_at": datetime.now().isoformat()
            }
            
            # Add to Appwrite
            result = databases.create_document(
                database_id="college_football",
                collection_id=TEAMS_COLLECTION_ID,
                document_id=f"bigten_{team_data['abbreviation'].lower()}",
                data=team_doc
            )
            print(f"✅ Added {team_data['name']}")
            
        except Exception as e:
            print(f"❌ Error adding {team_name}: {str(e)}")

def seed_big_ten_players(databases):
    """Seed Big Ten players into Appwrite"""
    print("👥 Seeding Big Ten players to Appwrite...")
    
    for team_name, players in BIG_TEN_PLAYERS.items():
        team_abbr = BIG_TEN_TEAMS[team_name]["abbreviation"]
        
        for i, player in enumerate(players):
            try:
                # Create player document
                player_doc = {
                    "name": player["name"],
                    "position": player["position"],
                    "team": team_name,
                    "team_abbreviation": team_abbr,
                    "conference": "Big Ten",
                    "year": player["year"],
                    "rating": player["rating"],
                    "draftable": True,
                    "conference_id": "big_ten",
                    "power_4": True,
                    "created_at": datetime.now().isoformat()
                }
                
                # Add to Appwrite
                result = databases.create_document(
                    database_id="college_football",
                    collection_id=PLAYERS_COLLECTION_ID,
                    document_id=f"bigten_{team_abbr.lower()}_{player['name'].replace(' ', '_').lower()}",
                    data=player_doc
                )
                print(f"✅ Added {player['name']} ({team_abbr})")
                
            except Exception as e:
                print(f"❌ Error adding {player['name']}: {str(e)}")

def create_big_ten_games(databases):
    """Create sample Big Ten games for 2024 season"""
    print("🏟️ Creating Big Ten games for 2024 season...")
    
    # Sample Big Ten games (key matchups)
    big_ten_games = [
        {
            "home_team": "Michigan",
            "away_team": "Ohio State",
            "date": "2024-11-30",
            "time": "15:30",
            "venue": "Ohio Stadium",
            "conference_game": True,
            "rivalry": True,
            "week": 14
        },
        {
            "home_team": "Penn State",
            "away_team": "Michigan",
            "date": "2024-11-09",
            "time": "19:30",
            "venue": "Beaver Stadium",
            "conference_game": True,
            "rivalry": True,
            "week": 12
        },
        {
            "home_team": "Ohio State",
            "away_team": "Penn State",
            "date": "2024-10-26",
            "time": "19:30",
            "venue": "Ohio Stadium",
            "conference_game": True,
            "rivalry": True,
            "week": 10
        },
        {
            "home_team": "Oregon",
            "away_team": "Washington",
            "date": "2024-11-30",
            "time": "16:30",
            "venue": "Autzen Stadium",
            "conference_game": True,
            "rivalry": True,
            "week": 14
        },
        {
            "home_team": "USC",
            "away_team": "UCLA",
            "date": "2024-11-23",
            "time": "15:30",
            "venue": "Los Angeles Memorial Coliseum",
            "conference_game": True,
            "rivalry": True,
            "week": 13
        }
    ]
    
    for i, game in enumerate(big_ten_games):
        try:
            game_doc = {
                "home_team": game["home_team"],
                "away_team": game["away_team"],
                "date": game["date"],
                "time": game["time"],
                "venue": game["venue"],
                "conference_game": game["conference_game"],
                "rivalry": game["rivalry"],
                "week": game["week"],
                "season": 2024,
                "conference": "Big Ten",
                "status": "scheduled",
                "created_at": datetime.now().isoformat()
            }
            
            # Add to Appwrite
            result = databases.create_document(
                database_id="college_football",
                collection_id=GAMES_COLLECTION_ID,
                document_id=f"bigten_game_{i+1}",
                data=game_doc
            )
            print(f"✅ Added {game['away_team']} @ {game['home_team']}")
            
        except Exception as e:
            print(f"❌ Error adding game: {str(e)}")

def main():
    """Main function to seed Big Ten data"""
    print("🏈 Big Ten Conference Data Seeder")
    print("=" * 50)
    
    # Check Appwrite connection
    databases = create_appwrite_client()
    if not databases:
        print("❌ Cannot connect to Appwrite. Please check your API key.")
        return
    
    print(f"✅ Connected to Appwrite project: {APPWRITE_PROJECT_ID}")
    
    # Seed data
    try:
        seed_big_ten_teams(databases)
        print("\n" + "=" * 50)
        
        seed_big_ten_players(databases)
        print("\n" + "=" * 50)
        
        create_big_ten_games(databases)
        print("\n" + "=" * 50)
        
        print("🎉 Big Ten data seeding completed successfully!")
        print(f"📊 Added {len(BIG_TEN_TEAMS)} teams")
        print(f"👥 Added {sum(len(players) for players in BIG_TEN_PLAYERS.values())} players")
        print(f"🏟️ Added 5 key rivalry games")
        
    except Exception as e:
        print(f"❌ Error during seeding: {str(e)}")

if __name__ == "__main__":
    main() 