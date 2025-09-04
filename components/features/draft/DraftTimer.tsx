'use client'

import { useCallback, useEffect, useState } from 'react'
import { FiClock } from 'react-icons/fi'

interface DraftTimerProps {
  timeLimit: number // in seconds
  isMyTurn: boolean
  onTimeExpired: () => void
  currentPick: number
}

export function DraftTimer({ timeLimit, isMyTurn, onTimeExpired, currentPick }: DraftTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [isWarning, setIsWarning] = useState(false)
  const [isCritical, setIsCritical] = useState(false)

  // Reset timer when pick changes
  useEffect(() => {
    setTimeRemaining(timeLimit)
    setIsWarning(false)
    setIsCritical(false)
  }, [currentPick, timeLimit])

  // Timer countdown
  useEffect(() => {
    if (!isMyTurn || timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = Math.max(0, prev - 1)

        // Update warning states
        if (newTime <= 10) {
          setIsCritical(true)
          setIsWarning(false)
        } else if (newTime <= 30) {
          setIsWarning(true)
          setIsCritical(false)
        }

        // Time expired
        if (newTime === 0) {
          onTimeExpired()
        }

        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isMyTurn, timeRemaining, onTimeExpired])

  // Format time display
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Get timer color based on state
  const getTimerColor = () => {
    if (isCritical) return 'text-red-600 bg-red-50 border-red-200'
    if (isWarning) return 'text-orange-600 bg-orange-50 border-orange-200'
    if (isMyTurn) return 'text-green-600 bg-green-50 border-green-200'
    return 'text-gray-600 bg-gray-50 border-gray-200'
  }

  // Get timer size based on state
  const getTimerSize = () => {
    if (!isMyTurn) return 'text-lg'
    if (isCritical) return 'text-3xl animate-pulse'
    if (isWarning) return 'text-2xl'
    return 'text-xl'
  }

  return (
    <div
      className={`rounded-lg border-2 px-4 py-3 transition-all duration-300 ${getTimerColor()} ${isMyTurn && isCritical ? 'timer-critical' : ''}`}
    >
      <div className="flex items-center gap-3">
        <FiClock className={`${getTimerSize()} transition-all`} />
        <div>
          <div className={`font-mono font-bold ${getTimerSize()} transition-all`}>
            {formatTime(timeRemaining)}
          </div>
          <div className="text-xs opacity-75">
            {isMyTurn ? (
              <>
                {isCritical && 'Make your pick NOW!'}
                {isWarning && !isCritical && 'Time running out...'}
                {!isWarning && !isCritical && 'Your turn to pick'}
              </>
            ) : (
              'Waiting for pick...'
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {isMyTurn && (
        <div className="mt-2 h-2 bg-white/50 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              isCritical ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-green-500'
            }`}
            style={{ width: `${(timeRemaining / timeLimit) * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}
