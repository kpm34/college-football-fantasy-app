import numpy as np
from scipy import stats
from typing import Dict, Optional
import json

class PlayerGameSimulator:
    """Simulate single game performance for players"""
    
    def __init__(self, params_path: str = "src/priors/params.json"):
        with open(params_path, 'r') as f:
            self.params = json.load(f)
    
    def simulate_qb_game(self, attempts: float, usage_prior: Dict[str, float],
                        opp_strength: float = 1.0) -> Dict[str, float]:
        """
        Simulate QB game performance
        
        Args:
            attempts: Expected pass attempts
            usage_prior: Dict with QB-specific priors
            opp_strength: Opponent defensive strength multiplier
            
        Returns:
            Dict of game stats
        """
        priors = self.params['position_priors']['QB']
        
        # Sample actual attempts (Poisson)
        actual_attempts = np.random.poisson(attempts)
        
        if actual_attempts == 0:
            return self._empty_qb_stats()
        
        # Completions (Binomial with shrunk rate)
        comp_rate = usage_prior.get('completion_rate', priors['completion_rate']['alpha'] / 
                                   (priors['completion_rate']['alpha'] + priors['completion_rate']['beta']))
        completions = np.random.binomial(actual_attempts, comp_rate * (2 - opp_strength))
        
        # Passing yards (Log-normal)
        ypa_mean = priors['yards_per_attempt']['mu']
        ypa_sigma = priors['yards_per_attempt']['sigma']
        
        # Adjust for opponent
        adj_ypa_mean = ypa_mean * (2 - opp_strength)
        
        # Sample yards with log-normal
        if completions > 0:
            total_yards_mean = np.log(actual_attempts * adj_ypa_mean)
            total_yards_sigma = ypa_sigma / np.sqrt(actual_attempts)
            passing_yards = np.random.lognormal(total_yards_mean, total_yards_sigma)
        else:
            passing_yards = 0
        
        # TDs and INTs (Poisson)
        td_rate = priors['td_rate'] * usage_prior.get('rz_share_boost', 1.0)
        passing_tds = np.random.poisson(actual_attempts * td_rate * (2 - opp_strength))
        
        int_rate = priors['int_rate']
        interceptions = np.random.poisson(actual_attempts * int_rate * opp_strength)
        
        # Rushing stats
        rush_share = priors['rush_share']
        qb_rushes = np.random.poisson(attempts * rush_share * 0.8)  # Some designed runs
        
        if qb_rushes > 0:
            rush_yards = np.random.normal(qb_rushes * 4.5, qb_rushes * 3.5)
            rush_yards = max(rush_yards, -10)  # Floor for sack yards
        else:
            rush_yards = 0
            
        # Rush TDs rare for QBs
        rush_tds = np.random.poisson(qb_rushes * 0.08) if qb_rushes > 0 else 0
        
        return {
            'pass_attempts': actual_attempts,
            'completions': completions,
            'passing_yards': passing_yards,
            'passing_tds': passing_tds,
            'interceptions': interceptions,
            'rush_attempts': qb_rushes,
            'rushing_yards': rush_yards,
            'rushing_tds': rush_tds,
            'two_point_conversions': np.random.poisson(0.02)  # Rare
        }
    
    def simulate_rb_game(self, team_carries: float, team_targets: float,
                        usage_shares: Dict[str, float], 
                        opp_strength: Dict[str, float]) -> Dict[str, float]:
        """
        Simulate RB game performance
        
        Args:
            team_carries: Team rush attempts
            team_targets: Team pass attempts  
            usage_shares: Player's rush_share and target_share
            opp_strength: Dict with 'rush' and 'pass' defense strengths
            
        Returns:
            Dict of game stats
        """
        priors = self.params['position_priors']['RB']
        
        # Carries (Poisson)
        rush_share = usage_shares.get('rush_share', 0.25)
        expected_carries = team_carries * rush_share
        carries = np.random.poisson(expected_carries)
        
        # Rushing yards (Normal with YPC variance)
        if carries > 0:
            ypc_mean = priors['yards_per_carry']['mu'] * (2 - opp_strength.get('rush', 1.0))
            ypc_sigma = priors['yards_per_carry']['sigma']
            
            # Total yards with between-carry variance
            total_rush_mean = carries * ypc_mean
            total_rush_sigma = np.sqrt(carries) * ypc_sigma
            rushing_yards = np.random.normal(total_rush_mean, total_rush_sigma)
            rushing_yards = max(rushing_yards, -5)  # Floor
        else:
            rushing_yards = 0
        
        # Targets (Poisson)
        target_share = usage_shares.get('target_share', 0.15)
        expected_targets = team_targets * target_share
        targets = np.random.poisson(expected_targets)
        
        # Receptions and receiving yards
        if targets > 0:
            catch_rate = priors['catch_rate']
            receptions = np.random.binomial(targets, catch_rate)
            
            if receptions > 0:
                # RBs have shorter catches
                rec_yards_mean = receptions * 7.0 * (2 - opp_strength.get('pass', 1.0))
                rec_yards_sigma = np.sqrt(receptions) * 4.0
                receiving_yards = np.random.normal(rec_yards_mean, rec_yards_sigma)
                receiving_yards = max(receiving_yards, 0)
            else:
                receiving_yards = 0
        else:
            receptions = 0
            receiving_yards = 0
        
        # TDs (Poisson based on usage and field position)
        rush_td_rate = priors['td_rate_rush'] * usage_shares.get('rz_share', rush_share * 1.2)
        rushing_tds = np.random.poisson(carries * rush_td_rate * (2 - opp_strength.get('rush', 1.0)))
        
        rec_td_rate = priors['td_rate_rec']
        receiving_tds = np.random.poisson(targets * rec_td_rate * (2 - opp_strength.get('pass', 1.0)))
        
        return {
            'rush_attempts': carries,
            'rushing_yards': rushing_yards,
            'rushing_tds': rushing_tds,
            'targets': targets,
            'receptions': receptions,
            'receiving_yards': receiving_yards,
            'receiving_tds': receiving_tds,
            'two_point_conversions': np.random.poisson(0.01)
        }
    
    def simulate_wr_game(self, team_attempts: float, usage_shares: Dict[str, float],
                        opp_strength: float = 1.0) -> Dict[str, float]:
        """
        Simulate WR/TE game performance
        
        Args:
            team_attempts: Team pass attempts
            usage_shares: Player's target_share and route_share
            opp_strength: Opponent pass defense strength
            
        Returns:
            Dict of game stats
        """
        priors = self.params['position_priors']['WR']
        
        # Targets (Poisson)
        target_share = usage_shares.get('target_share', 0.20)
        expected_targets = team_attempts * target_share
        targets = np.random.poisson(expected_targets)
        
        if targets == 0:
            return self._empty_wr_stats()
        
        # Receptions (Binomial)
        catch_rate = usage_shares.get('catch_rate', 0.65)
        adj_catch_rate = catch_rate * (2 - opp_strength) / 1.5  # Normalize
        receptions = np.random.binomial(targets, min(adj_catch_rate, 0.95))
        
        if receptions == 0:
            return {**self._empty_wr_stats(), 'targets': targets}
        
        # Receiving yards (Log-normal)
        ypr_mean = priors['yards_per_reception']['mu']
        ypr_sigma = priors['yards_per_reception']['sigma']
        
        # Adjust for opponent and target depth
        adot = usage_shares.get('adot', priors['adot'])
        depth_factor = adot / priors['adot']
        adj_ypr_mean = ypr_mean * depth_factor * (2 - opp_strength)
        
        # Total yards
        total_yards_mean = np.log(receptions * adj_ypr_mean)
        total_yards_sigma = ypr_sigma / np.sqrt(receptions)
        receiving_yards = np.random.lognormal(total_yards_mean, total_yards_sigma)
        
        # TDs (Poisson)
        td_rate = priors['td_rate'] * usage_shares.get('rz_target_share', target_share * 0.8)
        receiving_tds = np.random.poisson(targets * td_rate * (2 - opp_strength))
        
        # Occasional rush
        rush_attempts = np.random.poisson(0.1) if np.random.random() < 0.05 else 0
        rushing_yards = np.random.normal(8, 5) * rush_attempts if rush_attempts > 0 else 0
        
        return {
            'targets': targets,
            'receptions': receptions,
            'receiving_yards': receiving_yards,
            'receiving_tds': receiving_tds,
            'rush_attempts': rush_attempts,
            'rushing_yards': max(rushing_yards, -5),
            'rushing_tds': 0,
            'two_point_conversions': np.random.poisson(0.005)
        }
    
    def _empty_qb_stats(self) -> Dict[str, float]:
        """Return empty QB stats"""
        return {
            'pass_attempts': 0, 'completions': 0, 'passing_yards': 0,
            'passing_tds': 0, 'interceptions': 0, 'rush_attempts': 0,
            'rushing_yards': 0, 'rushing_tds': 0, 'two_point_conversions': 0
        }
    
    def _empty_wr_stats(self) -> Dict[str, float]:
        """Return empty WR stats"""
        return {
            'targets': 0, 'receptions': 0, 'receiving_yards': 0,
            'receiving_tds': 0, 'rush_attempts': 0, 'rushing_yards': 0,
            'rushing_tds': 0, 'two_point_conversions': 0
        }
