/**
 * UI Configuration Validation Schemas
 * 
 * Zod schemas for validating API requests and responses
 */

import { z } from 'zod';

// ==================== BASE SCHEMAS ====================

/**
 * Pagination schema for list endpoints
 */
export const PaginationSchema = z.object({
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(50),
    sortBy: z.string().optional().default('displayOrder'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc')
});

/**
 * Quote filtering schema
 */
export const QuoteFiltersSchema = z.object({
    type: z.union([z.string(), z.array(z.string())]).optional().transform((val) =>
        typeof val === 'string' ? [val] : val
    ),
    tags: z.union([z.string(), z.array(z.string())]).optional().transform((val) =>
        typeof val === 'string' ? [val] : val
    ),
    intensity: z.union([z.coerce.number(), z.array(z.coerce.number())]).optional().transform((val) =>
        typeof val === 'number' ? [val] : val
    ),
    theme: z.union([z.string(), z.array(z.string())]).optional().transform((val) =>
        typeof val === 'string' ? [val] : val
    ),
    targetAudience: z.union([z.string(), z.array(z.string())]).optional().transform((val) =>
        typeof val === 'string' ? [val] : val
    ),
    isActive: z.coerce.boolean().optional(),
    searchTerm: z.string().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional()
});

// ==================== QUOTE SCHEMAS ====================

/**
 * Base quote data schema (for creation)
 */
export const CreateQuoteSchema = z.object({
    type: z.string().min(1).max(50),
    headline: z.string().min(1).max(500),
    subheader: z.string().max(500).optional(),
    tags: z.array(z.string()).optional(),
    intensity: z.number().min(1).max(5).optional().default(1),
    theme: z.string().max(50).optional(),
    targetAudience: z.string().max(50).optional(),
    isActive: z.boolean().optional().default(true),
    displayOrder: z.number().optional().default(0),
    weight: z.number().min(1).optional().default(1),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    variant: z.string().max(50).optional(),
    metadata: z.record(z.any()).optional().default({})
});

/**
 * Quote update schema (includes ID)
 */
export const UpdateQuoteSchema = CreateQuoteSchema.partial().extend({
    id: z.string().uuid()
});

/**
 * Quote reordering schema
 */
export const ReorderQuotesSchema = z.object({
    quoteOrders: z.array(z.object({
        id: z.string().uuid(),
        displayOrder: z.number()
    })).min(1)
});

// ==================== COLLECTION SCHEMAS ====================

/**
 * Collection creation schema
 */
export const CreateCollectionSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    type: z.string().min(1).max(50),
    isActive: z.boolean().optional().default(true),
    priority: z.number().optional().default(0),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    config: z.record(z.any()).optional().default({}),
    quoteIds: z.array(z.string().uuid()).optional()
});

/**
 * Collection update schema (includes ID)
 */
export const UpdateCollectionSchema = CreateCollectionSchema.partial().extend({
    id: z.string().uuid()
});

// ==================== ANALYTICS SCHEMAS ====================

/**
 * Event tracking schema
 */
export const TrackEventSchema = z.object({
    quoteId: z.string().uuid(),
    eventType: z.string().min(1).max(50),
    context: z.object({
        userId: z.string().uuid().optional(),
        sessionId: z.string().optional(),
        page: z.string().optional(),
        position: z.string().optional(),
        userAgent: z.string().optional(),
        metadata: z.record(z.any()).optional()
    }).optional().default({})
});

/**
 * Analytics request schema
 */
export const AnalyticsRequestSchema = z.object({
    quoteId: z.string().uuid(),
    eventType: z.string().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    page: z.string().optional(),
    position: z.string().optional()
});

// ==================== BULK OPERATION SCHEMAS ====================

/**
 * Bulk quote operation schema
 */
export const BulkQuoteOperationSchema = z.object({
    action: z.enum(['activate', 'deactivate', 'delete', 'update_tags', 'update_intensity']),
    quoteIds: z.array(z.string().uuid()).min(1),
    data: CreateQuoteSchema.partial().optional()
});

