/**
 * Admin Analytics Validators
 * 
 * Zod validation schemas for analytics query parameters.
 */

import { z } from 'zod';

// Schema for time period validation
const periodAndDateValidation = z.object({}).refine(data => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) < new Date(data.endDate);
  }
  return true;
}, { message: 'Start date must be before end date.' });

// Schema for time period selection
export const AnalyticsPeriodSchema = z.object({
  period: z.enum(['today', '7d', '30d', '90d', 'all']).default('30d').optional(),
  startDate: z.string().datetime({ message: 'Start date must be a valid ISO datetime string.' }).optional(),
  endDate: z.string().datetime({ message: 'End date must be a valid ISO datetime string.' }).optional(),
}).and(periodAndDateValidation);

// Schema for chart granularity
export const AnalyticsGranularitySchema = z.object({
  granularity: z.enum(['daily', 'weekly', 'monthly']).default('daily').optional(),
});

// Combined schema for typical analytics queries
export const AnalyticsQuerySchema = z.object({
  period: z.enum(['today', '7d', '30d', '90d', 'all']).default('30d').optional(),
  startDate: z.string().datetime({ message: 'Start date must be a valid ISO datetime string.' }).optional(),
  endDate: z.string().datetime({ message: 'End date must be a valid ISO datetime string.' }).optional(),
  granularity: z.enum(['daily', 'weekly', 'monthly']).default('daily').optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10).optional(), // For top N lists
}).and(periodAndDateValidation);

export type AnalyticsPeriodInput = z.infer<typeof AnalyticsPeriodSchema>;
export type AnalyticsGranularityInput = z.infer<typeof AnalyticsGranularitySchema>;
export type AnalyticsQueryInput = z.infer<typeof AnalyticsQuerySchema>;
