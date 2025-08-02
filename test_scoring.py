"""
Test suite for the fantasy football scoring system
"""

import pytest
import json
import tempfile
from scoring import (
    calc_points, 
    DEFAULT_SCORING_CONFIG, 
    SCORING_PRESETS,
    ScoringSystem,
    _calculate_defense_points,
    _calculate_defense_yards,
    _calculate_field_goals,
    _calculate_bonuses
)


class TestCalcPoints:
    """Test the main calc_points function."""
    
    def test_basic_passing_scoring(self):
        """Test basic QB passing statistics."""
        stats = {
            "passing_yards": 300,
            "passing_tds": 3,
            "passing_ints": 1
        }
        # 300 * 0.04 + 3 * 4 - 1 * 2 = 12 + 12 - 2 = 22
        assert calc_points(stats) == 22.0
    
    def test_basic_rushing_scoring(self):
        """Test basic RB rushing statistics."""
        stats = {
            "rushing_yards": 120,
            "rushing_tds": 2,
            "rushing_fumbles_lost": 1
        }
        # 120 * 0.1 + 2 * 6 - 1 * 2 = 12 + 12 - 2 = 22
        assert calc_points(stats) == 22.0
    
    def test_basic_receiving_scoring(self):
        """Test basic WR/TE receiving statistics."""
        stats = {
            "receiving_yards": 85,
            "receiving_tds": 1,
            "receiving_receptions": 6
        }
        # Standard scoring (no PPR): 85 * 0.1 + 1 * 6 = 8.5 + 6 = 14.5
        assert calc_points(stats) == 14.5
    
    def test_ppr_scoring(self):
        """Test PPR scoring configuration."""
        stats = {
            "receiving_yards": 85,
            "receiving_tds": 1,
            "receiving_receptions": 6
        }
        ppr_config = {**DEFAULT_SCORING_CONFIG, "receiving_receptions": 1.0}
        # PPR: 85 * 0.1 + 1 * 6 + 6 * 1 = 8.5 + 6 + 6 = 20.5
        assert calc_points(stats, ppr_config) == 20.5
    
    def test_half_ppr_scoring(self):
        """Test Half-PPR scoring configuration."""
        stats = {
            "receiving_yards": 85,
            "receiving_tds": 1,
            "receiving_receptions": 6
        }
        half_ppr_config = {**DEFAULT_SCORING_CONFIG, "receiving_receptions": 0.5}
        # Half-PPR: 85 * 0.1 + 1 * 6 + 6 * 0.5 = 8.5 + 6 + 3 = 17.5
        assert calc_points(stats, half_ppr_config) == 17.5
    
    def test_kicker_scoring(self):
        """Test kicker scoring with field goals and PATs."""
        stats = {
            "fg_made_0_19": 1,
            "fg_made_40_49": 2,
            "fg_made_50_plus": 1,
            "pat_made": 3,
            "pat_missed": 1
        }
        # 1*3 + 2*4 + 1*5 + 3*1 - 1*1 = 3 + 8 + 5 + 3 - 1 = 18
        assert calc_points(stats) == 18.0
    
    def test_defense_scoring(self):
        """Test defensive scoring statistics."""
        stats = {
            "def_sacks": 3,
            "def_ints": 2,
            "def_fumbles_recovered": 1,
            "def_tds": 1,
            "def_points_allowed": 10,
            "def_yards_allowed": 250
        }
        # 3*1 + 2*2 + 1*2 + 1*6 + 4 + 3 = 3 + 4 + 2 + 6 + 4 + 3 = 22
        assert calc_points(stats) == 22.0
    
    def test_empty_stats(self):
        """Test with empty statistics."""
        assert calc_points({}) == 0.0
    
    def test_negative_scoring(self):
        """Test that negative scoring works correctly."""
        stats = {
            "passing_ints": 3,
            "fumbles_lost": 2,
            "def_points_allowed": 42
        }
        # -3*2 - 2*2 - 4 = -6 - 4 - 4 = -14
        expected = -14.0
        # Note: fumbles_lost isn't in default config, so just INTs and def points
        assert calc_points(stats) == -10.0
    
    def test_custom_scoring_config(self):
        """Test with completely custom scoring configuration."""
        stats = {"custom_stat": 10}
        custom_config = {"custom_stat": 2.5}
        assert calc_points(stats, custom_config) == 25.0


