export interface Team {
  id: string;
  school: string;
  mascot?: string;
  abbreviation?: string;
  conference: string;
  conferenceId?: number;
  color?: string;
  altColor?: string;
  logo?: string;
}

// Renamed to avoid conflict with fantasy Player
export interface TeamPlayer {
  id: string;
  name: string;
  position: string;
  jersey?: string;
  year?: string;
  height?: string;
  weight?: number;
  homeState?: string;
  teamId: string;
}

export interface TeamRoster {
  team: Team;
  players: TeamPlayer[];
}

export interface TeamsResponse {
  total: number;
  conferences: string[];
  teams: Record<string, Team[]>;
}