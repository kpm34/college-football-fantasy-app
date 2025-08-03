#!/usr/bin/env python3
"""
Simple Big 12 Conference Data Seeder
Creates Big 12 team and player data for the fantasy app
"""

import json
import requests
import os
from datetime import datetime
from typing import Dict, List, Any

# Big 12 Teams (16 teams as of 2024)
BIG_12_TEAMS = {
    "Arizona": {
        "name": "Arizona Wildcats",
        "abbreviation": "ARIZ",
        "conference": "Big 12",
        "location": "Tucson, AZ",
        "stadium": "Arizona Stadium",
        "capacity": 50782,
        "colors": ["#CC0033", "#003366"],
        "mascot": "Wildcats",
        "coach": "Brent Brennan",
        "established": 1899
    },
    "Arizona State": {
        "name": "Arizona State Sun Devils",
        "abbreviation": "ASU",
        "conference": "Big 12",
        "location": "Tempe, AZ",
        "stadium": "Mountain America Stadium",
        "capacity": 53899,
        "colors": ["#8C1D40", "#FFC627"],
        "mascot": "Sun Devils",
        "coach": "Kenny Dillingham",
        "established": 1885
    },
    "Baylor": {
        "name": "Baylor Bears",
        "abbreviation": "BAYL",
        "conference": "Big 12",
        "location": "Waco, TX",
        "stadium": "McLane Stadium",
        "capacity": 45140,
        "colors": ["#1F4E79", "#C8102E"],
        "mascot": "Bears",
        "coach": "Dave Aranda",
        "established": 1899
    },
    "BYU": {
        "name": "BYU Cougars",
        "abbreviation": "BYU",
        "conference": "Big 12",
        "location": "Provo, UT",
        "stadium": "LaVell Edwards Stadium",
        "capacity": 63825,
        "colors": ["#002E5D", "#FFFFFF"],
        "mascot": "Cougars",
        "coach": "Kalani Sitake",
        "established": 1922
    },
    "Cincinnati": {
        "name": "Cincinnati Bearcats",
        "abbreviation": "CIN",
        "conference": "Big 12",
        "location": "Cincinnati, OH",
        "stadium": "Nippert Stadium",
        "capacity": 40000,
        "colors": ["#E00122", "#000000"],
        "mascot": "Bearcats",
        "coach": "Scott Satterfield",
        "established": 1885
    },
    "Colorado": {
        "name": "Colorado Buffaloes",
        "abbreviation": "COLO",
        "conference": "Big 12",
        "location": "Boulder, CO",
        "stadium": "Folsom Field",
        "capacity": 53613,
        "colors": ["#CFB87C", "#000000"],
        "mascot": "Buffaloes",
        "coach": "Deion Sanders",
        "established": 1890
    },
    "Houston": {
        "name": "Houston Cougars",
        "abbreviation": "HOU",
        "conference": "Big 12",
        "location": "Houston, TX",
        "stadium": "TDECU Stadium",
        "capacity": 40000,
        "colors": ["#C8102E", "#FFFFFF"],
        "mascot": "Cougars",
        "coach": "Willie Fritz",
        "established": 1946
    },
    "Iowa State": {
        "name": "Iowa State Cyclones",
        "abbreviation": "ISU",
        "conference": "Big 12",
        "location": "Ames, IA",
        "stadium": "Jack Trice Stadium",
        "capacity": 61500,
        "colors": ["#C8102E", "#FDBB30"],
        "mascot": "Cyclones",
        "coach": "Matt Campbell",
        "established": 1892
    },
    "Kansas": {
        "name": "Kansas Jayhawks",
        "abbreviation": "KU",
        "conference": "Big 12",
        "location": "Lawrence, KS",
        "stadium": "David Booth Kansas Memorial Stadium",
        "capacity": 47033,
        "colors": ["#0051BA", "#E8000D"],
        "mascot": "Jayhawks",
        "coach": "Lance Leipold",
        "established": 1890
    },
    "Kansas State": {
        "name": "Kansas State Wildcats",
        "abbreviation": "KSU",
        "conference": "Big 12",
        "location": "Manhattan, KS",
        "stadium": "Bill Snyder Family Stadium",
        "capacity": 50000,
        "colors": ["#512888", "#FFFFFF"],
        "mascot": "Wildcats",
        "coach": "Chris Klieman",
        "established": 1896
    },
    "Oklahoma State": {
        "name": "Oklahoma State Cowboys",
        "abbreviation": "OKST",
        "conference": "Big 12",
        "location": "Stillwater, OK",
        "stadium": "Boone Pickens Stadium",
        "capacity": 60318,
        "colors": ["#FF7300", "#000000"],
        "mascot": "Cowboys",
        "coach": "Mike Gundy",
        "established": 1890
    },
    "TCU": {
        "name": "TCU Horned Frogs",
        "abbreviation": "TCU",
        "conference": "Big 12",
        "location": "Fort Worth, TX",
        "stadium": "Amon G. Carter Stadium",
        "capacity": 47000,
        "colors": ["#4D1979", "#FFFFFF"],
        "mascot": "Horned Frogs",
        "coach": "Sonny Dykes",
        "established": 1896
    },
    "Texas": {
        "name": "Texas Longhorns",
        "abbreviation": "TEX",
        "conference": "Big 12",
        "location": "Austin, TX",
        "stadium": "Darrell K Royal-Texas Memorial Stadium",
        "capacity": 100119,
        "colors": ["#BF5700", "#FFFFFF"],
        "mascot": "Longhorns",
        "coach": "Steve Sarkisian",
        "established": 1893
    },
    "Texas Tech": {
        "name": "Texas Tech Red Raiders",
        "abbreviation": "TTU",
        "conference": "Big 12",
        "location": "Lubbock, TX",
        "stadium": "Jones AT&T Stadium",
        "capacity": 60854,
        "colors": ["#CC0000", "#000000"],
        "mascot": "Red Raiders",
        "coach": "Joey McGuire",
        "established": 1925
    },
    "UCF": {
        "name": "UCF Knights",
        "abbreviation": "UCF",
        "conference": "Big 12",
        "location": "Orlando, FL",
        "stadium": "FBC Mortgage Stadium",
        "capacity": 44669,
        "colors": ["#000000", "#FFC904"],
        "mascot": "Knights",
        "coach": "Gus Malzahn",
        "established": 1963
    },
    "Utah": {
        "name": "Utah Utes",
        "abbreviation": "UTAH",
        "conference": "Big 12",
        "location": "Salt Lake City, UT",
        "stadium": "Rice-Eccles Stadium",
        "capacity": 51563,
        "colors": ["#CC0000", "#FFFFFF"],
        "mascot": "Utes",
        "coach": "Kyle Whittingham",
        "established": 1892
    }
}

