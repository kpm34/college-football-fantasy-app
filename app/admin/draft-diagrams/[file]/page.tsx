'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// This page now redirects to the main diagrams page
// The main page handles all diagram viewing in a simpler way
export default function DiagramViewerPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/admin/draft-diagrams')
  }, [router])
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to diagrams...</p>
      </div>
    </div>
  )
}