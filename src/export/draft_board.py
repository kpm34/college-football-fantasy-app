import pandas as pd
import numpy as np
from typing import Dict, List, Optional
import json
from datetime import datetime

from src.sim.season import SeasonSimulator

class DraftBoardExporter:
    """Generate draft board with projections, VORP, and tiers"""
    
    def __init__(self, scoring_config_path: str = "src/config/scoring.json",
                 output_path: str = "out/draft_board.csv"):
        with open(scoring_config_path, 'r') as f:
            self.scoring_config = json.load(f)
        
        self.output_path = output_path
        self.simulator = SeasonSimulator(scoring_config_path)
    
    def generate_draft_board(self, players_data: List[Dict],
                           schedule_data: Dict[str, List[Dict]],
                           league_size: int = 12,
                           n_sims: int = 1000) -> pd.DataFrame:
        """
        Generate complete draft board with projections and rankings
        
        Args:
            players_data: List of player info dicts
            schedule_data: Dict mapping team to schedule
            league_size: Number of teams in league
            n_sims: Simulations per player
            
        Returns:
            DataFrame with draft board
        """
        print(f"Simulating {len(players_data)} players with {n_sims} iterations each...")
        
        # Run simulations
        projections_df = self.simulator.simulate_multiple_players(
            players_data, schedule_data, n_sims
        )
        
        # Calculate replacement levels
        replacement_levels = self._calculate_replacement_levels(
            projections_df, league_size
        )
        
        # Calculate VORP
        projections_df = self._calculate_vorp(projections_df, replacement_levels)
        
        # Create tiers
        projections_df = self._create_tiers(projections_df)
        
        # Add additional metrics
        projections_df = self._add_draft_metrics(projections_df)
        
        # Sort by VORP
        projections_df = projections_df.sort_values('vorp', ascending=False)
        
        # Add overall rank
        projections_df['overall_rank'] = range(1, len(projections_df) + 1)
        
        # Save to CSV
        projections_df.to_csv(self.output_path, index=False)
        print(f"Draft board saved to {self.output_path}")
        
        return projections_df
    
    def _calculate_replacement_levels(self, df: pd.DataFrame, 
                                    league_size: int) -> Dict[str, float]:
        """Calculate replacement level for each position"""
        replacement_config = self.scoring_config['replacement_levels']
        replacement_levels = {}
        
        for position in ['QB', 'RB', 'WR', 'TE']:
            pos_df = df[df['position'] == position].copy()
            
            if len(pos_df) == 0:
                replacement_levels[position] = 0
                continue
            
            # Sort by mean points
            pos_df = pos_df.sort_values('mean', ascending=False)
            
            # Get replacement rank
            if league_size == 12:
                replacement_rank = replacement_config[position]['12_team']
            else:
                # Scale from 12-team baseline
                replacement_rank = int(replacement_config[position]['12_team'] * 
                                     league_size / 12)
            
            # Get replacement level (with safety check)
            if len(pos_df) > replacement_rank:
                replacement_levels[position] = pos_df.iloc[replacement_rank - 1]['mean']
            else:
                replacement_levels[position] = pos_df.iloc[-1]['mean'] * 0.8
        
        return replacement_levels
    
    def _calculate_vorp(self, df: pd.DataFrame, 
                       replacement_levels: Dict[str, float]) -> pd.DataFrame:
        """Calculate Value Over Replacement Player"""
        df['replacement_level'] = df['position'].map(replacement_levels)
        df['vorp'] = df['mean'] - df['replacement_level']
        
        # VORP can't be negative
        df['vorp'] = df['vorp'].clip(lower=0)
        
        # Calculate position rank
        df['position_rank'] = df.groupby('position')['mean'].rank(
            ascending=False, method='min'
        ).astype(int)
        
        return df
    
    def _create_tiers(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create tiers based on overlapping projection ranges"""
        # Group by position
        for position in df['position'].unique():
            pos_mask = df['position'] == position
            pos_df = df[pos_mask].sort_values('mean', ascending=False)
            
            if len(pos_df) == 0:
                continue
            
            # Initialize tiers
            tiers = []
            current_tier = 1
            tier_min = pos_df.iloc[0]['p25']
            
            for idx, row in pos_df.iterrows():
                # Check if this player's p75 overlaps with tier minimum
                if row['p75'] >= tier_min * 0.95:  # 5% buffer
                    tiers.append(current_tier)
                else:
                    # Start new tier
                    current_tier += 1
                    tier_min = row['p25']
                    tiers.append(current_tier)
            
            # Assign tiers back to main dataframe
            df.loc[pos_mask, 'tier'] = df.loc[pos_mask, 'player_id'].map(
                dict(zip(pos_df['player_id'], tiers))
            )
        
        df['tier'] = df['tier'].astype(int)
        return df
    
    def _add_draft_metrics(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add additional draft-relevant metrics"""
        # Coefficient of variation (risk metric)
        df['cv'] = df['std'] / df['mean']
        df['cv'] = df['cv'].fillna(0)
        
        # Upside (p90 vs mean)
        df['upside'] = (df['p90'] - df['mean']) / df['mean']
        df['upside'] = df['upside'].fillna(0)
        
        # Floor (mean vs p10)  
        df['floor'] = (df['mean'] - df['p10']) / df['mean']
        df['floor'] = df['floor'].fillna(0)
        
        # Consistency score (lower CV is better)
        df['consistency'] = 1 / (1 + df['cv'])
        
        # Value score (VORP adjusted for risk)
        df['value_score'] = df['vorp'] * df['consistency']
        
        # ADP (would come from external source, using rank as proxy)
        df['adp'] = df.groupby('position').cumcount() + 1
        
        # ADP value (negative means going later than projected)
        df['adp_diff'] = df['position_rank'] - df['adp']
        
        return df
    
    def export_by_position(self, df: pd.DataFrame, output_dir: str = "out/"):
        """Export separate files by position"""
        for position in df['position'].unique():
            pos_df = df[df['position'] == position].copy()
            pos_df.to_csv(f"{output_dir}{position}_projections.csv", index=False)
    
    def create_cheat_sheet(self, df: pd.DataFrame, 
                          output_path: str = "out/cheat_sheet.csv"):
        """Create condensed cheat sheet for draft day"""
        # Select key columns
        cheat_sheet_cols = [
            'overall_rank', 'player_id', 'position', 'team',
            'position_rank', 'tier', 'mean', 'vorp', 
            'consistency', 'upside', 'adp_diff'
        ]
        
        cheat_sheet = df[cheat_sheet_cols].copy()
        
        # Round numeric columns
        numeric_cols = ['mean', 'vorp', 'consistency', 'upside']
        cheat_sheet[numeric_cols] = cheat_sheet[numeric_cols].round(1)
        
        # Add tier labels
        cheat_sheet['tier_label'] = (cheat_sheet['position'] + 
                                     cheat_sheet['tier'].astype(str))
        
        cheat_sheet.to_csv(output_path, index=False)
        print(f"Cheat sheet saved to {output_path}")
        
        return cheat_sheet


def create_sample_data():
    """Create sample player and schedule data for testing"""
    # Sample players
    players = [
        # QBs
        {'player_id': 'QB1', 'name': 'Quinn Ewers', 'position': 'QB', 
         'team': 'TEX', 'team_info': {'pace': 72, 'pass_rate': 0.62}},
        {'player_id': 'QB2', 'name': 'Carson Beck', 'position': 'QB',
         'team': 'UGA', 'team_info': {'pace': 68, 'pass_rate': 0.58}},
        
        # RBs
        {'player_id': 'RB1', 'name': 'Quinshon Judkins', 'position': 'RB',
         'team': 'OSU', 'team_info': {'pace': 75, 'pass_rate': 0.55}},
        {'player_id': 'RB2', 'name': 'Ollie Gordon', 'position': 'RB',
         'team': 'OKST', 'team_info': {'pace': 78, 'pass_rate': 0.60}},
        
        # WRs
        {'player_id': 'WR1', 'name': 'Luther Burden', 'position': 'WR',
         'team': 'MIZ', 'team_info': {'pace': 73, 'pass_rate': 0.64}},
        {'player_id': 'WR2', 'name': 'Emeka Egbuka', 'position': 'WR',
         'team': 'OSU', 'team_info': {'pace': 75, 'pass_rate': 0.55}},
    ]
    
    # Sample schedule (3 games)
    base_schedule = [
        {'week': 1, 'home_team': 'TEX', 'away_team': 'RICE', 'total': 54,
         'opp_pace': 65, 'opp_pass_defense': 1.2, 'opp_rush_defense': 1.1},
        {'week': 2, 'home_team': 'MICH', 'away_team': 'TEX', 'total': 48,
         'opp_pace': 68, 'opp_pass_defense': 0.9, 'opp_rush_defense': 0.85},
        {'week': 3, 'home_team': 'TEX', 'away_team': 'OU', 'total': 51,
         'opp_pace': 70, 'opp_pass_defense': 0.95, 'opp_rush_defense': 1.05},
    ]
    
    # Create schedule for each team
    schedule_data = {
        'TEX': base_schedule,
        'UGA': base_schedule,
        'OSU': base_schedule,
        'OKST': base_schedule,
        'MIZ': base_schedule,
    }
    
    return players, schedule_data


if __name__ == "__main__":
    # Test with sample data
    exporter = DraftBoardExporter()
    
    players, schedules = create_sample_data()
    
    # Generate draft board
    draft_board = exporter.generate_draft_board(
        players, schedules, league_size=12, n_sims=100  # Small for testing
    )
    
    # Create cheat sheet
    exporter.create_cheat_sheet(draft_board)
    
    print("\nTop 10 Players by VORP:")
    print(draft_board[['player_id', 'position', 'mean', 'vorp', 'tier']].head(10))
