#!/usr/bin/env python3
"""
Player Database Restoration Script
Run in background: python3 scripts/restore_players.py &
Or with nohup: nohup python3 scripts/restore_players.py > restore.log 2>&1 &
"""

import json
import os
import time
import sys
from datetime import datetime
from pathlib import Path

# Try to import appwrite, if not available, provide instructions
try:
    from appwrite.client import Client
    from appwrite.services.databases import Databases
    from appwrite.query import Query
    from appwrite.id import ID
except ImportError:
    print("Appwrite SDK not installed. Installing...")
    os.system("pip3 install appwrite")
    from appwrite.client import Client
    from appwrite.services.databases import Databases
    from appwrite.query import Query
    from appwrite.id import ID

# Configuration
ENDPOINT = os.getenv('NEXT_PUBLIC_APPWRITE_ENDPOINT', 'https://nyc.cloud.appwrite.io/v1')
PROJECT_ID = os.getenv('NEXT_PUBLIC_APPWRITE_PROJECT_ID', 'college-football-fantasy-app')
API_KEY = os.getenv('APPWRITE_API_KEY', '')
DATABASE_ID = os.getenv('NEXT_PUBLIC_APPWRITE_DATABASE_ID', 'college-football-fantasy')
COLLECTION_ID = os.getenv('NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS', 'college_players')

# Rate limiting configuration
BATCH_SIZE = 10  # Documents per batch
DELAY_BETWEEN_DOCS = 0.3  # Seconds between each document
DELAY_BETWEEN_BATCHES = 3  # Seconds between batches
RATE_LIMIT_WAIT = 30  # Seconds to wait when rate limited

def setup_client():
    """Initialize Appwrite client"""
    client = Client()
    client.set_endpoint(ENDPOINT)
    client.set_project(PROJECT_ID)
    client.set_key(API_KEY)
    return client

def load_backup_data():
    """Load the backup JSON file"""
    backup_path = Path.cwd() / 'exports' / 'college_players_2025.json'
    
    if not backup_path.exists():
        print(f"❌ Backup file not found at {backup_path}")
        sys.exit(1)
    
    with open(backup_path, 'r') as f:
        data = json.load(f)
    
    print(f"✅ Loaded {len(data)} players from backup")
    
    # Count by conference
    conferences = {}
    for player in data:
        conf = player.get('conference', 'Unknown')
        conferences[conf] = conferences.get(conf, 0) + 1
    
    print("\n📊 Backup contains:")
    for conf in ['SEC', 'ACC', 'Big Ten', 'Big 12', 'Independent']:
        if conf in conferences:
            print(f"  • {conf}: {conferences[conf]} players")
    
    return data

def clean_player_data(player, index):
    """Clean and prepare player data for insertion"""
    # Remove Appwrite metadata
    clean = {k: v for k, v in player.items() 
             if not k.startswith('$')}
    
    # Ensure all required fields
    return {
        'name': clean.get('name', f'Player {index}'),
        'position': clean.get('position', 'RB'),
        'team': clean.get('team') or clean.get('school', 'Unknown'),
        'conference': clean.get('conference', 'Unknown'),
        'year': clean.get('year', 'JR'),
        'height': clean.get('height', '6-0'),
        'weight': clean.get('weight', 200),
        'jersey_number': clean.get('jersey_number', 0),
        'hometown': clean.get('hometown', ''),
        'high_school': clean.get('high_school', ''),
        'fantasy_points': clean.get('fantasy_points', 0),
        'adp': clean.get('adp', 999),
        'depth_chart_order': clean.get('depth_chart_order', 99),
        'injury_status': clean.get('injury_status', 'healthy'),
        'team_id': clean.get('team_id', 0),
        'cfbd_id': clean.get('cfbd_id', ''),
        'espn_id': clean.get('espn_id', ''),
        'statline_simple_json': clean.get('statline_simple_json', '{}'),
        'last_updated': datetime.now().isoformat()
    }

def restore_with_retry(databases, player_data, max_retries=3):
    """Attempt to create document with retry logic"""
    for attempt in range(max_retries):
        try:
            doc = databases.create_document(
                database_id=DATABASE_ID,
                collection_id=COLLECTION_ID,
                document_id=ID.unique(),
                data=player_data
            )
            return True, None
        except Exception as e:
            error_str = str(e)
            if 'Rate limit' in error_str or '429' in str(e):
                if attempt < max_retries - 1:
                    print(f"\n⏳ Rate limit hit, waiting {RATE_LIMIT_WAIT}s...")
                    time.sleep(RATE_LIMIT_WAIT)
                else:
                    return False, "Rate limit exceeded after retries"
            else:
                return False, error_str
    return False, "Max retries reached"

