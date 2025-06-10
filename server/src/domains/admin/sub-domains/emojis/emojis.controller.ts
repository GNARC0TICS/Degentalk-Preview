import { Request, Response } from 'express';
import { emojiService } from './emojis.service';
import {
	CreateEmojiSchema,
	UpdateEmojiSchema,
	ListEmojisQuerySchema,
	EmojiIdParamSchema,
	BulkDeleteEmojisSchema
} from './emojis.validators';
import { logger } from '../../../../core/logger';
import { AdminError, AdminErrorCodes } from '../../admin.errors';

/**
 * Helper function to get user ID from request
 */
function getUserId(req: Request): number | undefined {
	return (req.user as any)?.id;
}

/**
 * Helper function to handle validation errors
 */
function handleValidationError(error: any, res: Response) {
	if (error.name === 'ZodError') {
		return res.status(400).json({
			error: 'Validation failed',
			code: AdminErrorCodes.VALIDATION_ERROR,
			details: error.errors
		});
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

		// Validate query parameters
		const validation = ListEmojisQuerySchema.safeParse(req.query);
		if (!validation.success) {
			return handleValidationError(validation.error, res);
		}

		const options = validation.data;
		const result = await emojiService.getAll(options);

		logger.info('EMOJI_CONTROLLER', `Successfully fetched ${result.emojis.length} emojis`);

		return res.json({
			success: true,
			data: result.emojis,
			pagination: result.pagination
		});
	} catch (error) {
		logger.error('EMOJI_CONTROLLER', 'Error fetching emojis:', error);

		if (error instanceof AdminError) {
			return res.status(error.httpStatus).json({
				error: error.message,
				code: error.code,
				details: error.details
			});
		}

		return res.status(500).json({
			error: 'Internal server error while fetching emojis',
			code: AdminErrorCodes.INTERNAL_ERROR
		});
	}
};

/**
 * GET /api/admin/emojis/:id
 * Get a single emoji by ID
 */
export const getEmojiById = async (req: Request, res: Response) => {
	try {
		logger.info('EMOJI_CONTROLLER', `GET /api/admin/emojis/${req.params.id} requested`);

		// Validate path parameter
		const paramValidation = EmojiIdParamSchema.safeParse(req.params);
		if (!paramValidation.success) {
			return handleValidationError(paramValidation.error, res);
		}

		const { id } = paramValidation.data;
		const emoji = await emojiService.getById(id);

		if (!emoji) {
			return res.status(404).json({
				error: `Emoji with ID ${id} not found`,
				code: AdminErrorCodes.NOT_FOUND
			});
		}

		logger.info('EMOJI_CONTROLLER', `Successfully fetched emoji: ${emoji.name}`);

		return res.json({
			success: true,
			data: emoji
		});
	} catch (error) {
		logger.error('EMOJI_CONTROLLER', 'Error fetching emoji by ID:', error);

		if (error instanceof AdminError) {
			return res.status(error.httpStatus).json({
				error: error.message,
				code: error.code,
				details: error.details
			});
		}

		return res.status(500).json({
			error: 'Internal server error while fetching emoji',
			code: AdminErrorCodes.INTERNAL_ERROR
		});
	}
};

/**
 * POST /api/admin/emojis
 * Create a new emoji
 */