# Sample Big 12 Players (Top players from each team)
BIG_12_PLAYERS = {
    "Texas": [
        {"name": "Quinn Ewers", "position": "QB", "year": "Junior", "rating": 94},
        {"name": "CJ Baxter", "position": "RB", "year": "Sophomore", "rating": 92},
        {"name": "Xavier Worthy", "position": "WR", "year": "Junior", "rating": 93},
        {"name": "Adonai Mitchell", "position": "WR", "year": "Junior", "rating": 91},
        {"name": "Ja'Tavion Sanders", "position": "TE", "year": "Junior", "rating": 90}
    ],
    "Oklahoma State": [
        {"name": "Alan Bowman", "position": "QB", "year": "Senior", "rating": 88},
        {"name": "Ollie Gordon II", "position": "RB", "year": "Sophomore", "rating": 93},
        {"name": "Brennan Presley", "position": "WR", "year": "Senior", "rating": 89},
        {"name": "Rashod Owens", "position": "WR", "year": "Junior", "rating": 87},
        {"name": "Josiah Johnson", "position": "TE", "year": "Senior", "rating": 85}
    ],
    "Kansas State": [
        {"name": "Avery Johnson", "position": "QB", "year": "Sophomore", "rating": 89},
        {"name": "DJ Giddens", "position": "RB", "year": "Junior", "rating": 90},
        {"name": "Keagan Johnson", "position": "WR", "year": "Junior", "rating": 86},
        {"name": "Jayce Brown", "position": "WR", "year": "Sophomore", "rating": 84},
        {"name": "Ben Sinnott", "position": "TE", "year": "Senior", "rating": 88}
    ],
    "TCU": [
        {"name": "Chandler Morris", "position": "QB", "year": "Junior", "rating": 87},
        {"name": "Emani Bailey", "position": "RB", "year": "Senior", "rating": 88},
        {"name": "JP Richardson", "position": "WR", "year": "Junior", "rating": 86},
        {"name": "Savion Williams", "position": "WR", "year": "Senior", "rating": 85},
        {"name": "Jared Wiley", "position": "TE", "year": "Senior", "rating": 87}
    ],
    "Baylor": [
        {"name": "Blake Shapen", "position": "QB", "year": "Senior", "rating": 86},
        {"name": "Richard Reese", "position": "RB", "year": "Sophomore", "rating": 87},
        {"name": "Ketron Jackson Jr.", "position": "WR", "year": "Senior", "rating": 85},
        {"name": "Monaray Baldwin", "position": "WR", "year": "Junior", "rating": 84},
        {"name": "Kelsey Johnson", "position": "TE", "year": "Senior", "rating": 83}
    ],
    "Colorado": [
        {"name": "Shedeur Sanders", "position": "QB", "year": "Junior", "rating": 92},
        {"name": "Dylan Edwards", "position": "RB", "year": "Sophomore", "rating": 88},
        {"name": "Travis Hunter", "position": "WR", "year": "Sophomore", "rating": 91},
        {"name": "Jimmy Horn Jr.", "position": "WR", "year": "Junior", "rating": 86},
        {"name": "Michael Harrison", "position": "TE", "year": "Senior", "rating": 84}
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
DATABASE_ID = "college-football-fantasy"

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

def seed_big_12_teams(databases):
    """Seed Big 12 teams into Appwrite"""
    print("🏈 Seeding Big 12 teams to Appwrite...")
    
    for team_name, team_data in BIG_12_TEAMS.items():
        try:
            # Create team document (matching existing collection structure)
            team_doc = {
                "school": team_data["name"],
                "mascot": team_data["mascot"],
                "abbreviation": team_data["abbreviation"],
                "conference": team_data["conference"],
                "conferenceId": 2,  # Big 12
                "color": team_data["colors"][0] if team_data["colors"] else "#000000",
                "altColor": team_data["colors"][1] if len(team_data["colors"]) > 1 else "#FFFFFF",
                "logo": f"https://example.com/logos/{team_data['abbreviation'].lower()}.png",
                "lastUpdated": datetime.now().isoformat()
            }
            
            # Add to Appwrite
            result = databases.create_document(
                database_id=DATABASE_ID,
                collection_id=TEAMS_COLLECTION_ID,
                document_id=f"big12_{team_data['abbreviation'].lower()}",
                data=team_doc
            )
            print(f"✅ Added {team_data['name']}")
            
        except Exception as e:
            print(f"❌ Error adding {team_name}: {str(e)}")

def seed_big_12_players(databases):
    """Seed Big 12 players into Appwrite"""
    print("👥 Seeding Big 12 players to Appwrite...")
    
    for team_name, players in BIG_12_PLAYERS.items():
        team_abbr = BIG_12_TEAMS[team_name]["abbreviation"]
        
        for i, player in enumerate(players):
            try:
                # Create player document
                player_doc = {
                    "name": player["name"],
                    "position": player["position"],
                    "team": team_name,
                    "team_abbreviation": team_abbr,
                    "conference": "Big 12",
                    "year": player["year"],
                    "rating": player["rating"],
                    "draftable": True,
                    "conference_id": "big_12",
                    "power_4": True,
                    "created_at": datetime.now().isoformat()
                }
                
                # Add to Appwrite
                result = databases.create_document(
                    database_id=DATABASE_ID,
                    collection_id=PLAYERS_COLLECTION_ID,
                    document_id=f"big12_{team_abbr.lower()}_{player['name'].replace(' ', '_').lower()}",
                    data=player_doc
                )
                print(f"✅ Added {player['name']} ({team_abbr})")
                
            except Exception as e:
                print(f"❌ Error adding {player['name']}: {str(e)}")

def create_big_12_games(databases):
    """Create sample Big 12 games for 2024 season"""
    print("🏟️ Creating Big 12 games for 2024 season...")
    
    # Sample Big 12 games (key matchups)
    big_12_games = [
        {
            "home_team": "Texas",
            "away_team": "Oklahoma State",
            "date": "2024-11-16",
            "time": "15:30",
            "venue": "Darrell K Royal-Texas Memorial Stadium",
            "conference_game": True,
            "rivalry": True,
            "week": 12
        },
        {
            "home_team": "Oklahoma State",
            "away_team": "Kansas State",
            "date": "2024-11-09",
            "time": "19:30",
            "venue": "Boone Pickens Stadium",
            "conference_game": True,
            "rivalry": True,
            "week": 11
        },
        {
            "home_team": "TCU",
            "away_team": "Baylor",
            "date": "2024-11-30",
            "time": "15:30",
            "venue": "Amon G. Carter Stadium",
            "conference_game": True,
            "rivalry": True,
            "week": 14
        },
        {
            "home_team": "Colorado",
            "away_team": "Utah",
            "date": "2024-11-30",
            "time": "16:30",
            "venue": "Folsom Field",
            "conference_game": True,
            "rivalry": True,
            "week": 14
        },
        {
            "home_team": "Kansas State",
            "away_team": "Iowa State",
            "date": "2024-11-23",
            "time": "15:30",
            "venue": "Bill Snyder Family Stadium",
            "conference_game": True,
            "rivalry": True,
            "week": 13
        }
    ]
    
    for i, game in enumerate(big_12_games):
        try:
            # Create game document (matching existing collection structure)
            from datetime import datetime, timedelta
            
            # Parse the date string
            game_date = datetime.strptime(game["date"], "%Y-%m-%d")
            
            game_doc = {
                "season": 2024,
                "week": game["week"],
                "seasonType": "regular",
                "startDate": game_date.isoformat(),
                "homeTeam": game["home_team"],
                "homeConference": "Big 12",
                "homePoints": None,
                "awayTeam": game["away_team"],
                "awayConference": "Big 12",
                "awayPoints": None,
                "status": "scheduled",
                "period": None,
                "clock": None,
                "isConferenceGame": game["conference_game"],
                "lastUpdated": datetime.now().isoformat()
            }
            
            # Add to Appwrite
            result = databases.create_document(
                database_id=DATABASE_ID,
                collection_id=GAMES_COLLECTION_ID,
                document_id=f"big12_game_{i+1}",
                data=game_doc
            )
            print(f"✅ Added {game['away_team']} @ {game['home_team']}")
            
        except Exception as e:
            print(f"❌ Error adding game: {str(e)}")

def main():
    """Main function to seed Big 12 data"""
    print("🏈 Big 12 Conference Data Seeder")
    print("=" * 50)
    
    # Check Appwrite connection
    databases = create_appwrite_client()
    if not databases:
        print("❌ Cannot connect to Appwrite. Please check your API key.")
        return
    
    print(f"✅ Connected to Appwrite project: {APPWRITE_PROJECT_ID}")
    
    # Seed data
    try:
        seed_big_12_teams(databases)
        print("\n" + "=" * 50)
        
        seed_big_12_players(databases)
        print("\n" + "=" * 50)
        
        create_big_12_games(databases)
        print("\n" + "=" * 50)
        
        print("🎉 Big 12 data seeding completed successfully!")
        print(f"📊 Added {len(BIG_12_TEAMS)} teams")
        print(f"👥 Added {sum(len(players) for players in BIG_12_PLAYERS.values())} players")
        print(f"🏟️ Added 5 key rivalry games")
        
    except Exception as e:
        print(f"❌ Error during seeding: {str(e)}")

if __name__ == "__main__":
    main() 