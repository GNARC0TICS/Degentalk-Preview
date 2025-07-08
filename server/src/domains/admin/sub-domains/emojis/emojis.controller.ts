import type { Request, Response } from 'express';
import { userService } from '@server/src/core/services/user.service';
import { emojiService } from './emojis.service';
import {
	CreateEmojiSchema,
	UpdateEmojiSchema,
	ListEmojisQuerySchema,
	BulkDeleteEmojisSchema
} from './emojis.validators';
import {
	validateRequestBody,
	validateQueryParams,
	validateNumberParam
} from '../../admin.validation';
import { logger } from '../../../../core/logger';
import { AdminError, AdminErrorCodes } from '../../admin.errors';
import { 
	toPublicList,
	sendSuccessResponse,
	sendErrorResponse,
	sendTransformedResponse,
	sendTransformedListResponse
} from '@server/src/core/utils/transformer.helpers';
import { sendSuccess, sendError, sendValidationError, handleAdminError } from '../../admin.response';

// Removed redundant getUserId helper - use userService.getUserFromRequest(req)?.id directly

/**
 * Helper function to handle validation errors
 */
function handleValidationError(error: any, res: Response) {
	if (error.name === 'ZodError') {
		return sendValidationError(res, 'Validation failed', error.errors);
	}
	return null;
}

/**
 * GET /api/admin/emojis
 * Get all emojis with filtering and pagination
 */
export const getAllEmojis = async (req: Request, res: Response) => {
	try {
		logger.info('EMOJI_CONTROLLER', 'GET /api/admin/emojis requested', { query: req.query });

		const query = validateQueryParams(req, res, ListEmojisQuerySchema);
		if (!query) return;
		const result = await emojiService.getAll(query);

		logger.info('EMOJI_CONTROLLER', `Successfully fetched ${result.emojis.length} emojis`);

		return sendSuccessResponse(res, {
			data: toPublicList(result.emojis, (emoji) => ({ ...emoji, id: emoji.id })),
			pagination: result.pagination
		});
	} catch (error) {
		logger.error('EMOJI_CONTROLLER', 'Error fetching emojis:', error);

		if (error instanceof AdminError) {
			return handleAdminError(res, error);
		}

		return sendError(res, 'Internal server error while fetching emojis');
	}
};

/**
 * GET /api/admin/emojis/:id
 * Get a single emoji by ID
 */
export const getEmojiById = async (req: Request, res: Response) => {
	try {
		logger.info('EMOJI_CONTROLLER', `GET /api/admin/emojis/${req.params.id} requested`);

		const id = validateNumberParam(req, res, 'id');
		if (id === null) return;
		const emoji = await emojiService.getById(id);

		if (!emoji) {
			return sendError(res, `Emoji with ID ${id} not found`, 404);
		}

		logger.info('EMOJI_CONTROLLER', `Successfully fetched emoji: ${emoji.name}`);

		return sendSuccessResponse(res, { ...emoji, id: emoji.id });
	} catch (error) {
		logger.error('EMOJI_CONTROLLER', 'Error fetching emoji by ID:', error);

		if (error instanceof AdminError) {
			return handleAdminError(res, error);
		}

		return sendError(res, 'Internal server error while fetching emoji');
	}
};

/**
 * POST /api/admin/emojis
 * Create a new emoji
 */
export const createEmoji = async (req: Request, res: Response) => {
	try {
		logger.info('EMOJI_CONTROLLER', 'POST /api/admin/emojis requested', { body: req.body });

		const data = validateRequestBody(req, res, CreateEmojiSchema);
		if (!data) return;
		const emojiData = {
			...data,
			createdBy: userService.getUserFromRequest(req)
		};

		const newEmoji = await emojiService.create(emojiData);

		logger.info(
			'EMOJI_CONTROLLER',
			`Successfully created emoji: ${newEmoji.name} (ID: ${newEmoji.id})`
		);

		res.status(201);
		return sendSuccessResponse(res, { ...newEmoji, id: newEmoji.id }, `Emoji '${newEmoji.name}' created successfully`);
	} catch (error) {
		logger.error('EMOJI_CONTROLLER', 'Error creating emoji:', error);

		if (error instanceof AdminError) {
			return handleAdminError(res, error);
		}

		// Handle specific database constraint errors
		if (error instanceof Error) {
			if (error.message.includes('already exists')) {
				return sendError(res, error.message, 409);
			}
		}

		return sendError(res, 'Internal server error while creating emoji');
	}
};

/**
 * PUT /api/admin/emojis/:id
 * Update an existing emoji
 */
