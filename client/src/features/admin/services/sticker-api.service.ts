/**
 * Sticker API Service
 *
 * API client for sticker system management
 */

import { apiRequest } from '@/lib/api-request';
import type { PackId, StickerId } from '@shared/types/ids';

// Types
export interface Sticker {
	id: StickerId;
	name: string;
	displayName: string;
	shortcode: string;
	description?: string;
	staticUrl: string;
	animatedUrl?: string;
	thumbnailUrl?: string;
	width: number;
	height: number;
	staticFileSize?: number;
	animatedFileSize?: number;
	format: string;
	rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
	packId?: PackId;
	packName?: string;
	unlockType: 'shop' | 'xp_milestone' | 'admin_grant' | 'event' | 'free';
	priceDgt: number;
	requiredXp?: number;
	requiredLevel?: number;
	isActive: boolean;
	isVisible: boolean;
	isAnimated: boolean;
	totalUnlocks: number;
	totalUsage: number;
	popularityScore: number;
	createdAt: string;
	updatedAt: string;
	tags?: string;
	adminNotes?: string;
}

export interface StickerPack {
	id: PackId;
	name: string;
	displayName: string;
	description?: string;
	coverUrl?: string;
	previewUrl?: string;
	theme?: string;
	totalStickers: number;
	unlockType: 'shop' | 'xp_milestone' | 'admin_grant' | 'event' | 'free';
	priceDgt: number;
	requiredXp?: number;
	requiredLevel?: number;
	isActive: boolean;
	isVisible: boolean;
	isPromoted: boolean;
	sortOrder: number;
	totalUnlocks: number;
	popularityScore: number;
	createdAt: string;
	updatedAt: string;
	adminNotes?: string;
}

export interface CreateStickerData {
	name: string;
	displayName: string;
	shortcode: string;
	description?: string;
	staticUrl: string;
	animatedUrl?: string;
	thumbnailUrl?: string;
	width?: number;
	height?: number;
	staticFileSize?: number;
	animatedFileSize?: number;
	format?: 'webp' | 'png' | 'webm' | 'lottie';
	rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
	packId?: PackId;
	unlockType?: 'shop' | 'xp_milestone' | 'admin_grant' | 'event' | 'free';
	priceDgt?: number;
	requiredXp?: number;
	requiredLevel?: number;
	isActive?: boolean;
	isVisible?: boolean;
	isAnimated?: boolean;
	adminNotes?: string;
	tags?: string;
}

export interface UpdateStickerData extends Partial<CreateStickerData> {}

export interface CreateStickerPackData {
	name: string;
	displayName: string;
	description?: string;
	coverUrl?: string;
	previewUrl?: string;
	theme?: string;
	unlockType?: 'shop' | 'xp_milestone' | 'admin_grant' | 'event' | 'free';
	priceDgt?: number;
	requiredXp?: number;
	requiredLevel?: number;
	isActive?: boolean;
	isVisible?: boolean;
	isPromoted?: boolean;
	sortOrder?: number;
	adminNotes?: string;
}

export interface UpdateStickerPackData extends Partial<CreateStickerPackData> {}

export interface ListStickersParams {
	page?: number;
	limit?: number;
	search?: string;
	rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
	packId?: PackId;
	unlockType?: 'shop' | 'xp_milestone' | 'admin_grant' | 'event' | 'free';
	isActive?: boolean;
	isVisible?: boolean;
	isAnimated?: boolean;
	sortBy?: 'name' | 'displayName' | 'rarity' | 'createdAt' | 'popularity' | 'unlocks';
	sortOrder?: 'asc' | 'desc';
}

export interface ListStickerPacksParams {
	page?: number;
	limit?: number;
	search?: string;
	theme?: string;
	unlockType?: 'shop' | 'xp_milestone' | 'admin_grant' | 'event' | 'free';
	isActive?: boolean;
	isVisible?: boolean;
	isPromoted?: boolean;
	sortBy?: 'name' | 'displayName' | 'createdAt' | 'popularity' | 'unlocks' | 'sortOrder';
	sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
	success: boolean;
	data: {
		stickers?: T[];
		packs?: T[];
		pagination: {
			page: number;
			limit: number;
			totalCount: number;
			totalPages: number;
			hasNext: boolean;
			hasPrev: boolean;
		};
	};
}

export interface ApiResponse<T> {
	success: boolean;
	data: T;
	message?: string;
}

