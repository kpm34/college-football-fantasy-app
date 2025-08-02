import os
import json
import requests
from datetime import datetime

# Test CFBD API with provided key
CFBD_API_KEY = 'rEyNJxUagogtNdrndiKGMNjV03gRaVWr+hcTYDKbFXhzVR3V8WoCeUxo+h6S8okK'
SEASON_YEAR = '2024'

def test_cfbd_rankings():
    """Test CFBD API rankings endpoint"""
    # CFBD requires "Bearer " prefix
    headers = {
        'Authorization': f'Bearer {CFBD_API_KEY}',
        'Accept': 'application/json'
    }
    
    # Test rankings endpoint
    cfbd_url = f'https://api.collegefootballdata.com/rankings?year={SEASON_YEAR}&seasonType=regular'
    
    print(f"Testing CFBD API Rankings for {SEASON_YEAR}...")
    print(f"URL: {cfbd_url}")
    
    try:
        response = requests.get(cfbd_url, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            rankings_data = response.json()
            print(f"Successfully fetched rankings data")
            print(f"Number of weeks: {len(rankings_data)}")
            
            # Find latest AP Top 25
            ap_rankings = None
            latest_week = 0
            
            for week_data in rankings_data:
                week_num = week_data.get('week', 0)
                season_type = week_data.get('seasonType', '')
                print(f"\nWeek {week_num} ({season_type}):")
                
                polls = week_data.get('polls', [])
                for poll in polls:
                    poll_name = poll.get('poll')
                    print(f"  - {poll_name}")
                    
                    if poll_name == 'AP Top 25' and week_num > latest_week:
                        ap_rankings = poll.get('ranks', [])
                        latest_week = week_num
            
            if ap_rankings:
                print(f"\nLatest AP Top 25 (Week {latest_week}):")
                print("-" * 50)
                for i, ranking in enumerate(ap_rankings[:25], 1):
                    team = ranking.get('school')
                    rank = ranking.get('rank')
                    points = ranking.get('points', 0)
                    first_place = ranking.get('firstPlaceVotes', 0)
                    print(f"{rank:2d}. {team:25s} Points: {points:4d} (1st place votes: {first_place})")
                
                # Show what would be stored
                print("\nExample document structure:")
                example = ap_rankings[0]
                team_id = example.get('school').lower().replace(' ', '_').replace('-', '_')
                print(json.dumps({
                    'team_id': team_id,
                    'team_name': example.get('school'),
                    'rank': example.get('rank'),
                    'week': latest_week,
                    'season': int(SEASON_YEAR),
                    'poll': 'AP Top 25',
                    'points': example.get('points', 0),
                    'first_place_votes': example.get('firstPlaceVotes', 0),
                    'updated_at': datetime.utcnow().isoformat()
                }, indent=2))
            else:
                print("\nNo AP Top 25 rankings found in the data")
                
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Exception occurred: {str(e)}")

if __name__ == "__main__":
    test_cfbd_rankings()