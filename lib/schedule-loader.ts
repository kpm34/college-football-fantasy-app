import fs from 'fs';
import path from 'path';

export interface Game {
  id: string;
  week: number;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  homeConference: string;
  awayConference: string;
  tv?: string;
  location?: string;
  line?: string;
}

export interface WeekSchedule {
  week: number;
  startDate: string;
  endDate: string;
  games: Game[];
}

/**
 * Load schedule data from JSON files in the data/2025-schedule directory
 */
export function loadScheduleData(): WeekSchedule[] {
  const scheduleDir = path.join(process.cwd(), 'data', '2025-schedule');
  const scheduleData: WeekSchedule[] = [];

  // Check if directory exists
  if (!fs.existsSync(scheduleDir)) {
    console.warn('Schedule directory not found:', scheduleDir);
    return [];
  }

  // Read all week files
  for (let week = 1; week <= 15; week++) {
    const fileName = path.join(scheduleDir, `week-${week}.json`);
    
    if (fs.existsSync(fileName)) {
      try {
        const fileContent = fs.readFileSync(fileName, 'utf-8');
        const weekData = JSON.parse(fileContent) as WeekSchedule;
        scheduleData.push(weekData);
      } catch (error) {
        console.error(`Error loading week ${week} schedule:`, error);
      }
    }
  }

  return scheduleData.sort((a, b) => a.week - b.week);
}

/**
 * Load a specific week's schedule
 */
export function loadWeekSchedule(week: number): WeekSchedule | null {
  const scheduleDir = path.join(process.cwd(), 'data', '2025-schedule');
  const fileName = path.join(scheduleDir, `week-${week}.json`);
  
  if (!fs.existsSync(fileName)) {
    return null;
  }

  try {
    const fileContent = fs.readFileSync(fileName, 'utf-8');
    return JSON.parse(fileContent) as WeekSchedule;
  } catch (error) {
    console.error(`Error loading week ${week} schedule:`, error);
    return null;
  }
}

/**
 * Get all games for a specific team
 */
export function getTeamSchedule(teamName: string): Game[] {
  const allWeeks = loadScheduleData();
  const teamGames: Game[] = [];

  allWeeks.forEach(week => {
    week.games.forEach(game => {
      if (game.homeTeam === teamName || game.awayTeam === teamName) {
        teamGames.push(game);
      }
    });
  });

  return teamGames;
}

/**
 * Filter games by Power 4 conferences
 */
export function filterPower4Games(games: Game[]): Game[] {
  const POWER_4_CONFERENCES = ['SEC', 'Big Ten', 'Big 12', 'ACC'];
  
  return games.filter(game => 
    POWER_4_CONFERENCES.includes(game.homeConference) ||
    POWER_4_CONFERENCES.includes(game.awayConference)
  );
}