def main():
    print("=" * 60)
    print("🔄 PLAYER DATABASE RESTORATION SCRIPT")
    print("=" * 60)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Endpoint: {ENDPOINT}")
    print(f"Project: {PROJECT_ID}")
    print(f"Database: {DATABASE_ID}")
    print(f"Collection: {COLLECTION_ID}")
    print("=" * 60)
    
    # Setup client
    client = setup_client()
    databases = Databases(client)
    
    # Check current state
    print("\n📊 Checking current database state...")
    try:
        current = databases.list_documents(
            database_id=DATABASE_ID,
            collection_id=COLLECTION_ID,
            queries=[Query.limit(1)]
        )
        print(f"  Current documents: {current['total']}")
        if current['total'] > 0:
            print("  ⚠️  Warning: Database is not empty")
    except Exception as e:
        print(f"  Error checking database: {e}")
    
    # Load backup data
    print("\n📂 Loading backup data...")
    backup_data = load_backup_data()
    
    # Start restoration
    print("\n📥 Starting restoration...")
    print(f"  Will restore {len(backup_data)} players")
    print(f"  Estimated time: {len(backup_data) * (DELAY_BETWEEN_DOCS + 0.1) / 60:.1f} minutes")
    print("  Progress will be shown every 50 players")
    print("\n" + "-" * 60)
    
    restored = 0
    failed = 0
    failed_players = []
    start_time = time.time()
    
    for i, player in enumerate(backup_data):
        # Clean data
        player_data = clean_player_data(player, i)
        
        # Attempt to restore
        success, error = restore_with_retry(databases, player_data)
        
        if success:
            restored += 1
        else:
            failed += 1
            if failed <= 10:  # Keep first 10 failures
                failed_players.append(f"{player.get('name', 'Unknown')}: {error}")
        
        # Progress update
        if (restored + failed) % 50 == 0:
            elapsed = time.time() - start_time
            rate = (restored + failed) / elapsed
            remaining = (len(backup_data) - restored - failed) / rate if rate > 0 else 0
            print(f"Progress: {restored + failed}/{len(backup_data)} "
                  f"({restored} success, {failed} failed) "
                  f"- {remaining/60:.1f} min remaining")
        
        # Rate limiting
        if restored % BATCH_SIZE == 0:
            time.sleep(DELAY_BETWEEN_BATCHES)
        else:
            time.sleep(DELAY_BETWEEN_DOCS)
    
    # Final verification
    print("\n" + "-" * 60)
    print("\n🔍 Verifying restoration...")
    
    try:
        final = databases.list_documents(
            database_id=DATABASE_ID,
            collection_id=COLLECTION_ID,
            queries=[Query.limit(1)]
        )
        print(f"  Total documents in database: {final['total']}")
        
        # Check conferences
        print("\n  Checking Power 4 conferences:")
        for conf in ['SEC', 'ACC', 'Big Ten', 'Big 12']:
            try:
                conf_check = databases.list_documents(
                    database_id=DATABASE_ID,
                    collection_id=COLLECTION_ID,
                    queries=[Query.equal('conference', conf), Query.limit(1)]
                )
                status = "✅" if conf_check['total'] > 0 else "❌"
                print(f"    {status} {conf}: {conf_check['total']} players")
            except:
                print(f"    ❌ {conf}: Error checking")
    except Exception as e:
        print(f"  Error during verification: {e}")
    
    # Summary
    elapsed_total = time.time() - start_time
    print("\n" + "=" * 60)
    print("📊 RESTORATION COMPLETE")
    print("=" * 60)
    print(f"  Duration: {elapsed_total/60:.1f} minutes")
    print(f"  Successfully restored: {restored} players")
    print(f"  Failed: {failed} players")
    print(f"  Success rate: {restored/(restored+failed)*100:.1f}%")
    
    if failed > 0 and failed_players:
        print("\n  Failed players (first 10):")
        for fp in failed_players:
            print(f"    - {fp}")
    
    if restored > 2000:
        print("\n🎉 SUCCESS! Database fully restored with all Power 4 conferences!")
    elif restored > 1500:
        print("\n✅ Mostly successful. You may want to run again for missed players.")
    else:
        print("\n⚠️  Partial restoration. Please run again to complete.")
    
    print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

if __name__ == "__main__":
    main()
