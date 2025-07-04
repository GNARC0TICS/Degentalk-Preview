// server/src/domains/uploads/upload.service.ts

// import { v4 as uuidv4 } from 'uuid'; // Not strictly needed here if storageService handles unique names or paths are deterministic
import {
	storageService,
	AVATARS_BUCKET,
	BANNERS_BUCKET,
	STICKERS_BUCKET
	// type GetPresignedUploadUrlParams, // This type is for storageService, not directly used here
	// type PresignedUrlInfo // This type is for storageService, not directly used here
} from '../../core/storage.service';
import type { PackId, StickerId } from '@shared/types';

// --- Types specific to this Upload Domain Service ---
export type UploadType =
	| 'avatar'
	| 'banner'
	| 'sticker_static'
	| 'sticker_animated'
	| 'sticker_thumbnail'
	| 'sticker_pack_cover'
	| 'sticker_pack_preview';

export interface CreatePresignedUrlServiceParams {
	userId: string;
	fileName: string;
	fileType: string;
	fileSize: number;
	uploadType: UploadType;
	// Sticker-specific parameters
	stickerId?: StickerId; // For individual sticker files
	packId?: PackId; // For pack cover/preview images
}

export interface PresignedUploadServiceResult {
	uploadUrl: string;
	publicUrl: string;
	relativePath: string;
}

export interface ConfirmUploadServiceParams {
	relativePath: string;
	uploadType: UploadType;
}

export interface UploadConfirmationServiceResult {
	success: boolean;
	message: string;
	newPublicUrl?: string;
	relativePath?: string;
}

// Custom DegenUploadError (can be defined here or imported if it's shared)
export class DegenUploadError extends Error {
	public statusCode: number;
	constructor(message: string, statusCode: number = 400) {
		super(message);
		this.name = 'DegenUploadError';
		this.statusCode = statusCode;
	}
}

// --- Service Class ---
export class UploadService {
	// private sanitizeFileName(fileName: string): string { // This logic can move to storage.service if needed or stay if pre-sanitization is desired
	//   const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
	//   const extension = (fileName.substring(fileName.lastIndexOf('.') + 1) || '').toLowerCase();
	//   let sanitized = nameWithoutExtension.replace(/[^a-zA-Z0-9_-]/g, '_');
	//   sanitized = sanitized.replace(/__+/g, '_');
	//   sanitized = sanitized.replace(/^_+|_+$/g, '');
	//   sanitized = sanitized.substring(0, 100);
	//   return extension ? `${sanitized}.${extension}` : sanitized;
	// }

	private getFileExtension(fileName: string): string {
		const lastDot = fileName.lastIndexOf('.');
		if (lastDot === -1 || lastDot === 0 || lastDot === fileName.length - 1) {
			return '';
		}
		return fileName.substring(lastDot + 1).toLowerCase();
	}

	async createPresignedUploadUrl(
		params: CreatePresignedUrlServiceParams
	): Promise<PresignedUploadServiceResult> {
		const { userId, fileName, fileType, fileSize, uploadType, stickerId, packId } = params;

		// Determine bucket based on upload type
		let bucketName: string;
		if (uploadType.startsWith('sticker')) {
			bucketName = STICKERS_BUCKET;
		} else if (uploadType === 'avatar') {
			bucketName = AVATARS_BUCKET;
		} else {
			bucketName = BANNERS_BUCKET;
		}

		const extension = this.getFileExtension(fileName);
		if (!extension) {
			throw new DegenUploadError(
				`File (${fileName}) needs a valid extension, my G. What even is this?`,
				400
			);
		}

		// Generate path based on upload type
		let relativePath: string;

		if (uploadType.startsWith('sticker_pack_')) {
			// Pack files: stickers/packs/{packId}/cover.webp or preview.webp
			if (!packId) {
				throw new DegenUploadError(
					'Pack ID is required for sticker pack uploads. Cannot upload pack assets without a pack.',
					400
				);
			}
			const fileType = uploadType === 'sticker_pack_cover' ? 'cover' : 'preview';
			relativePath = `packs/${packId}/${fileType}.${extension}`;
		} else if (uploadType.startsWith('sticker_')) {
			// Individual sticker files: stickers/stickers/{stickerId}/static.webp, animated.webm, thumbnail.webp
			if (!stickerId) {
				throw new DegenUploadError(
					'Sticker ID is required for sticker uploads. Cannot upload sticker assets without a sticker.',
					400
				);
			}
			const fileType = uploadType.replace('sticker_', ''); // static, animated, thumbnail
			relativePath = `stickers/${stickerId}/${fileType}.${extension}`;
		} else {
			// Original logic for avatars/banners
			relativePath = `users/${userId}/${uploadType}.${extension}`;
		}

		try {
			const presignedInfoFromStorage = await storageService.getPresignedUploadUrl({
				bucket: bucketName,
				relativePath: relativePath, // This is the targetPath for storage service
				fileType: fileType,
				fileSize: fileSize
			});

			// The public URL should also be constructed via the storage service
			const publicUrl = storageService.getPublicUrl(
				bucketName,
				presignedInfoFromStorage.relativePath
			);

			return {
				uploadUrl: presignedInfoFromStorage.uploadUrl,
				publicUrl: publicUrl,
				relativePath: presignedInfoFromStorage.relativePath
			};
		} catch (err) {
			if (err instanceof DegenUploadError) {
				// Catch DegenUploadError from storageService
				throw err;
			}
			console.error(
				`UploadService: Error creating presigned URL for ${relativePath} via storageService:`,
				err
			);
			const statusCode =
				typeof err === 'object' &&
				err !== null &&
				'statusCode' in err &&
				typeof err.statusCode === 'number'
					? err.statusCode
					: 500;
			throw new DegenUploadError(
				`The tubes are clogged trying to get that upload URL for ${relativePath}. Server's probably NGMI.`,
				statusCode // Propagate status code if available
			);
		}
	}

