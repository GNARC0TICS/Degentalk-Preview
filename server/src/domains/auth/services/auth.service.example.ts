/**
 * Example of how to update error handling in services to use reportErrorServer
 * This file demonstrates the pattern for integrating Sentry error reporting
 */

import { reportErrorServer } from '../../../lib/report-error';
import { LogAction } from '../../../core/logger';
import type { Request } from 'express';

// Example 1: Simple service method with error reporting
export async function exampleServiceMethod(userId: string, data: any) {
  try {
    // ... your service logic here ...
    
    // Simulate some database operation
    const result = await someDatabasaOperation(userId, data);
    return result;
  } catch (error) {
    // Report error with context
    await reportErrorServer(error, {
      userId,
      action: LogAction.API_ERROR,
      data: {
        method: 'exampleServiceMethod',
        input: { userId, dataKeys: Object.keys(data) }
      }
    });
    
    // Re-throw to let Express error handler catch it
    throw error;
  }
}

// Example 2: Route handler with error reporting
export async function exampleRouteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUser(req)?.id;
    const { param1, param2 } = req.body;
    
    // ... your route logic here ...
    
    const result = await someService(param1, param2);
    
    res.json({ success: true, data: result });
  } catch (error) {
    // Report error with full request context
    await reportErrorServer(error, {
      route: req.originalUrl,
      userId,
      method: req.method,
      request: req,
      action: LogAction.API_ERROR,
      data: {
        body: req.body,
        params: req.params,
        query: req.query
      }
    });
    
    // Pass to error handler middleware
    next(error);
  }
}

// Example 3: Background job with error reporting
export async function exampleBackgroundJob() {
  try {
    // ... your background job logic ...
    
    await processItems();
  } catch (error) {
    // Report error for background job
    await reportErrorServer(error, {
      action: LogAction.CUSTOM,
      data: {
        job: 'exampleBackgroundJob',
        timestamp: new Date().toISOString()
      }
    });
    
    // For background jobs, you might want to handle the error differently
    // e.g., retry the job, send an alert, etc.
  }
}

// Example 4: Database transaction with error reporting
export async function exampleTransactionMethod(userId: string, amount: number) {
  const transaction = await db.transaction();
  
  try {
    // ... your transaction logic ...
    
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    
    // Report error with transaction context
    await reportErrorServer(error, {
      userId,
      action: LogAction.WALLET_TRANSACTION,
      data: {
        method: 'exampleTransactionMethod',
        amount,
        transactionFailed: true
      }
    });
    
    throw error;
  }
}

// Pattern Summary:
// 1. Wrap your code in try-catch blocks
// 2. Call reportErrorServer with appropriate context
// 3. Include relevant data: userId, route, method, action type
// 4. Re-throw the error to maintain existing error flow
// 5. For Express routes, pass error to next() instead of throwing