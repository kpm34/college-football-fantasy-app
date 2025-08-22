import pytest
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import logging
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class ValidationStatus(Enum):
    PASSED = "passed"
    FAILED = "failed"
    WARNING = "warning"

@dataclass
class ValidationResult:
    check_name: str
    status: ValidationStatus
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = datetime.now()

class DataQualityValidator:
    """Main data quality validation class for ETL pipeline"""
    
    def __init__(self, alert_threshold_seconds: int = 30):
        self.alert_threshold_seconds = alert_threshold_seconds
        self.results: List[ValidationResult] = []
    
    def validate_all(self, data: Dict[str, Any], data_type: str) -> List[ValidationResult]:
        """Run all validations for a specific data type"""
        self.results = []
        
        if data_type == "players":
            self._validate_players(data)
        elif data_type == "games":
            self._validate_games(data)
        elif data_type == "game_events":
            self._validate_game_events(data)
        elif data_type == "stats":
            self._validate_stats(data)
        
        return self.results
    
    def _validate_players(self, players: List[Dict[str, Any]]) -> None:
        """Validate player data"""
        # Check for duplicates
        self._check_duplicates(players, "external_id", "players")
        
        # Check for required fields
        required_fields = ["external_id", "first_name", "last_name", "position", "team_id"]
        self._check_required_fields(players, required_fields, "players")
        
        # Check for null values
        self._check_null_values(players, ["first_name", "last_name", "position"], "players")
        
        # Validate positions
        valid_positions = ["QB", "RB", "WR", "TE", "K", "DST", "OL", "DL", "LB", "DB"]
        self._validate_enum_values(players, "position", valid_positions, "players")
        
        # Check for reasonable values
        self._validate_numeric_ranges(players, {
            "height_inches": (60, 84),  # 5'0" to 7'0"
            "weight_lbs": (150, 400),
            "jersey_number": (0, 99)
        }, "players")
    
    def _validate_games(self, games: List[Dict[str, Any]]) -> None:
        """Validate game data"""
        # Check for duplicates
        self._check_duplicates(games, "external_id", "games")
        
        # Check required fields
        required_fields = ["external_id", "home_team_id", "away_team_id", "scheduled_time", "week"]
        self._check_required_fields(games, required_fields, "games")
        
        # Validate game status
        valid_statuses = ["scheduled", "in_progress", "completed", "cancelled", "postponed"]
        self._validate_enum_values(games, "status", valid_statuses, "games")
        
        # Check scores are non-negative
        self._validate_numeric_ranges(games, {
            "home_score": (0, 150),
            "away_score": (0, 150),
            "week": (1, 17)
        }, "games")
        
        # Validate timestamps
        self._validate_timestamps(games, ["scheduled_time"], "games")
    
    def _validate_game_events(self, events: List[Dict[str, Any]]) -> None:
        """Validate game event data"""
        # Check for duplicates within a time window
        self._check_event_duplicates(events)
        
        # Check required fields
        required_fields = ["game_id", "event_type", "quarter", "team_id"]
        self._check_required_fields(events, required_fields, "game_events")
        
        # Validate event types
        valid_event_types = [
            "pass", "rush", "kick", "punt", "penalty", "touchdown",
            "field_goal", "extra_point", "safety", "fumble", "interception"
        ]
        self._validate_enum_values(events, "event_type", valid_event_types, "game_events")
        
        # Validate quarters
        self._validate_numeric_ranges(events, {
            "quarter": (1, 5),  # Including overtime
            "points_scored": (0, 8)  # Max 8 for TD + 2pt conversion
        }, "game_events")
        
        # Check for feed lag
        self._check_feed_lag(events)
    
    def _validate_stats(self, stats: List[Dict[str, Any]]) -> None:
        """Validate player statistics"""
        # Check for duplicates
        self._check_duplicates(stats, ["player_id", "game_id"], "stats")
        
        # Validate statistical ranges
        stat_ranges = {
            "passing_yards": (-50, 700),  # Allow negative for sacks
            "passing_touchdowns": (0, 10),
            "interceptions": (0, 10),
            "rushing_yards": (-50, 400),
            "rushing_touchdowns": (0, 6),
            "receptions": (0, 25),
            "receiving_yards": (-20, 400),
            "receiving_touchdowns": (0, 5),
            "fumbles_lost": (0, 5)
        }
        self._validate_numeric_ranges(stats, stat_ranges, "stats")
        
        # Cross-validate stats
        self._cross_validate_stats(stats)
    
    def _check_duplicates(self, data: List[Dict], key_field: Any, data_type: str) -> None:
        """Check for duplicate records"""
        if isinstance(key_field, list):
            seen = set()
            duplicates = []
            for record in data:
                key = tuple(record.get(field) for field in key_field)
                if key in seen:
                    duplicates.append(key)
                seen.add(key)
        else:
            values = [record.get(key_field) for record in data if record.get(key_field)]
            duplicates = [v for v in values if values.count(v) > 1]
        
        if duplicates:
            self.results.append(ValidationResult(
                check_name=f"{data_type}_duplicates",
                status=ValidationStatus.FAILED,
                message=f"Found {len(set(duplicates))} duplicate records",
                details={"duplicates": list(set(duplicates))[:10]}  # First 10
            ))
        else:
            self.results.append(ValidationResult(
                check_name=f"{data_type}_duplicates",
                status=ValidationStatus.PASSED,
                message="No duplicates found"
            ))
    
    def _check_required_fields(self, data: List[Dict], required_fields: List[str], data_type: str) -> None:
        """Check for missing required fields"""
        missing_counts = {field: 0 for field in required_fields}
        
        for record in data:
            for field in required_fields:
                if field not in record or record.get(field) is None:
                    missing_counts[field] += 1
        
        missing_fields = {k: v for k, v in missing_counts.items() if v > 0}
        
        if missing_fields:
            self.results.append(ValidationResult(
                check_name=f"{data_type}_required_fields",
                status=ValidationStatus.FAILED,
                message=f"Missing required fields in {len(missing_fields)} fields",
                details={"missing_counts": missing_fields}
            ))
        else:
            self.results.append(ValidationResult(
                check_name=f"{data_type}_required_fields",
                status=ValidationStatus.PASSED,
                message="All required fields present"
            ))
    
    def _check_null_values(self, data: List[Dict], fields: List[str], data_type: str) -> None:
        """Check for unexpected null values"""
        null_counts = {field: 0 for field in fields}
        
        for record in data:
            for field in fields:
                if record.get(field) is None or record.get(field) == "":
                    null_counts[field] += 1
        
        fields_with_nulls = {k: v for k, v in null_counts.items() if v > 0}
        
        if fields_with_nulls:
            self.results.append(ValidationResult(
                check_name=f"{data_type}_null_values",
                status=ValidationStatus.WARNING,
                message=f"Found null values in {len(fields_with_nulls)} fields",
                details={"null_counts": fields_with_nulls}
            ))
        else:
            self.results.append(ValidationResult(
                check_name=f"{data_type}_null_values",
                status=ValidationStatus.PASSED,
                message="No unexpected null values"
            ))
    
    def _validate_enum_values(self, data: List[Dict], field: str, valid_values: List[str], data_type: str) -> None:
        """Validate that field values are within expected enum values"""
        invalid_values = []
        
        for record in data:
            value = record.get(field)
            if value and value not in valid_values:
                invalid_values.append(value)
        
        if invalid_values:
            unique_invalid = list(set(invalid_values))
            self.results.append(ValidationResult(
                check_name=f"{data_type}_{field}_values",
                status=ValidationStatus.FAILED,
                message=f"Found {len(unique_invalid)} invalid {field} values",
                details={"invalid_values": unique_invalid[:10]}
            ))
        else:
            self.results.append(ValidationResult(
                check_name=f"{data_type}_{field}_values",
                status=ValidationStatus.PASSED,
                message=f"All {field} values are valid"
            ))
    
    def _validate_numeric_ranges(self, data: List[Dict], field_ranges: Dict[str, tuple], data_type: str) -> None:
        """Validate numeric fields are within expected ranges"""
        out_of_range = {}
        
        for field, (min_val, max_val) in field_ranges.items():
            out_of_range_values = []
            for record in data:
                value = record.get(field)
                if value is not None and (value < min_val or value > max_val):
                    out_of_range_values.append({
                        "value": value,
                        "id": record.get("external_id", record.get("id"))
                    })
            
            if out_of_range_values:
                out_of_range[field] = out_of_range_values[:5]  # First 5 examples
        
        if out_of_range:
            self.results.append(ValidationResult(
                check_name=f"{data_type}_numeric_ranges",
                status=ValidationStatus.FAILED,
                message=f"Found out-of-range values in {len(out_of_range)} fields",
                details={"out_of_range": out_of_range}
            ))
        else:
            self.results.append(ValidationResult(
                check_name=f"{data_type}_numeric_ranges",
                status=ValidationStatus.PASSED,
                message="All numeric values within expected ranges"
            ))
    
    def _validate_timestamps(self, data: List[Dict], timestamp_fields: List[str], data_type: str) -> None:
        """Validate timestamp fields"""
        issues = {}
        current_time = datetime.now()
        
        for field in timestamp_fields:
            future_timestamps = []
            very_old_timestamps = []
            
            for record in data:
                timestamp_str = record.get(field)
                if timestamp_str:
                    try:
                        timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
                        
                        # Check if timestamp is in the future
                        if timestamp > current_time + timedelta(days=365):
                            future_timestamps.append(timestamp_str)
                        
                        # Check if timestamp is too old (before 2020)
                        if timestamp.year < 2020:
                            very_old_timestamps.append(timestamp_str)
                    
                    except (ValueError, AttributeError):
                        if field not in issues:
                            issues[field] = []
                        issues[field].append(f"Invalid format: {timestamp_str}")
            
            if future_timestamps:
                issues[field] = issues.get(field, []) + [f"Future: {t}" for t in future_timestamps[:3]]
            
            if very_old_timestamps:
                issues[field] = issues.get(field, []) + [f"Too old: {t}" for t in very_old_timestamps[:3]]
        
        if issues:
            self.results.append(ValidationResult(
                check_name=f"{data_type}_timestamps",
                status=ValidationStatus.WARNING,
                message=f"Found timestamp issues in {len(issues)} fields",
                details={"issues": issues}
            ))
        else:
            self.results.append(ValidationResult(
                check_name=f"{data_type}_timestamps",
                status=ValidationStatus.PASSED,
                message="All timestamps are valid"
            ))
    
    def _check_feed_lag(self, events: List[Dict]) -> None:
        """Check if data feed is lagging"""
        if not events:
            return
        
        current_time = datetime.now()
        latest_event_time = None
        
        for event in events:
            if "timestamp" in event:
                try:
                    event_time = datetime.fromisoformat(event["timestamp"].replace('Z', '+00:00'))
                    if latest_event_time is None or event_time > latest_event_time:
                        latest_event_time = event_time
                except (ValueError, AttributeError):
                    pass
        
        if latest_event_time:
            lag_seconds = (current_time - latest_event_time).total_seconds()
            
            if lag_seconds > self.alert_threshold_seconds:
                self.results.append(ValidationResult(
                    check_name="feed_lag",
                    status=ValidationStatus.FAILED,
                    message=f"Feed lag detected: {lag_seconds:.1f} seconds",
                    details={"lag_seconds": lag_seconds, "threshold": self.alert_threshold_seconds}
                ))
            else:
                self.results.append(ValidationResult(
                    check_name="feed_lag",
                    status=ValidationStatus.PASSED,
                    message=f"Feed lag within threshold: {lag_seconds:.1f} seconds"
                ))
    
    def _check_event_duplicates(self, events: List[Dict]) -> None:
        """Check for duplicate events within a short time window"""
        event_signatures = {}
        duplicates = []
        
        for event in events:
            # Create a signature for the event
            signature = (
                event.get("game_id"),
                event.get("event_type"),
                event.get("quarter"),
                event.get("team_id"),
                event.get("player_id")
            )
            
            timestamp = event.get("timestamp", datetime.now().isoformat())
            
            if signature in event_signatures:
                # Check if events are within 5 seconds of each other
                prev_timestamp = event_signatures[signature]
                try:
                    current_time = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                    prev_time = datetime.fromisoformat(prev_timestamp.replace('Z', '+00:00'))
                    
                    if abs((current_time - prev_time).total_seconds()) < 5:
                        duplicates.append({
                            "signature": signature,
                            "timestamps": [prev_timestamp, timestamp]
                        })
                except (ValueError, AttributeError):
                    pass
            
            event_signatures[signature] = timestamp
        
        if duplicates:
            self.results.append(ValidationResult(
                check_name="event_duplicates",
                status=ValidationStatus.WARNING,
                message=f"Found {len(duplicates)} potential duplicate events",
                details={"duplicates": duplicates[:5]}
            ))
        else:
            self.results.append(ValidationResult(
                check_name="event_duplicates",
                status=ValidationStatus.PASSED,
                message="No duplicate events detected"
            ))
    
    def _cross_validate_stats(self, stats: List[Dict]) -> None:
        """Cross-validate related statistics"""
        issues = []
        
        for stat in stats:
            # Receptions should not exceed targets (if available)
            targets = stat.get("targets", float('inf'))
            receptions = stat.get("receptions", 0)
            if receptions > targets and targets != float('inf'):
                issues.append({
                    "player_id": stat.get("player_id"),
                    "issue": f"Receptions ({receptions}) > Targets ({targets})"
                })
            
            # Receiving yards shouldn't be too high without receptions
            receiving_yards = stat.get("receiving_yards", 0)
            if receiving_yards > 20 and receptions == 0:
                issues.append({
                    "player_id": stat.get("player_id"),
                    "issue": f"Receiving yards ({receiving_yards}) with 0 receptions"
                })
            
            # Passing attempts should be >= completions
            attempts = stat.get("passing_attempts", float('inf'))
            completions = stat.get("passing_completions", 0)
            if completions > attempts and attempts != float('inf'):
                issues.append({
                    "player_id": stat.get("player_id"),
                    "issue": f"Completions ({completions}) > Attempts ({attempts})"
                })
        
        if issues:
            self.results.append(ValidationResult(
                check_name="stats_cross_validation",
                status=ValidationStatus.WARNING,
                message=f"Found {len(issues)} cross-validation issues",
                details={"issues": issues[:10]}
            ))
        else:
            self.results.append(ValidationResult(
                check_name="stats_cross_validation",
                status=ValidationStatus.PASSED,
                message="All stats cross-validation passed"
            ))


