export function formatGameTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });
}

export function formatScore(score?: number): string {
  return score !== undefined ? score.toString() : '-';
}

export function formatConference(conference?: string): string {
  if (!conference) return '';
  
  // Format common conference names
  const conferenceMap: Record<string, string> = {
    'Southeastern Conference': 'SEC',
    'Big Ten Conference': 'Big Ten',
    'Atlantic Coast Conference': 'ACC',
    'Big 12 Conference': 'Big 12',
  };
  
  return conferenceMap[conference] || conference;
}