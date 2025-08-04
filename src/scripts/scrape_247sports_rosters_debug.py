import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import date
import time

# 1. Configuration: which teams to scrape
schools = [
    {"name": "Notre Dame", "abbrev": "ND", "url": "https://247sports.com/college/notre-dame/Season/2024-Football/roster/", "conference": "Independent", "conf_id": "independent", "power4": False},
    {"name": "UCF",         "abbrev": "UCF","url": "https://247sports.com/college/central-florida/Season/2024-Football/roster/", "conference": "Big 12",      "conf_id": "big-12",      "power4": True},
    {"name": "Utah",        "abbrev": "UTAH","url": "https://247sports.com/college/utah/Season/2024-Football/roster/", "conference": "Big 12",      "conf_id": "big-12",      "power4": True},
]

# 2. Helper to map class → draftable
draftable_classes = {"Sr": True, "Gr": True, "Jr": True}

# 3. Loop over schools and build tables
today = date.today().isoformat()
headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

for school in schools:
    print(f"\n🔍 Scraping {school['name']} roster...")
    print(f"📄 URL: {school['url']}")
    
    try:
        # Add delay to be respectful
        time.sleep(2)
        
        res = requests.get(school["url"], headers=headers)
        print(f"📊 Response status: {res.status_code}")
        
        if res.status_code != 200:
            print(f"❌ Bad response status: {res.status_code}")
            continue
            
        soup = BeautifulSoup(res.text, "html.parser")
        
        # Debug: Look for any tables
        all_tables = soup.find_all("table")
        print(f"🔍 Found {len(all_tables)} tables on the page")
        
        # Try different table selectors
        table = None
        table_selectors = [
            "table.roster",
            "table",
            ".roster-table",
            "#roster-table"
        ]
        
        for selector in table_selectors:
            table = soup.select_one(selector)
            if table:
                print(f"✅ Found table with selector: {selector}")
                break
        
        if not table:
            print("❌ No table found with any selector")
            # Let's see what's actually on the page
            print("🔍 Page content preview:")
            print(soup.get_text()[:500] + "...")
            continue
            
        # Try to find rows
        rows = table.find_all("tr")
        print(f"📋 Found {len(rows)} rows in table")
        
        if len(rows) == 0:
            print("❌ No rows found in table")
            continue
            
        # Look at first few rows to understand structure
        print("🔍 First few rows structure:")
        for i, row in enumerate(rows[:3]):
            cols = row.find_all(["td", "th"])
            print(f"  Row {i}: {len(cols)} columns")
            if cols:
                col_texts = [col.get_text(strip=True) for col in cols]
                print(f"    Content: {col_texts}")

        data = []
        for tr in rows[1:]:  # Skip header row
            cols = [td.get_text(strip=True) for td in tr.find_all("td")]
            if len(cols) < 7:
                continue
                
            jersey, name, pos, _, height, weight, year = cols[:7]
            if pos not in ("QB", "RB", "WR", "TE", "K"):
                continue

            data.append({
                "Name":            name,
                "Position":        pos,
                "Team":            school["name"],
                "Team Abbrev":     school["abbrev"],
                "Conference":      school["conference"],
                "Year":            year,
                "Draftable":       draftable_classes.get(year, False),
                "Conference ID":   school["conf_id"],
                "Power_4":         school["power4"],
                "Created At":      today,
                "School":          school["name"],
                "Jersey":          jersey,
                "Height":          height,
                "Weight":          weight,
            })

        print(f"✅ Found {len(data)} players for {school['name']}")
        
        if data:
            df = pd.DataFrame(data)
            # print markdown table
            print(f"\n## {school['name']} ({school['conference']}; \"{school['abbrev']}\")\n")
            print(df.to_markdown(index=False))
        
    except Exception as e:
        print(f"❌ Error scraping {school['name']}: {e}")

print("\n🏈 247Sports scraping complete!") 