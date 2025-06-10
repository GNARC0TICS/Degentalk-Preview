/**
 * Admin Forum Controller
 *
 * Handles API requests for forum management.
 */

import { Request, Response } from 'express';
import { adminForumService } from './forum.service';
import { AdminError, AdminErrorCodes } from '../../admin.errors';
import { getUserId } from '../../admin.middleware';
import { adminController } from '../../admin.controller';
import {
	CategorySchema,
	PrefixSchema,
	ModerateThreadSchema,
	PaginationSchema
} from './forum.validators';

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
}

export const adminForumController = new AdminForumController();
