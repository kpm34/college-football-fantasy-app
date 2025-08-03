#!/usr/bin/env python3
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

CFBD_API_KEY = os.getenv('CFBD_API_KEY')

def test_cfbd_api():
    print("Testing CFBD API connection...")
    
    headers = {
        'Authorization': f'Bearer {CFBD_API_KEY}',
        'Accept': 'application/json'
    }
    
    # Test endpoint - get teams for 2024 season
    url = 'https://api.collegefootballdata.com/teams'
    params = {'year': 2024}
    
    try:
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            teams = response.json()
            print(f"\n✅ API Key is valid! Found {len(teams)} Big 12 teams:")
            for team in teams[:5]:  # Show first 5 teams
                print(f"  - {team.get('school', 'Unknown')}")
            return True
        else:
            print(f"\n❌ API request failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"\n❌ Error testing API: {e}")
        return False

if __name__ == "__main__":
    test_cfbd_api()