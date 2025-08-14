/**
 * Global Error Handler for API Routes
 * Provides consistent error responses and logging
 */

import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { 
  AppError, 
  isAppError, 
  isOperationalError,
  ValidationError 
} from '../errors/app-error';

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    errors?: Record<string, string>;
    timestamp: string;
    requestId?: string;
  };
}

/**
 * Handle errors consistently across all API routes
 */
export function handleError(error: unknown, requestId?: string): NextResponse<ErrorResponse> {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', error);
  }

  // Handle known AppError instances
  if (isAppError(error)) {
    // Log operational errors as warnings, non-operational as errors
    if (error.isOperational) {
      console.warn(`Operational error: ${error.code} - ${error.message}`);
    } else {
      console.error(`Non-operational error: ${error.code} - ${error.message}`);
      Sentry.captureException(error);
    }

    const response: ErrorResponse = {
      error: {
        code: error.code,
        message: error.message,
        timestamp: new Date().toISOString(),
        requestId,
      },
    };

    // Add validation errors if present
    if (error instanceof ValidationError && error.errors) {
      response.error.errors = error.errors;
    }

    return NextResponse.json(response, { status: error.statusCode });
  }

  // Handle Appwrite SDK errors
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    const appwriteError = error as any;
    
    // Map Appwrite error codes to HTTP status codes
    const statusMap: Record<number, number> = {
      401: 401, // Unauthorized
      403: 403, // Forbidden
      404: 404, // Not found
      409: 409, // Conflict
      429: 429, // Rate limit
      500: 500, // Server error
      503: 503, // Service unavailable
    };

    const status = statusMap[appwriteError.code] || 500;
    
    console.error(`Appwrite error ${appwriteError.code}: ${appwriteError.message}`);
    
    // Only capture non-4xx errors to Sentry
    if (status >= 500) {
      Sentry.captureException(error);
    }

    return NextResponse.json<ErrorResponse>(
      {
        error: {
          code: 'APPWRITE_ERROR',
          message: appwriteError.message || 'Database operation failed',
          timestamp: new Date().toISOString(),
          requestId,
        },
      },
      { status }
    );
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    console.error('Unhandled error:', error);
    Sentry.captureException(error);

    return NextResponse.json<ErrorResponse>(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: process.env.NODE_ENV === 'production' 
            ? 'An unexpected error occurred' 
            : error.message,
          timestamp: new Date().toISOString(),
          requestId,
        },
      },
      { status: 500 }
    );
  }

  // Handle unknown errors
  console.error('Unknown error type:', error);
  Sentry.captureException(new Error(`Unknown error: ${String(error)}`));

  return NextResponse.json<ErrorResponse>(
    {
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        requestId,
      },
    },
    { status: 500 }
  );
}

/**
 * Wrapper for API route handlers with automatic error handling
 */
export function withErrorHandler<T extends any[], R extends NextResponse | Promise<NextResponse>>(
  handler: (...args: T) => R
): (...args: T) => Promise<NextResponse> {
  return async (...args: T): Promise<NextResponse> => {
    try {
      const result = await handler(...args);
      return result;
    } catch (error) {
      // Generate request ID for tracking
      const requestId = crypto.randomUUID();
      return handleError(error, requestId);
    }
  };
}

/**
 * Extract error message safely from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'An unexpected error occurred';
}

/**
 * Log error with context
 */
export function logError(
  error: unknown,
  context: Record<string, any> = {}
): void {
  const errorInfo = {
    message: getErrorMessage(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
  };

  if (isOperationalError(error)) {
    console.warn('Operational error:', errorInfo);
  } else {
    console.error('System error:', errorInfo);
    Sentry.captureException(error, { extra: context });
  }
}
