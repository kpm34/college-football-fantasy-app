import requests
import json
from datetime import date

# 1. Configuration: which teams to fetch
schools = [
    {"name": "Notre Dame", "slug": "notre-dame", "conference": "Independent", "conf_id": "independent", "power4": False},
    {"name": "UCF", "slug": "central-florida", "conference": "Big 12", "conf_id": "big-12", "power4": True},
    {"name": "Utah", "slug": "utah", "conference": "Big 12", "conf_id": "big-12", "power4": True},
    {"name": "Texas", "slug": "texas", "conference": "SEC", "conf_id": "sec", "power4": True},
    {"name": "Oklahoma", "slug": "oklahoma", "conference": "SEC", "conf_id": "sec", "power4": True},
]

# 2. Helper to map class → draftable
draftable_classes = {"Sr": True, "Gr": True, "Jr": True}

# 3. Create session with better headers
session = requests.Session()
session.headers.update({
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/138.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Referer": "https://247sports.com/",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "X-Requested-With": "XMLHttpRequest"
})

# 4. Loop over schools and fetch JSON data
today = date.today().isoformat()
for school in schools:
    print(f"\n🔍 Fetching {school['name']} roster from JSON API...")
    
    url = f"https://247sports.com/college/{school['slug']}/Season/2024-Football/roster/json/"
    print(f"📄 URL: {url}")
    
    try:
        # First, try to get the main page to establish session
        main_url = f"https://247sports.com/college/{school['slug']}/Season/2024-Football/roster/"
        print(f"🌐 Establishing session with main page...")
        main_response = session.get(main_url)
        print(f"📊 Main page status: {main_response.status_code}")
        
        # Now try the JSON endpoint
        response = session.get(url)
        print(f"📊 JSON API status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ Bad response status: {response.status_code}")
            print(f"📄 Response headers: {dict(response.headers)}")
            continue
            
        data = response.json()
        print(f"✅ Successfully fetched JSON data")
        
        # Extract roster data
        if 'roster' in data:
            roster = data['roster']
            print(f"📋 Found {len(roster)} players in roster")
            
            # Filter for fantasy-relevant positions
            fantasy_players = []
            for player in roster:
                position = player.get('position', '')
                if position in ['QB', 'RB', 'WR', 'TE', 'K']:
                    fantasy_players.append({
                        "Name": player.get('name', ''),
                        "Position": position,
                        "Team": school['name'],
                        "Team Abbrev": school['name'][:3].upper(),
                        "Conference": school['conference'],
                        "Year": player.get('year', 'FR'),
                        "Draftable": draftable_classes.get(player.get('year', ''), False),
                        "Conference ID": school['conf_id'],
                        "Power_4": school['power4'],
                        "Created At": today,
                        "School": school['name'],
                        "Jersey": player.get('jersey', ''),
                        "Height": player.get('height', '6-0'),
                        "Weight": player.get('weight', '200'),
                    })
            
            print(f"🎯 Found {len(fantasy_players)} fantasy-relevant players")
            
            if fantasy_players:
                # Print as markdown table
                print(f"\n## {school['name']} ({school['conference']})\n")
                import pandas as pd
                df = pd.DataFrame(fantasy_players)
                print(df.to_markdown(index=False))
            else:
                print("❌ No fantasy-relevant players found")
                
        else:
            print("❌ No roster data found in JSON response")
            print("🔍 JSON structure:")
            print(json.dumps(data, indent=2)[:500] + "...")
            
    except Exception as e:
        print(f"❌ Error fetching {school['name']}: {e}")

print("\n🏈 247Sports JSON API fetching complete!") 