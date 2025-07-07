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
			return res.status(401).json({
				error: 'Unauthorized: User ID missing. You gotta be logged in to flex that new PFP, anon.'
			});
		}

		if (!fileName || !fileType || fileSize === undefined || !uploadType) {
			return res.status(400).json({
				error:
					'Missing parameters: fileName, fileType, fileSize, and uploadType are required. Spill the tea, what are you uploading?'
			});
		}

		if (uploadType !== 'avatar' && uploadType !== 'banner') {
			return res
				.status(400)
				.json({ error: 'Invalid uploadType. Must be "avatar" or "banner". Choose your fighter!' });
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
		return res.status(200).json(result);
	} catch (error) {
		if (error instanceof DegenUploadError) {
			logger.warn(`DegenUploadError: ${error.message}`);
			return res.status(error.statusCode).json({ error: error.message });
		}
		logger.error('Error generating presigned URL:', error);
		return res.status(500).json({
			error:
				'Internal server error: Our server just rugged itself trying to get that URL. Try again later, maybe?'
		});
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
			return res.status(401).json({
				error:
					"Unauthorized: User ID missing. Can't confirm without knowing who you are, space cadet."
			});
		}

		if (!relativePath || !uploadType) {
			return res.status(400).json({
				error:
					'Missing parameters: relativePath and uploadType are required. Details, degen, details!'
			});
		}
		if (uploadType !== 'avatar' && uploadType !== 'banner') {
			return res
				.status(400)
				.json({ error: 'Invalid uploadType. Must be "avatar" or "banner". Pick one, chief.' });
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
			return res.status(400).json({
				error:
					confirmation.message ||
					'Upload confirmation failed for reasons... unknown and unknowable. Relative path or public URL missing.'
			});
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
			return res.status(500).json({
				error: `Upload confirmed, but we fumbled updating your profile. Your ${uploadType} is in the void, but not on your page. Our bad.`,
				details: profileUpdateResult.message
			});
		}

		// TODO: WebSocket event for 'profileUpdated' is handled within profileService.updateMediaUrl

		return res.status(200).json({
			success: true,
			message: `PFP/Banner confirmed and profile updated! You're now officially more degen. ${profileUpdateResult.message}`,
			publicUrl: confirmation.newPublicUrl
		});
	} catch (error) {
		if (error instanceof DegenUploadError) {
			logger.warn(`DegenUploadError in confirmUploadController: ${error.message}`);
			return res.status(error.statusCode).json({ error: error.message });
		}
		// Handle errors from profileService.updateMediaUrl if it throws standard Error
		if (error instanceof Error && error.message.includes('Failed to update')) {
			logger.error('Error updating profile media URL in controller:', error);
			return res
				.status(500)
				.json({ error: `Profile update failed after confirming upload: ${error.message}` });
		}
		logger.error('Unexpected error in confirmUploadController:', error);
		return res.status(500).json({
			error: 'Internal server error: The confirmation ritual failed. Server demons strike again.'
		});
	}
}
