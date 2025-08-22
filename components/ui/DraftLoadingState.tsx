'use client';

import { LoadingSpinner } from './LoadingSpinner';

interface DraftLoadingStateProps {
  message?: string;
}

export function DraftLoadingState({ message = 'Loading draft...' }: DraftLoadingStateProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center">
        <LoadingSpinner className="w-16 h-16 mx-auto mb-6" />
        <h2 className="text-2xl font-bold chrome-text mb-2">{message}</h2>
        <p className="text-slate-400">Please wait while we prepare your draft experience</p>
        
        {/* Animated dots */}
        <div className="flex justify-center gap-2 mt-8">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

export function DraftErrorState({ 
  error, 
  onRetry 
}: { 
  error: string | Error; 
  onRetry?: () => void;
}) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="glass-card p-8 rounded-xl text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Draft Error</h2>
          <p className="text-slate-400 mb-6">{errorMessage}</p>
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function EmptyDraftState({ 
  title = 'No Players Available',
  message = 'There are no players available to draft at this time.',
  action
}: {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 mb-6 max-w-sm">{message}</p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function DraftConnectionStatus({ isConnected }: { isConnected: boolean }) {
  return (
    <div className={`
      fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full
      ${isConnected 
        ? 'bg-green-500/20 border border-green-500/30' 
        : 'bg-red-500/20 border border-red-500/30'
      }
    `}>
      <div className={`
        w-2 h-2 rounded-full
        ${isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}
      `} />
      <span className={`text-sm font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
        {isConnected ? 'Connected' : 'Reconnecting...'}
      </span>
    </div>
  );
}