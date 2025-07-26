import type { Request, Response } from 'express';
import { userService } from '@core/services/user.service';
import type { CategoryId, TagId, ThreadId, EntityId } from '@shared/types/ids';
import { adminForumService } from './forum.service';
import { AdminError, AdminErrorCodes } from '../../admin/admin.errors';
import { getUserId } from '../../admin/admin.middleware';
import { adminController } from '../../admin/admin.controller';
import { validateAndConvertId } from '@core/helpers/validate-controller-ids';
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
import { logger } from '@core/logger';
import { validateRequestBody, validateQueryParams } from '../../admin/admin.validation';
import { ForumTransformer } from '@domains/forum/transformers/forum.transformer';
import {
	toPublicList,
	sendSuccessResponse,
	sendErrorResponse,
	sendTransformedResponse,
	sendTransformedListResponse
} from '@core/utils/transformer.helpers';

export class AdminForumController {
	async getAllCategories(req: Request, res: Response) {
		try {
			const categories = await adminForumService.getAllCategories();
			sendTransformedListResponse(res, categories, ForumTransformer.toModerationForumStructure);
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus || 500);
			return sendErrorResponse(res, 'Failed to fetch categories', 500);
		}
	}

	async getCategoryById(req: Request, res: Response) {
		try {
			const categoryId = validateAndConvertId(req.params.id, 'Category');
			if (!categoryId) {
				return sendErrorResponse(res, 'Invalid category ID format', 400);
			}

			const category = await adminForumService.getCategoryById(categoryId);
			sendSuccessResponse(res, ForumTransformer.toModerationForumStructure(category));
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus || 500);
			return sendErrorResponse(res, 'Failed to fetch category', 500);
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
			res.status(201);
			sendSuccessResponse(res, ForumTransformer.toModerationForumStructure(category));
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus || 500);
			return sendErrorResponse(res, 'Failed to create category', 500);
		}
	}

	async updateCategory(req: Request, res: Response) {
		try {
			const categoryId = validateAndConvertId(req.params.id, 'Category');
			if (!categoryId) {
				return sendErrorResponse(res, 'Invalid category ID format', 400);
			}

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
			sendSuccessResponse(res, ForumTransformer.toModerationForumStructure(category));
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus || 500);
			return sendErrorResponse(res, 'Failed to update category', 500);
		}
	}

	async deleteCategory(req: Request, res: Response) {
		try {
			const categoryId = validateAndConvertId(req.params.id, 'Category');
			if (!categoryId) {
				return sendErrorResponse(res, 'Invalid category ID format', 400);
			}

			const result = await adminForumService.deleteCategory(categoryId);
			await adminController.logAction(
				req,
				'DELETE_CATEGORY',
				'category',
				categoryId.toString(),
				{}
			);
			sendSuccessResponse(res, result);
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus || 500);
			return sendErrorResponse(res, 'Failed to delete category', 500);
		}
	}

	async getAllPrefixes(req: Request, res: Response) {
		try {
			const prefixes = await adminForumService.getAllPrefixes();
			sendTransformedListResponse(res, prefixes, (prefix) => ({ ...prefix, id: prefix.id }));
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus || 500);
			return sendErrorResponse(res, 'Failed to fetch thread prefixes', 500);
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
			res.status(201);
			sendSuccessResponse(res, { ...prefix, id: prefix.id });
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus || 500);
			return sendErrorResponse(res, 'Failed to create thread prefix', 500);
		}
	}

	// Tag Management

	async getAllTags(req: Request, res: Response) {
		try {
			const tags = await adminForumService.getAllTags();
			sendTransformedListResponse(res, tags, (tag) => ({ ...tag, id: tag.id }));
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus || 500);
			return sendErrorResponse(res, 'Failed to fetch tags', 500);
		}
	}

	async createTag(req: Request, res: Response) {
		try {
			const dataTag = validateRequestBody(req, res, TagSchema);
			if (!dataTag) return;
			const tag = await adminForumService.createTag(dataTag);
			await adminController.logAction(req, 'CREATE_TAG', 'tag', tag.id.toString(), dataTag);
			res.status(201);
			sendSuccessResponse(res, { ...tag, id: tag.id });
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus || 500);
			return sendErrorResponse(res, 'Failed to create tag', 500);
		}
	}

	async updateTag(req: Request, res: Response) {
		try {
			const tagId = validateAndConvertId(req.params.id, 'Tag');
			if (!tagId) {
				return sendErrorResponse(res, 'Invalid tag ID format', 400);
			}

			const dataTagU = validateRequestBody(req, res, TagSchema);
			if (!dataTagU) return;
			const tag = await adminForumService.updateTag(tagId, dataTagU);
			await adminController.logAction(req, 'UPDATE_TAG', 'tag', tagId.toString(), dataTagU);
			sendSuccessResponse(res, { ...tag, id: tag.id });
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus || 500);
			return sendErrorResponse(res, 'Failed to update tag', 500);
		}
	}

	async deleteTag(req: Request, res: Response) {
		try {
			const tagId = validateAndConvertId(req.params.id, 'Tag');
			if (!tagId) {
				return sendErrorResponse(res, 'Invalid tag ID format', 400);
			}

			const result = await adminForumService.deleteTag(tagId);
			await adminController.logAction(req, 'DELETE_TAG', 'tag', tagId.toString(), {});
			sendSuccessResponse(res, result);
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus || 500);
			return sendErrorResponse(res, 'Failed to delete tag', 500);
		}
	}

	async moderateThread(req: Request, res: Response) {
		try {
			const threadId = validateAndConvertId(req.params.id, 'Thread');
			if (!threadId) {
				return sendErrorResponse(res, 'Invalid thread ID format', 400);
			}

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
			sendSuccessResponse(res, ForumTransformer.toModerationThread(thread));
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus || 500);
			return sendErrorResponse(res, 'Failed to moderate thread', 500);
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
			sendTransformedListResponse(res, entities, ForumTransformer.toModerationForumStructure);
		} catch (error) {
			logger.error('AdminForumController', 'Error getting all entities', { err: error });
			return sendErrorResponse(res, 'Failed to get forum entities', 500);
		}
	}

	async getEntityById(req: Request, res: Response) {
		try {
			const entityId = validateAndConvertId(req.params.id, 'Entity');
			if (!entityId) {
				return sendErrorResponse(res, 'Invalid entity ID format', 400);
			}

			const entity = await adminForumService.getEntityById(entityId);
			if (!entity) {
				return sendErrorResponse(res, 'Entity not found', 404);
			}

			sendSuccessResponse(res, ForumTransformer.toModerationForumStructure(entity));
		} catch (error) {
			logger.error('AdminForumController', 'Error getting entity by ID', { err: error });
			return sendErrorResponse(res, 'Failed to get entity', 500);
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
			res.status(201);
			sendSuccessResponse(res, ForumTransformer.toModerationForumStructure(entity));
		} catch (error) {
			logger.error('AdminForumController', 'Error creating entity', { err: error });
			return sendErrorResponse(res, 'Failed to create entity', 500);
		}
	}

	async updateEntity(req: Request, res: Response) {
		try {
			const entityId = validateAndConvertId(req.params.id, 'Entity');
			if (!entityId) {
				return sendErrorResponse(res, 'Invalid entity ID format', 400);
			}

			const dataEntU = validateRequestBody(req, res, updateEntitySchema);
			if (!dataEntU) return;
			const entity = await adminForumService.updateEntity(entityId, dataEntU);
			if (!entity) {
				return sendErrorResponse(res, 'Entity not found', 404);
			}

			await adminController.logAction(
				req,
				'UPDATE_FORUM_ENTITY',
				'forum_entity',
				entityId.toString(),
				dataEntU
			);
			sendSuccessResponse(res, ForumTransformer.toModerationForumStructure(entity));
		} catch (error) {
			logger.error('AdminForumController', 'Error updating entity', { err: error });
			return sendErrorResponse(res, 'Failed to update entity', 500);
		}
	}

	async deleteEntity(req: Request, res: Response) {
		try {
			const entityId = validateAndConvertId(req.params.id, 'Entity');
			if (!entityId) {
				return sendErrorResponse(res, 'Invalid entity ID format', 400);
			}

			const result = await adminForumService.deleteEntity(entityId);
			if (!result) {
				return sendErrorResponse(res, 'Entity not found', 404);
			}

			sendSuccessResponse(res, null, 'Entity deleted successfully');
		} catch (error) {
			logger.error('AdminForumController', 'Error deleting entity', { err: error });
			return sendErrorResponse(res, 'Failed to delete entity', 500);
		}
	}
}

export const adminForumController = new AdminForumController();
