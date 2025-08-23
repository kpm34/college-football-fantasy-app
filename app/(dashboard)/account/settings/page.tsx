'use client';

import { databases, DATABASE_ID } from '@lib/appwrite';
import { getTeamColors } from '@lib/team-colors';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@lib/hooks/useAuth';
import { ID } from 'appwrite';

const POWER_4_TEAMS = [
  // Big Ten
  'Michigan Wolverines', 'Ohio State Buckeyes', 'Penn State Nittany Lions', 'Michigan State Spartans',
  'Indiana Hoosiers', 'Maryland Terrapins', 'Rutgers Scarlet Knights', 'UCLA Bruins',
  'Washington Huskies', 'Oregon Ducks', 'USC Trojans', 'Wisconsin Badgers',
  'Iowa Hawkeyes', 'Minnesota Golden Gophers', 'Nebraska Cornhuskers', 'Northwestern Wildcats',
  'Purdue Boilermakers', 'Illinois Fighting Illini',
  // SEC
  'Georgia Bulldogs', 'Alabama Crimson Tide', 'LSU Tigers', 'Texas Longhorns',
  'Oklahoma Sooners', 'Florida Gators', 'Tennessee Volunteers', 'Kentucky Wildcats',
  'South Carolina Gamecocks', 'Missouri Tigers', 'Auburn Tigers', 'Ole Miss Rebels',
  'Mississippi State Bulldogs', 'Arkansas Razorbacks', 'Vanderbilt Commodores', 'Texas A&M Aggies',
  // Big 12
  'Oklahoma State Cowboys', 'Baylor Bears', 'Iowa State Cyclones', 'Kansas State Wildcats',
  'TCU Horned Frogs', 'Texas Tech Red Raiders', 'West Virginia Mountaineers', 'Kansas Jayhawks',
  'Cincinnati Bearcats', 'Houston Cougars', 'UCF Knights', 'BYU Cougars',
  'Colorado Buffaloes', 'Utah Utes', 'Arizona Wildcats', 'Arizona State Sun Devils',
  // ACC
  'Clemson Tigers', 'Florida State Seminoles', 'Miami Hurricanes', 'North Carolina Tar Heels',
  'NC State Wolfpack', 'Virginia Tech Hokies', 'Virginia Cavaliers', 'Duke Blue Devils',
  'Georgia Tech Yellow Jackets', 'Wake Forest Demon Deacons', 'Boston College Eagles', 'Syracuse Orange',
  'Pittsburgh Panthers', 'Louisville Cardinals', 'California Golden Bears', 'Stanford Cardinal', 'SMU Mustangs'
].sort();

const USER_PREFS_COLLECTION = 'user_preferences';

export default function AccountSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [favoriteTeam, setFavoriteTeam] = useState('');
  const [fantasyExperience, setFantasyExperience] = useState('intermediate');
  const [notificationPrefs, setNotificationPrefs] = useState({
    leagueUpdates: true,
    tradeOffers: true,
    waiverResults: true,
    gameReminders: true,
    weeklyRecap: false
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      // Parse the full name into first and last name
      const nameParts = (user.name || '').split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      loadPreferences(user.$id);
      setLoading(false);
    }
  }, [user, authLoading, router]);

  async function loadPreferences(userId: string) {
    try {
      const docs = await databases.listDocuments(
        DATABASE_ID,
        USER_PREFS_COLLECTION,
        [`equal("userId", "${userId}")`]
      );
      
      if (docs.documents.length > 0) {
        const prefs = docs.documents[0];
        setFavoriteTeam(prefs.favoriteTeam || '');
        setFantasyExperience(prefs.fantasyExperience || 'intermediate');
        setNotificationPrefs(prefs.notificationPrefs || notificationPrefs);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }

  async function handleSave() {
    if (!user) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Combine first and last name
      const fullName = `${firstName} ${lastName}`.trim();
      
      // Update name and email via API
      const updates: any = {};
      if (fullName !== user.name) {
        updates.name = fullName;
      }
      if (email !== user.email) {
        updates.email = email;
      }
      
      if (Object.keys(updates).length > 0) {
        const response = await fetch('/api/auth/update-profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error('Failed to update profile');
        }
      }

      // Save other preferences to database
      const prefsData = {
        userId: user.$id,
        favoriteTeam,
        fantasyExperience,
        notificationPrefs,
        updatedAt: new Date().toISOString()
      };

      try {
        // Try to update existing document
        const docs = await databases.listDocuments(
          DATABASE_ID,
          USER_PREFS_COLLECTION,
          [`equal("userId", "${user.$id}")`]
        );
        
        if (docs.documents.length > 0) {
          await databases.updateDocument(
            DATABASE_ID,
            USER_PREFS_COLLECTION,
            docs.documents[0].$id,
            prefsData
          );
        } else {
          // Create new document
          await databases.createDocument(
            DATABASE_ID,
            USER_PREFS_COLLECTION,
            ID.unique(),
            prefsData
          );
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue even if preferences fail to save
      }

      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  const selectedTeamColors = favoriteTeam ? getTeamColors(favoriteTeam) : null;

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#0B0E13] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0E13] via-[#1A1F2E] to-[#0B0E13]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Account Settings</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400">
            {success}
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Information */}
          <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-white/40 focus:outline-none"
                    placeholder="First name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-white/40 focus:outline-none"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-white/40 focus:outline-none"
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </div>

          {/* Fantasy Preferences */}
          <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">Fantasy Preferences</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Favorite Team
                </label>
                <select
                  value={favoriteTeam}
                  onChange={(e) => setFavoriteTeam(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-white/40 focus:outline-none"
                  style={{
                    backgroundColor: selectedTeamColors ? selectedTeamColors.primary + '20' : undefined,
                    borderColor: selectedTeamColors ? selectedTeamColors.primary + '60' : undefined
                  }}
                >
                  <option value="">Select a team...</option>
                  {POWER_4_TEAMS.map(team => (
                    <option key={team} value={team} className="bg-gray-900">
                      {team}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Fantasy Experience Level
                </label>
                <select
                  value={fantasyExperience}
                  onChange={(e) => setFantasyExperience(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-white/40 focus:outline-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                  <option value="dynasty">Dynasty Veteran</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">Notification Preferences</h2>
            
            <div className="space-y-3">
              {Object.entries({
                leagueUpdates: 'League Updates',
                tradeOffers: 'Trade Offers',
                waiverResults: 'Waiver Results',
                gameReminders: 'Game Reminders',
                weeklyRecap: 'Weekly Recap'
              }).map(([key, label]) => (
                <label key={key} className="flex items-center justify-between py-2">
                  <span className="text-white/80">{label}</span>
                  <input
                    type="checkbox"
                    checked={notificationPrefs[key as keyof typeof notificationPrefs]}
                    onChange={(e) => setNotificationPrefs({
                      ...notificationPrefs,
                      [key]: e.target.checked
                    })}
                    className="w-5 h-5 rounded bg-white/10 border-white/20 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 rounded-lg text-white transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}