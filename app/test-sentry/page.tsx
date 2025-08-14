'use client';

import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function TestSentryPage() {
  const [errorType, setErrorType] = useState('');

  const triggerError = (type: string) => {
    setErrorType(type);
    
    switch (type) {
      case 'client':
        throw new Error('Test client-side error from College Football Fantasy!');
        
      case 'async':
        setTimeout(() => {
          throw new Error('Test async error from College Football Fantasy!');
        }, 100);
        break;
        
      case 'handled':
        try {
          // @ts-ignore - Intentional error
          const result = someUndefinedFunction();
        } catch (error) {
          Sentry.captureException(error, {
            tags: {
              section: 'test-sentry',
              errorType: 'handled'
            },
            level: 'warning'
          });
          alert('Handled error sent to Sentry!');
        }
        break;
        
      case 'api':
        fetch('/api/test-sentry-error')
          .then(res => res.json())
          .catch(err => console.error('API error test:', err));
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Sentry Error Testing</h1>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
          <p className="mb-4">⚠️ This page is for testing Sentry error tracking integration.</p>
          <p className="text-sm text-gray-300">Click a button below to trigger different types of errors.</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => triggerError('client')}
            className="w-full p-4 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Trigger Client-Side Error
          </button>
          
          <button
            onClick={() => triggerError('async')}
            className="w-full p-4 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
          >
            Trigger Async Error
          </button>
          
          <button
            onClick={() => triggerError('handled')}
            className="w-full p-4 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
          >
            Trigger Handled Error
          </button>
          
          <button
            onClick={() => triggerError('api')}
            className="w-full p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Trigger API Error
          </button>
        </div>

        {errorType && (
          <div className="mt-8 p-4 bg-white/10 rounded-lg">
            <p className="text-sm">Last triggered: {errorType} error</p>
          </div>
        )}
      </div>
    </div>
  );
}
