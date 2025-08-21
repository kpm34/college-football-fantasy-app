# scripts/build_2026_consensus_real.py
# Updated with real data from WebFetch
import json, os, csv
from typing import Dict, List

OUT_DIR = "data/2026-consensus"
os.makedirs(OUT_DIR, exist_ok=True)

# REAL DATA from WebFetch (August 2025)
REAL_DATA = {
    "QB": {
        "WalterFootball": [
            {"name": "LaNorris Sellers", "rank": 1},
            {"name": "Garrett Nussmeier", "rank": 2},
            {"name": "Arch Manning", "rank": 3},
            {"name": "Drew Allar", "rank": 4},
            {"name": "Cade Klubnik", "rank": 5},
            {"name": "Carson Beck", "rank": 6},
            {"name": "Eli Holstein", "rank": 7},
            {"name": "Fernando Mendoza", "rank": 8},
            {"name": "Miller Moss", "rank": 9},
            {"name": "Behren Morton", "rank": 10},
            {"name": "Brenden Sorsby", "rank": 11},
            {"name": "Jackson Arnold", "rank": 12},
            {"name": "Jalon Daniels", "rank": 13},
            {"name": "Sam Leavitt", "rank": 14},
            {"name": "Tyler Van Dyke", "rank": 15},
            {"name": "Max Johnson", "rank": 16},
            {"name": "Donovan Smith", "rank": 17},
            {"name": "Kyron Drones", "rank": 18},
            {"name": "Noah Fifita", "rank": 19}
        ],
        "PFN": [
            {"name": "Cade Klubnik", "rank": 1},
            {"name": "Fernando Mendoza", "rank": 2},
            {"name": "LaNorris Sellers", "rank": 3},
            {"name": "Arch Manning", "rank": 4}
        ]
    },
    "RB": {
        "WalterFootball": [
            {"name": "Jeremiyah Love", "rank": 1},
            {"name": "Nicholas Singleton", "rank": 2},
            {"name": "Quintrevion Wisner", "rank": 3},
            {"name": "Makhi Hughes", "rank": 4},
            {"name": "Le'Veon Moss", "rank": 5},
            {"name": "Jadarian Price", "rank": 6},
            {"name": "Jayden Ott", "rank": 7},
            {"name": "Jonah Coleman", "rank": 8},
            {"name": "Demond Claiborne", "rank": 9},
            {"name": "Darius Taylor", "rank": 10},
            {"name": "Jam Miller", "rank": 11},
            {"name": "Josh McCray", "rank": 12},
            {"name": "Jamal Haynes", "rank": 13},
            {"name": "L.J. Martin", "rank": 14},
            {"name": "Justice Haynes", "rank": 15},
            {"name": "Emmett Johnson", "rank": 16},
            {"name": "Carson Hansen", "rank": 17},
            {"name": "Richard Young", "rank": 18},
            {"name": "Cash Jones", "rank": 19}
        ],
        "PFN": [
            {"name": "Jeremiyah Love", "rank": 1}
        ]
    },
    "WR": {
        "WalterFootball": [
            {"name": "Jordyn Tyson", "rank": 1},
            {"name": "Denzel Boston", "rank": 2},
            {"name": "Antonio Williams", "rank": 3},
            {"name": "Nic Anderson", "rank": 4},
            {"name": "Germie Bernard", "rank": 5},
            {"name": "Carnell Tate", "rank": 6},
            {"name": "Aaron Anderson", "rank": 7},
            {"name": "Deion Burks", "rank": 8},
            {"name": "Eric Singleton", "rank": 9},
            {"name": "Elijah Sarratt", "rank": 10},
            {"name": "Tre Wilson III", "rank": 11},
            {"name": "Isaiah Horton", "rank": 12},
            {"name": "Squirrel White", "rank": 13},
            {"name": "Malachi Fields", "rank": 14},
            {"name": "Omar Cooper Jr.", "rank": 15},
            {"name": "Chris Brazzell II", "rank": 16},
            {"name": "Nyck Harbor", "rank": 17},
            {"name": "Ja'Kobi Lane", "rank": 18},
            {"name": "Bryce Lance", "rank": 19},
            {"name": "Noah Thomas", "rank": 20},
            {"name": "Chris Bell", "rank": 21},
            {"name": "Jayden Gibson", "rank": 22},
            {"name": "Jaden Greathouse", "rank": 23},
            {"name": "Caleb Douglas", "rank": 24},
            {"name": "Jayce Brown", "rank": 25}
        ],
        "PFN": [
            {"name": "Jordyn Tyson", "rank": 1},
            {"name": "Antonio Williams", "rank": 2}
        ]
    },
    "TE": {
        "WalterFootball": [
            {"name": "Max Klare", "rank": 1},
            {"name": "John Michael Gyllenborg", "rank": 2},
            {"name": "Jack Velling", "rank": 3},
            {"name": "Jack Endries", "rank": 4},
            {"name": "Joe Royer", "rank": 5},
            {"name": "Justin Joly", "rank": 6},
            {"name": "Oscar Delp", "rank": 7},
            {"name": "Hayden Hansen", "rank": 8},
            {"name": "Arlis Boardingham", "rank": 9},
            {"name": "Josh Cuevas", "rank": 10},
            {"name": "Marlin Klein", "rank": 11},
            {"name": "Eli Stowers", "rank": 12},
            {"name": "Terrance Carter", "rank": 13},
            {"name": "Eli Raridon", "rank": 14},
            {"name": "Bauer Sharp", "rank": 15}
        ]
    }
}

