import { z } from 'zod';

/**
 * Standard API Response Schema
 * Matches the backend's consistent response format
 */
export const StandardApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
    errors: z
      .array(
        z.object({
          message: z.string(),
          code: z.string().optional(),
          field: z.string().optional(),
          details: z.record(z.unknown()).optional()
        })
      )
      .optional(),
    meta: z
      .object({
        timestamp: z.string(),
        requestId: z.string().optional(),
        pagination: z
          .object({
            page: z.number(),
            limit: z.number(),
            total: z.number(),
            totalPages: z.number(),
            hasNext: z.boolean(),
            hasPrev: z.boolean()
          })
          .optional(),
        _timing: z
          .object({
            duration: z.number(),
            requestId: z.string().optional(),
            cacheHit: z.boolean().optional()
          })
          .optional()
      })
      .optional()
  });

/**
 * Paginated Response Schema
 */
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean()
    })
  });

// Type helpers
export type StandardApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  errors?: Array<{
    message: string;
    code?: string;
    field?: string;
    details?: Record<string, unknown>;
  }>;
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
};

export type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};