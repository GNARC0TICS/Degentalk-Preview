/**
 * Admin Error Types
 * 
 * @deprecated This file is deprecated. Use server/src/core/errors.ts instead.
 * The centralized error system provides a consistent error handling approach across the application.
 * See the AdminError class in server/src/core/errors.ts for the replacement.
 */

export enum AdminErrorCodes {
  // General errors
  UNAUTHORIZED = 'ADMIN_UNAUTHORIZED',
  FORBIDDEN = 'ADMIN_FORBIDDEN',
  INVALID_REQUEST = 'ADMIN_INVALID_REQUEST',
  NOT_FOUND = 'ADMIN_NOT_FOUND',
  
  // Entity errors
  USER_NOT_FOUND = 'ADMIN_USER_NOT_FOUND',
  THREAD_NOT_FOUND = 'ADMIN_THREAD_NOT_FOUND',
  CATEGORY_NOT_FOUND = 'ADMIN_CATEGORY_NOT_FOUND',
  
  // Operation errors
  OPERATION_FAILED = 'ADMIN_OPERATION_FAILED',
  VALIDATION_ERROR = 'ADMIN_VALIDATION_ERROR',
  DUPLICATE_ENTRY = 'ADMIN_DUPLICATE_ENTRY',
  
  // Database errors
  DB_ERROR = 'ADMIN_DB_ERROR',
  
  // Unknown
  UNKNOWN_ERROR = 'ADMIN_UNKNOWN_ERROR'
}

/**
 * AdminError class for standardized error handling
 * 
 * @deprecated This class is deprecated. Use the AdminError class from server/src/core/errors.ts instead.
 */
export class AdminError extends Error {
  constructor(
    public message: string,
    public httpStatus: number = 500,
    public code: AdminErrorCodes = AdminErrorCodes.UNKNOWN_ERROR,
    public details?: any
  ) {
    super(message);
    this.name = 'AdminError';
    console.warn('⚠️ WARNING: server/src/domains/admin/admin.errors.ts is deprecated. Use server/src/core/errors.ts instead.');
  }
  
  /**
   * Create an unauthorized error
   * @deprecated Use AdminError.unauthorized from server/src/core/errors.ts instead
   */
  static unauthorized(message: string = 'Unauthorized access'): AdminError {
    console.warn('⚠️ WARNING: AdminError.unauthorized from admin.errors.ts is deprecated. Use AdminError from core/errors.ts instead.');
    return new AdminError(message, 401, AdminErrorCodes.UNAUTHORIZED);
  }
  
  /**
   * Create a forbidden error
   * @deprecated Use AdminError.forbidden from server/src/core/errors.ts instead
   */
  static forbidden(message: string = 'Access forbidden'): AdminError {
    console.warn('⚠️ WARNING: AdminError.forbidden from admin.errors.ts is deprecated. Use AdminError from core/errors.ts instead.');
    return new AdminError(message, 403, AdminErrorCodes.FORBIDDEN);
  }
  
  /**
   * Create a not found error
   * @deprecated Use AdminError.notFound from server/src/core/errors.ts instead
   */
  static notFound(entity: string, id?: number | string): AdminError {
    console.warn('⚠️ WARNING: AdminError.notFound from admin.errors.ts is deprecated. Use AdminError from core/errors.ts instead.');
    const message = id 
      ? `${entity} with ID ${id} not found` 
      : `${entity} not found`;
    return new AdminError(message, 404, AdminErrorCodes.NOT_FOUND);
  }
  
  /**
   * Create a validation error
   * @deprecated Use AdminError.validation from server/src/core/errors.ts instead
   */
  static validation(message: string = 'Validation error', details?: any): AdminError {
    console.warn('⚠️ WARNING: AdminError.validation from admin.errors.ts is deprecated. Use AdminError from core/errors.ts instead.');
    return new AdminError(message, 400, AdminErrorCodes.VALIDATION_ERROR, details);
  }
  
  /**
   * Create a duplicate entry error
   * @deprecated Use AdminError.duplicate from server/src/core/errors.ts instead
   */
  static duplicate(entity: string, field: string, value: string): AdminError {
    console.warn('⚠️ WARNING: AdminError.duplicate from admin.errors.ts is deprecated. Use AdminError from core/errors.ts instead.');
    return new AdminError(
      `${entity} with ${field} '${value}' already exists`,
      409,
      AdminErrorCodes.DUPLICATE_ENTRY
    );
  }
}
