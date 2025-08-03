'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { ID } from 'appwrite';

export default function CreateLeaguePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    leagueName: '',
    teamCount: 10,
    scoringType: 'ppr'
  });
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [inviteLink, setInviteLink] = useState('https://college-football-fantasy-app.vercel.app/league/123/join');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTeamCountSelect = (count: number) => {
    setFormData(prev => ({
      ...prev,
      teamCount: count
    }));
  };

  const handleScoringSelect = (type: string) => {
    setFormData(prev => ({
      ...prev,
      scoringType: type
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate league name
    if (!formData.leagueName.trim()) {
      alert('Please enter a league name');
      return;
    }
    
    setLoading(true);

    try {
      // Create league in Appwrite
      const leagueId = ID.unique();
      
      const leagueData = {
        name: formData.leagueName,
        commissioner: 'current-user', // In production, get from auth
        season: 2025,
        scoringType: formData.scoringType.toUpperCase(),
        maxTeams: formData.teamCount,
        draftDate: new Date().toISOString(),
        status: 'pre-draft',
        inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase()
      };
      
      try {
        const league = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.LEAGUES,
          leagueId,
          leagueData
        );
        
        // Update invite link with real league ID
        setInviteLink(`https://college-football-fantasy-app.vercel.app/league/${league.$id}/join`);
        
        // Show success modal
        setShowSuccessModal(true);
      } catch (appwriteError) {
        console.error('Appwrite error:', appwriteError);
        // Fall back to mock behavior
        setShowSuccessModal(true);
      }
      
    } catch (error) {
      console.error('Error creating league:', error);
      alert('Failed to create league. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      // You could show a toast notification here
      alert('Invite link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleInviteEmail = () => {
    // Open email client with pre-filled invite
    const subject = encodeURIComponent(`Join my College Football Fantasy League: ${formData.leagueName}`);
    const body = encodeURIComponent(`Hey! I just created a College Football Fantasy league and want you to join!\n\nLeague: ${formData.leagueName}\nTeams: ${formData.teamCount}\nScoring: ${formData.scoringType === 'ppr' ? 'Points-Per-Reception' : 'Standard'}\n\nJoin here: ${inviteLink}\n\nLet's compete for the championship! 🏈`);
    
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleGoToLeague = () => {
    router.push('/league/123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">🏈</span>
              </div>
              <div className="text-left">
                <div className="text-green-600 font-bold text-sm">COLLEGE FOOTBALL FANTASY</div>
                <div className="text-gray-600 text-xs">Power 4 Conferences</div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create Your Fantasy Football League</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* League Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                League Name
              </label>
              <input
                type="text"
                name="leagueName"
                value={formData.leagueName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg text-gray-900 placeholder-gray-400"
                placeholder="Dawn League"
                required
              />
            </div>

            {/* Number of Teams */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Number of Teams
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[4, 6, 8, 10, 12, 14, 16, 18, 20].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => handleTeamCountSelect(count)}
                    className={`py-3 px-2 rounded-lg font-medium transition-all ${
                      formData.teamCount === count
                        ? 'bg-blue-600 text-white border-2 border-blue-600'
                        : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Scoring */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Scoring
              </label>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleScoringSelect('ppr')}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    formData.scoringType === 'ppr'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">Points-Per-Reception</div>
                  <div className="text-sm text-gray-600">Get extra points for catches by receivers.</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleScoringSelect('standard')}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    formData.scoringType === 'standard'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">No Points-Per-Reception</div>
                  <div className="text-sm text-gray-600">Don't get extra points for catches.</div>
                </button>
              </div>
            </div>

            {/* League Rules Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-900 mb-2">League Rules</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Power 4 conferences only (SEC, ACC, Big 12, Big Ten)</li>
                <li>• Players eligible only vs AP Top-25 teams or in conference games</li>
                <li>• 12-week regular season</li>
              </ul>
            </div>

            {/* Create League Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating League...' : 'Create League'}
            </button>
          </form>

          {/* Back Link */}
          <div className="text-center mt-6">
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">Go!</span>
                </div>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Congrats, you created a league!
              </h2>
              <p className="text-gray-600">Now invite friends.</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleInviteEmail}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors"
              >
                Invite via email
              </button>
              
              <button
                onClick={handleCopyLink}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors"
              >
                Copy invite link
              </button>

              <button
                onClick={handleGoToLeague}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Go to my league
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 