# Pytest test cases
class TestDataQualityValidator:
    
    @pytest.fixture
    def validator(self):
        return DataQualityValidator(alert_threshold_seconds=30)
    
    def test_validate_players_success(self, validator):
        players = [
            {
                "external_id": "1",
                "first_name": "John",
                "last_name": "Doe",
                "position": "QB",
                "team_id": "team1",
                "height_inches": 72,
                "weight_lbs": 220,
                "jersey_number": 12
            }
        ]
        
        results = validator.validate_all(players, "players")
        
        passed_checks = [r for r in results if r.status == ValidationStatus.PASSED]
        assert len(passed_checks) > 0
    
    def test_validate_players_duplicates(self, validator):
        players = [
            {
                "external_id": "1",
                "first_name": "John",
                "last_name": "Doe",
                "position": "QB",
                "team_id": "team1"
            },
            {
                "external_id": "1",  # Duplicate
                "first_name": "Jane",
                "last_name": "Smith",
                "position": "RB",
                "team_id": "team2"
            }
        ]
        
        results = validator.validate_all(players, "players")
        
        duplicate_check = next((r for r in results if r.check_name == "players_duplicates"), None)
        assert duplicate_check is not None
        assert duplicate_check.status == ValidationStatus.FAILED
    
    def test_validate_games_out_of_range(self, validator):
        games = [
            {
                "external_id": "game1",
                "home_team_id": "team1",
                "away_team_id": "team2",
                "scheduled_time": "2024-09-01T15:00:00Z",
                "week": 1,
                "home_score": 200,  # Out of range
                "away_score": 45,
                "status": "completed"
            }
        ]
        
        results = validator.validate_all(games, "games")
        
        range_check = next((r for r in results if r.check_name == "games_numeric_ranges"), None)
        assert range_check is not None
        assert range_check.status == ValidationStatus.FAILED
    
    def test_feed_lag_detection(self, validator):
        old_timestamp = (datetime.now() - timedelta(minutes=5)).isoformat()
        
        events = [
            {
                "game_id": "game1",
                "event_type": "pass",
                "quarter": 1,
                "team_id": "team1",
                "timestamp": old_timestamp
            }
        ]
        
        results = validator.validate_all(events, "game_events")
        
        lag_check = next((r for r in results if r.check_name == "feed_lag"), None)
        assert lag_check is not None
        assert lag_check.status == ValidationStatus.FAILED