export const updateEmoji = async (req: Request, res: Response) => {
	try {
		logger.info('EMOJI_CONTROLLER', `PUT /api/admin/emojis/${req.params.id} requested`, {
			body: req.body
		});

		const id = validateNumberParam(req, res, 'id');
		if (id === null) return;

		const dataUpdate = validateRequestBody(req, res, UpdateEmojiSchema);
		if (!dataUpdate) return;

		if (Object.keys(dataUpdate).length === 0) {
			return sendValidationError(res, 'No fields provided for update');
		}

		const updateData = dataUpdate;

		const updatedEmoji = await emojiService.update(id, updateData);

		logger.info('EMOJI_CONTROLLER', `Successfully updated emoji: ${updatedEmoji.name} (ID: ${id})`);

		return sendSuccessResponse(res, { ...updatedEmoji, id: updatedEmoji.id }, `Emoji '${updatedEmoji.name}' updated successfully`);
	} catch (error) {
		logger.error('EMOJI_CONTROLLER', 'Error updating emoji:', error);

		if (error instanceof AdminError) {
			return handleAdminError(res, error);
		}

		// Handle specific errors
		if (error instanceof Error) {
			if (error.message.includes('not found')) {
				return sendError(res, error.message, 404);
			}
			if (error.message.includes('already uses this')) {
				return sendError(res, error.message, 409);
			}
		}

		return sendError(res, 'Internal server error while updating emoji');
	}
};

/**
 * DELETE /api/admin/emojis/:id
 * Soft delete an emoji
 */
export const deleteEmoji = async (req: Request, res: Response) => {
	try {
		logger.info('EMOJI_CONTROLLER', `DELETE /api/admin/emojis/${req.params.id} requested`);

		const id = validateNumberParam(req, res, 'id');
		if (id === null) return;
		const deletedEmoji = await emojiService.delete(id);

		logger.info('EMOJI_CONTROLLER', `Successfully deleted emoji (ID: ${id})`);

		return sendSuccessResponse(res, { id: deletedEmoji.id, name: deletedEmoji.name }, 'Emoji deleted successfully');
	} catch (error) {
		logger.error('EMOJI_CONTROLLER', 'Error deleting emoji:', error);

		if (error instanceof AdminError) {
			return handleAdminError(res, error);
		}

		// Handle specific errors
		if (error instanceof Error) {
			if (error.message.includes('not found')) {
				return sendError(res, error.message, 404);
			}
			if (error.message.includes('already deleted')) {
				return sendError(res, error.message, 409);
			}
		}

		return sendError(res, 'Internal server error while deleting emoji');
	}
};

/**
 * POST /api/admin/emojis/bulk-delete
 * Bulk delete multiple emojis
 */
export const bulkDeleteEmojis = async (req: Request, res: Response) => {
	try {
		logger.info('EMOJI_CONTROLLER', 'POST /api/admin/emojis/bulk-delete requested', {
			body: req.body
		});

		const dataBulk = validateRequestBody(req, res, BulkDeleteEmojisSchema);
		if (!dataBulk) return;

		const { ids } = dataBulk;
		const deletedEmojis = await emojiService.bulkDelete(ids);

		logger.info('EMOJI_CONTROLLER', `Successfully bulk deleted ${deletedEmojis.length} emojis`);

		return sendSuccessResponse(res, {
			deleted: deletedEmojis,
			count: deletedEmojis.length
		}, `Successfully deleted ${deletedEmojis.length} emoji(s)`);
	} catch (error) {
		logger.error('EMOJI_CONTROLLER', 'Error bulk deleting emojis:', error);

		if (error instanceof AdminError) {
			return handleAdminError(res, error);
		}

		return sendError(res, 'Internal server error while bulk deleting emojis');
	}
};

/**
 * GET /api/admin/emojis/categories
 * Get all emoji categories
 */
export const getEmojiCategories = async (req: Request, res: Response) => {
	try {
		logger.info('EMOJI_CONTROLLER', 'GET /api/admin/emojis/categories requested');

		const categories = await emojiService.getCategories();

		logger.info('EMOJI_CONTROLLER', `Successfully fetched ${categories.length} emoji categories`);

		return sendTransformedListResponse(res, categories, (category) => ({ ...category, id: category.id }));
	} catch (error) {
		logger.error('EMOJI_CONTROLLER', 'Error fetching emoji categories:', error);

		if (error instanceof AdminError) {
			return handleAdminError(res, error);
		}

		return sendError(res, 'Internal server error while fetching emoji categories');
	}
};
