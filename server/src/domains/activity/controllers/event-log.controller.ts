import type { Request, Response } from 'express';
import { eventLogService } from '../services/event-log.service';
import { z } from 'zod';
import { eventTypeEnum } from '@schema/system/event_logs';
import { logger } from "../../../core/logger";
import { sendSuccessResponse, sendErrorResponse } from '@server/src/core/utils/transformer.helpers';

/**
 * Controller for event log endpoints
 */
export class EventLogController {
	/**
	 * Create a new event log entry
	 */
	async createEventLog(req: Request, res: Response) {
		try {
			const schema = z.object({
				userId: z.string().uuid(),
				eventType: z.enum(eventTypeEnum.enumValues),
				relatedId: z.string().uuid().optional(),
				meta: z.record(z.any()).default({})
			});

			const validatedData = schema.parse(req.body);
			const result = await eventLogService.createEventLog(validatedData);

			return sendSuccessResponse(res, {
				success: true,
				data: result
			}, 201);
		} catch (error) {
			logger.error('Error creating event log:', error);
			return sendErrorResponse(res, error instanceof Error ? error.message : 'Failed to create event log', 400);
		}
	}

	/**
	 * Get event logs with filtering and pagination
	 */
	async getEventLogs(req: Request, res: Response) {
		try {
			const schema = z.object({
				userId: z.string().uuid().optional(),
				eventType: z
					.union([z.enum(eventTypeEnum.enumValues), z.array(z.enum(eventTypeEnum.enumValues))])
					.optional(),
				startDate: z
					.string()
					.datetime()
					.optional()
					.transform((val) => (val ? new Date(val) : undefined)),
				endDate: z
					.string()
					.datetime()
					.optional()
					.transform((val) => (val ? new Date(val) : undefined)),
				limit: z.number().int().positive().default(10),
				offset: z.number().int().nonnegative().default(0)
			});

			const query = {
				...req.query,
				limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
				offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
			};

			const validatedFilters = schema.parse(query);

			// If userId is provided in params, use that instead of query
			if (req.params.userId) {
				validatedFilters.userId = req.params.userId;
			}

			const result = await eventLogService.getAllEventLogs(validatedFilters);

			return sendSuccessResponse(res, {
				success: true,
				data: result
			});
		} catch (error) {
			logger.error('Error getting event logs:', error);
			return sendErrorResponse(res, error instanceof Error ? error.message : 'Failed to get event logs', 400);
		}
	}

	/**
	 * Get event logs for a specific user
	 */
	async getUserEventLogs(req: Request, res: Response) {
		try {
			const userId = req.params.userId;

			if (!userId) {
				return sendErrorResponse(res, 'User ID is required', 400);
			}

			const schema = z.object({
				eventType: z
					.union([z.enum(eventTypeEnum.enumValues), z.array(z.enum(eventTypeEnum.enumValues))])
					.optional(),
				startDate: z
					.string()
					.datetime()
					.optional()
					.transform((val) => (val ? new Date(val) : undefined)),
				endDate: z
					.string()
					.datetime()
					.optional()
					.transform((val) => (val ? new Date(val) : undefined)),
				limit: z.number().int().positive().default(10),
				offset: z.number().int().nonnegative().default(0)
			});

			const query = {
				...req.query,
				limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
				offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
			};

			const validatedFilters = schema.parse(query);

			const result = await eventLogService.getUserEventLogs({
				...validatedFilters,
				userId
			});

			return sendSuccessResponse(res, {
				success: true,
				data: result
			});
		} catch (error) {
			logger.error('Error getting user event logs:', error);
			return sendErrorResponse(res, error instanceof Error ? error.message : 'Failed to get user event logs', 400);
		}
	}

	/**
	 * Get event log by ID
	 */
	async getEventLogById(req: Request, res: Response) {
		try {
			const id = req.params.id;

			if (!id) {
				return sendErrorResponse(res, 'Event log ID is required', 400);
			}

			const result = await eventLogService.getEventLogById(id);

			if (!result) {
				return sendErrorResponse(res, 'Event log not found', 404);
			}

			return sendSuccessResponse(res, {
				success: true,
				data: result
			});
		} catch (error) {
			logger.error('Error getting event log:', error);
			return sendErrorResponse(res, error instanceof Error ? error.message : 'Failed to get event log', 400);
		}
	}

	/**
	 * Delete event log by ID
	 */
	async deleteEventLog(req: Request, res: Response) {
		try {
			const id = req.params.id;

			if (!id) {
				return sendErrorResponse(res, 'Event log ID is required', 400);
			}

			const result = await eventLogService.deleteEventLog(id);

			if (!result) {
				return sendErrorResponse(res, 'Event log not found or already deleted', 404);
			}

			return sendSuccessResponse(res, {
				success: true,
				message: 'Event log deleted successfully'
			});
		} catch (error) {
			logger.error('Error deleting event log:', error);
			return sendErrorResponse(res, error instanceof Error ? error.message : 'Failed to delete event log', 400);
		}
	}
}

export const eventLogController = new EventLogController();
