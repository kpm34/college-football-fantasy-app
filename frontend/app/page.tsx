'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  return (
    <main className="bg-gradient-to-br from-[#4A1626] via-[#5C1F30] to-[#3A1220] text-white min-h-screen">
      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="hero-title mb-4 bg-gradient-to-r from-[#D9BBA4] to-[#E89A5C] bg-clip-text text-transparent drop-shadow-lg">
            College Football Fantasy
          </h1>
          <p className="hero-subtitle text-[#D9BBA4]/90 mb-8 drop-shadow-lg">Power 4 Conferences Only</p>
          <div className="space-y-4">
            <button
              onClick={() => router.push('/league/create')}
              className="cta-button bg-[#E89A5C] px-8 py-4 rounded-xl hover:bg-[#D4834A] transition-colors shadow-lg backdrop-blur-sm text-white"
            >
              Start a League
            </button>
            <br />
            <button
              onClick={() => router.push('/league/join')}
              className="cta-button bg-[#8091BB] px-8 py-4 rounded-xl hover:bg-[#6B7CA6] transition-colors shadow-lg text-white"
            >
              Find Leagues
            </button>
            <br />
            <Link
              href="/conference-showcase"
              className="cta-button inline-block bg-[#D9BBA4] px-8 py-4 rounded-xl hover:bg-[#C4A58F] transition-colors shadow-lg backdrop-blur-sm text-[#3A1220]"
            >
              View Power 4 Conferences
            </Link>
          </div>
        </div>
      </div>
      
      {/* Quick Conference Preview */}
      <div className="py-16 bg-gradient-to-br from-[#4A1626] via-[#5C1F30] to-[#3A1220]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title text-white mb-4 flex items-center justify-center gap-3">
              <svg className="w-10 h-10 text-[#E89A5C]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 7h14l-.89 8.11c-.28 2.53-2.44 4.39-4.98 4.39H10.87c-2.54 0-4.7-1.86-4.98-4.39L5 7zm2.13 1L8 15.11c.19 1.69 1.63 2.89 3.32 2.89h2.36c1.69 0 3.13-1.2 3.32-2.89L17.87 8H7.13zM12 2c.55 0 1 .45 1 1v3H11V3c0-.55.45-1 1-1zm-3 1c0-.55.45-1 1-1s1 .45 1 1v3H9V3zm6 0c0-.55.45-1 1-1s1 .45 1 1v3h-2V3z"/>
              </svg>
              <span>Power 4 Conferences</span>
            </h2>
            <p className="section-subtitle text-gray-400">Exclusive to Power 4 conferences with unique eligibility rules</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Big Ten */}
            <Link href="/conference-showcase" className="group">
              <div className="bg-[#8091BB]/20 backdrop-blur-sm rounded-xl p-6 border border-[#8091BB]/30 hover:border-[#8091BB]/50 transition-all duration-300 group-hover:scale-105">
                <h3 className="team-name text-2xl text-[#8091BB] mb-2">Big Ten</h3>
                <p className="stat-number text-[#D9BBA4] text-sm">18 Teams</p>
                <p className="text-[#D9BBA4]/80 text-xs mt-2">Michigan, Ohio State, Penn State...</p>
              </div>
            </Link>

            {/* SEC */}
            <Link href="/conference-showcase" className="group">
              <div className="bg-[#E89A5C]/20 backdrop-blur-sm rounded-xl p-6 border border-[#E89A5C]/30 hover:border-[#E89A5C]/50 transition-all duration-300 group-hover:scale-105">
                <h3 className="team-name text-2xl text-[#E89A5C] mb-2">SEC</h3>
                <p className="stat-number text-[#D9BBA4] text-sm">16 Teams</p>
                <p className="text-[#D9BBA4]/80 text-xs mt-2">Georgia, Alabama, LSU...</p>
              </div>
            </Link>

            {/* Big 12 */}
            <Link href="/conference-showcase-2" className="group">
              <div className="bg-[#D9BBA4]/20 backdrop-blur-sm rounded-xl p-6 border border-[#D9BBA4]/30 hover:border-[#D9BBA4]/50 transition-all duration-300 group-hover:scale-105">
                <h3 className="team-name text-2xl text-[#D9BBA4] mb-2">Big 12</h3>
                <p className="stat-number text-[#E89A5C] text-sm">16 Teams</p>
                <p className="text-[#D9BBA4]/80 text-xs mt-2">Texas, Oklahoma State, Kansas State...</p>
              </div>
            </Link>

            {/* ACC */}
            <Link href="/conference-showcase-2" className="group">
              <div className="bg-[#8091BB]/20 backdrop-blur-sm rounded-xl p-6 border border-[#8091BB]/30 hover:border-[#8091BB]/50 transition-all duration-300 group-hover:scale-105">
                <h3 className="team-name text-2xl text-[#8091BB] mb-2">ACC</h3>
                <p className="stat-number text-[#D9BBA4] text-sm">17 Teams</p>
                <p className="text-[#D9BBA4]/80 text-xs mt-2">Florida State, Clemson, Miami...</p>
              </div>
            </Link>
          </div>

          {/* Eligibility Rules */}
          <div className="mt-12 bg-[#5C1F30]/40 backdrop-blur-sm rounded-xl p-8 border border-[#D9BBA4]/20">
            <h3 className="section-subtitle text-[#D9BBA4] mb-6 text-center font-montserrat">Unique Eligibility Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="mb-3 flex justify-center">
                  <svg className="w-12 h-12 text-[#8091BB]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="card-title text-white mb-2">Power 4 Only</h4>
                <p className="body-text text-sm text-[#D9BBA4]/70">Exclusive to SEC, ACC, Big 12, and Big Ten conferences</p>
              </div>
              <div className="text-center">
                <div className="mb-3 flex justify-center">
                  <svg className="w-12 h-12 text-[#8091BB]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h4 className="card-title text-white mb-2">AP Top-25 Rule</h4>
                <p className="body-text text-sm text-[#D9BBA4]/70">Players eligible only vs AP Top-25 teams or in conference games</p>
              </div>
              <div className="text-center">
                <div className="mb-3 flex justify-center">
                  <svg className="w-12 h-12 text-[#8091BB]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="card-title text-white mb-2">12-Week Season</h4>
                <p className="body-text text-sm text-[#D9BBA4]/70">No playoffs or bowls - just pure conference competition</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}