import pandas as pd
import numpy as np
from typing import Dict, List, Optional
import json
from datetime import datetime
import os

from src.sim.season import SeasonSimulator
from src.export.draft_board import DraftBoardExporter
from src.priors.rates import BetaBinomialShrinkage
from dataio.games import get_team_schedule
from dataio.team_rates import get_team_priors
from dataio.player_usage import get_player_usage_shares, calculate_shrunk_shares

class ProjectionsPipeline:
    """Main pipeline to generate projections for all players"""
    
    def __init__(self, output_dir: str = "out/"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        
        self.simulator = SeasonSimulator()
        self.exporter = DraftBoardExporter(output_path=f"{output_dir}draft_board.csv")
        self.shrinkage = BetaBinomialShrinkage()
    
    def run_projections(self, players_df: pd.DataFrame,
                       n_sims: int = 1000,
                       league_size: int = 12) -> pd.DataFrame:
        """
        Run full projection pipeline
        
        Args:
            players_df: DataFrame with player info from Appwrite
            n_sims: Number of simulations per player
            league_size: Number of teams in league
            
        Returns:
            DataFrame with projections
        """
        print(f"Starting projections for {len(players_df)} players...")
        
        # Get team priors
        team_priors = get_team_priors()
        
        # Prepare player data
        players_data = []
        schedule_data = {}
        
        for _, player in players_df.iterrows():
            team = player['team']
            
            # Get team info
            team_info = team_priors[team_priors['team'] == team].iloc[0].to_dict() \
                       if team in team_priors['team'].values else {}
            
            # Get schedule if not cached
            if team not in schedule_data:
                schedule = get_team_schedule(team)
                schedule_data[team] = self._prepare_schedule(schedule, team_priors)
            
            # Get player usage
            usage_priors = self._get_player_usage(player)
            
            # Add to players data
            players_data.append({
                'player_id': player['id'],
                'name': player['name'],
                'position': player['position'],
                'team': team,
                'team_info': team_info,
                'usage_priors': usage_priors,
                'rating': player.get('rating', 80),
                'year': player.get('year', 'JR')
            })
        
        # Run projections
        projections_df = self.exporter.generate_draft_board(
            players_data, schedule_data, league_size, n_sims
        )
        
        # Add player names and info back
        projections_df = projections_df.merge(
            players_df[['id', 'name', 'team', 'conference', 'year', 'rating']],
            left_on='player_id', right_on='id', how='left'
        )
        
        return projections_df
    
    def _prepare_schedule(self, schedule_df: pd.DataFrame,
                         team_priors_df: pd.DataFrame) -> List[Dict]:
        """Convert schedule DataFrame to list of dicts with opponent info"""
        schedule_list = []
        
        for _, game in schedule_df.iterrows():
            opp = game['opponent']
            
            # Get opponent stats
            opp_info = team_priors_df[team_priors_df['team'] == opp].iloc[0] \
                      if opp in team_priors_df['team'].values else {}
            
            game_dict = {
                'week': game['week'],
                'home_team': game['opponent'] if game['home_away'] == 'A' else game['team'],
                'away_team': game['team'] if game['home_away'] == 'A' else game['opponent'],
                'total': game.get('total', 48),
                'opp_pace': opp_info.get('pace_adj', 70),
                'opp_pass_defense': np.random.normal(1.0, 0.15),  # Would come from data
                'opp_rush_defense': np.random.normal(1.0, 0.15)   # Would come from data
            }
            
            schedule_list.append(game_dict)
        
        return schedule_list
    
    def _get_player_usage(self, player: Dict) -> Dict[str, float]:
        """Get player usage priors with shrinkage"""
        position = player['position']
        rating = player.get('rating', 80)
        
        # Scale usage by rating (higher rating = more usage)
        rating_mult = rating / 80  # 80 is average
        
        # Base usage by position
        base_usage = {
            'QB': {
                'completion_rate': 0.60 + 0.05 * (rating_mult - 1),
                'rz_share_boost': 0.9 + 0.2 * (rating_mult - 1)
            },
            'RB': {
                'rush_share': 0.20 * rating_mult,
                'target_share': 0.08 * rating_mult,
                'rz_share': 0.25 * rating_mult
            },
            'WR': {
                'target_share': 0.15 * rating_mult,
                'catch_rate': 0.60 + 0.05 * (rating_mult - 1),
                'adot': 10.5 + 2 * (rating_mult - 1),
                'rz_target_share': 0.12 * rating_mult
            },
            'TE': {
                'target_share': 0.12 * rating_mult,
                'catch_rate': 0.65 + 0.05 * (rating_mult - 1),
                'adot': 8.5,
                'rz_target_share': 0.10 * rating_mult
            }
        }
        
        return base_usage.get(position, {})
    
    def create_api_response(self, projections_df: pd.DataFrame) -> List[Dict]:
        """
        Format projections for API response
        
        Args:
            projections_df: DataFrame with projections
            
        Returns:
            List of player projection dicts
        """
        projections = []
        
        for _, row in projections_df.iterrows():
            projection = {
                'playerId': row['player_id'],
                'playerName': row['name'],
                'position': row['position'],
                'team': row['team'],
                'conference': row.get('conference', ''),
                'year': row.get('year', ''),
                'rating': row.get('rating', 80),
                
                # Projections
                'fantasyPoints': round(row['mean'], 1),
                'floor': round(row['p10'], 1),
                'ceiling': round(row['p90'], 1),
                'consistency': round(row.get('consistency', 0.7), 2),
                
                # Rankings
                'overallRank': int(row['overall_rank']),
                'positionRank': int(row['position_rank']),
                'tier': int(row['tier']),
                'vorp': round(row['vorp'], 1),
                'adp': row.get('adp', row['overall_rank']),
                
                # Stats projections (would be calculated in season sim)
                'projectedStats': self._get_projected_stats(row)
            }
            
            projections.append(projection)
        
        return projections
    
    def _get_projected_stats(self, row: pd.Series) -> Dict[str, float]:
        """Extract projected stats based on position"""
        position = row['position']
        points = row['mean']
        
        # Reverse engineer approximate stats from points
        if position == 'QB':
            return {
                'passingYards': round(points * 11),
                'passingTDs': round(points * 0.11),
                'interceptions': round(points * 0.04),
                'rushingYards': round(points * 0.5),
                'rushingTDs': round(points * 0.01)
            }
        elif position == 'RB':
            return {
                'rushingYards': round(points * 5),
                'rushingTDs': round(points * 0.06),
                'receptions': round(points * 0.15),
                'receivingYards': round(points * 1.2),
                'receivingTDs': round(points * 0.01)
            }
        elif position in ['WR', 'TE']:
            return {
                'receptions': round(points * 0.35),
                'receivingYards': round(points * 4.5),
                'receivingTDs': round(points * 0.04),
                'rushingYards': round(points * 0.1) if position == 'WR' else 0,
                'rushingTDs': 0
            }
        
        return {}


# Example usage
if __name__ == "__main__":
    # Sample player data (would come from Appwrite)
    sample_players = pd.DataFrame({
        'id': ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'],
        'name': ['Quinn Ewers', 'Ollie Gordon', 'Luther Burden', 
                'Carson Beck', 'Quinshon Judkins', 'Emeka Egbuka'],
        'position': ['QB', 'RB', 'WR', 'QB', 'RB', 'WR'],
        'team': ['TEX', 'OKST', 'MIZ', 'UGA', 'OSU', 'OSU'],
        'conference': ['SEC', 'B12', 'SEC', 'SEC', 'B10', 'B10'],
        'year': ['JR', 'JR', 'JR', 'SR', 'JR', 'SR'],
        'rating': [92, 91, 89, 90, 88, 87]
    })
    
    # Run pipeline
    pipeline = ProjectionsPipeline()
    projections = pipeline.run_projections(sample_players, n_sims=100)
    
    # Convert to API format
    api_response = pipeline.create_api_response(projections)
    
    print(f"\nGenerated projections for {len(api_response)} players")
    print("\nTop 5 by projected points:")
    for p in sorted(api_response, key=lambda x: x['fantasyPoints'], reverse=True)[:5]:
        print(f"{p['playerName']} ({p['position']}) - {p['fantasyPoints']} pts")
