import { FiClipboard, FiTrendingUp, FiCalendar } from "react-icons/fi";
import { useRouter } from "next/navigation";

interface LeagueOverviewProps {
  league: any;
  teams: any[];
  leagueId: string;
  onTabChange: (tab: string) => void;
}

export default function LeagueOverview({ league, teams, leagueId, onTabChange }: LeagueOverviewProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* League Info */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold mb-4">League Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400">Commissioner</p>
            <p className="font-semibold">{league?.commissioner}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Season</p>
            <p className="font-semibold">{league?.season}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Scoring Type</p>
            <p className="font-semibold">{league?.scoringType || 'PPR'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Teams</p>
            <p className="font-semibold">{teams.length} / {league?.maxTeams || 12}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Draft Date</p>
            <p className="font-semibold">
              {league?.draftDate ? new Date(league.draftDate).toLocaleDateString() : 'Not scheduled'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Status</p>
            <p className="font-semibold capitalize">{league?.status || 'Pre-Draft'}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => router.push(`/league/${leagueId}/locker-room`)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
        >
          <FiClipboard className="text-xl" />
          <span className="font-semibold">Manage Roster</span>
        </button>
        
        <button
          onClick={() => onTabChange('standings')}
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
        >
          <FiTrendingUp className="text-xl" />
          <span className="font-semibold">View Standings</span>
        </button>
        
        <button
          onClick={() => onTabChange('schedule')}
          className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
        >
          <FiCalendar className="text-xl" />
          <span className="font-semibold">Schedule</span>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <p className="text-sm text-gray-400">No recent activity</p>
        </div>
      </div>
    </div>
  );
}
