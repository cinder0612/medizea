interface ErrorWithCode extends Error {
  code?: string;
  statusCode?: number;
  digest?: string;
}

export type ErrorCode = 
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'DYNAMIC_ROUTE_ERROR'
  | 'DATABASE_ERROR'
  | 'API_ERROR';

export type ErrorType = {
  message: string;
  code: ErrorCode;
  status: number;
  isOperational: boolean;
  digest?: string;
};

export class AppError extends Error {
  code: ErrorCode;
  status: number;
  isOperational: boolean;
  digest?: string;

  constructor(
    message: string,
    code: ErrorCode = 'SERVER_ERROR',
    status = 500,
    isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  static fromError(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }

    // Handle Next.js server errors
    if (error instanceof Error && error.message.includes('Server Components render')) {
      return new AppError(
        'A server error occurred. Please try again.',
        'SERVER_ERROR',
        500,
        true
      );
    }

    // Handle dynamic route errors
    if (error instanceof Error && error.message.includes('Dynamic Server Usage')) {
      return new AppError(
        'This page requires dynamic data. Please try refreshing.',
        'DYNAMIC_ROUTE_ERROR',
        409,
        true
      );
    }

    // Handle authentication errors
    if (error instanceof Error && error.message.toLowerCase().includes('unauthorized')) {
      return new AppError(
        'Please sign in to continue.',
        'AUTHENTICATION_ERROR',
        401,
        true
      );
    }

    // Handle unknown errors
    return new AppError(
      process.env.NODE_ENV === 'development'
        ? `${error instanceof Error ? error.message : String(error)}`
        : 'An unexpected error occurred.',
      'SERVER_ERROR',
      500,
      false
    );
  }
}

export const handleServerError = (error: unknown): ErrorType => {
  const appError = AppError.fromError(error);
  
  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Server Error:', {
      message: appError.message,
      code: appError.code,
      status: appError.status,
      stack: appError.stack
    });
  }

  return {
    message: appError.message,
    code: appError.code,
    status: appError.status,
    isOperational: appError.isOperational,
    digest: appError.digest
  };
};

export const isOperationalError = (error: unknown): boolean => {
  const appError = AppError.fromError(error);
  return appError.isOperational;
};

export const formatErrorMessage = (error: unknown): string => {
  const appError = AppError.fromError(error);
  
  if (process.env.NODE_ENV === 'development') {
    return `${appError.message}\n${appError.stack || ''}`;
  }
  
  return appError.message;
};

