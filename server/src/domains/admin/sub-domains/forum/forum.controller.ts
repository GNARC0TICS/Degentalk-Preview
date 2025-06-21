/**
 * Admin Forum Controller
 *
 * Handles API requests for forum management.
 */

import type { Request, Response } from 'express';
import { adminForumService } from './forum.service';
import { AdminError, AdminErrorCodes } from '../../admin.errors';
import { getUserId } from '../../admin.middleware';
import { adminController } from '../../admin.controller';
import {
	CategorySchema,
	PrefixSchema,
	TagSchema,
	ModerateThreadSchema,
	PaginationSchema,
	createEntitySchema,
	updateEntitySchema,
	type ModerateThreadInput
} from './forum.validators';
import { logger } from '@server/src/core/logger';

export class AdminForumController {
	async getAllCategories(req: Request, res: Response) {
		try {
			const categories = await adminForumService.getAllCategories();
			res.json(categories);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to fetch categories' });
		}
	}

	async getCategoryById(req: Request, res: Response) {
		try {
			const categoryId = parseInt(req.params.id);
			if (isNaN(categoryId))
				throw new AdminError('Invalid category ID', 400, AdminErrorCodes.INVALID_REQUEST);

			const category = await adminForumService.getCategoryById(categoryId);
			res.json(category);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to fetch category' });
		}
	}

	async createCategory(req: Request, res: Response) {
		try {
			const validation = CategorySchema.safeParse(req.body);
			if (!validation.success) {
				throw new AdminError(
					'Invalid category data',
					400,
					AdminErrorCodes.VALIDATION_ERROR,
					validation.error.format()
				);
			}

			const category = await adminForumService.createCategory(validation.data);
			await adminController.logAction(
				req,
				'CREATE_CATEGORY',
				'category',
				category.id.toString(),
				validation.data
			);
			res.status(201).json(category);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to create category' });
		}
	}

	async updateCategory(req: Request, res: Response) {
		try {
			const categoryId = parseInt(req.params.id);
			if (isNaN(categoryId))
				throw new AdminError('Invalid category ID', 400, AdminErrorCodes.INVALID_REQUEST);

			const validation = CategorySchema.safeParse(req.body);
			if (!validation.success) {
				throw new AdminError(
					'Invalid category data',
					400,
					AdminErrorCodes.VALIDATION_ERROR,
					validation.error.format()
				);
			}

			const category = await adminForumService.updateCategory(categoryId, validation.data);
			await adminController.logAction(
				req,
				'UPDATE_CATEGORY',
				'category',
				categoryId.toString(),
				validation.data
			);
			res.json(category);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to update category' });
		}
	}

	async deleteCategory(req: Request, res: Response) {
		try {
			const categoryId = parseInt(req.params.id);
			if (isNaN(categoryId))
				throw new AdminError('Invalid category ID', 400, AdminErrorCodes.INVALID_REQUEST);

			const result = await adminForumService.deleteCategory(categoryId);
			await adminController.logAction(
				req,
				'DELETE_CATEGORY',
				'category',
				categoryId.toString(),
				{}
			);
			res.json(result);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to delete category' });
		}
	}

	async getAllPrefixes(req: Request, res: Response) {
		try {
			const prefixes = await adminForumService.getAllPrefixes();
			res.json(prefixes);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to fetch thread prefixes' });
		}
	}

	async createPrefix(req: Request, res: Response) {
		try {
			const validation = PrefixSchema.safeParse(req.body);
			if (!validation.success) {
				throw new AdminError(
					'Invalid prefix data',
					400,
					AdminErrorCodes.VALIDATION_ERROR,
					validation.error.format()
				);
			}

			const prefix = await adminForumService.createPrefix(validation.data);
			await adminController.logAction(
				req,
				'CREATE_THREAD_PREFIX',
				'thread_prefix',
				prefix.id.toString(),
				validation.data
			);
			res.status(201).json(prefix);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to create thread prefix' });
		}
	}

	// Tag Management

	async getAllTags(req: Request, res: Response) {
		try {
			const tags = await adminForumService.getAllTags();
			res.json(tags);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to fetch tags' });
		}
	}

	async createTag(req: Request, res: Response) {
		try {
			const validation = TagSchema.safeParse(req.body);
			if (!validation.success) {
				throw new AdminError(
					'Invalid tag data',
					400,
					AdminErrorCodes.VALIDATION_ERROR,
					validation.error.format()
				);
			}

			const tag = await adminForumService.createTag(validation.data);
			await adminController.logAction(req, 'CREATE_TAG', 'tag', tag.id.toString(), validation.data);
			res.status(201).json(tag);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to create tag' });
		}
	}

	async updateTag(req: Request, res: Response) {
		try {
			const tagId = parseInt(req.params.id);
			if (isNaN(tagId))
				throw new AdminError('Invalid tag ID', 400, AdminErrorCodes.INVALID_REQUEST);

			const validation = TagSchema.safeParse(req.body);
			if (!validation.success) {
				throw new AdminError(
					'Invalid tag data',
					400,
					AdminErrorCodes.VALIDATION_ERROR,
					validation.error.format()
				);
			}

			const tag = await adminForumService.updateTag(tagId, validation.data);
			await adminController.logAction(req, 'UPDATE_TAG', 'tag', tagId.toString(), validation.data);
			res.json(tag);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to update tag' });
		}
	}

