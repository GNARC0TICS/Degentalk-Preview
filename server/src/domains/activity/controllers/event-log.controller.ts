import { Request, Response } from "express";
import { eventLogService } from "../services/event-log.service";
import { z } from "zod";
import { eventTypeEnum } from "@schema/system/event_logs";

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
      
      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error("Error creating event log:", error);
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to create event log"
      });
    }
  }

  /**
   * Get event logs with filtering and pagination
   */
  async getEventLogs(req: Request, res: Response) {
    try {
      const schema = z.object({
        userId: z.string().uuid().optional(),
        eventType: z.union([
          z.enum(eventTypeEnum.enumValues),
          z.array(z.enum(eventTypeEnum.enumValues))
        ]).optional(),
        startDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
        endDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
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
      
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error("Error getting event logs:", error);
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to get event logs"
      });
    }
  }

  /**
   * Get event logs for a specific user
   */
  async getUserEventLogs(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required"
        });
      }
      
      const schema = z.object({
        eventType: z.union([
          z.enum(eventTypeEnum.enumValues),
          z.array(z.enum(eventTypeEnum.enumValues))
        ]).optional(),
        startDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
        endDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
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
      
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error("Error getting user event logs:", error);
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to get user event logs"
      });
    }
  }

  /**
   * Get event log by ID
   */
  async getEventLogById(req: Request, res: Response) {
    try {
      const id = req.params.id;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Event log ID is required"
        });
      }
      
      const result = await eventLogService.getEventLogById(id);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Event log not found"
        });
      }
      
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error("Error getting event log:", error);
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to get event log"
      });
    }
  }

  /**
   * Delete event log by ID
   */
  async deleteEventLog(req: Request, res: Response) {
    try {
      const id = req.params.id;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Event log ID is required"
        });
      }
      
      const result = await eventLogService.deleteEventLog(id);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Event log not found or already deleted"
        });
      }
      
      return res.status(200).json({
        success: true,
        message: "Event log deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting event log:", error);
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete event log"
      });
    }
  }
}

export const eventLogController = new EventLogController(); 