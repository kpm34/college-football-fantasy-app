'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateLeaguePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    leagueName: '',
    leagueType: 'snake', // 'snake' or 'auction'
    teamCount: 12,
    draftDate: '',
    draftTime: '',
    scoringType: 'ppr', // 'ppr', 'standard', 'half-ppr'
    entryFee: 0,
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Here you would typically save to your database
      console.log('Creating league with data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to the new league (you'd get the actual league ID from the API)
      router.push('/league/123/draft');
    } catch (error) {
      console.error('Error creating league:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">🏈 College Football Fantasy</h1>
            </div>
            <div className="flex items-center space-x-8">
              <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
              <a href="/league/join" className="text-gray-600 hover:text-gray-900">Join League</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create a New League</h2>
            <p className="text-gray-600">Set up your College Football Fantasy league with Power 4 conferences</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* League Name */}
            <div>
              <label htmlFor="leagueName" className="block text-sm font-medium text-gray-700 mb-2">
                League Name *
              </label>
              <input
                type="text"
                id="leagueName"
                name="leagueName"
                value={formData.leagueName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter league name"
              />
            </div>

            {/* League Type */}
            <div>
              <label htmlFor="leagueType" className="block text-sm font-medium text-gray-700 mb-2">
                Draft Type *
              </label>
              <select
                id="leagueType"
                name="leagueType"
                value={formData.leagueType}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="snake">Snake Draft</option>
                <option value="auction">Auction Draft</option>
              </select>
            </div>

            {/* Number of Teams */}
            <div>
              <label htmlFor="teamCount" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Teams *
              </label>
              <select
                id="teamCount"
                name="teamCount"
                value={formData.teamCount}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={8}>8 Teams</option>
                <option value={10}>10 Teams</option>
                <option value={12}>12 Teams</option>
                <option value={14}>14 Teams</option>
                <option value={16}>16 Teams</option>
              </select>
            </div>

            {/* Draft Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="draftDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Draft Date *
                </label>
                <input
                  type="date"
                  id="draftDate"
                  name="draftDate"
                  value={formData.draftDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="draftTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Draft Time *
                </label>
                <input
                  type="time"
                  id="draftTime"
                  name="draftTime"
                  value={formData.draftTime}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Scoring Type */}
            <div>
              <label htmlFor="scoringType" className="block text-sm font-medium text-gray-700 mb-2">
                Scoring System *
              </label>
              <select
                id="scoringType"
                name="scoringType"
                value={formData.scoringType}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ppr">PPR (Point Per Reception)</option>
                <option value="standard">Standard</option>
                <option value="half-ppr">Half PPR</option>
              </select>
            </div>

            {/* Entry Fee */}
            <div>
              <label htmlFor="entryFee" className="block text-sm font-medium text-gray-700 mb-2">
                Entry Fee ($)
              </label>
              <input
                type="number"
                id="entryFee"
                name="entryFee"
                value={formData.entryFee}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0 (Free league)"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                League Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell potential members about your league..."
              />
            </div>

            {/* League Rules Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">League Rules</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Power 4 conferences only (SEC, ACC, Big 12, Big Ten)</li>
                <li>• Players eligible only vs AP Top-25 teams or in conference games</li>
                <li>• 12-week regular season (no playoffs/bowls)</li>
                <li>• Real-time scoring via ESPN data</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating League...' : 'Create League'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 