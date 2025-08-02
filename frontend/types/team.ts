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

export interface Player {
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
  players: Player[];
}

export interface TeamsResponse {
  total: number;
  conferences: string[];
  teams: Record<string, Team[]>;
}