export const createEmoji = async (req: Request, res: Response) => {
	try {
		logger.info('EMOJI_CONTROLLER', 'POST /api/admin/emojis requested', { body: req.body });

		// Validate request body
		const validation = CreateEmojiSchema.safeParse(req.body);
		if (!validation.success) {
			return handleValidationError(validation.error, res);
		}

		const emojiData = {
			...validation.data,
			createdBy: getUserId(req) // Add creator ID if available
		};

		const newEmoji = await emojiService.create(emojiData);

		logger.info(
			'EMOJI_CONTROLLER',
			`Successfully created emoji: ${newEmoji.name} (ID: ${newEmoji.id})`
		);

		return res.status(201).json({
			success: true,
			message: `Emoji '${newEmoji.name}' created successfully`,
			data: newEmoji
		});
	} catch (error) {
		logger.error('EMOJI_CONTROLLER', 'Error creating emoji:', error);

		if (error instanceof AdminError) {
			return res.status(error.httpStatus).json({
				error: error.message,
				code: error.code,
				details: error.details
			});
		}

		// Handle specific database constraint errors
		if (error instanceof Error) {
			if (error.message.includes('already exists')) {
				return res.status(409).json({
					error: error.message,
					code: AdminErrorCodes.DUPLICATE_RESOURCE
				});
			}
		}

		return res.status(500).json({
			error: 'Internal server error while creating emoji',
			code: AdminErrorCodes.INTERNAL_ERROR
		});
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

		// Validate path parameter
		const paramValidation = EmojiIdParamSchema.safeParse(req.params);
		if (!paramValidation.success) {
			return handleValidationError(paramValidation.error, res);
		}

		// Validate request body
		const bodyValidation = UpdateEmojiSchema.safeParse(req.body);
		if (!bodyValidation.success) {
			return handleValidationError(bodyValidation.error, res);
		}

		// Check if there's actually something to update
		if (Object.keys(bodyValidation.data).length === 0) {
			return res.status(400).json({
				error: 'No fields provided for update',
				code: AdminErrorCodes.VALIDATION_ERROR
			});
		}

		const { id } = paramValidation.data;
		const updateData = bodyValidation.data;

		const updatedEmoji = await emojiService.update(id, updateData);

		logger.info('EMOJI_CONTROLLER', `Successfully updated emoji: ${updatedEmoji.name} (ID: ${id})`);

		return res.json({
			success: true,
			message: `Emoji '${updatedEmoji.name}' updated successfully`,
			data: updatedEmoji
		});
	} catch (error) {
		logger.error('EMOJI_CONTROLLER', 'Error updating emoji:', error);

		if (error instanceof AdminError) {
			return res.status(error.httpStatus).json({
				error: error.message,
				code: error.code,
				details: error.details
			});
		}

		// Handle specific errors
		if (error instanceof Error) {
			if (error.message.includes('not found')) {
				return res.status(404).json({
					error: error.message,
					code: AdminErrorCodes.NOT_FOUND
				});
			}
			if (error.message.includes('already uses this')) {
				return res.status(409).json({
					error: error.message,
					code: AdminErrorCodes.DUPLICATE_RESOURCE
				});
			}
		}

		return res.status(500).json({
			error: 'Internal server error while updating emoji',
			code: AdminErrorCodes.INTERNAL_ERROR
		});
	}
};

/**
 * DELETE /api/admin/emojis/:id
 * Soft delete an emoji
 */
export const deleteEmoji = async (req: Request, res: Response) => {
	try {
		logger.info('EMOJI_CONTROLLER', `DELETE /api/admin/emojis/${req.params.id} requested`);

		// Validate path parameter
		const paramValidation = EmojiIdParamSchema.safeParse(req.params);
		if (!paramValidation.success) {
			return handleValidationError(paramValidation.error, res);
		}

		const { id } = paramValidation.data;
		const deletedEmoji = await emojiService.delete(id);

		logger.info('EMOJI_CONTROLLER', `Successfully deleted emoji (ID: ${id})`);

		return res.json({
			success: true,
			message: `Emoji deleted successfully`,
			data: { id: deletedEmoji.id, name: deletedEmoji.name }
		});
	} catch (error) {
		logger.error('EMOJI_CONTROLLER', 'Error deleting emoji:', error);

		if (error instanceof AdminError) {
			return res.status(error.httpStatus).json({
				error: error.message,
				code: error.code,
				details: error.details
			});
		}

		// Handle specific errors
		if (error instanceof Error) {
			if (error.message.includes('not found')) {
				return res.status(404).json({
					error: error.message,
					code: AdminErrorCodes.NOT_FOUND
				});
			}
			if (error.message.includes('already deleted')) {
				return res.status(409).json({
					error: error.message,
					code: AdminErrorCodes.INVALID_OPERATION
				});
			}
		}

		return res.status(500).json({
			error: 'Internal server error while deleting emoji',
			code: AdminErrorCodes.INTERNAL_ERROR
		});
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

		// Validate request body
		const validation = BulkDeleteEmojisSchema.safeParse(req.body);
		if (!validation.success) {
			return handleValidationError(validation.error, res);
		}

		const { ids } = validation.data;
		const deletedEmojis = await emojiService.bulkDelete(ids);

		logger.info('EMOJI_CONTROLLER', `Successfully bulk deleted ${deletedEmojis.length} emojis`);

		return res.json({
			success: true,
			message: `Successfully deleted ${deletedEmojis.length} emoji(s)`,
			data: {
				deleted: deletedEmojis,
				count: deletedEmojis.length
			}
		});
	} catch (error) {
		logger.error('EMOJI_CONTROLLER', 'Error bulk deleting emojis:', error);

		if (error instanceof AdminError) {
			return res.status(error.httpStatus).json({
				error: error.message,
				code: error.code,
				details: error.details
			});
		}

		return res.status(500).json({
			error: 'Internal server error while bulk deleting emojis',
			code: AdminErrorCodes.INTERNAL_ERROR
		});
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

		return res.json({
			success: true,
			data: categories
		});
	} catch (error) {
		logger.error('EMOJI_CONTROLLER', 'Error fetching emoji categories:', error);

		if (error instanceof AdminError) {
			return res.status(error.httpStatus).json({
				error: error.message,
				code: error.code,
				details: error.details
			});
		}

		return res.status(500).json({
			error: 'Internal server error while fetching emoji categories',
			code: AdminErrorCodes.INTERNAL_ERROR
		});
	}
};
