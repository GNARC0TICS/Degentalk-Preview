import { userService } from '@server/src/core/services/user.service';
/**
 * Sticker Controller
 *
 * Handles HTTP requests for the sticker system
 */

import type { Request, Response } from 'express';
import { z } from 'zod';
import { stickerService } from './stickers.service';
import {
	createStickerSchema,
	updateStickerSchema,
	listStickersSchema,
	createStickerPackSchema,
	updateStickerPackSchema,
	listStickerPacksSchema,
	bulkDeleteStickersSchema,
	trackStickerUsageSchema,
	type CreateStickerInput,
	type UpdateStickerInput,
	type CreateStickerPackInput,
	type UpdateStickerPackInput
} from './stickers.validators';
import { formatAdminResponse, AdminOperationBoundary } from '@server/src/domains/admin/shared';
import { AdminError, AdminErrorCodes } from '@server/src/domains/admin/admin.errors';
import type { StickerId, PackId } from '@shared/types/ids';
import { sendSuccessResponse, sendErrorResponse } from "@server/src/core/utils/transformer.helpers";

// Additional validation schemas
const stickerIdSchema = z.object({
	id: z.string()
});

const packIdSchema = z.object({
	id: z.string()
});

export class StickerController {
	// ============ STICKER OPERATIONS ============

