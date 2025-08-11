#!/usr/bin/env python3
"""
Quick test of the projection system
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.export.draft_board import create_sample_data, DraftBoardExporter

def main():
    print("Testing CFB Fantasy Projection System...")
    print("=" * 50)
    
    # Create exporter
    exporter = DraftBoardExporter(output_path="test_output/draft_board.csv")
    
    # Get sample data
    players, schedules = create_sample_data()
    
    print(f"Running projections for {len(players)} players...")
    print("Players:", [p['name'] for p in players])
    print()
    
    # Run with small number of simulations for testing
    draft_board = exporter.generate_draft_board(
        players, schedules, 
        league_size=12, 
        n_sims=100  # Small for quick testing
    )
    
    # Create cheat sheet
    exporter.create_cheat_sheet(draft_board, "test_output/cheat_sheet.csv")
    
    print("\n" + "=" * 50)
    print("RESULTS:")
    print("=" * 50)
    
    # Display results
    print("\nTop Players by VORP:")
    print("-" * 40)
    for _, player in draft_board.head(10).iterrows():
        print(f"{player['position_rank']:2d}. {player['player_id']:4s} ({player['position']}) - "
              f"{player['mean']:6.1f} pts (VORP: {player['vorp']:5.1f}, Tier {player['tier']})")
    
    print("\n\nProjection Ranges:")
    print("-" * 40)
    for _, player in draft_board.head(6).iterrows():
        print(f"{player['player_id']:4s}: {player['p10']:5.1f} - {player['mean']:5.1f} - {player['p90']:5.1f} "
              f"(CV: {player['cv']:4.2f})")
    
    print(f"\n\nFull results saved to:")
    print(f"  - test_output/draft_board.csv")
    print(f"  - test_output/cheat_sheet.csv")

if __name__ == "__main__":
    # Create output directory
    os.makedirs("test_output", exist_ok=True)
    main()
