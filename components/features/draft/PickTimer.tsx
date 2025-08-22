'use client'
export default function PickTimer({ seconds, warningAt=10 }: { seconds: number; warningAt?: number }) {
  const danger = seconds <= warningAt
  return (
    <div className={`px-3 py-1 rounded font-mono text-xs ${danger ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-800'}`}>
      {Math.floor((seconds || 0) / 60)}:{String((seconds || 0) % 60).padStart(2, '0')}
    </div>
  )
}
