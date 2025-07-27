/**
 * Central export point for all core utilities
 * This prevents confusion about which file exports what
 * 
 * Usage:
 * import { sendSuccessResponse, sendErrorResponse } from '@core/utils';
 */

// Response/API utilities
export * from './transformer.helpers';

// Common aliases for easier discovery
export {
  sendSuccessResponse as sendSuccess,
  sendErrorResponse as sendError,
  sendSuccessResponse as successResponse,
  sendErrorResponse as errorResponse
} from './transformer.helpers';
