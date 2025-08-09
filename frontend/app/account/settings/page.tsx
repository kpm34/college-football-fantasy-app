'use client';

import { account, databases, DATABASE_ID } from '@/lib/appwrite';
import { getTeamColors } from '@/lib/team-colors';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function AccountSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Account fields
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  
  // Profile fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [favoriteTeam, setFavoriteTeam] = useState('');
  const [userDocId, setUserDocId] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    try {
      // Get account info
      const me = await account.get();
      setUserId(me.$id);
      setEmail(me.email);
      setName(me.name || '');
      
      // Parse name into first/last if possible
      if (me.name) {
        const parts = me.name.split(' ');
        if (parts.length >= 2) {
          setFirstName(parts[0]);
          setLastName(parts.slice(1).join(' '));
        } else {
          setFirstName(me.name);
        }
      }
      
      // Try to get extended profile from users collection
      try {
        // In our setup, the user document ID is the same as the account ID
        const userDoc = await databases.getDocument(
          DATABASE_ID,
          'users',
          me.$id
        );
        setUserDocId(userDoc.$id);
        setFirstName(userDoc.firstName || firstName);
        setLastName(userDoc.lastName || lastName);
        setPhone(userDoc.phoneNumber || '');
        setFavoriteTeam(userDoc.favoriteTeam || '');
      } catch (e) {
        console.log('No user document found, will create one on save');
        // Set the userDocId to the account ID for consistency
        setUserDocId(me.$id);
      }
    } catch (e: any) {
      setError('Please login first.');
      setTimeout(() => router.push('/login'), 2000);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    
    try {
      // Update account name
      const fullName = `${firstName} ${lastName}`.trim() || name;
      if (fullName) {
        await account.updateName(fullName);
      }
      
      // Save extended profile to users collection
      const profileData = {
        name: fullName,
        email,
        firstName,
        lastName,
        phoneNumber: phone,
        favoriteTeam,
        authMethod: 'email'
      };
      
      if (userDocId === userId) {
        // The document should exist in Appwrite (was created during user creation)
        // Update it with new profile data
        try {
          await databases.updateDocument(
            DATABASE_ID,
            'users',
            userDocId,
            profileData
          );
        } catch (updateError) {
          // If update fails, the document might not exist, so create it
          console.log('Update failed, creating new document');
          await databases.createDocument(
            DATABASE_ID,
            'users',
            userId, // Use the account ID as document ID
            {
              ...profileData,
              name: fullName,
              authMethod: 'email',
              isVerified: true,
              createdAt: new Date().toISOString()
            },
            [
              `read("user:${userId}")`,
              `update("user:${userId}")`,
              `delete("user:${userId}")`
            ]
          );
        }
      }
      
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (e: any) {
      console.error('Error saving profile:', e);
      setError(e?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-locker-primary via-locker-primaryDark to-locker-accent flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </main>
    );
  }

  const selectedTeamColors = favoriteTeam ? getTeamColors(favoriteTeam) : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-locker-primary via-locker-primaryDark to-locker-accent">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-black/30 backdrop-blur-lg rounded-xl p-6 md:p-8 border border-white/10">
          <h1 className="text-3xl font-bold text-white mb-6">Account Settings</h1>
          
          {message && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">
              {message}
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
              {error}
            </div>
          )}
          
          <form onSubmit={saveProfile} className="space-y-6">
            {/* Login Info Section */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Login Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm mb-1">Email</label>
                  <input 
                    type="email"
                    className="w-full px-4 py-2 rounded-lg bg-white/10 text-white/70 border border-white/20 cursor-not-allowed"
                    value={email}
                    disabled
                  />
                </div>
              </div>
            </div>
            
            {/* Personal Info Section */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Personal Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm mb-1">First Name</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:border-locker-ice focus:outline-none"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm mb-1">Last Name</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:border-locker-ice focus:outline-none"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-white/80 text-sm mb-1">Phone Number</label>
                  <input 
                    type="tel"
                    className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:border-locker-ice focus:outline-none"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>
            
            {/* Fantasy Preferences Section */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Fantasy Preferences</h2>
              <div>
                <label className="block text-white/80 text-sm mb-1">Favorite Team</label>
                <select
                  className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:border-locker-ice focus:outline-none"
                  value={favoriteTeam}
                  onChange={(e) => setFavoriteTeam(e.target.value)}
                >
                  <option value="">Select your favorite team</option>
                  {POWER_4_TEAMS.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
                {selectedTeamColors && (
                  <div className="mt-2 flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full border border-white/20"
                      style={{ backgroundColor: selectedTeamColors.primary }}
                    />
                    <div 
                      className="w-6 h-6 rounded-full border border-white/20"
                      style={{ backgroundColor: selectedTeamColors.secondary }}
                    />
                    <span className="text-white/60 text-sm">Team colors</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 px-6 rounded-lg bg-locker-ice hover:bg-locker-ice/80 text-black font-semibold transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="py-3 px-6 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

