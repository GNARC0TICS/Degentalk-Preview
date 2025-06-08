/**
 * Core Error Types
 * 
 * Centralized error handling system for the application.
 * This file provides standardized error classes and helpers
 * for creating consistent error responses across the application.
 */

import { Request, Response, NextFunction } from 'express';

export enum ErrorCodes {
  // General errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_REQUEST = 'INVALID_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  
  // Entity errors
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  THREAD_NOT_FOUND = 'THREAD_NOT_FOUND',
  CATEGORY_NOT_FOUND = 'CATEGORY_NOT_FOUND',
  
  // Operation errors
  OPERATION_FAILED = 'OPERATION_FAILED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  
  // Database errors
  DB_ERROR = 'DB_ERROR',
  
  // Admin specific errors
  ADMIN_UNAUTHORIZED = 'ADMIN_UNAUTHORIZED',
  ADMIN_FORBIDDEN = 'ADMIN_FORBIDDEN',
  ADMIN_INVALID_REQUEST = 'ADMIN_INVALID_REQUEST',
  ADMIN_NOT_FOUND = 'ADMIN_NOT_FOUND',
  ADMIN_OPERATION_FAILED = 'ADMIN_OPERATION_FAILED',
  
  // Wallet specific errors
  WALLET_INVALID_OPERATION = 'WALLET_INVALID_OPERATION',
  WALLET_INSUFFICIENT_FUNDS = 'WALLET_INSUFFICIENT_FUNDS',
  WALLET_NOT_FOUND = 'WALLET_NOT_FOUND',
  WALLET_TRANSACTION_FAILED = 'WALLET_TRANSACTION_FAILED',
  
  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Base error class for the application
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public httpStatus: number = 500,
    public code: ErrorCodes = ErrorCodes.UNKNOWN_ERROR,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * AdminError class for admin-specific error handling
 */
export class AdminError extends AppError {
  constructor(
    message: string,
    httpStatus: number = 500,
    code: ErrorCodes = ErrorCodes.ADMIN_OPERATION_FAILED,
    details?: any
  ) {
    super(message, httpStatus, code, details);
    this.name = 'AdminError';
  }
  
  /**
   * Create an unauthorized error
   */
  static unauthorized(message: string = 'Unauthorized access'): AdminError {
    return new AdminError(message, 401, ErrorCodes.ADMIN_UNAUTHORIZED);
  }
  
  /**
   * Create a forbidden error
   */
  static forbidden(message: string = 'Access forbidden'): AdminError {
    return new AdminError(message, 403, ErrorCodes.ADMIN_FORBIDDEN);
  }
  
  /**
   * Create a not found error
   */
  static notFound(entity: string, id?: number | string): AdminError {
    const message = id 
      ? `${entity} with ID ${id} not found` 
      : `${entity} not found`;
    return new AdminError(message, 404, ErrorCodes.ADMIN_NOT_FOUND);
  }
  
  /**
   * Create a validation error
   */
  static validation(message: string = 'Validation error', details?: any): AdminError {
    return new AdminError(message, 400, ErrorCodes.VALIDATION_ERROR, details);
  }
  
  /**
   * Create a duplicate entry error
   */
  static duplicate(entity: string, field: string, value: string): AdminError {
    return new AdminError(
      `${entity} with ${field} '${value}' already exists`,
      409,
      ErrorCodes.DUPLICATE_ENTRY
    );
  }
  
  /**
   * Create a database error
   */
  static database(message: string = 'Database operation failed'): AdminError {
    return new AdminError(message, 500, ErrorCodes.DB_ERROR);
  }
}

/**
 * WalletError class for wallet-specific error handling
 */
export class WalletError extends AppError {
  constructor(
    message: string,
    httpStatus: number = 500,
    code: ErrorCodes = ErrorCodes.WALLET_TRANSACTION_FAILED,
    details?: any
  ) {
    super(message, httpStatus, code, details);
    this.name = 'WalletError';
  }
  
  /**
   * Create an insufficient funds error
   */
  static insufficientFunds(amount?: number, currency: string = 'DGT'): WalletError {
    const message = amount 
      ? `Insufficient funds. Needed ${amount} ${currency}` 
      : 'Insufficient funds';
    return new WalletError(message, 400, ErrorCodes.WALLET_INSUFFICIENT_FUNDS);
  }
  
  /**
   * Create a not found error for wallet
   */
  static notFound(userId?: number): WalletError {
    const message = userId 
      ? `Wallet for user ID ${userId} not found` 
      : 'Wallet not found';
    return new WalletError(message, 404, ErrorCodes.WALLET_NOT_FOUND);
  }
  
  /**
   * Create an invalid operation error
   */
  static invalidOperation(message: string = 'Invalid wallet operation'): WalletError {
    return new WalletError(message, 400, ErrorCodes.WALLET_INVALID_OPERATION);
  }
  
  /**
   * Create a transaction failed error
   */
  static transactionFailed(message: string = 'Wallet transaction failed'): WalletError {
    return new WalletError(message, 500, ErrorCodes.WALLET_TRANSACTION_FAILED);
  }
  
  /**
   * Create a database error
   */
  static database(message: string = 'Database operation failed'): WalletError {
    return new WalletError(message, 500, ErrorCodes.DB_ERROR);
  }
}

/**
 * ForumError class for forum-specific error handling
 */
export class ForumError extends AppError {
  constructor(
    message: string,
    httpStatus: number = 500,
    code: ErrorCodes = ErrorCodes.OPERATION_FAILED,
    details?: any
  ) {
    super(message, httpStatus, code, details);
    this.name = 'ForumError';
  }
  
  /**
   * Create a not found error
   */
  static notFound(entity: string, id?: number | string): ForumError {
    const message = id 
      ? `${entity} with ID ${id} not found` 
      : `${entity} not found`;
    return new ForumError(message, 404, ErrorCodes.NOT_FOUND);
  }
  
  /**
   * Create a validation error
   */
  static validation(message: string = 'Forum validation error', details?: any): ForumError {
    return new ForumError(message, 400, ErrorCodes.VALIDATION_ERROR, details);
  }
  
  /**
   * Create a permission error
   */
  static permissionDenied(message: string = 'You do not have permission to perform this action'): ForumError {
    return new ForumError(message, 403, ErrorCodes.FORBIDDEN);
  }
}

/**
 * Error handler middleware functions
 */

/**
 * Wallet error handler middleware
 */
export function walletErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Wallet Error:', err);
  
  if (err instanceof WalletError) {
    return res.status(err.httpStatus).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    });
  }
  
  // Pass to the next error handler if it's not a WalletError
  next(err);
}

/**
 * Admin error handler middleware
 */
export function adminErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Admin Error:', err);
  
  if (err instanceof AdminError) {
    return res.status(err.httpStatus).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    });
  }
  
  // Pass to the next error handler if it's not an AdminError
  next(err);
}

/**
 * Forum error handler middleware
 */
export function forumErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Forum Error:', err);
  
  if (err instanceof ForumError) {
    return res.status(err.httpStatus).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    });
  }
  
  // Pass to the next error handler if it's not a ForumError
  next(err);
}

/**
 * Global error handler middleware
 * This should be registered last to catch any errors not handled by specific domain handlers
 */
export function globalErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Global Error:', err);
  
  // Handle AppError instances
  if (err instanceof AppError) {
    return res.status(err.httpStatus).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    });
  }
  
  // Handle other errors (e.g., SyntaxError, TypeError, etc.)
  return res.status(500).json({
    success: false,
    error: {
      code: ErrorCodes.UNKNOWN_ERROR,
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred'
        : err.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    }
  });
}

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
}; 