'use client';

import * as Sentry from '@sentry/nextjs';
import NextError from 'next/error';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong!
            </h2>
            <p className="text-gray-700 mb-4">
              We apologize for the inconvenience. An error has occurred and our team has been notified.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm text-gray-500">
                  Error details (development only)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {error.message}
                  {error.stack}
                </pre>
              </details>
            )}
            <div className="flex gap-4">
              <button
                onClick={reset}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Try again
              </button>
              <a
                href="/"
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition text-center"
              >
                Go home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