	async confirmUpload(
		userId: string,
		params: ConfirmUploadServiceParams
	): Promise<UploadConfirmationServiceResult> {
		const { relativePath, uploadType } = params;

		// Determine bucket based on upload type
		let bucketName: string;
		if (uploadType.startsWith('sticker')) {
			bucketName = STICKERS_BUCKET;
		} else if (uploadType === 'avatar') {
			bucketName = AVATARS_BUCKET;
		} else {
			bucketName = BANNERS_BUCKET;
		}

		// Security validation - different logic for stickers vs user uploads
		if (uploadType.startsWith('sticker')) {
			// For stickers, verify the path structure is valid (no user folder restriction)
			const isValidStickerPath =
				relativePath.startsWith('stickers/') || relativePath.startsWith('packs/');

			if (!isValidStickerPath) {
				console.error(
					`UploadService: Invalid sticker path structure. Path ${relativePath} does not match expected sticker patterns.`
				);
				throw new DegenUploadError(
					`Invalid sticker upload path: ${relativePath}. Sticker files must be in stickers/ or packs/ directories.`,
					400
				);
			}
		} else {
			// Original user folder security check for avatars/banners
			const expectedUserFolder = `users/${userId}/`;
			if (!relativePath.startsWith(expectedUserFolder)) {
				console.error(
					`UploadService: Security check failed. User ${userId} trying to confirm path ${relativePath} not matching their folder.`
				);
				throw new DegenUploadError(
					`Hold your horses, degenerate! That path (${relativePath}) ain't yours to confirm. Nice try, script kiddie.`,
					403
				);
			}
		}

		try {
			const fileExists = await storageService.verifyFileExists(bucketName, relativePath);

			if (!fileExists) {
				console.warn(
					`UploadService: File not found in storage at path ${relativePath} during confirmation for user ${userId}.`
				);
				throw new DegenUploadError(
					`We checked the blockchain (our storage, lol) and your file at ${relativePath} is pure vaporware. Upload it first, genius.`,
					404
				);
			}

			const publicUrl = storageService.getPublicUrl(bucketName, relativePath);

			return {
				success: true,
				message: `Your ${uploadType} at ${relativePath} is confirmed and looking fire on the permaweb!`,
				newPublicUrl: publicUrl,
				relativePath: relativePath
			};
		} catch (err) {
			if (err instanceof DegenUploadError) {
				// Catch DegenUploadError from storageService
				throw err;
			}
			console.error(
				`UploadService: Unexpected error in confirmUpload for path ${relativePath} (user ${userId}):`,
				err
			);
			const statusCode =
				typeof err === 'object' &&
				err !== null &&
				'statusCode' in err &&
				typeof err.statusCode === 'number'
					? err.statusCode
					: 500;
			throw new DegenUploadError(
				`Something went intergalactically wrong confirming your upload of ${relativePath}. Server's probably rugged.`,
				statusCode // Propagate status code if available
			);
		}
	}

	/**
	 * Delete a file from storage (admin operation for asset management)
	 */
	async deleteFile(
		uploadType: UploadType,
		relativePath: string,
		adminId: string
	): Promise<{ success: boolean; message: string }> {
		// Determine bucket
		let bucketName: string;
		if (uploadType.startsWith('sticker')) {
			bucketName = STICKERS_BUCKET;
		} else if (uploadType === 'avatar') {
			bucketName = AVATARS_BUCKET;
		} else {
			bucketName = BANNERS_BUCKET;
		}

		try {
			const deleted = await storageService.deleteFile(bucketName, relativePath);

			if (deleted) {
				console.log(
					`UploadService: Admin ${adminId} successfully deleted file ${bucketName}/${relativePath}`
				);
				return {
					success: true,
					message: `File ${relativePath} deleted successfully from ${bucketName}`
				};
			} else {
				return {
					success: false,
					message: `File ${relativePath} could not be deleted or was already missing`
				};
			}
		} catch (err) {
			if (err instanceof DegenUploadError) {
				throw err;
			}
			console.error(
				`UploadService: Error deleting file ${bucketName}/${relativePath} by admin ${adminId}:`,
				err
			);
			throw new DegenUploadError(
				`Failed to delete file ${relativePath}. Storage service error.`,
				500
			);
		}
	}
}

export const uploadService = new UploadService();
