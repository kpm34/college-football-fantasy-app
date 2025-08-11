import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
import json
from concurrent.futures import ProcessPoolExecutor, as_completed
import multiprocessing as mp

from src.sim.player_game import PlayerGameSimulator
from src.features.game_expectation import GameExpectation
from src.priors.rates import BetaBinomialShrinkage

class SeasonSimulator:
    """Simulate full season performance for players"""
    
    def __init__(self, scoring_config_path: str = "src/config/scoring.json"):
        with open(scoring_config_path, 'r') as f:
            self.scoring_config = json.load(f)
        
        self.game_sim = PlayerGameSimulator()
        self.game_expect = GameExpectation()
        self.shrinkage = BetaBinomialShrinkage()
    
    def simulate_season(self, player_id: str, player_info: Dict,
                       schedule: List[Dict], usage_priors: Dict,
                       n_sims: int = 5000) -> Dict[str, float]:
        """
        Simulate full season for a player
        
        Args:
            player_id: Player identifier
            player_info: Dict with position, team, etc.
            schedule: List of game dicts with opponent info
            usage_priors: Player's usage share priors
            n_sims: Number of simulations
            
        Returns:
            Dict with mean, p10, p25, p50, p75, p90 fantasy points
        """
        position = player_info['position']
        team = player_info['team']
        
        # Run simulations
        season_totals = []
        
        for sim in range(n_sims):
            season_stats = self._simulate_single_season(
                player_info, schedule, usage_priors
            )
            
            # Calculate fantasy points
            fantasy_points = self._calculate_fantasy_points(season_stats, position)
            season_totals.append(fantasy_points)
        
        # Calculate percentiles
        season_totals = np.array(season_totals)
        
        return {
            'player_id': player_id,
            'position': position,
            'team': team,
            'games': len(schedule),
            'mean': np.mean(season_totals),
            'std': np.std(season_totals),
            'min': np.min(season_totals),
            'max': np.max(season_totals),
            'p10': np.percentile(season_totals, 10),
            'p25': np.percentile(season_totals, 25),
            'p50': np.percentile(season_totals, 50),
            'p75': np.percentile(season_totals, 75),
            'p90': np.percentile(season_totals, 90),
            'p95': np.percentile(season_totals, 95),
            'p99': np.percentile(season_totals, 99)
        }
    
    def _simulate_single_season(self, player_info: Dict, 
                               schedule: List[Dict],
                               usage_priors: Dict) -> Dict[str, float]:
        """Simulate one season iteration"""
        position = player_info['position']
        team_info = player_info.get('team_info', {})
        
        # Initialize season totals
        season_stats = {
            'passing_yards': 0, 'passing_tds': 0, 'interceptions': 0,
            'rushing_yards': 0, 'rushing_tds': 0, 'rush_attempts': 0,
            'receptions': 0, 'receiving_yards': 0, 'receiving_tds': 0,
            'targets': 0, 'two_point_conversions': 0
        }
        
        for game in schedule:
            # Skip if player is injured/suspended for this game
            if game.get(f'{player_info["player_id"]}_out', False):
                continue
            
            # Get game expectations
            is_home = game['home_team'] == player_info['team']
            team_pace = team_info.get('pace', 70)
            opp_pace = game.get('opp_pace', 70)
            game_total = game.get('total', 48)
            
            expected_plays = self.game_expect.expected_plays(
                team_pace if is_home else opp_pace,
                opp_pace if is_home else team_pace,
                game_total,
                is_home
            )
            
            # Get pass/run mix
            team_pass_rate = team_info.get('pass_rate', 0.58)
            opp_pass_def = game.get('opp_pass_defense', 1.0)
            opp_rush_def = game.get('opp_rush_defense', 1.0)
            
            pass_rate, rush_rate = self.game_expect.expected_mix(
                team_pass_rate, opp_pass_def, opp_rush_def
            )
            
            # Get team attempts
            attempts = self.game_expect.calculate_team_attempts(
                expected_plays, pass_rate
            )
            
            # Simulate game based on position
            if position == 'QB':
                game_stats = self.game_sim.simulate_qb_game(
                    attempts['pass_attempts'],
                    usage_priors,
                    opp_pass_def
                )
            elif position == 'RB':
                game_stats = self.game_sim.simulate_rb_game(
                    attempts['rush_attempts'],
                    attempts['pass_attempts'],
                    usage_priors,
                    {'rush': opp_rush_def, 'pass': opp_pass_def}
                )
            elif position in ['WR', 'TE']:
                game_stats = self.game_sim.simulate_wr_game(
                    attempts['pass_attempts'],
                    usage_priors,
                    opp_pass_def
                )
            else:
                continue
            
            # Add to season totals
            for stat, value in game_stats.items():
                if stat in season_stats:
                    season_stats[stat] += value
        
        return season_stats
    
    def _calculate_fantasy_points(self, stats: Dict[str, float], 
                                position: str) -> float:
        """Calculate fantasy points from stats"""
        points = 0.0
        scoring = self.scoring_config['points']
        
        # Passing points
        if position == 'QB':
            points += stats.get('passing_yards', 0) * scoring['passing']['yards']
            points += stats.get('passing_tds', 0) * scoring['passing']['touchdowns']
            points += stats.get('interceptions', 0) * scoring['passing']['interceptions']
        
        # Rushing points
        points += stats.get('rushing_yards', 0) * scoring['rushing']['yards']
        points += stats.get('rushing_tds', 0) * scoring['rushing']['touchdowns']
        
        # Receiving points
        points += stats.get('receiving_yards', 0) * scoring['receiving']['yards']
        points += stats.get('receiving_tds', 0) * scoring['receiving']['touchdowns']
        points += stats.get('receptions', 0) * scoring['receiving']['receptions']
        
        # Two point conversions
        points += stats.get('two_point_conversions', 0) * 2
        
        # Bonuses
        bonuses = self.scoring_config['points']['bonuses']
        
        if position == 'QB':
            if stats.get('passing_yards', 0) >= 400:
                points += bonuses['passing_400_yards']
            elif stats.get('passing_yards', 0) >= 300:
                points += bonuses['passing_300_yards']
        
        if stats.get('rushing_yards', 0) >= 200:
            points += bonuses['rushing_200_yards']
        elif stats.get('rushing_yards', 0) >= 100:
            points += bonuses['rushing_100_yards']
            
        if stats.get('receiving_yards', 0) >= 200:
            points += bonuses['receiving_200_yards']
        elif stats.get('receiving_yards', 0) >= 100:
            points += bonuses['receiving_100_yards']
        
        return points
    
    def simulate_multiple_players(self, players_data: List[Dict],
                                 schedule_data: Dict[str, List[Dict]],
                                 n_sims: int = 1000,
                                 n_cores: Optional[int] = None) -> pd.DataFrame:
        """
        Simulate multiple players in parallel
        
        Args:
            players_data: List of player info dicts
            schedule_data: Dict mapping team to schedule
            n_sims: Simulations per player
            n_cores: Number of CPU cores to use
            
        Returns:
            DataFrame with all projections
        """
        if n_cores is None:
            n_cores = mp.cpu_count() - 1
        
        results = []
        
        # Create tasks
        tasks = []
        for player in players_data:
            team = player['team']
            schedule = schedule_data.get(team, [])
            
            # Get usage priors (would come from database/model)
            usage_priors = self._get_player_usage_priors(player)
            
            tasks.append({
                'player_id': player['player_id'],
                'player_info': player,
                'schedule': schedule,
                'usage_priors': usage_priors,
                'n_sims': n_sims
            })
        
        # Run in parallel
        with ProcessPoolExecutor(max_workers=n_cores) as executor:
            futures = {
                executor.submit(
                    self.simulate_season,
                    task['player_id'],
                    task['player_info'],
                    task['schedule'],
                    task['usage_priors'],
                    task['n_sims']
                ): task['player_id']
                for task in tasks
            }
            
            for future in as_completed(futures):
                try:
                    result = future.result()
                    results.append(result)
                except Exception as e:
                    print(f"Error simulating player {futures[future]}: {e}")
        
        return pd.DataFrame(results)
    
    def _get_player_usage_priors(self, player: Dict) -> Dict[str, float]:
        """Get usage priors for a player (placeholder)"""
        position = player['position']
        
        # Default priors by position
        defaults = {
            'QB': {
                'completion_rate': 0.65,
                'rz_share_boost': 1.0
            },
            'RB': {
                'rush_share': 0.25,
                'target_share': 0.10,
                'rz_share': 0.30
            },
            'WR': {
                'target_share': 0.20,
                'catch_rate': 0.65,
                'adot': 10.5,
                'rz_target_share': 0.15
            },
            'TE': {
                'target_share': 0.15,
                'catch_rate': 0.70,
                'adot': 8.5,
                'rz_target_share': 0.12
            }
        }
        
        return defaults.get(position, {})
