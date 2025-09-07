# Project Map — lib/repos

```mermaid
flowchart TB
  classDef folder fill:#fef3c7,stroke:#d97706,stroke-width:2,color:#451a03,rx:8,ry:8
  classDef file fill:#f0fdf4,stroke:#65a30d,stroke-width:1.5,color:#422006,rx:4,ry:4
  lib_repos["lib/repos/" ]
  class lib_repos folder
  lib_repos_auctions_repo_ts["auctions.repo.ts"]
  class lib_repos_auctions_repo_ts file
  lib_repos --> lib_repos_auctions_repo_ts
  lib_repos_bids_repo_ts["bids.repo.ts"]
  class lib_repos_bids_repo_ts file
  lib_repos --> lib_repos_bids_repo_ts
  lib_repos_college_players_repo_ts["college_players.repo.ts"]
  class lib_repos_college_players_repo_ts file
  lib_repos --> lib_repos_college_players_repo_ts
  lib_repos_draft_picks_repo_ts["draft_picks.repo.ts"]
  class lib_repos_draft_picks_repo_ts file
  lib_repos --> lib_repos_draft_picks_repo_ts
  lib_repos_drafts_repo_ts["drafts.repo.ts"]
  class lib_repos_drafts_repo_ts file
  lib_repos --> lib_repos_drafts_repo_ts
  lib_repos_fantasy_teams_repo_ts["fantasy_teams.repo.ts"]
  class lib_repos_fantasy_teams_repo_ts file
  lib_repos --> lib_repos_fantasy_teams_repo_ts
  lib_repos_games_repo_ts["games.repo.ts"]
  class lib_repos_games_repo_ts file
  lib_repos --> lib_repos_games_repo_ts
  lib_repos_leagues_repo_ts["leagues.repo.ts"]
  class lib_repos_leagues_repo_ts file
  lib_repos --> lib_repos_leagues_repo_ts
  lib_repos_lineups_repo_ts["lineups.repo.ts"]
  class lib_repos_lineups_repo_ts file
  lib_repos --> lib_repos_lineups_repo_ts
  lib_repos_player_stats_repo_ts["player_stats.repo.ts"]
  class lib_repos_player_stats_repo_ts file
  lib_repos --> lib_repos_player_stats_repo_ts
  lib_repos_rankings_repo_ts["rankings.repo.ts"]
  class lib_repos_rankings_repo_ts file
  lib_repos --> lib_repos_rankings_repo_ts
  lib_repos_repositories["repositories/"]
  class lib_repos_repositories folder
  lib_repos --> lib_repos_repositories
  click lib_repos_repositories "/admin/project-map/lib/repos/repositories" "Open repositories"
  lib_repos_rosters_repo_ts["rosters.repo.ts"]
  class lib_repos_rosters_repo_ts file
  lib_repos --> lib_repos_rosters_repo_ts
```
