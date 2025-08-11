import numpy as np
from typing import Dict, Tuple
import json

class GameExpectation:
    """Calculate expected plays and play mix for games"""
    
    def __init__(self, params_path: str = "src/priors/params.json"):
        with open(params_path, 'r') as f:
            self.params = json.load(f)
            
    def expected_plays(self, home_pace: float, away_pace: float, 
                      total: float, is_home: bool = True) -> float:
        """
        Calculate expected plays for a team in a game
        
        Args:
            home_pace: Home team's plays per game average
            away_pace: Away team's plays per game average
            total: Vegas total for the game
            is_home: Whether calculating for home team
            
        Returns:
            Expected number of plays
        """
        # Average the two teams' pace
        base_pace = (home_pace + away_pace) / 2
        
        # Apply home field advantage
        home_bump = self.params['team_priors']['home_advantage']
        if is_home:
            pace_adj = base_pace * (1 + home_bump)
        else:
            pace_adj = base_pace * (1 - home_bump)
        
        # Scale by Vegas total (normalized to 50 point game)
        total_factor = total / 50.0
        expected = pace_adj * np.sqrt(total_factor)
        
        return expected
    
    def expected_mix(self, team_pass_rate: float, 
                    opp_pass_defense_strength: float,
                    opp_rush_defense_strength: float,
                    game_script: float = 0.0) -> Tuple[float, float]:
        """
        Calculate expected pass/run mix for a game
        
        Args:
            team_pass_rate: Team's baseline pass rate (0-1)
            opp_pass_defense_strength: Opponent pass D (1.0 = average, <1 = good)
            opp_rush_defense_strength: Opponent rush D (1.0 = average, <1 = good)
            game_script: Expected point differential (-14 to +14)
            
        Returns:
            Tuple of (pass_rate, rush_rate)
        """
        # Adjust for opponent strength differential
        defense_diff = opp_rush_defense_strength - opp_pass_defense_strength
        strength_adj = defense_diff * 0.05  # 5% swing per unit difference
        
        # Adjust for game script (more passing when behind)
        script_adj = game_script * 0.01  # 1% per point differential
        
        # Apply logistic transformation to keep in [0, 1]
        logit_pass_rate = np.log(team_pass_rate / (1 - team_pass_rate))
        adjusted_logit = logit_pass_rate + strength_adj - script_adj
        
        # Convert back to probability
        pass_rate = 1 / (1 + np.exp(-adjusted_logit))
        rush_rate = 1 - pass_rate
        
        return pass_rate, rush_rate
    
    def calculate_team_attempts(self, expected_plays: float,
                              pass_rate: float) -> Dict[str, float]:
        """
        Calculate expected attempts by type
        
        Args:
            expected_plays: Total expected plays
            pass_rate: Expected pass rate
            
        Returns:
            Dict with 'pass_attempts' and 'rush_attempts'
        """
        # Account for sacks reducing pass attempts
        sack_rate = self.params['position_priors']['QB']['sack_rate']
        
        pass_plays = expected_plays * pass_rate
        pass_attempts = pass_plays * (1 - sack_rate)
        rush_attempts = expected_plays * (1 - pass_rate) + (pass_plays * sack_rate)
        
        return {
            'pass_attempts': pass_attempts,
            'rush_attempts': rush_attempts,
            'total_plays': expected_plays
        }
    
    def calculate_scoring_opportunities(self, team_total: float,
                                      expected_plays: float) -> Dict[str, float]:
        """
        Calculate red zone and scoring opportunities
        
        Args:
            team_total: Expected team points
            expected_plays: Expected total plays
            
        Returns:
            Dict with scoring opportunity metrics
        """
        # Estimate TD expectations
        expected_tds = team_total / 7  # Rough estimate
        
        # Red zone plays correlation with scoring
        rz_plays_per_td = 4.5  # Average plays per RZ trip
        rz_td_rate = 0.55  # RZ trips that end in TD
        
        rz_trips = expected_tds / rz_td_rate
        rz_plays = rz_trips * rz_plays_per_td
        rz_play_rate = rz_plays / expected_plays
        
        return {
            'expected_tds': expected_tds,
            'rz_trips': rz_trips,
            'rz_plays': rz_plays,
            'rz_play_rate': rz_play_rate,
            'two_pt_attempts': expected_tds * 0.02  # 2% of TDs
        }