class TestDefenseCalculations:
    """Test defense-specific calculation functions."""
    
    def test_defense_points_allowed_tiers(self):
        """Test all defense points allowed tiers."""
        config = DEFAULT_SCORING_CONFIG
        
        assert _calculate_defense_points({"def_points_allowed": 0}, config) == 10.0
        assert _calculate_defense_points({"def_points_allowed": 6}, config) == 7.0
        assert _calculate_defense_points({"def_points_allowed": 13}, config) == 4.0
        assert _calculate_defense_points({"def_points_allowed": 20}, config) == 1.0
        assert _calculate_defense_points({"def_points_allowed": 27}, config) == 0.0
        assert _calculate_defense_points({"def_points_allowed": 34}, config) == -1.0
        assert _calculate_defense_points({"def_points_allowed": 42}, config) == -4.0
    
    def test_defense_yards_allowed_tiers(self):
        """Test all defense yards allowed tiers."""
        config = DEFAULT_SCORING_CONFIG
        
        assert _calculate_defense_yards({"def_yards_allowed": 50}, config) == 10.0
        assert _calculate_defense_yards({"def_yards_allowed": 150}, config) == 5.0
        assert _calculate_defense_yards({"def_yards_allowed": 250}, config) == 3.0
        assert _calculate_defense_yards({"def_yards_allowed": 350}, config) == 0.0
        assert _calculate_defense_yards({"def_yards_allowed": 425}, config) == -1.0
        assert _calculate_defense_yards({"def_yards_allowed": 475}, config) == -3.0
        assert _calculate_defense_yards({"def_yards_allowed": 550}, config) == -5.0


class TestFieldGoals:
    """Test field goal calculations."""
    
    def test_field_goal_distances(self):
        """Test field goals at different distances."""
        config = DEFAULT_SCORING_CONFIG
        
        # Test each distance bracket
        assert _calculate_field_goals({"fg_made_0_19": 1}, config) == 3.0
        assert _calculate_field_goals({"fg_made_20_29": 1}, config) == 3.0
        assert _calculate_field_goals({"fg_made_30_39": 1}, config) == 3.0
        assert _calculate_field_goals({"fg_made_40_49": 1}, config) == 4.0
        assert _calculate_field_goals({"fg_made_50_plus": 1}, config) == 5.0
    
    def test_field_goal_misses(self):
        """Test field goal miss penalties."""
        config = DEFAULT_SCORING_CONFIG
        
        assert _calculate_field_goals({"fg_missed_0_19": 1}, config) == -2.0
        assert _calculate_field_goals({"fg_missed_20_29": 1}, config) == -1.0
        assert _calculate_field_goals({"fg_missed_30_39": 1}, config) == -1.0
        assert _calculate_field_goals({"fg_missed_40_49": 1}, config) == 0.0
        assert _calculate_field_goals({"fg_missed_50_plus": 1}, config) == 0.0


class TestBonuses:
    """Test bonus point calculations."""
    
    def test_passing_bonuses(self):
        """Test passing yardage bonuses."""
        config = {
            "passing_300_yard_bonus": 3.0,
            "passing_400_yard_bonus": 5.0
        }
        
        assert _calculate_bonuses({"passing_yards": 250}, config) == 0.0
        assert _calculate_bonuses({"passing_yards": 350}, config) == 3.0
        assert _calculate_bonuses({"passing_yards": 450}, config) == 5.0
    
    def test_rushing_bonuses(self):
        """Test rushing yardage bonuses."""
        config = {
            "rushing_100_yard_bonus": 2.0,
            "rushing_200_yard_bonus": 5.0
        }
        
        assert _calculate_bonuses({"rushing_yards": 90}, config) == 0.0
        assert _calculate_bonuses({"rushing_yards": 150}, config) == 2.0
        assert _calculate_bonuses({"rushing_yards": 220}, config) == 5.0
    
    def test_receiving_bonuses(self):
        """Test receiving yardage bonuses."""
        config = {
            "receiving_100_yard_bonus": 2.0,
            "receiving_200_yard_bonus": 5.0
        }
        
        assert _calculate_bonuses({"receiving_yards": 90}, config) == 0.0
        assert _calculate_bonuses({"receiving_yards": 150}, config) == 2.0
        assert _calculate_bonuses({"receiving_yards": 220}, config) == 5.0


