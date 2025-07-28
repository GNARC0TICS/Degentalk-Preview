import { z } from 'zod';

/**
 * API Success Response Schema
 * Matches the shared API types from @shared/types/api.types
 */
export const ApiSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().optional(),
    timestamp: z.string(),
    meta: z
      .union([
        z.object({
          page: z.number(),
          limit: z.number(),
          total: z.number(),
          totalPages: z.number(),
          hasNext: z.boolean(),
          hasPrev: z.boolean()
        }),
        z.object({
          appliedFilters: z.record(z.unknown()),
          availableFilters: z.array(z.string()),
          resultCount: z.number()
        })
      ])
      .optional()
  });

/**
 * API Error Response Schema
 */
export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
    field: z.string().optional()
  }),
  timestamp: z.string()
});

/**
 * API Response Schema (Union of Success and Error)
 */
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.union([ApiSuccessSchema(dataSchema), ApiErrorSchema]);

/**
 * Pagination Metadata Schema
 */
export const PaginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean()
});

/**
 * Filter Metadata Schema
 */
export const FilterMetaSchema = z.object({
  appliedFilters: z.record(z.unknown()),
  availableFilters: z.array(z.string()),
  resultCount: z.number()
});