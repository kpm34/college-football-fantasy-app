'use client';

import { useEffect, useState, useCallback } from 'react';
import { Transition } from '@headlessui/react';
import { XMarkIcon, ClockIcon, UserIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export interface DraftNotification {
  id: string;
  type: 'pick_made' | 'your_turn' | 'time_warning' | 'draft_paused' | 'draft_resumed';
  title: string;
  message: string;
  timestamp: Date;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface DraftNotificationsProps {
  notifications: DraftNotification[];
  onDismiss: (id: string) => void;
  onDismissAll?: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export default function DraftNotifications({ 
  notifications, 
  onDismiss, 
  onDismissAll,
  position = 'top-right' 
}: DraftNotificationsProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<DraftNotification[]>([]);

  useEffect(() => {
    setVisibleNotifications(notifications);

    // Auto-dismiss non-persistent notifications after 5 seconds
    const timers = notifications
      .filter(n => !n.persistent)
      .map(notification => {
        return setTimeout(() => {
          onDismiss(notification.id);
        }, 5000);
      });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications, onDismiss]);

  const getIcon = (type: DraftNotification['type']) => {
    switch (type) {
      case 'pick_made':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'your_turn':
        return <UserIcon className="w-5 h-5 text-blue-400" />;
      case 'time_warning':
        return <ClockIcon className="w-5 h-5 text-yellow-400" />;
      case 'draft_paused':
      case 'draft_resumed':
        return <ExclamationCircleIcon className="w-5 h-5 text-orange-400" />;
      default:
        return null;
    }
  };

  const getNotificationStyle = (type: DraftNotification['type']) => {
    const baseStyle = "glass-card p-4 rounded-lg border backdrop-blur-sm shadow-xl";
    switch (type) {
      case 'pick_made':
        return `${baseStyle} border-green-500/30 bg-green-500/10`;
      case 'your_turn':
        return `${baseStyle} border-blue-500/30 bg-blue-500/10 animate-pulse`;
      case 'time_warning':
        return `${baseStyle} border-yellow-500/30 bg-yellow-500/10`;
      case 'draft_paused':
      case 'draft_resumed':
        return `${baseStyle} border-orange-500/30 bg-orange-500/10`;
      default:
        return `${baseStyle} border-slate-700`;
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
      default:
        return 'top-4 right-4';
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div 
      className={`fixed ${getPositionClasses()} z-50 space-y-3 pointer-events-none`}
      style={{ maxWidth: '400px' }}
      aria-live="polite"
      aria-label="Draft notifications"
    >
      {visibleNotifications.map((notification) => (
        <Transition
          key={notification.id}
          appear
          show={true}
          enter="transition-all duration-300 ease-out"
          enterFrom="translate-x-full opacity-0"
          enterTo="translate-x-0 opacity-100"
          leave="transition-all duration-200 ease-in"
          leaveFrom="translate-x-0 opacity-100"
          leaveTo="translate-x-full opacity-0"
        >
          <div className={`${getNotificationStyle(notification.type)} pointer-events-auto`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white mb-1">
                  {notification.title}
                </h4>
                <p className="text-sm text-slate-300">
                  {notification.message}
                </p>
                {notification.action && (
                  <button
                    onClick={notification.action.onClick}
                    className="mt-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {notification.action.label}
                  </button>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  {formatTime(notification.timestamp)}
                </p>
              </div>
              <button
                onClick={() => onDismiss(notification.id)}
                className="flex-shrink-0 rounded-lg p-1 hover:bg-slate-700 transition-colors"
                aria-label="Dismiss notification"
              >
                <XMarkIcon className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </Transition>
      ))}

      {/* Dismiss All Button */}
      {visibleNotifications.length > 2 && onDismissAll && (
        <div className="pointer-events-auto pt-2">
          <button
            onClick={onDismissAll}
            className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
          >
            Dismiss all notifications
          </button>
        </div>
      )}
    </div>
  );
}

// Hook for managing draft notifications
export function useDraftNotifications() {
  const [notifications, setNotifications] = useState<DraftNotification[]>([]);

  const addNotification = useCallback((notification: Omit<DraftNotification, 'id' | 'timestamp'>) => {
    const newNotification: DraftNotification = {
      ...notification,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Play sound for certain notification types
    if (notification.type === 'your_turn') {
      playNotificationSound();
    }
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const dismissAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    dismissNotification,
    dismissAllNotifications
  };
}

// Helper function to play notification sound
function playNotificationSound() {
  try {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Handle browsers that block autoplay
      console.log('Audio autoplay blocked');
    });
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
}

// Example usage:
export const exampleNotifications: Omit<DraftNotification, 'id' | 'timestamp'>[] = [
  {
    type: 'your_turn',
    title: "It's Your Turn!",
    message: "You have 60 seconds to make your pick",
    persistent: true,
    action: {
      label: 'View Available Players',
      onClick: () => console.log('Opening player list')
    }
  },
  {
    type: 'pick_made',
    title: 'Pick Made',
    message: 'Team Crimson Tide selected Bryce Young (QB)',
    persistent: false
  },
  {
    type: 'time_warning',
    title: 'Time Warning',
    message: '15 seconds remaining to make your pick',
    persistent: true
  },
  {
    type: 'draft_paused',
    title: 'Draft Paused',
    message: 'The commissioner has paused the draft',
    persistent: true
  }
];