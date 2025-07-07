// server/src/core/storage.service.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DegenUploadError } from '../domains/uploads/upload.service';
import { logger } from "../core/logger";

// --- Environment Variables ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
	console.error(
		'❌ STORAGE SERVICE: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. Storage operations will fail.'
	);
}
const supabase: SupabaseClient = createClient(supabaseUrl!, supabaseServiceKey!);

// --- Constants for Buckets ---
export const AVATARS_BUCKET = 'avatars';
export const BANNERS_BUCKET = 'banners';
export const STICKERS_BUCKET = 'stickers';

// --- Interface Definitions ---
export interface PresignedUploadOptions {
	fileType: string; // MIME type, e.g., 'image/png'
	fileSize: number; // bytes
	// We can add more options like 'upsert' if needed by different providers
}

export interface PresignedUrlInfo {
	uploadUrl: string; // URL for client to PUT/POST to
	relativePath: string; // Relative path to be stored in DB (e.g., 'users/123/avatar.png')
	// method?: 'PUT' | 'POST'; // Optional method, can be part of provider-specific logic if needed
}

export interface GetPresignedUploadUrlParams {
	bucket: string;
	relativePath: string; // The final relative path for the object in the bucket
	fileType: string; // MIME type
	fileSize: number; // bytes
}

export interface IStorageService {
	getPresignedUploadUrl(params: GetPresignedUploadUrlParams): Promise<PresignedUrlInfo>;

	getPublicUrl(bucket: string, relativePath: string): string;

	verifyFileExists(bucket: string, relativePath: string): Promise<boolean>;

	deleteFile(bucket: string, relativePath: string): Promise<boolean>;
}

// --- Supabase Storage Service Implementation ---
class SupabaseStorageService implements IStorageService {
	// Max file sizes specific to Supabase buckets (can be part of bucket config or here)
	private MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
	private MAX_BANNER_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
	private MAX_STICKER_STATIC_SIZE_BYTES = 2 * 1024 * 1024; // 2MB for static stickers
	private MAX_STICKER_ANIMATED_SIZE_BYTES = 8 * 1024 * 1024; // 8MB for animated stickers
	private MAX_STICKER_THUMBNAIL_SIZE_BYTES = 512 * 1024; // 512KB for thumbnails

	private ALLOWED_MIME_TYPES: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
	private ALLOWED_STICKER_STATIC_TYPES: string[] = ['image/webp', 'image/png'];
	private ALLOWED_STICKER_ANIMATED_TYPES: string[] = ['video/webm', 'application/json']; // WebM videos + Lottie JSON
	private ALLOWED_STICKER_THUMBNAIL_TYPES: string[] = ['image/webp', 'image/png'];

	/**
	 * Validate sticker files based on type and path structure
	 */
	private validateStickerFile(targetPath: string, fileType: string, fileSize: number): void {
		// Determine sticker file type from path
		let stickerFileType: 'static' | 'animated' | 'thumbnail' | 'pack_cover' | 'pack_preview';
		let maxSize: number;
		let allowedTypes: string[];

		if (targetPath.includes('/static.') || targetPath.endsWith('/static')) {
			stickerFileType = 'static';
			maxSize = this.MAX_STICKER_STATIC_SIZE_BYTES;
			allowedTypes = this.ALLOWED_STICKER_STATIC_TYPES;
		} else if (targetPath.includes('/animated.') || targetPath.endsWith('/animated')) {
			stickerFileType = 'animated';
			maxSize = this.MAX_STICKER_ANIMATED_SIZE_BYTES;
			allowedTypes = this.ALLOWED_STICKER_ANIMATED_TYPES;
		} else if (targetPath.includes('/thumbnail.') || targetPath.endsWith('/thumbnail')) {
			stickerFileType = 'thumbnail';
			maxSize = this.MAX_STICKER_THUMBNAIL_SIZE_BYTES;
			allowedTypes = this.ALLOWED_STICKER_THUMBNAIL_TYPES;
		} else if (targetPath.includes('/cover.') || targetPath.includes('/preview.')) {
			// Pack images
			stickerFileType = targetPath.includes('/cover.') ? 'pack_cover' : 'pack_preview';
			maxSize = this.MAX_STICKER_STATIC_SIZE_BYTES; // Same as static stickers
			allowedTypes = this.ALLOWED_STICKER_STATIC_TYPES;
		} else {
			throw new DegenUploadError(
				`Sticker path structure is sus: ${targetPath}. Expected formats like /stickers/123/static.webp or /packs/456/cover.webp`
			);
		}

		// Validate file type
		if (!allowedTypes.includes(fileType.toLowerCase())) {
			const typeList = allowedTypes.join(', ');
			throw new DegenUploadError(
				`File type ${fileType} not allowed for ${stickerFileType} stickers. Allowed: ${typeList}`
			);
		}

		// Validate file size
		if (fileSize > maxSize) {
			const actualSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
			const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
			throw new DegenUploadError(
				`${stickerFileType} sticker file too large: ${actualSizeMB}MB. Max allowed: ${maxSizeMB}MB`
			);
		}

		// Additional validation for Lottie files
		if (fileType === 'application/json' && stickerFileType === 'animated') {
			// Lottie files should have reasonable size limits
			if (fileSize > 1024 * 1024) {
				// 1MB limit for JSON
				throw new DegenUploadError(
					`Lottie animation file too large: ${(fileSize / (1024 * 1024)).toFixed(2)}MB. Max for JSON: 1MB`
				);
			}
		}
	}

