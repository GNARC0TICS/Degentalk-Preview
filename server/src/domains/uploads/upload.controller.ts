import { userService } from '@server/src/core/services/user.service';
import type { Request, Response } from 'express';
// Use type-only imports for types
import {
	uploadService,
	DegenUploadError,
	type CreatePresignedUrlServiceParams, // Updated type name from upload.service.ts
	type UploadType,
	type ConfirmUploadServiceParams, // Updated type name from upload.service.ts
	// type PresignedUploadServiceResult, // Removed as it's implicitly handled by service return types
	type UploadConfirmationServiceResult // For response of confirmUploadController
} from './upload.service';
import { profileService, type ProfileMediaUpdateParams } from '../profile/profile.service';
import { logger } from "../../core/logger";
import { sendSuccessResponse, sendErrorResponse } from '@server/src/core/utils/transformer.helpers';

// The `authenticate` middleware augments Express.Request to include `user`.
// So, `req.user` should be available and typed correctly if `requireAuth` middleware is used.
// We can define AuthenticatedRequest to ensure the body is typed correctly.
// The `req.user` type comes from the global Express namespace augmentation in `authenticate.ts`.
interface AuthenticatedRequest extends Request {
	// user property is now inherited from the augmented Express.Request type
	body: {
		fileName: string;
		fileType: string; // MIME type
		fileSize: number; // in bytes
		uploadType: UploadType; // 'avatar' | 'banner'
	};
}

export async function createPresignedUploadUrlController(req: AuthenticatedRequest, res: Response) {
	try {
		const { fileName, fileType, fileSize, uploadType } = req.body;

		// Ensure user is authenticated and userId is available
		const userId = userService.getUserFromRequest(req)?.id;
		if (!userId) {
			return sendErrorResponse(res, 'Unauthorized: User ID missing. You gotta be logged in to flex that new PFP, anon.', 401);
		}

		if (!fileName || !fileType || fileSize === undefined || !uploadType) {
			return sendErrorResponse(res, 'Missing parameters: fileName, fileType, fileSize, and uploadType are required. Spill the tea, what are you uploading?', 400);
		}

		if (uploadType !== 'avatar' && uploadType !== 'banner') {
			return sendErrorResponse(res, 'Invalid uploadType. Must be "avatar" or "banner". Choose your fighter!', 400);
		}

		const params: CreatePresignedUrlServiceParams = {
			// Updated type name
			userId: String(userId), // Convert number to string for the service
			fileName,
			fileType,
			fileSize,
			uploadType
		};

		const result = await uploadService.createPresignedUploadUrl(params);
		return sendSuccessResponse(res, result);
	} catch (error) {
		if (error instanceof DegenUploadError) {
			logger.warn(`DegenUploadError: ${error.message}`);
			return sendErrorResponse(res, error.message, error.statusCode);
		}
		logger.error('Error generating presigned URL:', error);
		return sendErrorResponse(res, 'Internal server error: Our server just rugged itself trying to get that URL. Try again later, maybe?', 500);
	}
}

// Relies on global Express.User augmentation from authenticate.ts for req.user typing
interface ConfirmUploadAuthenticatedRequest extends Request {
	// user property is inherited from the augmented Express.Request type
	body: {
		relativePath: string; // Changed from supabasePath
		uploadType: UploadType;
	};
}

export async function confirmUploadController(
	req: ConfirmUploadAuthenticatedRequest,
	res: Response
) {
	try {
		const { relativePath, uploadType } = req.body; // Changed from supabasePath
		const userId = userService.getUserFromRequest(req)?.id;

		if (!userId) {
			return sendErrorResponse(res, "Unauthorized: User ID missing. Can't confirm without knowing who you are, space cadet.", 401);
		}

		if (!relativePath || !uploadType) {
			return sendErrorResponse(res, 'Missing parameters: relativePath and uploadType are required. Details, degen, details!', 400);
		}
		if (uploadType !== 'avatar' && uploadType !== 'banner') {
			return sendErrorResponse(res, 'Invalid uploadType. Must be "avatar" or "banner". Pick one, chief.', 400);
		}

		const confirmServiceParams: ConfirmUploadServiceParams = { relativePath, uploadType }; // Updated type name
		// uploadService.confirmUpload expects userId as string
		const confirmation: UploadConfirmationServiceResult = await uploadService.confirmUpload(
			String(userId),
			confirmServiceParams
		);

		if (!confirmation.success || !confirmation.relativePath || !confirmation.newPublicUrl) {
			// DegenUploadError from confirmUpload should have been caught by the generic catch block.
			// This handles cases where success is false without an error being thrown by the service,
			// or if essential data for profile update is missing.
			return sendErrorResponse(res, confirmation.message || 'Upload confirmation failed for reasons... unknown and unknowable. Relative path or public URL missing.', 400);
		}

		// Now update the user's profile with the new media's relative path
		const mediaUpdateParams: ProfileMediaUpdateParams = {
			userId: userId, // profileService.updateMediaUrl expects userId as number
			mediaType: uploadType,
			relativePath: confirmation.relativePath // Store relativePath in DB
		};

		const profileUpdateResult = await profileService.updateMediaUrl(mediaUpdateParams);

		if (!profileUpdateResult.success) {
			// If profile update failed, this is a server-side issue.
			// The file is uploaded and confirmed in storage, but DB link failed.
			// This might require a retry mechanism or manual intervention in a real system.
			logger.error(`Failed to update profile for user ${userId} after upload confirmation: ${profileUpdateResult.message}`);
			return sendErrorResponse(res, `Upload confirmed, but we fumbled updating your profile. Your ${uploadType} is in the void, but not on your page. Our bad.`, 500);
		}

		// TODO: WebSocket event for 'profileUpdated' is handled within profileService.updateMediaUrl

		return sendSuccessResponse(res, {
			success: true,
			message: `PFP/Banner confirmed and profile updated! You're now officially more degen. ${profileUpdateResult.message}`,
			publicUrl: confirmation.newPublicUrl
		});
	} catch (error) {
		if (error instanceof DegenUploadError) {
			logger.warn(`DegenUploadError in confirmUploadController: ${error.message}`);
			return sendErrorResponse(res, error.message, error.statusCode);
		}
		// Handle errors from profileService.updateMediaUrl if it throws standard Error
		if (error instanceof Error && error.message.includes('Failed to update')) {
			logger.error('Error updating profile media URL in controller:', error);
			return sendErrorResponse(res, `Profile update failed after confirming upload: ${error.message}`, 500);
		}
		logger.error('Unexpected error in confirmUploadController:', error);
		return sendErrorResponse(res, 'Internal server error: The confirmation ritual failed. Server demons strike again.', 500);
	}
}
