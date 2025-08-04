import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import date

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
for school in schools:
    print(f"\n🔍 Scraping {school['name']} roster...")
    try:
        res = requests.get(school["url"])
        soup = BeautifulSoup(res.text, "html.parser")

        # find the roster table
        table = soup.find("table", class_="roster")
        if not table:
            print(f"❌ No roster table found for {school['name']}")
            continue
            
        rows = table.tbody.find_all("tr")

        data = []
        for tr in rows:
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

        df = pd.DataFrame(data)
        print(f"✅ Found {len(data)} players for {school['name']}")
        
        # print markdown table
        print(f"\n## {school['name']} ({school['conference']}; \"{school['abbrev']}\")\n")
        print(df.to_markdown(index=False))
        
    except Exception as e:
        print(f"❌ Error scraping {school['name']}: {e}")

print("\n🏈 247Sports scraping complete!") 