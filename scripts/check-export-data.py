import json
import sys

with open('exports/college_players_2025.json', 'r') as f:
    data = json.load(f)

print(f'Total players: {len(data)}')

# Count by conference
confs = {}
positions = {}
teams_by_conf = {}

for p in data:
    conf = p.get('conference', 'Unknown')
    pos = p.get('position', 'Unknown')
    team = p.get('team', 'Unknown')
    
    confs[conf] = confs.get(conf, 0) + 1
    positions[pos] = positions.get(pos, 0) + 1
    
    if conf not in teams_by_conf:
        teams_by_conf[conf] = set()
    teams_by_conf[conf].add(team)

print('\nBy Conference:')
for c, count in sorted(confs.items()):
    print(f'  {c}: {count} players ({len(teams_by_conf.get(c, []))} teams)')

print('\nBy Position:')
for p, count in sorted(positions.items()):
    print(f'  {p}: {count}')

# Check for specific Power 4 teams
print('\nChecking for Power 4 teams:')
power4_teams = {
    'Big Ten': ['Ohio State', 'Michigan', 'Penn State', 'Wisconsin'],
    'Big 12': ['Texas Tech', 'Kansas State', 'Iowa State', 'Oklahoma State'],
    'SEC': ['Alabama', 'Georgia', 'Texas', 'Oklahoma'],
    'ACC': ['Clemson', 'Florida State', 'Miami', 'North Carolina']
}

for conf, teams in power4_teams.items():
    found = []
    for team in teams:
        team_players = [p for p in data if p.get('team') == team]
        if team_players:
            found.append(f"{team} ({len(team_players)})")
    if found:
        print(f"  {conf}: {', '.join(found)}")
    else:
        print(f"  {conf}: No teams found")
