/**
 * Test route for verifying error handling and Sentry integration
 * This route is only available in development mode
 */

import { Router } from 'express';
import { asyncHandlerWithReporting } from "@lib/report-error";
import { logger, LogAction } from '../core/logger';
import { 
  ValidationError, 
  DatabaseError, 
  NotFoundError,
  RateLimitError,
  AppError 
} from '../middleware/centralized-error-handler.middleware';

const router = Router();

// Only enable in development
if (process.env.NODE_ENV === 'development') {
  /**
   * Test route that throws an error to verify error handling
   */
  router.get('/test-error', asyncHandlerWithReporting(async (req, res) => {
    logger.info('TEST_ERROR', 'Test error route accessed');
    
    // Throw a test error
    throw new Error('Test error from server - This should be caught by error handler and reported to Sentry');
  }));
  
  /**
   * Test route that throws different types of errors
   */
  router.get('/test-error/:type', asyncHandlerWithReporting(async (req, res) => {
    const { type } = req.params;
    
    switch (type) {
      case 'validation':
        const validationError = new Error('Test validation error');
        validationError.name = 'ValidationError';
        throw validationError;
        
      case 'database':
        const dbError = new Error('Test database connection error');
        dbError.name = 'DatabaseError';
        throw dbError;
        
      case 'payment':
        const paymentError = new Error('Test payment processing error');
        paymentError.name = 'PaymentError';
        throw paymentError;
        
      case 'reference':
        // This will cause a ReferenceError
        // @ts-expect-error Testing ReferenceError for error handler
        nonExistentFunction();
        break;
        
      case 'type':
        // This will cause a TypeError
        // @ts-expect-error Testing TypeError for error handler
        null.someMethod();
        break;
        
      default:
        throw new Error(`Unknown error type: ${type}`);
    }
  }));
  
  /**
   * Test route that returns success to verify server is working
   */
  router.get('/test-success', asyncHandlerWithReporting(async (req, res) => {
    logger.info('TEST_SUCCESS', 'Test success route accessed');
    
    res.json({
      success: true,
      message: 'Server error handling is configured correctly',
      timestamp: new Date().toISOString(),
    });
  }));
}

export default router;