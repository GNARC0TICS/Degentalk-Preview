import { userService } from '@core/services/user.service';
import type { Request, Response } from 'express';
import type { EntityId } from '@shared/types/ids';
import { z } from 'zod';
import { insertAnnouncementSchema } from '@schema';
import {
	getActiveAnnouncements,
	getAllAnnouncements,
	getAnnouncementById,
	createAnnouncement,
	updateAnnouncement,
	deactivateAnnouncement
} from './announcements.service';
import { logger } from '@core/logger';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';

// Removed redundant getUserId helper - use userService.getUserFromRequest(req)?.id directly

/**
 * Controller for fetching active announcements (public endpoint)
 */
export async function getAnnouncementsController(req: Request, res: Response) {
	try {
		const isTicker = req.query.ticker === 'true';
		const userRole = userService.getUserFromRequest(req)?.role || 'guest';
		const userId = userService.getUserFromRequest(req);

		const announcements = await getActiveAnnouncements({
			tickerOnly: isTicker,
			userRole,
			userId,
			limit: 10
		});

		return sendSuccessResponse(res, announcements);
	} catch (error) {
		logger.error('Error fetching announcements:', error);
		return sendErrorResponse(res, 'Internal server error', 400);
	}
}

/**
 * Controller for fetching all announcements (admin endpoint)
 */
export async function getAllAnnouncementsController(req: Request, res: Response) {
	try {
		const announcements = await getAllAnnouncements();
		return sendSuccessResponse(res, announcements);
	} catch (error) {
		logger.error('Error fetching all announcements:', error);
		return sendErrorResponse(res, 'Internal server error', 400);
	}
}

/**
 * Controller for getting a single announcement (admin endpoint)
 */
export async function getAnnouncementByIdController(req: Request, res: Response) {
	try {
		const id = req.params.id as EntityId;
		if (isNaN(id)) {
			return sendErrorResponse(res, 'Invalid announcement ID', 400);
		}

		const announcement = await getAnnouncementById(id);

		if (!announcement) {
			return sendErrorResponse(res, 'Announcement not found', 404);
		}

		return sendSuccessResponse(res, announcement);
	} catch (error) {
		logger.error('Error fetching announcement:', error);
		return sendErrorResponse(res, 'Internal server error', 400);
	}
}

/**
 * Controller for creating a new announcement (admin endpoint)
 */
export async function createAnnouncementController(req: Request, res: Response) {
	try {
		if (!userService.getUserFromRequest(req)) {
			return sendErrorResponse(res, 'Unauthorized', 401);
		}

		// Validate input against schema
		const validatedData = insertAnnouncementSchema.parse({
			...req.body,
			createdBy: userService.getUserFromRequest(req)
		});

		const newAnnouncement = await createAnnouncement(validatedData);
		return sendSuccessResponse(res, newAnnouncement);
	} catch (error: any) {
		if (error.name === 'ZodError') {
			return sendErrorResponse(res, 'Invalid announcement data', 400);
		}
		logger.error('Error creating announcement:', error);
		return sendErrorResponse(res, 'Internal server error', 400);
	}
}

/**
 * Controller for updating an announcement (admin endpoint)
 */
export async function updateAnnouncementController(req: Request, res: Response) {
	try {
		const id = req.params.id as EntityId;
		if (isNaN(id)) {
			return sendErrorResponse(res, 'Invalid announcement ID', 400);
		}

		// First check if the announcement exists
		const existingAnnouncement = await getAnnouncementById(id);

		if (!existingAnnouncement) {
			return sendErrorResponse(res, 'Announcement not found', 404);
		}

		// Update the announcement
		const updatedAnnouncement = await updateAnnouncement(id, req.body);

		return sendSuccessResponse(res, updatedAnnouncement);
	} catch (error) {
		logger.error('Error updating announcement:', error);
		return sendErrorResponse(res, 'Internal server error', 400);
	}
}

/**
 * Controller for deactivating an announcement (admin endpoint)
 */
export async function deactivateAnnouncementController(req: Request, res: Response) {
	try {
		const id = req.params.id as EntityId;
		if (isNaN(id)) {
			return sendErrorResponse(res, 'Invalid announcement ID', 400);
		}

		const deactivatedAnnouncement = await deactivateAnnouncement(id);

		if (!deactivatedAnnouncement) {
			return sendErrorResponse(res, 'Announcement not found', 404);
		}

		return sendSuccessResponse(res, { message: 'Announcement deactivated successfully' });
	} catch (error) {
		logger.error('Error deactivating announcement:', error);
		return sendErrorResponse(res, 'Internal server error', 400);
	}
}
