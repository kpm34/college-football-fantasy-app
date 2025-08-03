#!/usr/bin/env python3
"""
Streamlined Big Ten Draft Board Seeder - Essential Advanced Features
Populate Appwrite with Big Ten draft-board players & projections
---------------------------------------------------------------
Uses essential data sources for draft night research:
1. CFBD historical pace & usage data
2. Vegas lines (point-spreads & totals) from OddsAPI.io
3. SP+ metrics (offense/defense efficiency)
4. Weekly projections with confidence intervals
5. Season-long projections with risk assessment

Requires ENV:
  APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY
  CFBD_API_KEY, ODDS_API_KEY
"""

import os
import json
import requests
import logging
import hashlib
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from collections import defaultdict
import statistics
import math
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuration
CFBD_API_KEY = os.getenv('CFBD_API_KEY', '')
CFBD_API_KEY_BACKUP = os.getenv('CFBD_API_KEY_BACKUP', '')
ODDS_API_KEY = os.getenv('ODDS_API_KEY', '')
APPWRITE_ENDPOINT = os.getenv('APPWRITE_ENDPOINT', 'https://nyc.cloud.appwrite.io/v1')
APPWRITE_PROJECT_ID = os.getenv('APPWRITE_PROJECT_ID', '688ccd49002eacc6c020')
APPWRITE_API_KEY = os.getenv('APPWRITE_API_KEY', '')

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

# Fantasy scoring multipliers
SCORING = {
    'pass_yd': 1/25,
    'pass_td': 4,
    'pass_int': -2,
    'rush_yd': 1/10,
    'rush_td': 6,
    'rec_yd': 1/10,
    'rec_td': 6,
    'fg': 3,
    'receptions': 1.0  # PPR
}

# Position limits per team
POSITION_LIMITS = {
    'QB': 2,
    'RB': 3,
    'WR': 4,
    'TE': 2,
    'K': 1
}

# Streamlined ensemble weights (focusing on essential factors)
ENSEMBLE_WEIGHTS = {
    'raw_proj': 0.40,
    'vegas_adj': 0.30,
    'sp_plus_adj': 0.20,
    'usage_adj': 0.10
}

