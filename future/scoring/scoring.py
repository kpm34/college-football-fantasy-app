"""
Fantasy Football Scoring System
Comprehensive scoring calculation with ESPN-style defaults and commissioner customization
"""

from typing import Dict, List, Optional, Union
import json

# Default ESPN-style scoring configuration
DEFAULT_SCORING_CONFIG = {
    # Passing
    "passing_yards": 0.04,  # 1 point per 25 yards
    "passing_tds": 4.0,
    "passing_ints": -2.0,
    "passing_2pt": 2.0,
    "passing_fumbles_lost": -2.0,
    
    # Rushing
    "rushing_yards": 0.1,  # 1 point per 10 yards
    "rushing_tds": 6.0,
    "rushing_2pt": 2.0,
    "rushing_fumbles_lost": -2.0,
    
    # Receiving
    "receiving_yards": 0.1,  # 1 point per 10 yards
    "receiving_tds": 6.0,
    "receiving_receptions": 0.0,  # PPR variants: 0.5 or 1.0
    "receiving_2pt": 2.0,
    "receiving_fumbles_lost": -2.0,
    
    # Kicking
    "fg_made_0_19": 3.0,
    "fg_made_20_29": 3.0,
    "fg_made_30_39": 3.0,
    "fg_made_40_49": 4.0,
    "fg_made_50_plus": 5.0,
    "fg_missed_0_19": -2.0,
    "fg_missed_20_29": -1.0,
    "fg_missed_30_39": -1.0,
    "fg_missed_40_49": 0.0,
    "fg_missed_50_plus": 0.0,
    "pat_made": 1.0,
    "pat_missed": -1.0,
    
    # Defense/Special Teams
    "def_sacks": 1.0,
    "def_ints": 2.0,
    "def_fumbles_recovered": 2.0,
    "def_fumbles_forced": 1.0,
    "def_tds": 6.0,
    "def_safeties": 2.0,
    "def_blocks": 2.0,
    "return_tds": 6.0,
    
    # Defense Points Allowed (team defense)
    "def_points_allowed_0": 10.0,
    "def_points_allowed_1_6": 7.0,
    "def_points_allowed_7_13": 4.0,
    "def_points_allowed_14_20": 1.0,
    "def_points_allowed_21_27": 0.0,
    "def_points_allowed_28_34": -1.0,
    "def_points_allowed_35_plus": -4.0,
    
    # Defense Yards Allowed (team defense)
    "def_yards_allowed_0_99": 10.0,
    "def_yards_allowed_100_199": 5.0,
    "def_yards_allowed_200_299": 3.0,
    "def_yards_allowed_300_399": 0.0,
    "def_yards_allowed_400_449": -1.0,
    "def_yards_allowed_450_499": -3.0,
    "def_yards_allowed_500_plus": -5.0,
    
    # Bonus scoring (optional)
    "passing_300_yard_bonus": 0.0,
    "passing_400_yard_bonus": 0.0,
    "rushing_100_yard_bonus": 0.0,
    "rushing_200_yard_bonus": 0.0,
    "receiving_100_yard_bonus": 0.0,
    "receiving_200_yard_bonus": 0.0,
}

# Scoring presets for common league types
SCORING_PRESETS = {
    "standard": DEFAULT_SCORING_CONFIG.copy(),
    "ppr": {**DEFAULT_SCORING_CONFIG, "receiving_receptions": 1.0},
    "half_ppr": {**DEFAULT_SCORING_CONFIG, "receiving_receptions": 0.5},
    "6pt_passing_td": {**DEFAULT_SCORING_CONFIG, "passing_tds": 6.0},
    "custom": {}  # Empty for full customization
}


def calc_points(stats: Dict[str, int], scoring_cfg: Optional[Dict[str, float]] = None) -> float:
    """
    Calculate fantasy points based on player statistics and scoring configuration.
    
    Args:
        stats: Dictionary of player statistics (stat_name -> value)
        scoring_cfg: Optional scoring configuration. Uses DEFAULT_SCORING_CONFIG if None.
    
    Returns:
        Total fantasy points as a float, rounded to 2 decimal places
    """
    if scoring_cfg is None:
        scoring_cfg = DEFAULT_SCORING_CONFIG
    
    total_points = 0.0
    
    # Direct stat calculations
    for stat_name, stat_value in stats.items():
        if stat_name in scoring_cfg and stat_value:
            points = stat_value * scoring_cfg[stat_name]
            total_points += points
    
    # Handle special calculations (defense points/yards allowed)
    total_points += _calculate_defense_points(stats, scoring_cfg)
    total_points += _calculate_defense_yards(stats, scoring_cfg)
    total_points += _calculate_field_goals(stats, scoring_cfg)
    total_points += _calculate_bonuses(stats, scoring_cfg)
    
    return round(total_points, 2)


def _calculate_defense_points(stats: Dict[str, int], scoring_cfg: Dict[str, float]) -> float:
    """Calculate points based on defensive points allowed."""
    points_allowed = stats.get("def_points_allowed", None)
    if points_allowed is None:
        return 0.0
    
    if points_allowed == 0:
        return scoring_cfg.get("def_points_allowed_0", 0)
    elif points_allowed <= 6:
        return scoring_cfg.get("def_points_allowed_1_6", 0)
    elif points_allowed <= 13:
        return scoring_cfg.get("def_points_allowed_7_13", 0)
    elif points_allowed <= 20:
        return scoring_cfg.get("def_points_allowed_14_20", 0)
    elif points_allowed <= 27:
        return scoring_cfg.get("def_points_allowed_21_27", 0)
    elif points_allowed <= 34:
        return scoring_cfg.get("def_points_allowed_28_34", 0)
    else:
        return scoring_cfg.get("def_points_allowed_35_plus", 0)