	async getPresignedUploadUrl(params: GetPresignedUploadUrlParams): Promise<PresignedUrlInfo> {
		const { bucket, relativePath: targetPath, fileType, fileSize } = params;

		if (!supabaseUrl || !supabaseServiceKey) {
			throw new DegenUploadError(
				'Storage Service misconfig: Supabase creds not set. Tell the devs their .env is jacked.',
				500
			);
		}

		// Validate file type and size based on bucket and path
		if (bucket === STICKERS_BUCKET) {
			// Sticker-specific validation
			this.validateStickerFile(targetPath, fileType, fileSize);
		} else {
			// Original validation for avatars/banners
			if (!this.ALLOWED_MIME_TYPES.includes(fileType.toLowerCase())) {
				throw new DegenUploadError(
					`Yo, storage service says that file type (${fileType}) ain't cool. Stick to JPG, PNG, GIF, or WEBP.`
				);
			}

			// Validate file size based on bucket
			const maxSizeLimitBytes =
				bucket === AVATARS_BUCKET ? this.MAX_AVATAR_SIZE_BYTES : this.MAX_BANNER_SIZE_BYTES;
			const maxSizeLimitMB =
				bucket === AVATARS_BUCKET
					? this.MAX_AVATAR_SIZE_BYTES / (1024 * 1024)
					: this.MAX_BANNER_SIZE_BYTES / (1024 * 1024);

			if (fileSize > maxSizeLimitBytes) {
				const actualSizeMB = (fileSize / (1024 * 1024)).toFixed(1);
				throw new DegenUploadError(
					`That file for ${bucket} is a thicc boi (${actualSizeMB}MB)! Max is ${maxSizeLimitMB}MB. NGMI.`
				);
			}
		}

		try {
			// Using createSignedUploadUrl for TUS resumable uploads, which is generally robust.
			// Supabase client handles the details. Default expiry is 1 hour.
			const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(targetPath);

			if (error) {
				console.error(`Supabase createSignedUploadUrl error for ${bucket}/${targetPath}:`, error);
				throw new DegenUploadError(
					`Supabase ghosted us on the presigned URL for ${targetPath}. Sadge.`,
					503
				);
			}
			if (!data || !data.signedUrl) {
				console.error(`No signedUrl in Supabase response for ${bucket}/${targetPath}:`, data);
				throw new DegenUploadError(
					`Supabase returned empty handed for ${targetPath}. Probably a server rug.`,
					500
				);
			}

			return {
				uploadUrl: data.signedUrl,
				relativePath: targetPath // data.path from Supabase should match targetPath
				// method: 'PUT', // TUS usually uses PATCH, but signedUrl is for PUT. Client needs to know.
				// For createSignedUploadUrl, Supabase expects TUS protocol which involves POST then PATCH.
				// If client uses a simple PUT, it might not work as expected with TUS.
				// However, many clients just PUT to the signedUrl.
				// For simplicity, we can omit method, or specify if Supabase's createSignedUploadUrl has a fixed expectation.
				// The Supabase docs imply the client handles TUS protocol with this URL.
			};
		} catch (err) {
			if (err instanceof DegenUploadError) throw err;
			console.error(`Unexpected error in getPresignedUploadUrl for ${targetPath}:`, err);
			throw new DegenUploadError(
				`Server's brain farted while getting upload URL for ${targetPath}. Try again maybe?`,
				500
			);
		}
	}

	getPublicUrl(bucket: string, relativePath: string): string {
		if (!supabaseUrl) {
			console.error('Supabase URL not configured, cannot get public URL.');
			// Return a non-functional placeholder or throw, depending on desired strictness
			return `error://supabase_url_not_configured/${bucket}/${relativePath}`;
		}
		const { data } = supabase.storage.from(bucket).getPublicUrl(relativePath);

		if (!data || !data.publicUrl) {
			// This can happen if the object doesn't exist or bucket isn't public
			// For robustness, construct a predictable URL, assuming public access is set up
			console.warn(
				`Could not retrieve public URL directly for ${bucket}/${relativePath}. Constructing fallback.`
			);
			return `${supabaseUrl}/storage/v1/object/public/${bucket}/${relativePath}`;
		}
		return data.publicUrl;
	}

