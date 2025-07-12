/**
 * Upload Transformer
 *
 * This file is responsible for transforming upload-related data into
 * standardized API response formats.
 */

import type { PresignedUploadResult, UploadConfirmationResult } from './upload.service';

export class UploadTransformer {
	/**
	 * Transforms the result of a presigned URL request.
	 */
	static toPresignedUrl(data: PresignedUploadResult) {
		return {
			success: data.success,
			message: data.message,
			...data.presignedUrlInfo
		};
	}

	/**
	 * Transforms the result of an upload confirmation.
	 */
	static toUploadConfirmation(data: UploadConfirmationResult) {
		return {
			success: data.success,
			message: data.message,
			publicUrl: data.newPublicUrl
		};
	}
} 