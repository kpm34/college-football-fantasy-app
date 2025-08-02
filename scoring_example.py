"""
Example usage of the fantasy football scoring system
Shows how commissioners can customize scoring for their leagues
"""

from scoring import ScoringSystem, calc_points

def main():
    print("=== Fantasy Football Scoring System Demo ===\n")
    
    # Example player stats from a game
    qb_stats = {
        "passing_yards": 325,
        "passing_tds": 3,
        "passing_ints": 1,
        "rushing_yards": 15
    }
    
    rb_stats = {
        "rushing_yards": 92,
        "rushing_tds": 1,
        "receiving_yards": 38,
        "receiving_receptions": 4
    }
    
    # 1. Standard Scoring
    print("1. STANDARD SCORING")
    standard_system = ScoringSystem("standard")
    qb_points = standard_system.calculate(qb_stats)
    rb_points = standard_system.calculate(rb_stats)
    print(f"QB Points: {qb_points}")
    print(f"RB Points: {rb_points}\n")
    
    # 2. PPR Scoring
    print("2. PPR SCORING")
    ppr_system = ScoringSystem("ppr")
    rb_ppr_points = ppr_system.calculate(rb_stats)
    print(f"RB Points (PPR): {rb_ppr_points}")
    print(f"  - Difference from standard: +{rb_ppr_points - rb_points}\n")
    
    # 3. Custom Commissioner Settings
    print("3. CUSTOM COMMISSIONER SETTINGS")
    custom_system = ScoringSystem("standard")
    
    # Commissioner wants:
    # - 6 point passing TDs
    # - 0.5 PPR
    # - Bonus points for big games
    custom_system.customize({
        "passing_tds": 6.0,
        "receiving_receptions": 0.5,
        "passing_300_yard_bonus": 3.0,
        "rushing_100_yard_bonus": 3.0
    })
    
    print("Custom rules applied:")
    print("  - 6 points for passing TDs (instead of 4)")
    print("  - 0.5 points per reception")
    print("  - 3 bonus points for 300+ passing yards")
    print("  - 3 bonus points for 100+ rushing yards")
    
    custom_qb_points = custom_system.calculate(qb_stats)
    custom_rb_points = custom_system.calculate(rb_stats)
    
    print(f"\nQB Points (custom): {custom_qb_points}")
    print(f"  - Gained {custom_qb_points - qb_points} points from customization")
    print(f"RB Points (custom): {custom_rb_points}")
    print(f"  - Gained {custom_rb_points - rb_points} points from customization\n")
    
    # 4. Save and Load Custom Configuration
    print("4. SAVING CONFIGURATION")
    custom_system.save_to_json("my_league_scoring.json")
    print("Saved custom scoring to 'my_league_scoring.json'")
    
    # Load it back
    loaded_system = ScoringSystem.load_from_json("my_league_scoring.json")
    print("Loaded configuration back from file")
    print(f"Verified: QB points = {loaded_system.calculate(qb_stats)}\n")
    
    # 5. Validate Configuration
    print("5. CONFIGURATION VALIDATION")
    extreme_system = ScoringSystem("standard")
    extreme_system.customize({
        "passing_tds": 20.0,  # Way too high!
        "receiving_receptions": 5.0  # Also very high
    })
    
    warnings = extreme_system.validate_config()
    if warnings:
        print("Configuration warnings:")
        for warning in warnings:
            print(f"  - {warning}")
    
    # 6. Commissioner Dashboard Example
    print("\n6. COMMISSIONER DASHBOARD EXAMPLE")
    print("=" * 50)
    print("Current League Settings:")
    print("-" * 50)
    
    config = custom_system.get_config()
    important_settings = [
        ("Passing Yards", "passing_yards", "points per yard"),
        ("Passing TDs", "passing_tds", "points"),
        ("Interceptions", "passing_ints", "points"),
        ("Rushing Yards", "rushing_yards", "points per yard"),
        ("Rushing TDs", "rushing_tds", "points"),
        ("Receiving Yards", "receiving_yards", "points per yard"),
        ("Receiving TDs", "receiving_tds", "points"),
        ("Receptions", "receiving_receptions", "points"),
        ("300+ Yard Passing Bonus", "passing_300_yard_bonus", "points"),
        ("100+ Yard Rushing Bonus", "rushing_100_yard_bonus", "points")
    ]
    
    for display_name, key, unit in important_settings:
        value = config.get(key, 0)
        if value != 0:
            print(f"{display_name:<25}: {value:>6.1f} {unit}")
    
    print("=" * 50)


if __name__ == "__main__":
    main()