def norm_name(s: str) -> str:
    s = s.replace("'", "").replace("'", "")  # remove apostrophes
    s = s.replace("Jr.", "Jr").replace("Jr", "Jr")  # normalize Jr
    s = " ".join(s.split())  # normalize whitespace
    return s.lower()

def process_position(pos: str, need: int = 25) -> List[Dict]:
    """Process a position's rankings from multiple sources"""
    print(f"Processing {pos}...")
    
    position_data = REAL_DATA.get(pos, {})
    
    # Start with WalterFootball as base (most complete)
    merged = {}
    wf_data = position_data.get("WalterFootball", [])
    for player in wf_data[:need]:
        key = norm_name(player["name"])
        merged[key] = {
            "Player": player["name"],
            "WalterFootball_Rank": player["rank"],
            "PFN_Rank": None,
            "n_sources": 1
        }
    
    # Add PFN data where available
    pfn_data = position_data.get("PFN", [])
    for player in pfn_data:
        key = norm_name(player["name"])
        if key in merged:
            merged[key]["PFN_Rank"] = player["rank"]
            merged[key]["n_sources"] += 1
        else:
            # Add new player if not in WalterFootball but in top need
            if len(merged) < need:
                merged[key] = {
                    "Player": player["name"],
                    "WalterFootball_Rank": None,
                    "PFN_Rank": player["rank"],
                    "n_sources": 1
                }
    
    # Calculate consensus rankings
    items = []
    for player_data in merged.values():
        ranks = [r for r in [player_data["WalterFootball_Rank"], player_data["PFN_Rank"]] if r is not None]
        player_data["Mean_Rank"] = round(sum(ranks) / len(ranks), 2) if ranks else None
        items.append(player_data)
    
    # Sort by consensus rank, then by WalterFootball rank
    items.sort(key=lambda x: (
        x["Mean_Rank"] if x["Mean_Rank"] is not None else 999,
        x["WalterFootball_Rank"] if x["WalterFootball_Rank"] is not None else 999
    ))
    
    return items[:need]

def main():
    """Generate consensus rankings for all positions"""
    SPEC = {"QB": 25, "RB": 30, "WR": 50, "TE": 20}
    
    all_export = {}
    
    for pos, need in SPEC.items():
        items = process_position(pos, need)
        all_export[pos] = items
        
        # Write CSV
        csv_path = os.path.join(OUT_DIR, f"{pos.lower()}_consensus_real.csv")
        with open(csv_path, "w", newline="") as f:
            fieldnames = ["Player", "WalterFootball_Rank", "PFN_Rank", "Mean_Rank", "n_sources"]
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for item in items:
                writer.writerow(item)
        
        print(f"✅ {pos}: {len(items)} players written to {csv_path}")
    
    # Write combined JSON
    json_path = os.path.join(OUT_DIR, "consensus_all_real.json")
    with open(json_path, "w") as f:
        json.dump(all_export, f, indent=2)
    
    print(f"✅ Combined data written to {json_path}")
    
    # Summary
    print(f"\n📊 Summary:")
    for pos, data in all_export.items():
        top_3 = [p["Player"] for p in data[:3]]
        print(f"{pos}: {', '.join(top_3)} (top 3)")

if __name__ == "__main__":
    main()