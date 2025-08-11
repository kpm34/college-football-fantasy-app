import pandas as pd
import numpy as np
from typing import Dict, Tuple

def get_team_priors(conference: str = None) -> pd.DataFrame:
    """
    Get team pace and style priors
    
    Args:
        conference: Optional conference filter
        
    Returns:
        DataFrame with team-level priors
    """
    # Sample data - would come from Appwrite
    teams_data = {
        'team': ['TEX', 'UGA', 'BAMA', 'OSU', 'MICH', 'OU', 'MIZ', 'OKST'],
        'conference': ['SEC', 'SEC', 'SEC', 'B10', 'B10', 'SEC', 'SEC', 'B12'],
        'pace_2024': [71, 68, 69, 75, 66, 72, 73, 78],
        'pass_rate_2024': [0.62, 0.58, 0.60, 0.55, 0.52, 0.61, 0.64, 0.60],
        'returning_production_off': [0.65, 0.72, 0.58, 0.81, 0.45, 0.69, 0.77, 0.83],
        'offensive_sp_plus': [112, 118, 115, 120, 108, 110, 105, 102]
    }
    
    df = pd.DataFrame(teams_data)
    
    if conference:
        df = df[df['conference'] == conference]
    
    # Apply conference shrinkage
    conf_means = df.groupby('conference')[['pace_2024', 'pass_rate_2024']].mean()
    
    # Shrink by 30% to conference mean
    for conf in df['conference'].unique():
        conf_mask = df['conference'] == conf
        df.loc[conf_mask, 'pace_adj'] = (
            0.7 * df.loc[conf_mask, 'pace_2024'] + 
            0.3 * conf_means.loc[conf, 'pace_2024']
        )
        df.loc[conf_mask, 'pass_rate_adj'] = (
            0.7 * df.loc[conf_mask, 'pass_rate_2024'] + 
            0.3 * conf_means.loc[conf, 'pass_rate_2024']
        )
    
    return df
