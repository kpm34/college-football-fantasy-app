import { NextRequest, NextResponse } from 'next/server';
import { loadScheduleData, loadWeekSchedule, getTeamSchedule, filterPower4Games } from '@lib/schedule-loader';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const week = searchParams.get('week');
    const team = searchParams.get('team');
    
    let scheduleData;
    
    // Load data based on parameters
    if (week) {
      const weekNum = parseInt(week);
      const weekData = loadWeekSchedule(weekNum);
      scheduleData = weekData ? [weekData] : [];
    } else if (team) {
      const teamGames = getTeamSchedule(team);
      // Group games by week
      const gamesByWeek = new Map<number, any>();
      teamGames.forEach(game => {
        if (!gamesByWeek.has(game.week)) {
          gamesByWeek.set(game.week, {
            week: game.week,
            startDate: game.date,
            endDate: game.date,
            games: []
          });
        }
        gamesByWeek.get(game.week)!.games.push(game);
      });
      scheduleData = Array.from(gamesByWeek.values()).sort((a, b) => a.week - b.week);
    } else {
      scheduleData = loadScheduleData();
    }
    
    // Filter to only include Power 4 games
    const filteredSchedule = scheduleData.map(weekData => ({
      ...weekData,
      games: filterPower4Games(weekData.games)
    }));
    
    return NextResponse.json({
      success: true,
      schedule: filteredSchedule,
      totalWeeks: 15 // Regular season + conference championship + playoffs
    });
    
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}