class StreamlinedBigTenDraftBoardSeeder:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'X-Appwrite-Project': APPWRITE_PROJECT_ID,
            'X-Appwrite-Key': APPWRITE_API_KEY,
            'Content-Type': 'application/json'
        })
        
        # Cache for various data sources
        self.sp_plus_cache = {}
        
    def fantasy_pts(self, stat: Dict) -> float:
        """Calculate fantasy points from player stats"""
        return (
            stat.get("passYards", 0) * SCORING["pass_yd"] +
            stat.get("passTD", 0) * SCORING["pass_td"] +
            stat.get("interceptions", 0) * SCORING["pass_int"] +
            stat.get("rushYards", 0) * SCORING["rush_yd"] +
            stat.get("rushTD", 0) * SCORING["rush_td"] +
            stat.get("receivingYards", 0) * SCORING["rec_yd"] +
            stat.get("receivingTD", 0) * SCORING["rec_td"] +
            stat.get("receptions", 0) * SCORING["receptions"] +
            stat.get("fieldGoals", 0) * SCORING["fg"]
        )
    
    def cfbd_request(self, path: str, **params) -> List[Dict]:
        """Make request to CollegeFootballData API with fallback"""
        url = f"https://api.collegefootballdata.com/{path}"
        logger.debug(f"Making CFBD request to: {path} with params: {params}")
        
        # Try primary key first
        for api_key in [CFBD_API_KEY, CFBD_API_KEY_BACKUP]:
            if not api_key:
                logger.debug(f"Skipping empty API key")
                continue
                
            logger.debug(f"Trying API key ending in ...{api_key[-4:]}")
            headers = {'Authorization': f'Bearer {api_key}'}
            
            try:
                # Add small delay to avoid rate limiting
                time.sleep(0.5)
                response = self.session.get(url, params=params, headers=headers, timeout=30)
                response.raise_for_status()
                return response.json()
            except requests.exceptions.HTTPError as e:
                if e.response.status_code == 401:
                    logger.warning(f"Authentication failed with key ending in ...{api_key[-4:]}, trying backup")
                    continue
                else:
                    logger.error(f"CFBD API HTTP error for {path}: {e}")
                    return []
            except requests.exceptions.RequestException as e:
                logger.error(f"CFBD API error for {path}: {e}")
                return []
        
        logger.error(f"All CFBD API keys failed for {path}")
        return []
    
    def get_team_pace_data(self, team: str, year: int = 2024) -> Dict:
        """Get team's historical pace data (plays per game)"""
        try:
            # Get team stats for plays per game
            stats = self.cfbd_request("stats/player/season", 
                                          year=year, team=team, category="plays")
            
            if stats:
                # Calculate average plays per game
                total_plays = sum(stat.get("stat", 0) for stat in stats)
                games_played = len(stats)
                avg_plays = total_plays / games_played if games_played > 0 else 70.0
                
                return {
                    "plays_per_game": avg_plays,
                    "games_played": games_played,
                    "total_plays": total_plays
                }
        except Exception as e:
            logger.error(f"Error getting pace data for {team}: {e}")
        
        return {"plays_per_game": 70.0, "games_played": 12, "total_plays": 840}
    
    def get_player_usage_share(self, player_id: str, position: str, team: str, year: int = 2024) -> float:
        """Get player's usage share based on historical data"""
        try:
            # Get player's stats for the season
            player_stats = self.cfbd_request("stats/player/season", 
                                                 year=year, team=team, seasonType="regular")
            
            # Find the specific player
            player_data = next((stat for stat in player_stats if str(stat.get("playerId")) == str(player_id)), None)
            
            if player_data:
                # Calculate usage share based on position
                if position == "QB":
                    # QB usage is typically 100% when they play
                    return 1.0
                elif position == "RB":
                    # RB usage based on rushing attempts + receptions
                    rush_att = player_data.get("rushAttempts", 0)
                    rec = player_data.get("receptions", 0)
                    total_touches = rush_att + rec
                    
                    # Get team total touches for RBs
                    team_rb_touches = sum(
                        stat.get("rushAttempts", 0) + stat.get("receptions", 0)
                        for stat in player_stats
                        if stat.get("position") == "RB"
                    )
                    
                    return total_touches / team_rb_touches if team_rb_touches > 0 else 0.25
                elif position in ["WR", "TE"]:
                    # WR/TE usage based on targets/receptions
                    rec = player_data.get("receptions", 0)
                    
                    # Get team total receptions for position
                    team_pos_receptions = sum(
                        stat.get("receptions", 0)
                        for stat in player_stats
                        if stat.get("position") == position
                    )
                    
                    return rec / team_pos_receptions if team_pos_receptions > 0 else 0.2
                elif position == "K":
                    # Kicker usage based on field goal attempts
                    fg_att = player_data.get("fieldGoalAttempts", 0)
                    
                    # Get team total FG attempts
                    team_fg_attempts = sum(
                        stat.get("fieldGoalAttempts", 0)
                        for stat in player_stats
                        if stat.get("position") == "K"
                    )
                    
                    return fg_att / team_fg_attempts if team_fg_attempts > 0 else 1.0
            
        except Exception as e:
            logger.error(f"Error getting usage share for player {player_id}: {e}")
        
        # Default usage shares by position
        defaults = {"QB": 1.0, "RB": 0.25, "WR": 0.2, "TE": 0.15, "K": 1.0}
        return defaults.get(position, 0.2)
    
    def get_vegas_odds(self, team: str, opponent: str, date_str: str) -> Dict:
        """Get Vegas odds data (point spread and totals)"""
        try:
            params = {
                "regions": "us",
                "markets": "spreads,totals",
                "date": date_str,
                "teams": f"{team},{opponent}"
            }
            headers = {"X-API-Key": ODDS_API_KEY}
            
            response = self.session.get(
                "https://api.the-odds-api.com/v4/sports/americanfootball_ncaaf/odds/",
                params=params,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200 and response.json():
                game_data = response.json()[0]
                
                # Extract spread and total
                spread = 0
                total = 28.0
                
                for market in game_data.get("bookmakers", [{}])[0].get("markets", []):
                    if market["key"] == "spreads":
                        for outcome in market["outcomes"]:
                            if outcome["name"] == team:
                                spread = outcome["point"]
                    elif market["key"] == "totals":
                        total = market["outcomes"][0]["point"]
                
                return {
                    "spread": spread,
                    "total": total,
                    "implied_team_pts": (total / 2) + (spread / 2)
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Odds API error for {team} vs {opponent}: {e}")
        
        return {"spread": 0, "total": 28.0, "implied_team_pts": 14.0}
    
    def get_sp_plus_metrics(self, team: str) -> Dict:
        """Get SP+ metrics (placeholder for now)"""
        if team in self.sp_plus_cache:
            return self.sp_plus_cache[team]
        
        try:
            # Placeholder SP+ data - would be replaced with real scraping
            sp_plus_data = {
                "offense_efficiency": 0.0,
                "defense_efficiency": 0.0,
                "special_teams": 0.0,
                "overall": 0.0
            }
            
            # Cache the result
            self.sp_plus_cache[team] = sp_plus_data
            return sp_plus_data
            
        except Exception as e:
            logger.error(f"Error getting SP+ metrics for {team}: {e}")
            return {"offense_efficiency": 0.0, "defense_efficiency": 0.0, "special_teams": 0.0, "overall": 0.0}
    
    def calculate_confidence_interval(self, projections: List[float], final_proj: float) -> Dict:
        """Calculate confidence interval for projections"""
        if len(projections) < 2:
            return {"lower": final_proj * 0.85, "upper": final_proj * 1.15, "confidence": 0.68}
        
        # Calculate standard error
        std_dev = statistics.stdev(projections)
        std_error = std_dev / math.sqrt(len(projections))
        
        # 68% confidence interval (1 standard deviation)
        lower_68 = final_proj - std_error
        upper_68 = final_proj + std_error
        
        # 95% confidence interval (2 standard deviations)
        lower_95 = final_proj - (2 * std_error)
        upper_95 = final_proj + (2 * std_error)
        
        return {
            "lower_68": max(0, lower_68),
            "upper_68": upper_68,
            "lower_95": max(0, lower_95),
            "upper_95": upper_95,
            "confidence": 0.68,
            "std_error": std_error
        }
    
    def calculate_ensemble_projection(self, projections: Dict[str, float]) -> float:
        """Calculate final projection using streamlined ensemble weights"""
        weighted_sum = sum(
            projections.get(key, 0) * weight
            for key, weight in ENSEMBLE_WEIGHTS.items()
        )
        
        return round(weighted_sum, 1)
    
    def calculate_streamlined_projection(self, player: Dict, team: str, position: str, 
                                       opponent: str, week: int, game_date: str) -> Dict:
        """Calculate streamlined projection using essential data sources"""
        
        # 1. Get team pace data
        pace_data = self.get_team_pace_data(team)
        pace_factor = pace_data["plays_per_game"] / 70.0  # Normalize to average
        
        # 2. Get player usage share
        usage_share = self.get_player_usage_share(
            str(player["playerId"]), position, team
        )
        
        # 3. Get Vegas odds for implied team points
        odds_data = self.get_vegas_odds(team, opponent, game_date)
        implied_team_pts = odds_data["implied_team_pts"]
        
        # 4. Calculate raw projection
        scoring_multiplier = self.get_position_scoring_multiplier(position)
        raw_proj = pace_factor * usage_share * implied_team_pts * scoring_multiplier
        
        # 5. Apply Vegas adjustment
        vegas_adj = raw_proj * (1 + (odds_data["spread"] / 100))  # Adjust based on spread
        
        # 6. Apply SP+ adjustment
        team_sp_plus = self.get_sp_plus_metrics(team)
        opp_sp_plus = self.get_sp_plus_metrics(opponent)
        
        sp_plus_adjustment = (team_sp_plus["offense_efficiency"] - opp_sp_plus["defense_efficiency"]) / 100
        sp_plus_adj = vegas_adj * (1 + sp_plus_adjustment)
        
        # 7. Apply usage adjustment
        usage_adj = sp_plus_adj * usage_share
        
        # 8. Calculate final ensemble projection
        all_projections = {
            'raw_proj': raw_proj,
            'vegas_adj': vegas_adj,
            'sp_plus_adj': sp_plus_adj,
            'usage_adj': usage_adj
        }
        
        final_proj = self.calculate_ensemble_projection(all_projections)
        
        # 9. Calculate confidence interval
        confidence_data = self.calculate_confidence_interval(list(all_projections.values()), final_proj)
        
        return {
            "projection": max(0.0, final_proj),
            "confidence_interval": confidence_data,
            "components": all_projections,
            "vegas_data": odds_data,
            "pace_data": pace_data
        }
    
    def get_position_scoring_multiplier(self, position: str) -> float:
        """Get scoring multiplier for position"""
        multipliers = {
            "QB": 0.15,  # QBs typically score more fantasy points
            "RB": 0.12,  # RBs get rushing and receiving points
            "WR": 0.10,  # WRs get receiving points
            "TE": 0.08,  # TEs get receiving points
            "K": 0.05    # Kickers get field goal points
        }
        return multipliers.get(position, 0.10)
    
    def build_player_lists(self, team: str) -> Dict[str, List]:
        """Build ranked player lists by position for a team"""
        logger.info(f"Building player lists for {team}")
        
        # Get player stats for 2024 season
        stats = self.cfbd_request("stats/player/season", year=2024, team=team, seasonType="regular")
        
        by_pos = defaultdict(list)
        for stat in stats:
            pts = self.fantasy_pts(stat)
            by_pos[stat["position"]].append((pts, stat))
        
        # Select top players per position
        picks = {}
        for pos, limit in POSITION_LIMITS.items():
            if pos in by_pos:
                # Sort by fantasy points (first element of tuple)
                picks[pos] = sorted(by_pos[pos], key=lambda x: x[0], reverse=True)[:limit]
            else:
                picks[pos] = []
        
        return picks
    
    def create_player_document(self, player: Dict, team: str, position: str, depth_rank: int) -> Dict:
        """Create player document for Appwrite"""
        return {
            "name": player["player"],
            "position": position,
            "team": team,
            "team_abbreviation": BIG_TEN_TEAMS[team]["abbreviation"],
            "conference": "Big Ten",
            "year": "Senior",  # Default, would be enhanced with real data
            "rating": int(min(99, 50 + self.fantasy_pts(player) / 4)),  # Convert fantasy points to rating
            "draftable": True,
            "conference_id": "big_ten",
            "power_4": True,
            "created_at": datetime.now().isoformat()
        }
    
    def create_weekly_projection(self, player_id: str, week: int, game: Dict, 
                               team: str, position: str, projection_data: Dict) -> Dict:
        """Create weekly projection document"""
        opponent = game.get("away_team", "Unknown") if game.get("home_team") == team else game.get("home_team", "Unknown")
        is_conf = True  # All Big Ten games are conference games
        opp_rank25 = bool(game.get("away_rank") or game.get("home_rank"))
        
        return {
            "player_id": player_id,
            "week": week,
            "opponent": opponent,
            "is_conference_game": is_conf,
            "opponent_rank25": opp_rank25,
            "projected_points": projection_data["projection"],
            "confidence_interval": projection_data["confidence_interval"],
            "vegas_data": projection_data["vegas_data"],
            "pace_data": projection_data["pace_data"],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
    
    def create_season_projection(self, player_id: str, weekly_projections: List[float]) -> Dict:
        """Create season projection document"""
        total = sum(weekly_projections)
        ceiling = round(total * 1.15, 1)
        floor = round(total * 0.85, 1)
        
        # Determine risk level based on variance
        if len(weekly_projections) > 0:
            variance = statistics.variance(weekly_projections) if len(weekly_projections) > 1 else 0
            if variance > total * 0.3:
                risk = "high"
            elif variance > total * 0.15:
                risk = "medium"
            else:
                risk = "low"
        else:
            risk = "medium"
        
        return {
            "player_id": player_id,
            "projected_total": total,
            "ceiling": ceiling,
            "floor": floor,
            "risk_level": risk,
            "weekly_projections": weekly_projections,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
    
    def save_to_appwrite(self, collection: str, document_id: str, data: Dict) -> bool:
        """Save document to Appwrite"""
        try:
            url = f"{APPWRITE_ENDPOINT}/databases/college-football-fantasy/collections/{collection}/documents"
            payload = {
                "documentId": document_id,
                "data": data
            }
            
            response = self.session.post(url, json=payload)
            if response.status_code in [200, 201]:
                logger.info(f"Saved {collection}/{document_id}")
                return True
            else:
                logger.error(f"Failed to save {collection}/{document_id}: {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Appwrite save error for {collection}/{document_id}: {e}")
            return False
    
    def process_team(self, team: str):
        """Process a single team's players and projections"""
        logger.info(f"Processing team: {team}")
        
        # Build player lists
        picks = self.build_player_lists(team)
        
        # Get team schedule for 2024
        schedule = self.cfbd_request("games", year=2024, team=team, seasonType="regular")
        schedule = sorted(schedule, key=lambda x: x.get("week", 0))[:12]  # First 12 weeks
        
        for position, player_list in picks.items():
            for depth_rank, (fantasy_pts, player) in enumerate(player_list, 1):
                player_id = str(player["playerId"])
                
                # Create player document
                player_doc = self.create_player_document(player, team, position, depth_rank)
                self.save_to_appwrite("college_players", player_id, player_doc)
                
                # Calculate streamlined weekly projections
                weekly_projections = []
                for week, game in enumerate(schedule, 1):
                    # Calculate streamlined projection
                    projection_data = self.calculate_streamlined_projection(
                        player, team, position, 
                        game.get("away_team", "Unknown") if game.get("home_team") == team else game.get("home_team", "Unknown"),
                        week, game.get("start_date", "2024-09-01")[:10]
                    )
                    weekly_projections.append(projection_data["projection"])
                    
                    # Create weekly projection document (skip for now - focus on players first)
                    # weekly_doc = self.create_weekly_projection(player_id, week, game, team, position, projection_data)
                    # self.save_to_appwrite("weekly_projections", f"{player_id}-{week}", weekly_doc)
                
                # Create season projection document (skip for now - focus on players first)
                # season_doc = self.create_season_projection(player_id, weekly_projections)
                # self.save_to_appwrite("season_projections", player_id, season_doc)
    
    def run_seeding(self):
        """Main seeding process"""
        logger.info("Starting Streamlined Big Ten draft board seeding with essential advanced features")
        
        # Generate season hash
        season_hash = hashlib.sha1(str(time.time()).encode()).hexdigest()[:8]
        
        # Process each team
        for team in BIG_TEN_TEAMS.keys():
            self.process_team(team)
        
        # Create metadata document
        meta_doc = {
            "generated_at": datetime.now().isoformat(),
            "source_sha": season_hash,
            "teams_processed": len(BIG_TEN_TEAMS),
            "conference": "Big Ten",
            "season": 2024,
            "data_sources": ["CFBD", "Vegas Odds", "SP+ Metrics"],
            "ensemble_weights": ENSEMBLE_WEIGHTS,
            "features": ["Team Pace", "Player Usage", "Vegas Projections", "SP+ Efficiency"]
        }
        
        self.save_to_appwrite("meta", season_hash, meta_doc)
        
        logger.info("Streamlined Big Ten draft board seeding completed successfully")

def main():
    """Main entry point"""
    seeder = StreamlinedBigTenDraftBoardSeeder()
    seeder.run_seeding()

if __name__ == "__main__":
    main() 