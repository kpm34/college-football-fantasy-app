'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full h-full flex items-center justify-center bg-zinc-900/50 rounded-lg">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🏈</div>
            <div className="text-zinc-400 text-sm mb-2">Something went wrong</div>
            <div className="text-zinc-500 text-xs mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </div>
            <button 
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specialized error boundary for Spline scenes
export function SplineErrorBoundary({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <ErrorBoundary
      className={className}
      fallback={
        <div className={`w-full h-full flex items-center justify-center bg-zinc-900/50 rounded-lg ${className || ''}`}>
          <div className="text-center p-6">
            <div className="text-6xl mb-4">🏟️</div>
            <div className="text-zinc-300 text-lg font-semibold mb-2">3D Scene Unavailable</div>
            <div className="text-zinc-500 text-sm">
              The 3D visualization couldn't load. Please try refreshing the page.
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
} 