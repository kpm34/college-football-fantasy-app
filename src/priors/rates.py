import numpy as np
from typing import Dict, Tuple, Optional
import json

class BetaBinomialShrinkage:
    """Implements Beta-Binomial shrinkage for rate statistics"""
    
    def __init__(self, params_path: str = "src/priors/params.json"):
        with open(params_path, 'r') as f:
            self.params = json.load(f)
    
    def shrink_rate(self, successes: int, attempts: int, 
                    alpha_prior: float, beta_prior: float) -> float:
        """
        Apply Beta-Binomial shrinkage to a rate statistic
        
        τ̂p = (Tp + α) / (At + α + β)
        
        Args:
            successes: Number of successes (e.g., targets, completions)
            attempts: Number of attempts
            alpha_prior: Beta distribution alpha parameter
            beta_prior: Beta distribution beta parameter
            
        Returns:
            Shrunken rate estimate
        """
        if attempts == 0:
            # Return prior mean if no data
            return alpha_prior / (alpha_prior + beta_prior)
        
        return (successes + alpha_prior) / (attempts + alpha_prior + beta_prior)
    
    def get_position_priors(self, position: str) -> Dict[str, Dict[str, float]]:
        """Get position-specific priors"""
        return self.params['position_priors'].get(position, {})
    
    def shrink_to_conference(self, team_value: float, conference_mean: float,
                           weight: Optional[float] = None) -> float:
        """
        Shrink team-level stat to conference mean
        
        Args:
            team_value: Team's raw value
            conference_mean: Conference average
            weight: Shrinkage weight (0-1), defaults to config value
            
        Returns:
            Weighted average of team and conference values
        """
        if weight is None:
            weight = self.params['team_priors']['conference_shrink_weight']
        
        return team_value * (1 - weight) + conference_mean * weight
    
    def calculate_usage_shares(self, player_stats: Dict[str, int], 
                             team_stats: Dict[str, int],
                             position: str) -> Dict[str, float]:
        """
        Calculate shrunken usage shares for a player
        
        Args:
            player_stats: Dict with player's targets, carries, etc.
            team_stats: Dict with team totals
            position: Player position
            
        Returns:
            Dict of shrunken share estimates
        """
        priors = self.get_position_priors(position)
        shares = {}
        
        if position in ['WR', 'TE']:
            if 'target_share' in priors:
                alpha, beta = priors['target_share']['alpha'], priors['target_share']['beta']
                shares['target_share'] = self.shrink_rate(
                    player_stats.get('targets', 0),
                    team_stats.get('pass_attempts', 1),
                    alpha, beta
                )
        
        if position == 'RB':
            if 'rush_share' in priors:
                alpha, beta = priors['rush_share']['alpha'], priors['rush_share']['beta']
                shares['rush_share'] = self.shrink_rate(
                    player_stats.get('carries', 0),
                    team_stats.get('rush_attempts', 1),
                    alpha, beta
                )
            
            if 'target_share' in priors:
                alpha, beta = priors['target_share']['alpha'], priors['target_share']['beta']
                shares['target_share'] = self.shrink_rate(
                    player_stats.get('targets', 0),
                    team_stats.get('pass_attempts', 1),
                    alpha, beta
                )
        
        return shares
    
    def adjust_for_returning_production(self, base_share: float, 
                                      returning_prod: float) -> float:
        """
        Adjust usage share based on returning production
        
        Args:
            base_share: Base usage share
            returning_prod: Team's returning production percentage (0-1)
            
        Returns:
            Adjusted share
        """
        rp_params = self.params['returning_production_boost']
        min_boost, max_boost = rp_params['range']
        weight = rp_params['weight']
        
        # Scale boost based on returning production
        boost = min_boost + (max_boost - min_boost) * returning_prod
        adjustment = 1 + boost * weight
        
        # Apply boost and cap at 1.0
        return min(base_share * adjustment, 1.0)
    
    def apply_depth_chart_modifier(self, base_projection: float,
                                 depth_position: str,
                                 is_rookie_wr: bool = False) -> float:
        """
        Apply depth chart position modifier
        
        Args:
            base_projection: Base projection value
            depth_position: 'starter', 'backup', or 'third_string'
            is_rookie_wr: Whether player is a rookie WR
            
        Returns:
            Modified projection
        """
        modifiers = self.params['depth_chart_modifiers']
        modifier = modifiers.get(depth_position, 1.0)
        
        if is_rookie_wr and depth_position == 'starter':
            modifier *= (1 - modifiers['rookie_wr_discount'])
        
        return base_projection * modifier
