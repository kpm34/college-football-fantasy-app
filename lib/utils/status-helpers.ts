/**
 * Helper functions for determining league and draft status
 */

export interface LeagueStatusInfo {
  leagueStatus: 'open' | 'closed';
  draftStatus: 'pre-draft' | 'drafting' | 'post-draft';
}

/**
 * Determine league status based on current teams and max teams
 */
export function determineLeagueStatus(currentTeams: number, maxTeams: number): 'open' | 'closed' {
  return currentTeams >= maxTeams ? 'closed' : 'open';
}

/**
 * Determine draft status based on draft date and completion
 */
export function determineDraftStatus(
  draftDate: Date | string | null | undefined,
  draftCompleted?: boolean,
  isDrafting?: boolean
): 'pre-draft' | 'drafting' | 'post-draft' {
  // If explicitly marked as completed or post-draft
  if (draftCompleted) {
    return 'post-draft';
  }
  
  // If currently drafting
  if (isDrafting) {
    return 'drafting';
  }
  
  // If no draft date set, it's pre-draft
  if (!draftDate) {
    return 'pre-draft';
  }
  
  const now = new Date();
  const draftDateTime = typeof draftDate === 'string' ? new Date(draftDate) : draftDate;
  
  // If draft date hasn't arrived yet
  if (draftDateTime > now) {
    return 'pre-draft';
  }
  
  // If draft date has passed but not explicitly marked as drafting or complete
  // We assume it's post-draft (draft might have been completed)
  // This could be refined with additional logic
  return 'post-draft';
}

/**
 * Get complete status information for a league
 */
export function getLeagueStatusInfo(league: {
  currentTeams?: number;
  maxTeams?: number;
  draftDate?: Date | string | null;
  draftCompleted?: boolean;
  isDrafting?: boolean;
  leagueStatus?: string;
  draftStatus?: string;
}): LeagueStatusInfo {
  const currentTeams = league.currentTeams || 0;
  const maxTeams = league.maxTeams || 12;
  
  return {
    leagueStatus: (league.leagueStatus as any) || determineLeagueStatus(currentTeams, maxTeams),
    draftStatus: (league.draftStatus as any) || determineDraftStatus(
      league.draftDate,
      league.draftCompleted,
      league.isDrafting
    )
  };
}

/**
 * Check if a league is joinable
 */
export function isLeagueJoinable(league: {
  currentTeams?: number;
  maxTeams?: number;
  leagueStatus?: string;
  draftStatus?: string;
}): boolean {
  const { leagueStatus, draftStatus } = getLeagueStatusInfo(league);
  
  // Can only join if league is open and hasn't started drafting
  return leagueStatus === 'open' && draftStatus === 'pre-draft';
}
