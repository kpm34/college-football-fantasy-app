/**
 * Custom Error Classes for Application
 * Provides structured error handling with proper status codes
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
    
    // Set the prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * 401 Unauthorized - Authentication required
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(401, 'UNAUTHORIZED', message);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * 403 Forbidden - No permission to access resource
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(403, 'FORBIDDEN', message);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * 404 Not Found - Resource doesn't exist
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier 
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(404, 'NOT_FOUND', message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * 400 Bad Request - Validation errors
 */
export class ValidationError extends AppError {
  public readonly errors?: Record<string, string>;

  constructor(message: string, errors?: Record<string, string>) {
    super(400, 'VALIDATION_ERROR', message);
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 409 Conflict - Resource already exists
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, 'CONFLICT', message);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(message = 'Too many requests', retryAfter?: number) {
    super(429, 'RATE_LIMIT_EXCEEDED', message);
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * 500 Internal Server Error - Unexpected errors
 */
export class InternalServerError extends AppError {
  constructor(message = 'An unexpected error occurred') {
    super(500, 'INTERNAL_ERROR', message, false);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

/**
 * 503 Service Unavailable - External service down
 */
export class ServiceUnavailableError extends AppError {
  public readonly service?: string;

  constructor(service?: string) {
    const message = service 
      ? `${service} service is currently unavailable`
      : 'Service temporarily unavailable';
    super(503, 'SERVICE_UNAVAILABLE', message);
    this.service = service;
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
  }
}

/**
 * Database operation error
 */
export class DatabaseError extends AppError {
  constructor(operation: string, details?: string) {
    const message = details 
      ? `Database ${operation} failed: ${details}`
      : `Database ${operation} failed`;
    super(500, 'DATABASE_ERROR', message, false);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * External API error
 */
export class ExternalAPIError extends AppError {
  public readonly api: string;
  public readonly originalError?: any;

  constructor(api: string, message: string, originalError?: any) {
    super(502, 'EXTERNAL_API_ERROR', `${api} API error: ${message}`);
    this.api = api;
    this.originalError = originalError;
    Object.setPrototypeOf(this, ExternalAPIError.prototype);
  }
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if error is operational (expected)
 */
export function isOperationalError(error: unknown): boolean {
  if (isAppError(error)) {
    return error.isOperational;
  }
  return false;
}
