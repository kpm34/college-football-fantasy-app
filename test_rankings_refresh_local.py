import os
import json
import requests
from datetime import datetime, timedelta, timezone

def test_rankings_refresh():
    """
    Test version of rankings_refresh function
    """
    # Test with actual CFBD key
    CFBD_API_KEY = 'rEyNJxUagogtNdrndiKGMNjV03gRaVWr+hcTYDKbFXhzVR3V8WoCeUxo+h6S8okK'
    SEASON_YEAR = '2024'
    
    # Fetch AP Top-25 rankings from CFBD
    headers = {
        'Authorization': f'Bearer {CFBD_API_KEY}',
        'Accept': 'application/json'
    }
    
    cfbd_url = f'https://api.collegefootballdata.com/rankings?year={SEASON_YEAR}&seasonType=regular'
    response = requests.get(cfbd_url, headers=headers)
    
    if response.status_code != 200:
        print(f"Error: CFBD API returned {response.status_code}")
        return
    
    rankings_data = response.json()
    
    # Find the latest week's AP poll
    ap_rankings = None
    latest_week = 0
    
    for week_data in rankings_data:
        week_num = week_data.get('week', 0)
        if week_num > latest_week:
            polls = week_data.get('polls', [])
            for poll in polls:
                if poll.get('poll') == 'AP Top 25':
                    ap_rankings = poll.get('ranks', [])
                    latest_week = week_num
                    break
    
    if not ap_rankings:
        print("No AP Top 25 rankings found")
        return
    
    print(f"Found AP Top 25 rankings for Week {latest_week}")
    print(f"Processing {len(ap_rankings[:25])} teams...")
    
    # Calculate expiry date (35 days from now)
    expiry_date = datetime.now(timezone.utc) + timedelta(days=35)
    expiry_timestamp = int(expiry_date.timestamp())
    
    # Simulate Appwrite document creation
    documents_to_create = []
    
    for ranking in ap_rankings[:25]:
        team = ranking.get('school')
        rank = ranking.get('rank')
        
        if not team or not rank:
            continue
        
        # Use team name as document ID (sanitized)
        team_id = team.lower().replace(' ', '_').replace('-', '_')
        
        document_data = {
            'team_id': team_id,
            'team_name': team,
            'rank': rank,
            'week': latest_week,
            'season': int(SEASON_YEAR),
            'poll': 'AP Top 25',
            'points': ranking.get('points', 0),
            'first_place_votes': ranking.get('firstPlaceVotes', 0),
            'updated_at': datetime.now(timezone.utc).isoformat(),
            '$expire': expiry_timestamp  # Appwrite TTL attribute
        }
        
        documents_to_create.append(document_data)
        print(f"  {rank:2d}. {team:25s} (ID: {team_id})")
    
    print(f"\nWould create/update {len(documents_to_create)} documents in Appwrite")
    print(f"Documents will expire on: {expiry_date.isoformat()}")
    
    # Show example document
    print("\nExample document:")
    print(json.dumps(documents_to_create[0], indent=2))
    
    return {"updated": len(documents_to_create)}

if __name__ == "__main__":
    result = test_rankings_refresh()
    print(f"\nResult: {json.dumps(result)}")