def _calculate_defense_yards(stats: Dict[str, int], scoring_cfg: Dict[str, float]) -> float:
    """Calculate points based on defensive yards allowed."""
    yards_allowed = stats.get("def_yards_allowed", None)
    if yards_allowed is None:
        return 0.0
    
    if yards_allowed < 100:
        return scoring_cfg.get("def_yards_allowed_0_99", 0)
    elif yards_allowed < 200:
        return scoring_cfg.get("def_yards_allowed_100_199", 0)
    elif yards_allowed < 300:
        return scoring_cfg.get("def_yards_allowed_200_299", 0)
    elif yards_allowed < 400:
        return scoring_cfg.get("def_yards_allowed_300_399", 0)
    elif yards_allowed < 450:
        return scoring_cfg.get("def_yards_allowed_400_449", 0)
    elif yards_allowed < 500:
        return scoring_cfg.get("def_yards_allowed_450_499", 0)
    else:
        return scoring_cfg.get("def_yards_allowed_500_plus", 0)


def _calculate_field_goals(stats: Dict[str, int], scoring_cfg: Dict[str, float]) -> float:
    """Calculate field goal points based on distance."""
    total_points = 0.0
    
    # Field goals made
    for distance, stat_key in [
        (19, "fg_made_0_19"),
        (29, "fg_made_20_29"),
        (39, "fg_made_30_39"),
        (49, "fg_made_40_49"),
        (50, "fg_made_50_plus")
    ]:
        if stat_key in stats:
            total_points += stats[stat_key] * scoring_cfg.get(stat_key, 0)
    
    # Field goals missed
    for distance, stat_key in [
        (19, "fg_missed_0_19"),
        (29, "fg_missed_20_29"),
        (39, "fg_missed_30_39"),
        (49, "fg_missed_40_49"),
        (50, "fg_missed_50_plus")
    ]:
        if stat_key in stats:
            total_points += stats[stat_key] * scoring_cfg.get(stat_key, 0)
    
    return total_points


def _calculate_bonuses(stats: Dict[str, int], scoring_cfg: Dict[str, float]) -> float:
    """Calculate bonus points for milestone achievements."""
    total_points = 0.0
    
    # Passing bonuses
    passing_yards = stats.get("passing_yards", 0)
    if passing_yards >= 400:
        total_points += scoring_cfg.get("passing_400_yard_bonus", 0)
    elif passing_yards >= 300:
        total_points += scoring_cfg.get("passing_300_yard_bonus", 0)
    
    # Rushing bonuses
    rushing_yards = stats.get("rushing_yards", 0)
    if rushing_yards >= 200:
        total_points += scoring_cfg.get("rushing_200_yard_bonus", 0)
    elif rushing_yards >= 100:
        total_points += scoring_cfg.get("rushing_100_yard_bonus", 0)
    
    # Receiving bonuses
    receiving_yards = stats.get("receiving_yards", 0)
    if receiving_yards >= 200:
        total_points += scoring_cfg.get("receiving_200_yard_bonus", 0)
    elif receiving_yards >= 100:
        total_points += scoring_cfg.get("receiving_100_yard_bonus", 0)
    
    return total_points


class ScoringSystem:
    """Commissioner-configurable scoring system with presets and validation."""
    
    def __init__(self, preset: str = "standard"):
        """Initialize with a scoring preset."""
        if preset not in SCORING_PRESETS:
            raise ValueError(f"Invalid preset: {preset}. Choose from: {list(SCORING_PRESETS.keys())}")
        
        self.config = SCORING_PRESETS[preset].copy()
        self.preset_name = preset
    
    def customize(self, customizations: Dict[str, float]) -> None:
        """Apply custom scoring values to the configuration."""
        for stat, value in customizations.items():
            if not isinstance(value, (int, float)):
                raise ValueError(f"Scoring value for {stat} must be numeric, got {type(value)}")
            self.config[stat] = float(value)
    
    def calculate(self, stats: Dict[str, int]) -> float:
        """Calculate points using the current configuration."""
        return calc_points(stats, self.config)
    
    def get_config(self) -> Dict[str, float]:
        """Get the current scoring configuration."""
        return self.config.copy()
    
    def save_to_json(self, filepath: str) -> None:
        """Save the scoring configuration to a JSON file."""
        with open(filepath, 'w') as f:
            json.dump({
                "preset": self.preset_name,
                "config": self.config
            }, f, indent=2)
    
    @classmethod
    def load_from_json(cls, filepath: str) -> 'ScoringSystem':
        """Load a scoring configuration from a JSON file."""
        with open(filepath, 'r') as f:
            data = json.load(f)
        
        system = cls(data.get("preset", "custom"))
        system.config = data["config"]
        return system
    
    def validate_config(self) -> List[str]:
        """Validate the scoring configuration and return any warnings."""
        warnings = []
        
        # Check for missing essential stats
        essential_stats = [
            "passing_yards", "passing_tds", "rushing_yards", "rushing_tds",
            "receiving_yards", "receiving_tds"
        ]
        for stat in essential_stats:
            if stat not in self.config:
                warnings.append(f"Missing essential stat: {stat}")
        
        # Check for unusual values
        if self.config.get("passing_tds", 0) > 10:
            warnings.append("Passing TD value seems unusually high")
        
        if self.config.get("receiving_receptions", 0) > 2:
            warnings.append("Reception value seems unusually high for PPR")
        
        return warnings