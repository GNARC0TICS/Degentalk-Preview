import { userService } from '@server/src/core/services/user.service';
/**
 * Admin Forum Controller
 *
 * Handles API requests for forum management.
 */

import type { Request, Response } from 'express';
import type { CategoryId, TagId, ThreadId, EntityId } from '@db/types';
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
import { validateRequestBody, validateQueryParams } from '../../admin.validation';

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
			const categoryId = req.params.id as CategoryId;

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
			const data = validateRequestBody(req, res, CategorySchema);
			if (!data) return;
			const category = await adminForumService.createCategory(data);
			await adminController.logAction(
				req,
				'CREATE_CATEGORY',
				'category',
				category.id.toString(),
				data
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
			const categoryId = req.params.id as CategoryId;

			const data = validateRequestBody(req, res, CategorySchema);
			if (!data) return;
			const category = await adminForumService.updateCategory(categoryId, data);
			await adminController.logAction(
				req,
				'UPDATE_CATEGORY',
				'category',
				categoryId.toString(),
				data
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
			const categoryId = req.params.id as CategoryId;

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
			const dataPrefix = validateRequestBody(req, res, PrefixSchema);
			if (!dataPrefix) return;
			const prefix = await adminForumService.createPrefix(dataPrefix);
			await adminController.logAction(
				req,
				'CREATE_THREAD_PREFIX',
				'thread_prefix',
				prefix.id.toString(),
				dataPrefix
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
			const dataTag = validateRequestBody(req, res, TagSchema);
			if (!dataTag) return;
			const tag = await adminForumService.createTag(dataTag);
			await adminController.logAction(req, 'CREATE_TAG', 'tag', tag.id.toString(), dataTag);
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
			const tagId = req.params.id as TagId;

			const dataTagU = validateRequestBody(req, res, TagSchema);
			if (!dataTagU) return;
			const tag = await adminForumService.updateTag(tagId, dataTagU);
			await adminController.logAction(req, 'UPDATE_TAG', 'tag', tagId.toString(), dataTagU);
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
			const tagId = req.params.id as TagId;

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
			const threadId = req.params.id as ThreadId;

			const dataMod = validateRequestBody(req, res, ModerateThreadSchema);
			if (!dataMod) return;
			const thread = await adminForumService.moderateThread(
				threadId,
				dataMod,
				userService.getUserFromRequest(req),
				this.determineModerationType(dataMod)
			);
			const moderationType = this.determineModerationType(dataMod);
			await adminController.logAction(req, moderationType, 'thread', threadId.toString(), dataMod);
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
			const pagination = validateQueryParams(req, res, PaginationSchema) || undefined;
			const entities = await adminForumService.getAllEntities(pagination);
			res.json(entities);
		} catch (error) {
			logger.error('AdminForumController', 'Error getting all entities', { err: error });
			res.status(500).json({ message: 'Failed to get forum entities' });
		}
	}

	async getEntityById(req: Request, res: Response) {
		try {
			const entityId = req.params.id as EntityId;

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
			const dataEnt = validateRequestBody(req, res, createEntitySchema);
			if (!dataEnt) return;
			const entity = await adminForumService.createEntity(dataEnt);
			await adminController.logAction(
				req,
				'CREATE_FORUM_ENTITY',
				'forum_entity',
				entity.id.toString(),
				dataEnt
			);
			res.status(201).json(entity);
		} catch (error) {
			logger.error('AdminForumController', 'Error creating entity', { err: error });
			res.status(500).json({ message: 'Failed to create entity' });
		}
	}

	async updateEntity(req: Request, res: Response) {
		try {
			const entityId = req.params.id as EntityId;

			const dataEntU = validateRequestBody(req, res, updateEntitySchema);
			if (!dataEntU) return;
			const entity = await adminForumService.updateEntity(entityId, dataEntU);
			if (!entity) {
				return res.status(404).json({ message: 'Entity not found' });
			}

			await adminController.logAction(
				req,
				'UPDATE_FORUM_ENTITY',
				'forum_entity',
				entityId.toString(),
				dataEntU
			);
			res.json(entity);
		} catch (error) {
			logger.error('AdminForumController', 'Error updating entity', { err: error });
			res.status(500).json({ message: 'Failed to update entity' });
		}
	}

	async deleteEntity(req: Request, res: Response) {
		try {
			const entityId = req.params.id as EntityId;

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
