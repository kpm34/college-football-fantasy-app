import { useState } from "react";
import { databases, DATABASE_ID, COLLECTIONS } from '@lib/appwrite';

interface LeagueSettingsProps {
  league: any;
  isCommissioner: boolean;
  initialScoringSettings: any;
  initialDraftSettings: any;
}

export default function LeagueSettings({ 
  league, 
  isCommissioner, 
  initialScoringSettings, 
  initialDraftSettings 
}: LeagueSettingsProps) {
  const [savingSettings, setSavingSettings] = useState(false);
  const [scoringSettings, setScoringSettings] = useState(initialScoringSettings);
  const [draftSettings, setDraftSettings] = useState(initialDraftSettings);

  const updateScoringSettings = async (key: string, value: number) => {
    if (!isCommissioner || !league) return;

    const newSettings = { ...scoringSettings, [key]: value };
    setScoringSettings(newSettings);
    setSavingSettings(true);

    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        league.$id,
        { scoringRules: JSON.stringify(newSettings) }
      );
    } catch (error) {
      console.error('Error saving scoring settings:', error);
    } finally {
      setSavingSettings(false);
    }
  };

  const updateDraftSettings = async (key: string, value: string | number) => {
    if (!isCommissioner || !league) return;

    const newSettings = { ...draftSettings, [key]: value };
    setDraftSettings(newSettings);
    setSavingSettings(true);

    try {
      const updates: any = {};
      
      if (key === 'type') updates.draftType = value;
      if (key === 'pickTimeSeconds') updates.pickTimeSeconds = value;
      if (key === 'orderMode') updates.orderMode = value;
      if (key === 'date' || key === 'time') {
        const date = key === 'date' ? value : draftSettings.date;
        const time = key === 'time' ? value : draftSettings.time;
        if (date && time) {
          updates.draftDate = new Date(`${date}T${time}`).toISOString();
        }
      }

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        league.$id,
        updates
      );
    } catch (error) {
      console.error('Error saving draft settings:', error);
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold mb-6">League Settings</h3>
      {/* Scoring Settings */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h4 className="text-xl font-bold mb-4">Scoring Settings</h4>
        {savingSettings && (
          <p className="text-sm text-green-400 mb-2">Saving changes...</p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(scoringSettings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-sm capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              {isCommissioner ? (
                <input
                  type="number"
                  step="0.01"
                  value={value as number}
                  onChange={(e) => updateScoringSettings(key, parseFloat(e.target.value))}
                  className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded text-right"
                />
              ) : (
                <span className="font-semibold">{value as number}</span>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Draft Settings */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h4 className="text-xl font-bold mb-4">Draft Settings</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm">Draft Type</label>
            {isCommissioner ? (
              <select
                value={draftSettings.type}
                onChange={(e) => updateDraftSettings('type', e.target.value)}
                className="px-3 py-1 bg-white/10 border border-white/20 rounded"
              >
                <option value="snake">Snake</option>
                <option value="auction">Auction</option>
              </select>
            ) : (
              <span className="font-semibold capitalize">{draftSettings.type}</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm">Pick Time (seconds)</label>
            {isCommissioner ? (
              <input
                type="number"
                value={draftSettings.pickTimeSeconds}
                onChange={(e) => updateDraftSettings('pickTimeSeconds', parseInt(e.target.value))}
                className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded text-right"
              />
            ) : (
              <span className="font-semibold">{draftSettings.pickTimeSeconds}s</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm">Draft Date</label>
            {isCommissioner ? (
              <input
                type="date"
                value={draftSettings.date}
                onChange={(e) => updateDraftSettings('date', e.target.value)}
                className="px-2 py-1 bg-white/10 border border-white/20 rounded"
              />
            ) : (
              <span className="font-semibold">
                {draftSettings.date ? new Date(draftSettings.date).toLocaleDateString() : 'Not set'}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm">Draft Time</label>
            {isCommissioner ? (
              <input
                type="time"
                value={draftSettings.time}
                onChange={(e) => updateDraftSettings('time', e.target.value)}
                className="px-2 py-1 bg-white/10 border border-white/20 rounded"
              />
            ) : (
              <span className="font-semibold">{draftSettings.time || 'Not set'}</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm">Draft Order</label>
            {isCommissioner ? (
              <select
                value={draftSettings.orderMode}
                onChange={(e) => updateDraftSettings('orderMode', e.target.value)}
                className="px-3 py-1 bg-white/10 border border-white/20 rounded"
              >
                <option value="random">Random</option>
                <option value="manual">Manual</option>
                <option value="lastYear">Last Year's Standings</option>
              </select>
            ) : (
              <span className="font-semibold capitalize">{draftSettings.orderMode}</span>
            )}
          </div>
        </div>
      </div>
      {/* Commissioner Tools */}
      {isCommissioner && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h4 className="text-xl font-bold mb-4">Commissioner Tools</h4>
          
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
              Pause/Resume League
            </button>
            <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
              Reset Draft
            </button>
            <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
              Edit Team Rosters
            </button>
            <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
              Process Waivers
            </button>
            <button className="w-full text-left px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors">
              Delete League
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
