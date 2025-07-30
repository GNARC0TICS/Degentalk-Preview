import { Router } from 'express'
import type { Router as RouterType } from 'express';
import {
	getAllEmojis,
	getEmojiById,
	createEmoji,
	updateEmoji,
	deleteEmoji,
	bulkDeleteEmojis,
	getEmojiCategories
} from './emojis.controller';
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { randomUUID } from 'crypto';
import { eventEmitter } from '@domains/notifications/event-notification-listener';



// forum async handler that emits admin events
const forumAsyncHandler = (
  routeHandler: RequestHandler
): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();
    try {
      await routeHandler(req, res, next);
    } catch (error) {
      // Emit asynchronously to not block response
      setImmediate(() => {
        eventEmitter.emit('admin.route.error', {
          domain: 'forum',
          error: error instanceof Error ? {
            message: error.message,
            stack: error.stack,
            name: error.name
          } : String(error),
          timestamp: new Date(),
          userId: req.user?.id || null,
          correlationId,
          path: req.path,
          method: req.method
        });
      });
      next(error);
    }
  };
};

const router: RouterType = Router();

// Apply forumAsyncHandler to all routes for consistent error handling

// GET /api/admin/emojis/categories - Get all emoji categories
router.get('/categories', forumAsyncHandler(getEmojiCategories));

// GET /api/admin/emojis - Get all emojis with filtering and pagination
router.get('/', forumAsyncHandler(getAllEmojis));

// GET /api/admin/emojis/:id - Get a single emoji by ID
router.get('/:id', forumAsyncHandler(getEmojiById));

// POST /api/admin/emojis - Create a new emoji
router.post('/', forumAsyncHandler(createEmoji));

// POST /api/admin/emojis/bulk-delete - Bulk delete emojis
router.post('/bulk-delete', forumAsyncHandler(bulkDeleteEmojis));

// PUT /api/admin/emojis/:id - Update an existing emoji
router.put('/:id', forumAsyncHandler(updateEmoji));

// DELETE /api/admin/emojis/:id - Soft delete an emoji
router.delete('/:id', forumAsyncHandler(deleteEmoji));

export default router;
