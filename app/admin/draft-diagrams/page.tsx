'use client'

import { useState } from 'react'
import Link from 'next/link'

const diagrams = [
  {
    name: 'Create Account Flow',
    file: 'create-account-flow.html',
    description: 'Client account creation using Appwrite Auth',
    icon: '🚀'
  },
  {
    name: 'Create League & Draft Flow',
    file: 'create-league-draft-flow.html',
    description: 'Complete flow for creating a league with draft scheduling',
    icon: '🏈'
  },
  {
    name: 'Join League (Invite)',
    file: 'join-league-invite-flow.html',
    description: 'Flow for joining a league via invite link',
    icon: '🎟️'
  },
  {
    name: 'Draft API Endpoints',
    file: 'draft-api-endpoints.html',
    description: 'Complete API reference and WebSocket implementation',
    icon: '🌐'
  },
  {
    name: 'Draft Database Schema',
    file: 'draft-database-board.html',
    description: 'Database architecture and draft board export system',
    icon: '🗄️'
  },
  {
    name: 'Draft Comparison & Timing',
    file: 'draft-comparison-timing.html',
    description: 'Mock vs Real drafts comparison with timing control',
    icon: '⚖️'
  },
  {
    name: 'Draft Autopick System',
    file: 'draft-autopick-system.html',
    description: 'Intelligent autopick orchestration with failsafe',
    icon: '🤖'
  },
  {
    name: 'Mock Draft Flow',
    file: 'mock-draft-flow-standalone.html',
    description: 'Practice mode for draft preparation',
    icon: '🎮'
  },
  {
    name: 'Real Draft Flow',
    file: 'real-draft-flow-standalone.html',
    description: 'Official league draft process',
    icon: '🏆'
  },
  {
    name: 'Mock vs Real Drafts',
    file: 'mock-real-draft-flows.html',
    description: 'Comparison of mock and real draft flows',
    icon: '📊'
  }
]

export default function DraftDiagramsPage() {
  const [selectedDiagram, setSelectedDiagram] = useState<string | null>(null)

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/admin" className="text-amber-600 hover:text-amber-700">
          ← Back to Admin
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-8">Draft System Diagrams</h1>
      
      {!selectedDiagram ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {diagrams.map((diagram) => (
            <div
              key={diagram.file}
              onClick={() => setSelectedDiagram(diagram.file)}
              className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow duration-200 border border-gray-200"
            >
              <div className="text-4xl mb-3">{diagram.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                {diagram.name}
              </h3>
              <p className="text-gray-600 text-sm">
                {diagram.description}
              </p>
              <div className="mt-4 text-amber-600 font-medium">
                View Diagram →
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">
              {diagrams.find(d => d.file === selectedDiagram)?.name}
            </h2>
            <button
              onClick={() => setSelectedDiagram(null)}
              className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
            >
              ← Back to List
            </button>
          </div>
          
          <div className="border border-gray-200 rounded">
            <iframe
              src={`/api/docs/diagrams/${selectedDiagram}`}
              className="w-full h-[80vh]"
              title={selectedDiagram}
            />
          </div>
        </div>
      )}
    </div>
  )
}