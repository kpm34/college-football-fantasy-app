#!/usr/bin/env python3
"""
Extract active rosters from PDFs and clean the player database
"""

import json
import pdfplumber
import re
from pathlib import Path
from typing import Set, Dict, List

# SEC Teams we're checking
SEC_TEAMS = [
    'Alabama', 'Georgia', 'Mississippi', 'OleMiss', 'Texas', 
    'Oklahoma', 'Tennessee', 'Kentucky', 'SouthCarolinaGamecocks', 
    'Arkansas', 'Florida', 'LSU', 'Missouri', 'Auburn', 
    'TexasA&M', 'Vanderbilt'
]

# Fantasy-relevant positions
FANTASY_POSITIONS = {'QB', 'RB', 'WR', 'TE', 'K', 'PK'}

def extract_players_from_pdf(pdf_path: Path) -> Set[str]:
    """Extract player names from a roster PDF"""
    active_players = set()
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if not text:
                    continue
                
                # Split into lines
                lines = text.split('\n')
                
                for line in lines:
                    # Look for patterns like: "1 Smith, John QB 6-2 210 Jr."
                    # or "Smith, John QB" or "John Smith QB"
                    
                    # Pattern 1: Number Name, First Position
                    match1 = re.match(r'^\d+\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(QB|RB|WR|TE|K|PK)', line)
                    if match1:
                        last_name = match1.group(1).strip()
                        first_name = match1.group(2).strip()
                        position = match1.group(3)
                        full_name = f"{first_name} {last_name}"
                        active_players.add(full_name.lower())
                        continue
                    
                    # Pattern 2: Name Position (without number)
                    match2 = re.match(r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(QB|RB|WR|TE|K|PK)\s', line)
                    if match2:
                        name = match2.group(1).strip()
                        active_players.add(name.lower())
                        continue
                    
                    # Pattern 3: Just look for QB/RB/WR/TE/K in line with names
                    if any(pos in line for pos in FANTASY_POSITIONS):
                        # Extract potential names (2-3 word combinations before position)
                        words = line.split()
                        for i, word in enumerate(words):
                            if word in FANTASY_POSITIONS and i > 0:
                                # Try to get the name before the position
                                if i >= 2 and words[i-2][0].isupper() and words[i-1][0].isupper():
                                    name = f"{words[i-2]} {words[i-1]}"
                                    active_players.add(name.lower())
                                elif words[i-1][0].isupper():
                                    active_players.add(words[i-1].lower())
                
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
    
    return active_players

def load_player_database(json_path: str) -> List[Dict]:
    """Load the player database from JSON"""
    with open(json_path, 'r') as f:
        return json.load(f)

def clean_player_database(players: List[Dict], active_rosters: Dict[str, Set[str]]) -> List[Dict]:
    """Remove players not on active rosters"""
    cleaned_players = []
    removed_players = []
    
    for player in players:
        # Only check SEC players for now
        if player.get('conference') != 'SEC':
            cleaned_players.append(player)
            continue
        
        # Only check fantasy positions
        if player.get('position') not in FANTASY_POSITIONS:
            # Skip non-fantasy positions
            continue
            
        player_name = player.get('name', '').lower()
        player_team = player.get('team', '').lower()
        
        # Check if player is on any active roster
        found = False
        for team, roster in active_rosters.items():
            if team.lower() in player_team or player_team in team.lower():
                # Check if player name is in this team's roster
                for roster_name in roster:
                    # Flexible matching - last name match or full name match
                    if player_name in roster_name or roster_name in player_name:
                        found = True
                        break
                    # Also check last name only
                    player_last = player_name.split()[-1] if player_name else ''
                    roster_last = roster_name.split()[-1] if roster_name else ''
                    if player_last and roster_last and player_last == roster_last:
                        found = True
                        break
                
                if found:
                    break
        
        if found or not player_team:  # Keep if found or no team info
            cleaned_players.append(player)
        else:
            removed_players.append(f"{player.get('name')} ({player.get('team')})")
    
    return cleaned_players, removed_players

def main():
    print("=" * 60)
    print("ROSTER EXTRACTION AND CLEANING")
    print("=" * 60)
    
    # Step 1: Extract active rosters from PDFs
    print("\n📄 Extracting active rosters from PDFs...")
    roster_dir = Path("confrence rosters/SEC_College_Football")
    active_rosters = {}
    
    for team in SEC_TEAMS:
        pdf_path = roster_dir / f"{team}2025.pdf"
        if pdf_path.exists():
            print(f"  Processing {team}...")
            players = extract_players_from_pdf(pdf_path)
            active_rosters[team] = players
            print(f"    Found {len(players)} fantasy position players")
        else:
            print(f"  ⚠️  PDF not found: {pdf_path}")
    
    # Save extracted rosters for reference
    roster_json_path = Path("exports/sec_active_rosters_2025.json")
    with open(roster_json_path, 'w') as f:
        # Convert sets to lists for JSON serialization
        roster_dict = {team: list(players) for team, players in active_rosters.items()}
        json.dump(roster_dict, f, indent=2)
    print(f"\n✅ Saved active rosters to {roster_json_path}")
    
    # Step 2: Load and clean player database
    print("\n📊 Loading player database...")
    player_db_path = Path("exports/college_players_2025.json")
    players = load_player_database(player_db_path)
    print(f"  Loaded {len(players)} total players")
    
    # Count SEC players before cleaning
    sec_players_before = sum(1 for p in players if p.get('conference') == 'SEC')
    print(f"  SEC players before cleaning: {sec_players_before}")
    
    # Step 3: Clean the database
    print("\n🧹 Cleaning player database...")
    cleaned_players, removed_players = clean_player_database(players, active_rosters)
    
    # Count SEC players after cleaning
    sec_players_after = sum(1 for p in cleaned_players if p.get('conference') == 'SEC')
    
    print(f"\n📈 Results:")
    print(f"  Total players before: {len(players)}")
    print(f"  Total players after: {len(cleaned_players)}")
    print(f"  Players removed: {len(players) - len(cleaned_players)}")
    print(f"  SEC players before: {sec_players_before}")
    print(f"  SEC players after: {sec_players_after}")
    print(f"  SEC players removed: {sec_players_before - sec_players_after}")
    
    if removed_players:
        print(f"\n  Sample of removed players (first 20):")
        for player in removed_players[:20]:
            print(f"    - {player}")
    
    # Step 4: Save cleaned database
    cleaned_db_path = Path("exports/college_players_2025_cleaned.json")
    with open(cleaned_db_path, 'w') as f:
        json.dump(cleaned_players, f, indent=2)
    
    print(f"\n✅ Saved cleaned database to {cleaned_db_path}")
    print(f"   Ready for import with {len(cleaned_players)} players")
    
    # Update the function data file too
    function_data_path = Path("functions/import-players/players-data.json")
    with open(function_data_path, 'w') as f:
        json.dump(cleaned_players, f, indent=2)
    print(f"✅ Updated function data at {function_data_path}")

if __name__ == "__main__":
    main()