	async deleteTag(req: Request, res: Response) {
		try {
			const tagId = parseInt(req.params.id);
			if (isNaN(tagId))
				throw new AdminError('Invalid tag ID', 400, AdminErrorCodes.INVALID_REQUEST);

			const result = await adminForumService.deleteTag(tagId);
			await adminController.logAction(req, 'DELETE_TAG', 'tag', tagId.toString(), {});
			res.json(result);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to delete tag' });
		}
	}

	async moderateThread(req: Request, res: Response) {
		try {
			const threadId = parseInt(req.params.id);
			if (isNaN(threadId))
				throw new AdminError('Invalid thread ID', 400, AdminErrorCodes.INVALID_REQUEST);

			const validation = ModerateThreadSchema.safeParse(req.body);
			if (!validation.success) {
				throw new AdminError(
					'Invalid moderation data',
					400,
					AdminErrorCodes.VALIDATION_ERROR,
					validation.error.format()
				);
			}

			const thread = await adminForumService.moderateThread(threadId, validation.data);
			const actionType = this.determineModerationType(validation.data);
			await adminController.logAction(
				req,
				actionType,
				'thread',
				threadId.toString(),
				validation.data
			);
			res.json(thread);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to moderate thread' });
		}
	}

	private determineModerationType(data: ModerateThreadInput): string {
		if (data.isLocked === true) return 'LOCK_THREAD';
		if (data.isLocked === false) return 'UNLOCK_THREAD';
		if (data.isSticky === true) return 'PIN_THREAD';
		if (data.isSticky === false) return 'UNPIN_THREAD';
		if (data.isHidden === true) return 'HIDE_THREAD';
		if (data.isHidden === false) return 'UNHIDE_THREAD';
		if (data.categoryId) return 'MOVE_THREAD';
		if (data.prefixId) return 'UPDATE_PREFIX';

		return 'MODERATE_THREAD';
	}

	// Forum entity management methods
	async getAllEntities(req: Request, res: Response) {
		try {
			const entities = await adminForumService.getAllEntities();
			res.json(entities);
		} catch (error) {
			logger.error('AdminForumController', 'Error getting all entities', { err: error });
			res.status(500).json({ message: 'Failed to get forum entities' });
		}
	}

	async getEntityById(req: Request, res: Response) {
		try {
			const entityId = parseInt(req.params.id);
			if (isNaN(entityId)) {
				return res.status(400).json({ message: 'Invalid entity ID' });
			}

			const entity = await adminForumService.getEntityById(entityId);
			if (!entity) {
				return res.status(404).json({ message: 'Entity not found' });
			}

			res.json(entity);
		} catch (error) {
			logger.error('AdminForumController', 'Error getting entity by ID', { err: error });
			res.status(500).json({ message: 'Failed to get entity' });
		}
	}

	async createEntity(req: Request, res: Response) {
		try {
			const validation = createEntitySchema.safeParse(req.body);
			if (!validation.success) {
				return res.status(400).json({
					message: 'Invalid entity data',
					errors: validation.error.flatten()
				});
			}

			const entity = await adminForumService.createEntity(validation.data);
			res.status(201).json(entity);
		} catch (error) {
			logger.error('AdminForumController', 'Error creating entity', { err: error });
			res.status(500).json({ message: 'Failed to create entity' });
		}
	}

	async updateEntity(req: Request, res: Response) {
		try {
			const entityId = parseInt(req.params.id);
			if (isNaN(entityId)) {
				return res.status(400).json({ message: 'Invalid entity ID' });
			}

			const validation = updateEntitySchema.safeParse(req.body);
			if (!validation.success) {
				return res.status(400).json({
					message: 'Invalid entity data',
					errors: validation.error.flatten()
				});
			}

			const entity = await adminForumService.updateEntity(entityId, validation.data);
			if (!entity) {
				return res.status(404).json({ message: 'Entity not found' });
			}

			res.json(entity);
		} catch (error) {
			logger.error('AdminForumController', 'Error updating entity', { err: error });
			res.status(500).json({ message: 'Failed to update entity' });
		}
	}

	async deleteEntity(req: Request, res: Response) {
		try {
			const entityId = parseInt(req.params.id);
			if (isNaN(entityId)) {
				return res.status(400).json({ message: 'Invalid entity ID' });
			}

			const result = await adminForumService.deleteEntity(entityId);
			if (!result) {
				return res.status(404).json({ message: 'Entity not found' });
			}

			res.json({ message: 'Entity deleted successfully' });
		} catch (error) {
			logger.error('AdminForumController', 'Error deleting entity', { err: error });
			res.status(500).json({ message: 'Failed to delete entity' });
		}
	}
}

export const adminForumController = new AdminForumController();
