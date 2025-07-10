import { userService } from '@core/services/user.service';
import type { Request, Response } from 'express';
import {
	uploadService,
	DegenUploadError,
	type CreatePresignedUrlServiceParams,
	type UploadType,
	type ConfirmUploadServiceParams
} from './upload.service';
import { logger } from "../../core/logger";
import { sendErrorResponse, sendTransformedResponse } from '@core/utils/transformer.helpers';
import { UploadTransformer } from './upload.transformer';
import type { UserId } from '@shared/types/ids';

interface AuthenticatedRequest extends Request {
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
		const userId = userService.getUserFromRequest(req)?.id;

		if (!userId) {
			return sendErrorResponse(res, 'Unauthorized: User ID missing.', 401);
		}

		if (!fileName || !fileType || fileSize === undefined || !uploadType) {
			return sendErrorResponse(res, 'Missing parameters: fileName, fileType, fileSize, and uploadType are required.', 400);
		}

		if (uploadType !== 'avatar' && uploadType !== 'banner') {
			return sendErrorResponse(res, 'Invalid uploadType. Must be "avatar" or "banner".', 400);
		}

		const params: CreatePresignedUrlServiceParams = {
			userId: userId as UserId,
			fileName,
			fileType,
			fileSize,
			uploadType
		};

		const result = await uploadService.createPresignedUploadUrl(params);
		
		if (!result.success || !result.presignedUrlInfo) {
			return sendErrorResponse(res, result.message, 400);
		}

		return sendTransformedResponse(res, result, UploadTransformer.toPresignedUrl);

	} catch (error) {
		if (error instanceof DegenUploadError) {
			logger.warn(`DegenUploadError: ${error.message}`);
			return sendErrorResponse(res, error.message, error.statusCode);
		}
		logger.error('Error generating presigned URL:', error);
		return sendErrorResponse(res, 'Internal server error.', 500);
	}
}

interface ConfirmUploadAuthenticatedRequest extends Request {
	body: {
		relativePath: string;
		uploadType: UploadType;
	};
}

export async function confirmUploadController(
	req: ConfirmUploadAuthenticatedRequest,
	res: Response
) {
	try {
		const { relativePath, uploadType } = req.body;
		const userId = userService.getUserFromRequest(req)?.id;

		if (!userId) {
			return sendErrorResponse(res, "Unauthorized: User ID missing.", 401);
		}

		if (!relativePath || !uploadType) {
			return sendErrorResponse(res, 'Missing parameters: relativePath and uploadType are required.', 400);
		}
		if (uploadType !== 'avatar' && uploadType !== 'banner') {
			return sendErrorResponse(res, 'Invalid uploadType. Must be "avatar" or "banner".', 400);
		}

		const confirmServiceParams: ConfirmUploadServiceParams = { relativePath, uploadType };
		const confirmation = await uploadService.confirmUpload(
			userId as UserId,
			confirmServiceParams
		);

		if (!confirmation.success) {
			return sendErrorResponse(res, confirmation.message, 400);
		}

		return sendTransformedResponse(res, confirmation, UploadTransformer.toUploadConfirmation);
		
	} catch (error) {
		if (error instanceof DegenUploadError) {
			logger.warn(`DegenUploadError in confirmUploadController: ${error.message}`);
			return sendErrorResponse(res, error.message, error.statusCode);
		}
		logger.error('Unexpected error in confirmUploadController:', error);
		return sendErrorResponse(res, 'Internal server error.', 500);
	}
}