export interface StickerCategories {
	themes: string[];
	rarities: string[];
	formats: string[];
}

export interface StickerPreview {
	staticUrl: string;
	animatedUrl?: string;
	thumbnailUrl?: string;
	format: string;
	isAnimated: boolean;
	width: number;
	height: number;
}

/**
 * Sticker API Service Class
 */
export class StickerApiService {
	private baseUrl = '/api/admin/collectibles';

	// ============ STICKER OPERATIONS ============

	/**
	 * Get all stickers with filtering and pagination
	 */
	async getStickers(params: ListStickersParams = {}): Promise<PaginatedResponse<Sticker>> {
		// Convert params to strings for apiRequest
		const stringParams: Record<string, string> = {};
		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined) {
				stringParams[key] = String(value);
			}
		});

		return apiRequest<PaginatedResponse<Sticker>>({
			url: `${this.baseUrl}/stickers`,
			method: 'GET',
			params: Object.keys(stringParams).length > 0 ? stringParams : undefined
		});
	}

	/**
	 * Get single sticker by ID
	 */
	async getSticker(id: StickerId): Promise<ApiResponse<{ sticker: Sticker }>> {
		return apiRequest<ApiResponse<{ sticker: Sticker }>>({
			url: `${this.baseUrl}/stickers/${id}`,
			method: 'GET'
		});
	}

	/**
	 * Create new sticker
	 */
	async createSticker(
		data: CreateStickerData
	): Promise<ApiResponse<{ stickerId: StickerId; message: string }>> {
		return apiRequest<ApiResponse<{ stickerId: StickerId; message: string }>>({
			url: `${this.baseUrl}/stickers`,
			method: 'POST',
			data
		});
	}

	/**
	 * Update existing sticker
	 */
	async updateSticker(
		id: StickerId,
		data: UpdateStickerData
	): Promise<ApiResponse<{ message: string }>> {
		return apiRequest<ApiResponse<{ message: string }>>({
			url: `${this.baseUrl}/stickers/${id}`,
			method: 'PUT',
			data
		});
	}

	/**
	 * Delete sticker (soft delete)
	 */
	async deleteSticker(id: StickerId): Promise<ApiResponse<{ message: string }>> {
		return apiRequest<ApiResponse<{ message: string }>>({
			url: `${this.baseUrl}/stickers/${id}`,
			method: 'DELETE'
		});
	}

	/**
	 * Bulk delete stickers
	 */
	async bulkDeleteStickers(
		ids: StickerId[]
	): Promise<ApiResponse<{ deletedCount: number; message: string }>> {
		return apiRequest<ApiResponse<{ deletedCount: number; message: string }>>({
			url: `${this.baseUrl}/stickers/bulk-delete`,
			method: 'POST',
			data: { ids }
		});
	}

	// ============ STICKER PACK OPERATIONS ============

	/**
	 * Get all sticker packs with filtering
	 */
	async getStickerPacks(
		params: ListStickerPacksParams = {}
	): Promise<PaginatedResponse<StickerPack>> {
		// Convert params to strings for apiRequest
		const stringParams: Record<string, string> = {};
		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined) {
				stringParams[key] = String(value);
			}
		});

		return apiRequest<PaginatedResponse<StickerPack>>({
			url: `${this.baseUrl}/sticker-packs`,
			method: 'GET',
			params: Object.keys(stringParams).length > 0 ? stringParams : undefined
		});
	}

	/**
	 * Get single sticker pack by ID
	 */
	async getStickerPack(id: PackId): Promise<ApiResponse<{ pack: StickerPack }>> {
		return apiRequest<ApiResponse<{ pack: StickerPack }>>({
			url: `${this.baseUrl}/sticker-packs/${id}`,
			method: 'GET'
		});
	}

	/**
	 * Create new sticker pack
	 */
	async createStickerPack(
		data: CreateStickerPackData
	): Promise<ApiResponse<{ packId: PackId; message: string }>> {
		return apiRequest<ApiResponse<{ packId: PackId; message: string }>>({
			url: `${this.baseUrl}/sticker-packs`,
			method: 'POST',
			data
		});
	}

	/**
	 * Update existing sticker pack
	 */
	async updateStickerPack(
		id: PackId,
		data: UpdateStickerPackData
	): Promise<ApiResponse<{ message: string }>> {
		return apiRequest<ApiResponse<{ message: string }>>({
			url: `${this.baseUrl}/sticker-packs/${id}`,
			method: 'PUT',
			data
		});
	}

	/**
	 * Delete sticker pack
	 */
	async deleteStickerPack(id: PackId): Promise<ApiResponse<{ message: string }>> {
		return apiRequest<ApiResponse<{ message: string }>>({
			url: `${this.baseUrl}/sticker-packs/${id}`,
			method: 'DELETE'
		});
	}

	// ============ UTILITY OPERATIONS ============

	/**
	 * Get sticker categories/metadata
	 */
	async getStickerCategories(): Promise<ApiResponse<StickerCategories>> {
		return apiRequest<ApiResponse<StickerCategories>>({
			url: `${this.baseUrl}/stickers/categories`,
			method: 'GET'
		});
	}

	/**
	 * Preview sticker (get URLs and metadata)
	 */
	async previewSticker(id: StickerId): Promise<ApiResponse<StickerPreview>> {
		return apiRequest<ApiResponse<StickerPreview>>({
			url: `${this.baseUrl}/stickers/preview/${id}`,
			method: 'GET'
		});
	}

	/**
	 * Track sticker usage
	 */
	async trackStickerUsage(
		stickerId: StickerId,
		contextType: string,
		contextId?: string
	): Promise<ApiResponse<{ message: string }>> {
		return apiRequest<ApiResponse<{ message: string }>>({
			url: `${this.baseUrl}/stickers/track-usage`,
			method: 'POST',
			data: {
				stickerId,
				contextType,
				contextId
			}
		});
	}

	// ============ FILE UPLOAD OPERATIONS ============

	/**
	 * Upload sticker file (Supabase Storage - presigned URL flow)
	 */
	async uploadStickerFile(
		file: File,
		uploadType:
			| 'sticker_static'
			| 'sticker_animated'
			| 'sticker_thumbnail'
			| 'sticker_pack_cover'
			| 'sticker_pack_preview',
		options: { stickerId?: StickerId; packId?: PackId } = {}
	): Promise<ApiResponse<{ uploadUrl: string; publicUrl: string; relativePath: string }>> {
		// Step 1: Get presigned upload URL
		const uploadResponse = await apiRequest<
			ApiResponse<{ uploadUrl: string; publicUrl: string; relativePath: string }>
		>({
			url: `${this.baseUrl}/stickers/upload`,
			method: 'POST',
			data: {
				fileName: file.name,
				fileType: file.type,
				fileSize: file.size,
				uploadType,
				stickerId: options.stickerId,
				packId: options.packId
			}
		});

		// Step 2: Upload file directly to Supabase using presigned URL
		if (uploadResponse.success && uploadResponse.data.uploadUrl) {
			await fetch(uploadResponse.data.uploadUrl, {
				method: 'PUT',
				body: file,
				headers: {
					'Content-Type': file.type
				}
			});

			// Step 3: Confirm upload completion
			await this.confirmStickerUpload({
				relativePath: uploadResponse.data.relativePath,
				uploadType,
				stickerId: options.stickerId,
				packId: options.packId
			});
		}

		return uploadResponse;
	}

	/**
	 * Confirm sticker file upload completion
	 */
	async confirmStickerUpload(data: {
		relativePath: string;
		uploadType:
			| 'sticker_static'
			| 'sticker_animated'
			| 'sticker_thumbnail'
			| 'sticker_pack_cover'
			| 'sticker_pack_preview';
		stickerId?: StickerId;
		packId?: PackId;
	}): Promise<ApiResponse<{ success: boolean; message: string; newPublicUrl?: string }>> {
		return apiRequest<ApiResponse<{ success: boolean; message: string; newPublicUrl?: string }>>({
			url: `${this.baseUrl}/stickers/confirm-upload`,
			method: 'POST',
			data
		});
	}

	/**
	 * Delete sticker file from storage
	 */
	async deleteStickerFile(data: {
		relativePath: string;
		uploadType:
			| 'sticker_static'
			| 'sticker_animated'
			| 'sticker_thumbnail'
			| 'sticker_pack_cover'
			| 'sticker_pack_preview';
		stickerId?: StickerId;
		packId?: PackId;
	}): Promise<ApiResponse<{ success: boolean; message: string }>> {
		return apiRequest<ApiResponse<{ success: boolean; message: string }>>({
			url: `${this.baseUrl}/stickers/delete-file`,
			method: 'DELETE',
			data
		});
	}
}

// Export service instance
export const stickerApiService = new StickerApiService();

// Export default
export default stickerApiService;