	/**
	 * GET /api/admin/stickers
	 * List all stickers with filtering and pagination
	 */
	async getStickers(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'LIST_STICKERS',
			entityType: 'sticker'
		});

		return boundary.execute(async () => {
			const filters = listStickersSchema.parse(req.query);
			const result = await stickerService.getStickers(filters);

			return formatAdminResponse(result, 'LIST_STICKERS', 'sticker');
		});
	}

	/**
	 * GET /api/admin/stickers/:id
	 * Get sticker details by ID
	 */
	async getSticker(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'GET_STICKER',
			entityType: 'sticker'
		});

		return boundary.execute(async () => {
			const { id } = stickerIdSchema.parse(req.params);
			const sticker = await stickerService.getSticker(id);

			return formatAdminResponse({ sticker }, 'GET_STICKER', 'sticker');
		});
	}

	/**
	 * POST /api/admin/stickers
	 * Create a new sticker
	 */
	async createSticker(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'CREATE_STICKER',
			entityType: 'sticker'
		});

		return boundary.execute(async () => {
			const stickerData = createStickerSchema.parse(req.body);
			const adminId = userService.getUserFromRequest(req)?.id;

			if (!adminId) {
				throw new AdminError('Admin ID required', 401, AdminErrorCodes.UNAUTHORIZED);
			}

			const result = await stickerService.createSticker(stickerData, adminId);

			return formatAdminResponse(result, 'CREATE_STICKER', 'sticker');
		});
	}

	/**
	 * PUT /api/admin/stickers/:id
	 * Update an existing sticker
	 */
	async updateSticker(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'UPDATE_STICKER',
			entityType: 'sticker'
		});

		return boundary.execute(async () => {
			const { id } = stickerIdSchema.parse(req.params);
			const stickerData = updateStickerSchema.parse(req.body);
			const adminId = userService.getUserFromRequest(req)?.id;

			if (!adminId) {
				throw new AdminError('Admin ID required', 401, AdminErrorCodes.UNAUTHORIZED);
			}

			const result = await stickerService.updateSticker(id, stickerData, adminId);

			return formatAdminResponse(result, 'UPDATE_STICKER', 'sticker');
		});
	}

	/**
	 * DELETE /api/admin/stickers/:id
	 * Delete a sticker (soft delete)
	 */
	async deleteSticker(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'DELETE_STICKER',
			entityType: 'sticker'
		});

		return boundary.execute(async () => {
			const { id } = stickerIdSchema.parse(req.params);
			const adminId = userService.getUserFromRequest(req)?.id;

			if (!adminId) {
				throw new AdminError('Admin ID required', 401, AdminErrorCodes.UNAUTHORIZED);
			}

			const result = await stickerService.deleteSticker(id, adminId);

			return formatAdminResponse(result, 'DELETE_STICKER', 'sticker');
		});
	}

	/**
	 * POST /api/admin/stickers/bulk-delete
	 * Bulk delete stickers
	 */
	async bulkDeleteStickers(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'BULK_DELETE_STICKERS',
			entityType: 'sticker'
		});

		return boundary.execute(async () => {
			const data = bulkDeleteStickersSchema.parse(req.body);
			const adminId = userService.getUserFromRequest(req)?.id;

			if (!adminId) {
				throw new AdminError('Admin ID required', 401, AdminErrorCodes.UNAUTHORIZED);
			}

			const result = await stickerService.bulkDeleteStickers(data, adminId);

			return formatAdminResponse(result, 'BULK_DELETE_STICKERS', 'sticker');
		});
	}

	// ============ STICKER PACK OPERATIONS ============

	/**
	 * GET /api/admin/sticker-packs
	 * List all sticker packs with filtering
	 */
	async getStickerPacks(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'LIST_STICKER_PACKS',
			entityType: 'stickerPack'
		});

		return boundary.execute(async () => {
			const filters = listStickerPacksSchema.parse(req.query);
			const result = await stickerService.getStickerPacks(filters);

			return formatAdminResponse(result, 'LIST_STICKER_PACKS', 'stickerPack');
		});
	}

	/**
	 * GET /api/admin/sticker-packs/:id
	 * Get sticker pack details by ID
	 */
	async getStickerPack(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'GET_STICKER_PACK',
			entityType: 'stickerPack'
		});

		return boundary.execute(async () => {
			const { id } = packIdSchema.parse(req.params);
			const pack = await stickerService.getStickerPack(id);

			return formatAdminResponse({ pack }, 'GET_STICKER_PACK', 'stickerPack');
		});
	}

	/**
	 * POST /api/admin/sticker-packs
	 * Create a new sticker pack
	 */
	async createStickerPack(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'CREATE_STICKER_PACK',
			entityType: 'stickerPack'
		});

		return boundary.execute(async () => {
			const packData = createStickerPackSchema.parse(req.body);
			const adminId = userService.getUserFromRequest(req)?.id;

			if (!adminId) {
				throw new AdminError('Admin ID required', 401, AdminErrorCodes.UNAUTHORIZED);
			}

			const result = await stickerService.createStickerPack(packData, adminId);

			return formatAdminResponse(result, 'CREATE_STICKER_PACK', 'stickerPack');
		});
	}

	/**
	 * PUT /api/admin/sticker-packs/:id
	 * Update an existing sticker pack
	 */
	async updateStickerPack(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'UPDATE_STICKER_PACK',
			entityType: 'stickerPack'
		});

		return boundary.execute(async () => {
			const { id } = packIdSchema.parse(req.params);
			const packData = updateStickerPackSchema.parse(req.body);
			const adminId = userService.getUserFromRequest(req)?.id;

			if (!adminId) {
				throw new AdminError('Admin ID required', 401, AdminErrorCodes.UNAUTHORIZED);
			}

			const result = await stickerService.updateStickerPack(id, packData, adminId);

			return formatAdminResponse(result, 'UPDATE_STICKER_PACK', 'stickerPack');
		});
	}

	/**
	 * DELETE /api/admin/sticker-packs/:id
	 * Delete a sticker pack
	 */
	async deleteStickerPack(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'DELETE_STICKER_PACK',
			entityType: 'stickerPack'
		});

		return boundary.execute(async () => {
			const { id } = packIdSchema.parse(req.params);
			const adminId = userService.getUserFromRequest(req)?.id;

			if (!adminId) {
				throw new AdminError('Admin ID required', 401, AdminErrorCodes.UNAUTHORIZED);
			}

			const result = await stickerService.deleteStickerPack(id, adminId);

			return formatAdminResponse(result, 'DELETE_STICKER_PACK', 'stickerPack');
		});
	}

	// ============ UTILITY ENDPOINTS ============

	/**
	 * GET /api/admin/stickers/categories
	 * Get available sticker categories/metadata
	 */
	async getStickerCategories(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'GET_STICKER_CATEGORIES',
			entityType: 'sticker'
		});

		return boundary.execute(async () => {
			const categories = await stickerService.getStickerCategories();

			return formatAdminResponse(categories, 'GET_STICKER_CATEGORIES', 'sticker');
		});
	}

	/**
	 * POST /api/admin/stickers/track-usage
	 * Track sticker usage (for analytics)
	 */
	async trackStickerUsage(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'TRACK_STICKER_USAGE',
			entityType: 'sticker'
		});

		return boundary.execute(async () => {
			const usageData = trackStickerUsageSchema.parse(req.body);
			const userId = userService.getUserFromRequest(req)?.id;

			if (!userId) {
				throw new AdminError('User ID required', 401, AdminErrorCodes.UNAUTHORIZED);
			}

			await stickerService.trackStickerUsage(usageData, userId);

			return formatAdminResponse(
				{ message: 'Usage tracked successfully' },
				'TRACK_STICKER_USAGE',
				'sticker'
			);
		});
	}

	// ============ FILE UPLOAD ENDPOINTS ============

	/**
	 * POST /api/admin/stickers/upload
	 * Upload sticker file (Supabase Storage)
	 */
	async uploadStickerFile(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'UPLOAD_STICKER_FILE',
			entityType: 'sticker'
		});

		return boundary.execute(async () => {
			// Parse upload parameters from request body
			const uploadSchema = z.object({
				fileName: z.string().min(1),
				fileType: z.string().min(1),
				fileSize: z.number().positive(),
				uploadType: z.enum([
					'sticker_static',
					'sticker_animated',
					'sticker_thumbnail',
					'sticker_pack_cover',
					'sticker_pack_preview'
				]),
				stickerId: z.string().uuid().positive().optional(),
				packId: z.string().uuid().positive().optional()
			});

			const uploadData = uploadSchema.parse(req.body);
			const adminId = userService.getUserFromRequest(req)?.id;

			if (!adminId) {
				throw new AdminError('Admin ID required', 401, AdminErrorCodes.UNAUTHORIZED);
			}

			// Import upload service
			const { uploadService } = await import('@server/src/domains/uploads/upload.service');

			// Create presigned upload URL
			const result = await uploadService.createPresignedUploadUrl({
				userId: adminId, // Admin user creating the upload
				fileName: uploadData.fileName,
				fileType: uploadData.fileType,
				fileSize: uploadData.fileSize,
				uploadType: uploadData.uploadType,
				stickerId: uploadData.stickerId,
				packId: uploadData.packId
			});

			return formatAdminResponse(
				{
					uploadUrl: result.uploadUrl,
					publicUrl: result.publicUrl,
					relativePath: result.relativePath,
					message: 'Upload URL generated successfully. Use this URL to upload your file.'
				},
				'UPLOAD_STICKER_FILE',
				'sticker'
			);
		});
	}

	/**
	 * POST /api/admin/stickers/confirm-upload
	 * Confirm sticker file upload completion
	 */
	async confirmStickerUpload(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'CONFIRM_STICKER_UPLOAD',
			entityType: 'sticker'
		});

		return boundary.execute(async () => {
			const confirmSchema = z.object({
				relativePath: z.string().min(1),
				uploadType: z.enum([
					'sticker_static',
					'sticker_animated',
					'sticker_thumbnail',
					'sticker_pack_cover',
					'sticker_pack_preview'
				]),
				stickerId: z.string().uuid().positive().optional(),
				packId: z.string().uuid().positive().optional()
			});

			const confirmData = confirmSchema.parse(req.body);
			const adminId = userService.getUserFromRequest(req)?.id;

			if (!adminId) {
				throw new AdminError('Admin ID required', 401, AdminErrorCodes.UNAUTHORIZED);
			}

			// Import upload service
			const { uploadService } = await import('@server/src/domains/uploads/upload.service');

			// Confirm upload
			const result = await uploadService.confirmUpload(adminId, {
				relativePath: confirmData.relativePath,
				uploadType: confirmData.uploadType
			});

			// If this is a sticker file, update the sticker record with the new URL
			if (confirmData.stickerId && result.newPublicUrl) {
				const updateData: any = {};

				if (confirmData.uploadType === 'sticker_static') {
					updateData.staticUrl = result.newPublicUrl;
				} else if (confirmData.uploadType === 'sticker_animated') {
					updateData.animatedUrl = result.newPublicUrl;
					updateData.isAnimated = true;
				} else if (confirmData.uploadType === 'sticker_thumbnail') {
					updateData.thumbnailUrl = result.newPublicUrl;
				}

				if (Object.keys(updateData).length > 0) {
					await stickerService.updateSticker(confirmData.stickerId, updateData, adminId);
				}
			}

			// If this is a pack file, update the pack record
			if (confirmData.packId && result.newPublicUrl) {
				const updateData: any = {};

				if (confirmData.uploadType === 'sticker_pack_cover') {
					updateData.coverUrl = result.newPublicUrl;
				} else if (confirmData.uploadType === 'sticker_pack_preview') {
					updateData.previewUrl = result.newPublicUrl;
				}

				if (Object.keys(updateData).length > 0) {
					await stickerService.updateStickerPack(confirmData.packId, updateData, adminId);
				}
			}

			return formatAdminResponse(
				{
					...result,
					message: 'Upload confirmed and sticker/pack updated successfully'
				},
				'CONFIRM_STICKER_UPLOAD',
				'sticker'
			);
		});
	}

	/**
	 * DELETE /api/admin/stickers/delete-file
	 * Delete sticker file from storage (admin asset management)
	 */
	async deleteStickerFile(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'DELETE_STICKER_FILE',
			entityType: 'sticker'
		});

		return boundary.execute(async () => {
			const deleteSchema = z.object({
				relativePath: z.string().min(1),
				uploadType: z.enum([
					'sticker_static',
					'sticker_animated',
					'sticker_thumbnail',
					'sticker_pack_cover',
					'sticker_pack_preview'
				]),
				stickerId: z.string().uuid().positive().optional(),
				packId: z.string().uuid().positive().optional()
			});

			const deleteData = deleteSchema.parse(req.body);
			const adminId = userService.getUserFromRequest(req)?.id;

			if (!adminId) {
				throw new AdminError('Admin ID required', 401, AdminErrorCodes.UNAUTHORIZED);
			}

			// Import upload service
			const { uploadService } = await import('@server/src/domains/uploads/upload.service');

			// Delete file from storage
			const result = await uploadService.deleteFile(
				deleteData.uploadType,
				deleteData.relativePath,
				adminId
			);

			// If deletion was successful, update database records to remove URLs
			if (result.success) {
				if (deleteData.stickerId) {
					const updateData: any = {};

					if (deleteData.uploadType === 'sticker_static') {
						updateData.staticUrl = null;
					} else if (deleteData.uploadType === 'sticker_animated') {
						updateData.animatedUrl = null;
						updateData.isAnimated = false;
					} else if (deleteData.uploadType === 'sticker_thumbnail') {
						updateData.thumbnailUrl = null;
					}

					if (Object.keys(updateData).length > 0) {
						await stickerService.updateSticker(deleteData.stickerId, updateData, adminId);
					}
				}

				if (deleteData.packId) {
					const updateData: any = {};

					if (deleteData.uploadType === 'sticker_pack_cover') {
						updateData.coverUrl = null;
					} else if (deleteData.uploadType === 'sticker_pack_preview') {
						updateData.previewUrl = null;
					}

					if (Object.keys(updateData).length > 0) {
						await stickerService.updateStickerPack(deleteData.packId, updateData, adminId);
					}
				}
			}

			return formatAdminResponse(result, 'DELETE_STICKER_FILE', 'sticker');
		});
	}

	/**
	 * GET /api/admin/stickers/preview/:id
	 * Preview sticker (supports WebP/WebM/Lottie)
	 */
	async previewSticker(req: Request, res: Response) {
		try {
			const { id } = stickerIdSchema.parse(req.params);
			const sticker = await stickerService.getSticker(id);

			// Return sticker URLs for preview
			sendSuccessResponse(res, {
            				success: true,
            				data: {
            					staticUrl: sticker.staticUrl,
            					animatedUrl: sticker.animatedUrl,
            					thumbnailUrl: sticker.thumbnailUrl,
            					format: sticker.format,
            					isAnimated: sticker.isAnimated,
            					width: sticker.width,
            					height: sticker.height
            				}
            			});
		} catch (error) {
			res.status(500).json({
				success: false,
				error: error.message || 'Failed to preview sticker'
			});
		}
	}
}

// Export controller instance
export const stickerController = new StickerController();