class TestScoringSystem:
    """Test the ScoringSystem class for commissioner customization."""
    
    def test_preset_initialization(self):
        """Test initialization with different presets."""
        standard = ScoringSystem("standard")
        assert standard.config == SCORING_PRESETS["standard"]
        
        ppr = ScoringSystem("ppr")
        assert ppr.config["receiving_receptions"] == 1.0
        
        half_ppr = ScoringSystem("half_ppr")
        assert half_ppr.config["receiving_receptions"] == 0.5
    
    def test_invalid_preset(self):
        """Test initialization with invalid preset."""
        with pytest.raises(ValueError):
            ScoringSystem("invalid_preset")
    
    def test_customize(self):
        """Test customizing scoring values."""
        system = ScoringSystem("standard")
        
        # Customize some values
        system.customize({
            "passing_tds": 6.0,
            "receiving_receptions": 0.5,
            "new_stat": 10.0
        })
        
        assert system.config["passing_tds"] == 6.0
        assert system.config["receiving_receptions"] == 0.5
        assert system.config["new_stat"] == 10.0
    
    def test_customize_validation(self):
        """Test that non-numeric values raise errors."""
        system = ScoringSystem("standard")
        
        with pytest.raises(ValueError):
            system.customize({"passing_tds": "not a number"})
    
    def test_calculate_with_system(self):
        """Test calculating points using ScoringSystem."""
        system = ScoringSystem("ppr")
        
        stats = {
            "receiving_yards": 100,
            "receiving_tds": 1,
            "receiving_receptions": 8
        }
        
        # 100*0.1 + 1*6 + 8*1 = 10 + 6 + 8 = 24
        assert system.calculate(stats) == 24.0
    
    def test_save_and_load_json(self):
        """Test saving and loading configuration to/from JSON."""
        system = ScoringSystem("ppr")
        system.customize({"passing_tds": 6.0})
        
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as f:
            system.save_to_json(f.name)
            
            # Load it back
            loaded_system = ScoringSystem.load_from_json(f.name)
            
            assert loaded_system.preset_name == "ppr"
            assert loaded_system.config["passing_tds"] == 6.0
            assert loaded_system.config["receiving_receptions"] == 1.0
    
    def test_validate_config(self):
        """Test configuration validation."""
        system = ScoringSystem("standard")
        
        # Normal config should have no warnings
        warnings = system.validate_config()
        assert len(warnings) == 0
        
        # Create problematic config
        system.customize({
            "passing_tds": 15.0,
            "receiving_receptions": 3.0
        })
        
        warnings = system.validate_config()
        assert any("Passing TD" in w for w in warnings)
        assert any("Reception" in w for w in warnings)
    
    def test_get_config(self):
        """Test that get_config returns a copy."""
        system = ScoringSystem("standard")
        config = system.get_config()
        
        # Modify the returned config
        config["passing_tds"] = 999
        
        # Original should be unchanged
        assert system.config["passing_tds"] == 4.0


class TestComplexScenarios:
    """Test complex, real-world scoring scenarios."""
    
    def test_complete_qb_game(self):
        """Test a complete QB game with various stats."""
        stats = {
            "passing_yards": 385,
            "passing_tds": 3,
            "passing_ints": 1,
            "passing_2pt": 1,
            "rushing_yards": 22,
            "rushing_tds": 1,
            "passing_fumbles_lost": 1
        }
        
        # 385*0.04 + 3*4 - 1*2 + 1*2 + 22*0.1 + 1*6 - 1*2
        # = 15.4 + 12 - 2 + 2 + 2.2 + 6 - 2 = 33.6
        assert calc_points(stats) == 33.6
    
    def test_complete_rb_game(self):
        """Test a complete RB game with rushing and receiving."""
        stats = {
            "rushing_yards": 87,
            "rushing_tds": 1,
            "receiving_yards": 42,
            "receiving_receptions": 5,
            "receiving_tds": 1,
            "rushing_fumbles_lost": 1
        }
        
        # Standard scoring (no PPR)
        # 87*0.1 + 1*6 + 42*0.1 + 1*6 - 1*2
        # = 8.7 + 6 + 4.2 + 6 - 2 = 22.9
        assert calc_points(stats) == 22.9
    
    def test_complete_defense_game(self):
        """Test a complete defense/ST game."""
        stats = {
            "def_sacks": 4,
            "def_ints": 2,
            "def_fumbles_recovered": 1,
            "def_fumbles_forced": 2,
            "def_tds": 1,
            "def_safeties": 1,
            "def_points_allowed": 17,
            "def_yards_allowed": 285,
            "return_tds": 1
        }
        
        # 4*1 + 2*2 + 1*2 + 2*1 + 1*6 + 1*2 + 1 + 3 + 1*6
        # = 4 + 4 + 2 + 2 + 6 + 2 + 1 + 3 + 6 = 30
        assert calc_points(stats) == 30.0


if __name__ == "__main__":
    # Run pytest if executed directly
    pytest.main([__file__, "-v"])