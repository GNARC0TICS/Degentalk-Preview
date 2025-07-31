/**
 * Standardized API response utilities
 * Ensures all endpoints return consistent ApiResponse<T> format as defined in @shared/types/api.types
 */

import type { Response } from 'express';
import type { 
  ApiResponse, 
  ApiSuccess, 
  ApiError, 
  PaginationMeta 
} from '@shared/types/api.types';
import { ApiErrorCode } from '@shared/types/api.types';

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(
  data: T, 
  message?: string, 
  meta?: PaginationMeta
): ApiSuccess<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    meta
  };
}

/**
 * Create an error API response
 */
export function createErrorResponse(
  code: string | ApiErrorCode,
  message: string,
  details?: Record<string, unknown>,
  field?: string
): ApiError {
  return {
    success: false,
    error: {
      code,
      message,
      details,
      field
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Create a paginated API response
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): ApiSuccess<T[]> {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

/**
 * Send a successful API response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  status = 200,
  meta?: PaginationMeta
): Response {
  return res.status(status).json(createSuccessResponse(data, message, meta));
}

/**
 * Send an error API response
 */
export function sendError(
  res: Response,
  code: string | ApiErrorCode,
  message: string,
  status = 400,
  details?: Record<string, unknown>,
  field?: string
): Response {
  return res.status(status).json(createErrorResponse(code, message, details, field));
}

/**
 * Send a paginated API response
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string,
  status = 200
): Response {
  return res.status(status).json(createPaginatedResponse(data, page, limit, total, message));
}

/**
 * Common error response helpers
 */
export const errorResponses = {
  unauthorized: (res: Response, message = 'Unauthorized') =>
    sendError(res, ApiErrorCode.UNAUTHORIZED, message, 401),
    
  forbidden: (res: Response, message = 'Forbidden') =>
    sendError(res, ApiErrorCode.FORBIDDEN, message, 403),
    
  notFound: (res: Response, message = 'Resource not found') =>
    sendError(res, ApiErrorCode.NOT_FOUND, message, 404),
    
  validationError: (res: Response, message: string, details?: Record<string, unknown>, field?: string) =>
    sendError(res, ApiErrorCode.VALIDATION_ERROR, message, 400, details, field),
    
  internalError: (res: Response, message = 'Internal server error') =>
    sendError(res, ApiErrorCode.INTERNAL_ERROR, message, 500),
    
  alreadyExists: (res: Response, message: string) =>
    sendError(res, ApiErrorCode.ALREADY_EXISTS, message, 409),
    
  operationFailed: (res: Response, message: string) =>
    sendError(res, ApiErrorCode.OPERATION_FAILED, message, 400)
};

/**
 * Helper to transform data before sending response
 */
export function sendTransformed<T, R>(
  res: Response,
  data: T,
  transformer: (item: T) => R,
  message?: string,
  status = 200
): Response {
  return sendSuccess(res, transformer(data), message, status);
}

/**
 * Helper to transform list data before sending response
 */
export function sendTransformedList<T, R>(
  res: Response,
  data: T[],
  transformer: (item: T) => R,
  message?: string,
  status = 200
): Response {
  return sendSuccess(res, data.map(transformer), message, status);
}

/**
 * Helper to transform paginated data before sending response
 */
export function sendTransformedPaginated<T, R>(
  res: Response,
  data: T[],
  transformer: (item: T) => R,
  page: number,
  limit: number,
  total: number,
  message?: string,
  status = 200
): Response {
  return sendPaginated(res, data.map(transformer), page, limit, total, message, status);
}