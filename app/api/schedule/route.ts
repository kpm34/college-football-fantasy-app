import { NextRequest, NextResponse } from 'next/server';

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

// Power 4 conferences
const POWER_4_CONFERENCES = ['SEC', 'Big Ten', 'Big 12', 'ACC'];

// Sample schedule data for 2025 season
const SCHEDULE_DATA: WeekSchedule[] = [
  {
    week: 1,
    startDate: '2025-08-28',
    endDate: '2025-08-30',
    games: [
      {
        id: 'texas-ohio-state-w1',
        week: 1,
        date: '2025-08-30',
        time: '12:00 PM',
        homeTeam: 'Ohio State',
        awayTeam: 'Texas',
        homeConference: 'Big Ten',
        awayConference: 'SEC',
        tv: 'FOX',
        location: 'Ohio Stadium, Columbus, OH',
        line: 'Ohio State -2.5'
      },
      {
        id: 'alabama-florida-state-w1',
        week: 1,
        date: '2025-08-30',
        time: '3:30 PM',
        homeTeam: 'Florida State',
        awayTeam: 'Alabama',
        homeConference: 'ACC',
        awayConference: 'SEC',
        tv: 'ABC',
        location: 'Doak Campbell Stadium, Tallahassee, FL',
        line: 'Alabama -13.5'
      },
      {
        id: 'georgia-marshall-w1',
        week: 1,
        date: '2025-08-30',
        time: '3:30 PM',
        homeTeam: 'Georgia',
        awayTeam: 'Marshall',
        homeConference: 'SEC',
        awayConference: 'Sun Belt',
        tv: 'ESPN',
        location: 'Sanford Stadium, Athens, GA',
        line: 'Georgia -39.5'
      },
      {
        id: 'penn-state-nevada-w1',
        week: 1,
        date: '2025-08-30',
        time: '3:30 PM',
        homeTeam: 'Penn State',
        awayTeam: 'Nevada',
        homeConference: 'Big Ten',
        awayConference: 'Mountain West',
        tv: 'CBS',
        location: 'Beaver Stadium, University Park, PA',
        line: 'Penn State -44'
      },
      {
        id: 'oklahoma-illinois-state-w1',
        week: 1,
        date: '2025-08-30',
        time: '6:00 PM',
        homeTeam: 'Oklahoma',
        awayTeam: 'Illinois State',
        homeConference: 'SEC',
        awayConference: 'Missouri Valley',
        tv: 'ESPN+',
        location: 'Memorial Stadium, Norman, OK',
        line: 'Oklahoma -35.5'
      },
      {
        id: 'michigan-virginia-tech-w1',
        week: 1,
        date: '2025-08-30',
        time: '7:30 PM',
        homeTeam: 'Michigan',
        awayTeam: 'Virginia Tech',
        homeConference: 'Big Ten',
        awayConference: 'ACC',
        tv: 'ESPN',
        location: 'Michigan Stadium, Ann Arbor, MI',
        line: 'Michigan -14'
      }
    ]
  },
  {
    week: 2,
    startDate: '2025-09-04',
    endDate: '2025-09-06',
    games: [
      {
        id: 'texas-michigan-w2',
        week: 2,
        date: '2025-09-06',
        time: '12:00 PM',
        homeTeam: 'Texas',
        awayTeam: 'Michigan',
        homeConference: 'SEC',
        awayConference: 'Big Ten',
        tv: 'FOX',
        location: 'Darrell K Royal Stadium, Austin, TX',
        line: 'Texas -3'
      },
      {
        id: 'georgia-texas-am-w2',
        week: 2,
        date: '2025-09-06',
        time: '3:30 PM',
        homeTeam: 'Georgia',
        awayTeam: 'Texas A&M',
        homeConference: 'SEC',
        awayConference: 'SEC',
        tv: 'CBS',
        location: 'Sanford Stadium, Athens, GA',
        line: 'Georgia -7'
      },
      {
        id: 'clemson-notre-dame-w2',
        week: 2,
        date: '2025-09-06',
        time: '7:30 PM',
        homeTeam: 'Clemson',
        awayTeam: 'Notre Dame',
        homeConference: 'ACC',
        awayConference: 'ACC',
        tv: 'ESPN',
        location: 'Memorial Stadium, Clemson, SC',
        line: 'Clemson -4'
      },
      {
        id: 'oklahoma-state-iowa-state-w2',
        week: 2,
        date: '2025-09-06',
        time: '8:00 PM',
        homeTeam: 'Oklahoma State',
        awayTeam: 'Iowa State',
        homeConference: 'Big 12',
        awayConference: 'Big 12',
        tv: 'FOX',
        location: 'Boone Pickens Stadium, Stillwater, OK',
        line: 'Oklahoma State -6'
      }
    ]
  },
  {
    week: 3,
    startDate: '2025-09-11',
    endDate: '2025-09-13',
    games: [
      {
        id: 'alabama-wisconsin-w3',
        week: 3,
        date: '2025-09-13',
        time: '3:30 PM',
        homeTeam: 'Alabama',
        awayTeam: 'Wisconsin',
        homeConference: 'SEC',
        awayConference: 'Big Ten',
        tv: 'CBS',
        location: 'Bryant-Denny Stadium, Tuscaloosa, AL',
        line: 'Alabama -21'
      },
      {
        id: 'ohio-state-oregon-w3',
        week: 3,
        date: '2025-09-13',
        time: '7:30 PM',
        homeTeam: 'Ohio State',
        awayTeam: 'Oregon',
        homeConference: 'Big Ten',
        awayConference: 'Big Ten',
        tv: 'ABC',
        location: 'Ohio Stadium, Columbus, OH',
        line: 'Ohio State -3'
      },
      {
        id: 'florida-state-louisville-w3',
        week: 3,
        date: '2025-09-13',
        time: '8:00 PM',
        homeTeam: 'Florida State',
        awayTeam: 'Louisville',
        homeConference: 'ACC',
        awayConference: 'ACC',
        tv: 'ESPN',
        location: 'Doak Campbell Stadium, Tallahassee, FL',
        line: 'Florida State -10'
      }
    ]
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const week = searchParams.get('week');
    const team = searchParams.get('team');
    
    let scheduleData = SCHEDULE_DATA;
    
    // Filter by week if specified
    if (week) {
      const weekNum = parseInt(week);
      scheduleData = scheduleData.filter(w => w.week === weekNum);
    }
    
    // Filter by team if specified
    if (team) {
      scheduleData = scheduleData.map(weekData => ({
        ...weekData,
        games: weekData.games.filter(game => 
          game.homeTeam.toLowerCase().includes(team.toLowerCase()) ||
          game.awayTeam.toLowerCase().includes(team.toLowerCase())
        )
      })).filter(weekData => weekData.games.length > 0);
    }
    
    // Only include games with at least one Power 4 team
    const filteredSchedule = scheduleData.map(weekData => ({
      ...weekData,
      games: weekData.games.filter(game => 
        POWER_4_CONFERENCES.includes(game.homeConference) ||
        POWER_4_CONFERENCES.includes(game.awayConference)
      )
    }));
    
    return NextResponse.json({
      success: true,
      schedule: filteredSchedule,
      totalWeeks: 13 // Regular season weeks
    });
    
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}