export const ErrorCode = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  FORBIDDEN: 'FORBIDDEN',
  TENANT_NOT_FOUND: 'TENANT_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_INACTIVE: 'USER_INACTIVE',
  SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
