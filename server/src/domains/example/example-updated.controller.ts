/**
 * Example Controller with Updated Error Handling
 * Shows the pattern for using reportErrorServer in controllers
 */

import { Router } from 'express';
import { asyncHandlerWithReporting } from '../../lib/report-error';
import { ValidationError, NotFoundError } from '../../middleware/centralized-error-handler.middleware';
import { isAuthenticated } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate-request.middleware';
import { z } from 'zod';
import { getUser } from '@core/utils/auth.helpers';
import { LogAction } from '../../core/logger';

const router = Router();

// Schema for request validation
const createItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  value: z.number().positive(),
});

/**
 * Example: Create item endpoint with proper error handling
 */
router.post(
  '/items',
  isAuthenticated,
  validateRequest({ body: createItemSchema }),
  asyncHandlerWithReporting(
    async (req, res) => {
      const user = await getUser(req);
      const { name, description, value } = req.body;
      
      // Example validation that throws custom error
      if (name.toLowerCase() === 'forbidden') {
        throw new ValidationError('This name is not allowed', 'name', name);
      }
      
      // Simulate some business logic
      const item = await createItem({
        userId: user.id,
        name,
        description,
        value,
      });
      
      res.json({
        success: true,
        data: item,
      });
    },
    {
      service: 'ExampleService',
      operation: 'createItem',
      action: LogAction.API_REQUEST,
    }
  )
);

/**
 * Example: Get item by ID with not found handling
 */
router.get(
  '/items/:id',
  asyncHandlerWithReporting(
    async (req, res) => {
      const { id } = req.params;
      
      const item = await getItemById(id);
      
      if (!item) {
        throw new NotFoundError('Item not found', 'item', id);
      }
      
      res.json({
        success: true,
        data: item,
      });
    },
    {
      service: 'ExampleService',
      operation: 'getItemById',
    }
  )
);

/**
 * Example: Update item with complex error handling
 */
router.put(
  '/items/:id',
  isAuthenticated,
  validateRequest({ body: createItemSchema.partial() }),
  asyncHandlerWithReporting(
    async (req, res) => {
      const user = await getUser(req);
      const { id } = req.params;
      const updates = req.body;
      
      const item = await getItemById(id);
      
      if (!item) {
        throw new NotFoundError('Item not found', 'item', id);
      }
      
      // Check ownership
      if (item.userId !== user.id) {
        throw new AuthorizationError('You do not own this item');
      }
      
      const updatedItem = await updateItem(id, updates);
      
      res.json({
        success: true,
        data: updatedItem,
      });
    },
    {
      service: 'ExampleService',
      operation: 'updateItem',
    }
  )
);

// Example service functions (these would be in a separate service file)
async function createItem(data: any) {
  // Implementation
  return { id: '123', ...data };
}

async function getItemById(id: string) {
  // Implementation
  return id === '404' ? null : { id, name: 'Example Item' };
}

async function updateItem(id: string, updates: any) {
  // Implementation
  return { id, ...updates };
}

export default router;