// ==================== IMPORT/EXPORT SCHEMAS ====================

/**
 * Import quotes schema
 */
export const ImportQuotesSchema = z.object({
    quotes: z.array(CreateQuoteSchema).min(1),
    overwriteExisting: z.boolean().optional().default(false)
});

/**
 * Export quotes schema
 */
export const ExportQuotesSchema = z.object({
    filters: QuoteFiltersSchema.optional(),
    format: z.enum(['json', 'csv']).optional().default('json'),
    includeAnalytics: z.boolean().optional().default(false)
});

// ==================== HELPER VALIDATION FUNCTIONS ====================

/**
 * Validate quote type against allowed values
 */
export const validateQuoteType = (type: string): boolean => {
    const allowedTypes = ['hero', 'footer', 'toast', 'loading', 'error', 'success', 'modal', 'banner'];
    return allowedTypes.includes(type);
};

/**
 * Validate collection type against allowed values
 */
export const validateCollectionType = (type: string): boolean => {
    const allowedTypes = ['seasonal', 'mood', 'event', 'ab_test', 'campaign', 'theme'];
    return allowedTypes.includes(type);
};

/**
 * Validate event type against allowed values
 */
export const validateEventType = (eventType: string): boolean => {
    const allowedEvents = ['impression', 'click', 'share', 'favorite', 'dismiss', 'hover'];
    return allowedEvents.includes(eventType);
};

// ==================== REFINEMENT SCHEMAS ====================

/**
 * Enhanced quote schema with business logic validation
 */
export const EnhancedCreateQuoteSchema = CreateQuoteSchema.refine(
    (data) => {
        // Validate quote type
        if (data.type && !validateQuoteType(data.type)) {
            return false;
        }

        // Ensure end date is after start date
        if (data.startDate && data.endDate && data.endDate <= data.startDate) {
            return false;
        }

        // Validate intensity range
        if (data.intensity && (data.intensity < 1 || data.intensity > 5)) {
            return false;
        }

        return true;
    },
    {
        message: "Quote validation failed: invalid type, date range, or intensity"
    }
);

/**
 * Enhanced collection schema with business logic validation
 */
export const EnhancedCreateCollectionSchema = CreateCollectionSchema.refine(
    (data) => {
        // Validate collection type
        if (data.type && !validateCollectionType(data.type)) {
            return false;
        }

        // Ensure end date is after start date
        if (data.startDate && data.endDate && data.endDate <= data.startDate) {
            return false;
        }

        return true;
    },
    {
        message: "Collection validation failed: invalid type or date range"
    }
);

/**
 * Enhanced tracking schema with business logic validation
 */
export const EnhancedTrackEventSchema = TrackEventSchema.refine(
    (data) => {
        // Validate event type
        if (!validateEventType(data.eventType)) {
            return false;
        }

        return true;
    },
    {
        message: "Event validation failed: invalid event type"
    }
);

// ==================== TYPE EXPORTS ====================

// Export inferred types for use in other files
export type CreateQuoteRequest = z.infer<typeof CreateQuoteSchema>;
export type UpdateQuoteRequest = z.infer<typeof UpdateQuoteSchema>;
export type QuoteFilters = z.infer<typeof QuoteFiltersSchema>;
export type PaginationOptions = z.infer<typeof PaginationSchema>;
export type CreateCollectionRequest = z.infer<typeof CreateCollectionSchema>;
export type UpdateCollectionRequest = z.infer<typeof UpdateCollectionSchema>;
export type ReorderQuotesRequest = z.infer<typeof ReorderQuotesSchema>;
export type BulkQuoteOperation = z.infer<typeof BulkQuoteOperationSchema>;
export type ImportQuotesRequest = z.infer<typeof ImportQuotesSchema>;
export type ExportQuotesRequest = z.infer<typeof ExportQuotesSchema>;
export type TrackEventRequest = z.infer<typeof TrackEventSchema>;
export type AnalyticsRequest = z.infer<typeof AnalyticsRequestSchema>; 