	async verifyFileExists(bucket: string, relativePath: string): Promise<boolean> {
		if (!supabaseUrl || !supabaseServiceKey) {
			console.error('Supabase creds not set, cannot verify file.');
			return false; // Or throw
		}
		try {
			// Listing with a search for the exact path.
			// Path is split because .list() takes a folderPath and a search pattern for file names within it.
			const lastSlash = relativePath.lastIndexOf('/');
			const folderPath = lastSlash > -1 ? relativePath.substring(0, lastSlash) : '';
			const fileName = lastSlash > -1 ? relativePath.substring(lastSlash + 1) : relativePath;

			const { data, error } = await supabase.storage.from(bucket).list(folderPath, {
				limit: 1,
				search: fileName
			});

			if (error) {
				console.error(`Error verifying file ${bucket}/${relativePath}:`, error);
				return false; // Or throw a DegenUploadError
			}
			return data !== null && data.length > 0 && data[0].name === fileName;
		} catch (err) {
			console.error(`Unexpected error verifying file ${bucket}/${relativePath}:`, err);
			return false; // Or throw
		}
	}

	/**
	 * Delete a file from storage (for admin asset management)
	 */
	async deleteFile(bucket: string, relativePath: string): Promise<boolean> {
		if (!supabaseUrl || !supabaseServiceKey) {
			console.error('Supabase creds not set, cannot delete file.');
			throw new DegenUploadError(
				'Storage service misconfigured for file deletion. Check your environment setup.',
				500
			);
		}

		try {
			const { error } = await supabase.storage.from(bucket).remove([relativePath]);

			if (error) {
				console.error(`Error deleting file ${bucket}/${relativePath}:`, error);
				throw new DegenUploadError(
					`Failed to delete file ${relativePath} from ${bucket}. Storage service error: ${error.message}`,
					500
				);
			}

			// Verify deletion
			const stillExists = await this.verifyFileExists(bucket, relativePath);
			if (stillExists) {
				console.warn(`File ${bucket}/${relativePath} still exists after deletion attempt`);
				return false;
			}

			return true;
		} catch (err) {
			if (err instanceof DegenUploadError) throw err;
			console.error(`Unexpected error deleting file ${bucket}/${relativePath}:`, err);
			throw new DegenUploadError(
				`Something went wrong deleting ${relativePath}. Storage service might be having issues.`,
				500
			);
		}
	}
}

// Export a singleton instance
export const storageService: IStorageService = new SupabaseStorageService();

// --- Stub for Google Cloud Storage Service (Bonus) ---
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class GoogleCloudStorageService implements IStorageService {
	constructor() {
		// Initialize GCS client here using GOOGLE_APPLICATION_CREDENTIALS or other auth
		// eslint-disable-next-line no-console
		console.warn(
			'GCS_STORAGE_SERVICE: Initialized (STUB). Implement actual GCS logic if switching providers.'
		);
	}

	async getPresignedUploadUrl(params: GetPresignedUploadUrlParams): Promise<PresignedUrlInfo> {
		const { bucket, relativePath, fileType, fileSize } = params;
		// TODO: Implement GCS presigned URL generation
		// Example: const [url] = await storage.bucket(bucket).file(relativePath).getSignedUrl({ action: 'write', expires: '03-17-2025', contentType: fileType });
		// eslint-disable-next-line no-console
		logger.info(`GCS_STORAGE_SERVICE: STUB - getPresignedUploadUrl for ${bucket}/${relativePath} (type: ${fileType}, size: ${fileSize})`);
		if (bucket === 'gcs_error_test_bucket') {
			// For testing error propagation
			throw new DegenUploadError('GCS is feeling moody today, no URLs for you.', 503);
		}
		return {
			uploadUrl: `gcs-presigned-url-for-${relativePath}`,
			relativePath: relativePath
			// method: 'PUT', // GCS presigned URLs for write are typically PUT
		};
	}

	getPublicUrl(bucket: string, relativePath: string): string {
		// TODO: Implement GCS public URL construction
		// Example: return `https://storage.googleapis.com/${bucket}/${relativePath}`;
		// eslint-disable-next-line no-console
		logger.info(`GCS_STORAGE_SERVICE: STUB - getPublicUrl for ${bucket}/${relativePath}`);
		return `gcs-public-url-for-${bucket}/${relativePath}`;
	}

	async verifyFileExists(bucket: string, relativePath: string): Promise<boolean> {
		// TODO: Implement GCS file existence check
		// Example: const [exists] = await storage.bucket(bucket).file(relativePath).exists();
		// eslint-disable-next-line no-console
		logger.info(`GCS_STORAGE_SERVICE: STUB - verifyFileExists for ${bucket}/${relativePath}`);
		if (relativePath.includes('nonexistent')) return false; // For testing
		return true;
	}

	// async deleteFile(bucket: string, relativePath: string): Promise<void> {
	//   // TODO: Implement GCS file deletion
	//   console.log(`GCS_STORAGE_SERVICE: STUB - deleteFile for ${bucket}/${relativePath}`);
	// }
}

// To use GoogleCloudStorageService, you would change the export:
// export const storageService: IStorageService = new GoogleCloudStorageService();
// Or use a factory pattern based on environment configuration.
