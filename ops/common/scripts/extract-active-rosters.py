#!/usr/bin/env python3
"""
Extract player rosters from PDFs using pdftotext and clean the player database.
This script uses the pdftotext command-line tool for better text extraction.
"""

import subprocess
import json
import os
import re
from pathlib import Path

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
ROSTER_DIRS = {
    'SEC': PROJECT_ROOT / 'conference rosters' / 'SEC_College_Football',
    'ACC': PROJECT_ROOT / 'conference rosters' / 'ACC',
    'Big 12': PROJECT_ROOT / 'conference rosters' / 'Big_12_2025',
    'Big Ten': PROJECT_ROOT / 'conference rosters' / 'big ten rosters'
}
PLAYER_DATA_FILE = PROJECT_ROOT / 'exports' / 'college_players_2025.json'
OUTPUT_FILE = PROJECT_ROOT / 'exports' / 'college_players_2025_cleaned.json'
ACTIVE_ROSTERS_FILE = PROJECT_ROOT / 'exports' / 'active_rosters_2025.json'

# Fantasy-relevant positions
FANTASY_POSITIONS = {'QB', 'RB', 'WR', 'TE', 'K', 'PK'}

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF using pdftotext command."""
    try:
        result = subprocess.run(
            ['pdftotext', '-layout', str(pdf_path), '-'],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"  Error extracting text from {pdf_path}: {e}")
        return ""
    except FileNotFoundError:
        print("  Error: pdftotext not found. Please install poppler-utils.")
        return ""

def parse_roster_text(text, team_name):
    """Parse roster text to extract player names and positions."""
    players = set()
    
    lines = text.split('\n')
    for line in lines:
        # Skip empty lines and headers
        if not line.strip() or 'NAME' in line or 'JERSEY' in line or 'POS' in line:
            continue
        
        # Split by multiple spaces (at least 2)
        parts = re.split(r'\s{2,}', line.strip())
        
        # Look for lines with at least name, jersey, and position
        if len(parts) >= 3:
            # First part should be the name
            name = parts[0].strip()
            
            # Skip if name doesn't look like a real name
            if not name or len(name) < 3 or not re.match(r'^[A-Z][a-z]', name):
                continue
            
            # Look for position (usually 3rd field, after jersey number)
            for i in range(1, min(4, len(parts))):
                pos_candidate = parts[i].strip().upper()
                
                # Check if this looks like a position
                if pos_candidate in FANTASY_POSITIONS:
                    players.add(f"{name}|{pos_candidate}|{team_name}")
                    break
                elif pos_candidate == 'PK':
                    players.add(f"{name}|K|{team_name}")
                    break
                # Also check for QB, RB, WR, TE, K even if not exactly matching
                elif len(pos_candidate) <= 3 and any(p in pos_candidate for p in ['QB', 'RB', 'WR', 'TE', 'K']):
                    if pos_candidate in ['QB', 'RB', 'WR', 'TE', 'K', 'PK']:
                        position = 'K' if pos_candidate == 'PK' else pos_candidate
                        players.add(f"{name}|{position}|{team_name}")
                        break
    
    return players

def extract_all_rosters():
    """Extract rosters from all PDF files."""
    all_players = set()
    roster_data = {}
    
    for conference, roster_dir in ROSTER_DIRS.items():
        print(f"\nProcessing {conference} rosters...")
        conference_players = set()
        
        if not roster_dir.exists():
            print(f"  Directory not found: {roster_dir}")
            continue
        
        pdf_files = list(roster_dir.glob("*.pdf"))
        print(f"  Found {len(pdf_files)} PDF files")
        
        for pdf_path in pdf_files:
            # Extract team name from filename
            team_name = pdf_path.stem.replace('2025', '').strip()
            print(f"  Processing {team_name}...")
            
            # Extract text from PDF
            text = extract_text_from_pdf(pdf_path)
            if not text:
                continue
            
            # Parse roster
            team_players = parse_roster_text(text, team_name)
            print(f"    Found {len(team_players)} fantasy players")
            
            conference_players.update(team_players)
            all_players.update(team_players)
            
            # Store in roster data
            if conference not in roster_data:
                roster_data[conference] = {}
            roster_data[conference][team_name] = list(team_players)
        
        print(f"  Total {conference} fantasy players: {len(conference_players)}")
    
    # Save active rosters for reference
    with open(ACTIVE_ROSTERS_FILE, 'w') as f:
        json.dump(roster_data, f, indent=2)
    print(f"\nSaved active rosters to {ACTIVE_ROSTERS_FILE}")
    
    return all_players

def clean_player_database(active_players):
    """Clean the player database by removing inactive players."""
    # Load existing player data
    with open(PLAYER_DATA_FILE, 'r') as f:
        all_players_data = json.load(f)
    
    print(f"\nOriginal database: {len(all_players_data)} players")
    
    # Create lookup set for faster matching
    active_lookup = set()
    for player_str in active_players:
        parts = player_str.split('|')
        if len(parts) >= 2:
            name = parts[0].lower().strip()
            position = parts[1].strip()
            active_lookup.add(f"{name}|{position}")
    
    # Filter players
    cleaned_players = []
    removed_count = 0
    kept_count = 0
    
    for player in all_players_data:
        player_name = player.get('name', '').lower().strip()
        player_position = player.get('position', '').strip()
        
        # Check if player is in active rosters and has fantasy position
        lookup_key = f"{player_name}|{player_position}"
        
        if player_position in FANTASY_POSITIONS and lookup_key in active_lookup:
            cleaned_players.append(player)
            kept_count += 1
        else:
            removed_count += 1
    
    print(f"Kept: {kept_count} players")
    print(f"Removed: {removed_count} players")
    
    # Save cleaned data
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(cleaned_players, f, indent=2)
    
    print(f"\nCleaned database saved to {OUTPUT_FILE}")
    print(f"Final count: {len(cleaned_players)} players")
    
    # Show distribution
    conference_counts = {}
    position_counts = {}
    for player in cleaned_players:
        conf = player.get('conference', 'Unknown')
        pos = player.get('position', 'Unknown')
        conference_counts[conf] = conference_counts.get(conf, 0) + 1
        position_counts[pos] = position_counts.get(pos, 0) + 1
    
    print("\nConference distribution:")
    for conf, count in sorted(conference_counts.items()):
        print(f"  {conf}: {count}")
    
    print("\nPosition distribution:")
    for pos, count in sorted(position_counts.items()):
        print(f"  {pos}: {count}")

def main():
    print("=" * 60)
    print("College Football Fantasy - Roster Extraction & Cleaning")
    print("=" * 60)
    
    # Check if pdftotext is available
    try:
        subprocess.run(['pdftotext', '-v'], capture_output=True, check=True)
        print("✓ pdftotext is installed")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("✗ pdftotext is not installed. Please run: brew install poppler")
        return
    
    # Extract rosters from PDFs
    print("\nStep 1: Extracting rosters from PDFs...")
    active_players = extract_all_rosters()
    print(f"\nTotal active fantasy players found: {len(active_players)}")
    
    if len(active_players) == 0:
        print("\n⚠️  Warning: No players found in PDFs. Extraction may have failed.")
        print("Please check the PDF format and extraction patterns.")
        return
    
    # Clean the player database
    print("\nStep 2: Cleaning player database...")
    clean_player_database(active_players)
    
    print("\n✅ Process complete!")
    print(f"Clean data ready at: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
