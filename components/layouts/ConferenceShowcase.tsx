'use client';

import { useState } from 'react';
import { ConferenceCard } from '@/components/features/conferences/ConferenceCard';

const conferences = [
  { name: 'SEC', color: 'from-red-600/20 to-red-800/20' },
  { name: 'Big Ten', color: 'from-blue-600/20 to-blue-800/20' },
  { name: 'ACC', color: 'from-orange-600/20 to-orange-800/20' },
  { name: 'Big 12', color: 'from-purple-600/20 to-purple-800/20' },
];

export function ConferenceShowcase() {
  const [selectedConference, setSelectedConference] = useState<string | null>(null);

  return (
    <section className="py-20 px-4 relative bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-bold text-center mb-16 chrome-text">
          Featured Conferences
        </h2>
        
        <div className="grid md:grid-cols-4 gap-8">
          {conferences.map((conf) => (
            <ConferenceCard
              key={conf.name}
              name={conf.name}
              color={conf.color}
              isSelected={selectedConference === conf.name}
              onClick={() => setSelectedConference(conf.name)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}