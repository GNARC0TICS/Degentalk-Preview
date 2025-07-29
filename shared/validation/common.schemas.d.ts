/**
 * Common Validation Schemas
 *
 * Reusable Zod schemas to eliminate validation pattern duplication
 * Provides consistent validation across domains
 */
import { z } from 'zod';
export declare const positiveInt: z.ZodNumber;
export declare const nonNegativeInt: z.ZodNumber;
export declare const positiveFloat: z.ZodNumber;
export declare const nonNegativeFloat: z.ZodNumber;
export declare const nonEmptyString: z.ZodString;
export declare const trimmedString: z.ZodString;
export declare const email: z.ZodString;
export declare const url: z.ZodString;
export declare const slug: z.ZodString;
export declare const username: z.ZodString;
export declare const dateString: z.ZodString;
export declare const futureDate: z.ZodEffects<z.ZodDate, Date, Date>;
export declare const pastDate: z.ZodEffects<z.ZodDate, Date, Date>;
export declare const userId: z.ZodString;
export declare const groupId: z.ZodString;
export declare const threadId: z.ZodString;
export declare const postId: z.ZodString;
export declare const forumId: z.ZodString;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    offset?: number;
    limit?: number;
    page?: number;
}, {
    offset?: number;
    limit?: number;
    page?: number;
}>;
export declare const sortSchema: z.ZodObject<{
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    sortOrder?: "asc" | "desc";
    sortBy?: string;
}, {
    sortOrder?: "asc" | "desc";
    sortBy?: string;
}>;
export declare const searchSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    filters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    query?: string;
    filters?: Record<string, any>;
}, {
    query?: string;
    filters?: Record<string, any>;
}>;
export declare const passwordSchema: z.ZodString;
export declare const tokenSchema: z.ZodString;
export declare const colorSchema: z.ZodString;
export declare const currencySchema: z.ZodObject<{
    symbol: z.ZodString;
    amount: z.ZodNumber;
    decimals: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    symbol?: string;
    amount?: number;
    decimals?: number;
}, {
    symbol?: string;
    amount?: number;
    decimals?: number;
}>;
export declare const userRoleSchema: z.ZodEnum<["user", "moderator", "admin"]>;
export declare const permissionSchema: z.ZodString;
export declare const titleSchema: z.ZodString;
export declare const contentSchema: z.ZodString;
export declare const tagSchema: z.ZodString;
export declare const tagsArraySchema: z.ZodArray<z.ZodString, "many">;
export declare const fileTypeSchema: z.ZodEnum<["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "text/plain", "application/json"]>;
export declare const fileSizeSchema: z.ZodNumber;
export declare const fileUploadSchema: z.ZodObject<{
    filename: z.ZodString;
    size: z.ZodNumber;
    type: z.ZodEnum<["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "text/plain", "application/json"]>;
    data: z.ZodString;
}, "strip", z.ZodTypeAny, {
    data?: string;
    filename?: string;
    type?: "text/plain" | "application/json" | "image/jpeg" | "image/png" | "image/gif" | "image/webp" | "application/pdf";
    size?: number;
}, {
    data?: string;
    filename?: string;
    type?: "text/plain" | "application/json" | "image/jpeg" | "image/png" | "image/gif" | "image/webp" | "application/pdf";
    size?: number;
}>;
export declare const successResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodAny;
    meta: z.ZodOptional<z.ZodObject<{
        pagination: z.ZodOptional<z.ZodObject<{
            page: z.ZodDefault<z.ZodNumber>;
            limit: z.ZodDefault<z.ZodNumber>;
            offset: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            offset?: number;
            limit?: number;
            page?: number;
        }, {
            offset?: number;
            limit?: number;
            page?: number;
        }>>;
        timestamp: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        timestamp?: string;
        pagination?: {
            offset?: number;
            limit?: number;
            page?: number;
        };
    }, {
        timestamp?: string;
        pagination?: {
            offset?: number;
            limit?: number;
            page?: number;
        };
    }>>;
}, "strip", z.ZodTypeAny, {
    data?: any;
    meta?: {
        timestamp?: string;
        pagination?: {
            offset?: number;
            limit?: number;
            page?: number;
        };
    };
    success?: true;
}, {
    data?: any;
    meta?: {
        timestamp?: string;
        pagination?: {
            offset?: number;
            limit?: number;
            page?: number;
        };
    };
    success?: true;
}>;
export declare const errorResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodString;
    code: z.ZodOptional<z.ZodString>;
    details: z.ZodOptional<z.ZodAny>;
    timestamp: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error?: string;
    code?: string;
    details?: any;
    timestamp?: string;
    success?: false;
}, {
    error?: string;
    code?: string;
    details?: any;
    timestamp?: string;
    success?: false;
}>;
export declare const featureGateSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    enabled: z.ZodBoolean;
    minLevel: z.ZodOptional<z.ZodNumber>;
    devOnly: z.ZodOptional<z.ZodBoolean>;
    rolloutPercentage: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    id?: string;
    minLevel?: number;
    enabled?: boolean;
    rolloutPercentage?: number;
    devOnly?: boolean;
}, {
    name?: string;
    description?: string;
    id?: string;
    minLevel?: number;
    enabled?: boolean;
    rolloutPercentage?: number;
    devOnly?: boolean;
}>;
export declare const configCreateSchema: z.ZodObject<{
    field: z.ZodString;
    value: z.ZodAny;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason?: string;
    value?: any;
    field?: string;
}, {
    reason?: string;
    value?: any;
    field?: string;
}>;
export declare const configUpdateSchema: z.ZodObject<{
    field: z.ZodOptional<z.ZodString>;
    value: z.ZodOptional<z.ZodAny>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason?: string;
    value?: any;
    field?: string;
}, {
    reason?: string;
    value?: any;
    field?: string;
}>;
export declare const dgtAmountSchema: z.ZodNumber;
export declare const cryptoAddressSchema: z.ZodString;
export declare const transactionTypeSchema: z.ZodEnum<["deposit", "withdrawal", "transfer", "tip", "purchase", "reward", "refund"]>;
export declare const threadTypeSchema: z.ZodEnum<["discussion", "question", "announcement", "poll"]>;
export declare const postTypeSchema: z.ZodEnum<["post", "reply"]>;
export declare const forumAccessLevelSchema: z.ZodEnum<["public", "registered", "level_10+", "moderator", "admin"]>;
export declare const friendshipStatusSchema: z.ZodEnum<["pending", "accepted", "blocked", "declined"]>;
export declare const privacyLevelSchema: z.ZodEnum<["public", "friends", "private"]>;
export declare const notificationTypeSchema: z.ZodEnum<["mention", "reply", "friend_request", "achievement", "system", "tip_received"]>;
export declare const channelSchema: z.ZodEnum<["email", "sms", "push", "webhook"]>;
export declare const auditActionSchema: z.ZodEnum<["create", "update", "delete", "login", "logout", "permission_change"]>;
export declare const timeRangeSchema: z.ZodEffects<z.ZodObject<{
    start: z.ZodDate;
    end: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    end?: Date;
    start?: Date;
}, {
    end?: Date;
    start?: Date;
}>, {
    end?: Date;
    start?: Date;
}, {
    end?: Date;
    start?: Date;
}>;
export declare const durationSchema: z.ZodObject<{
    value: z.ZodNumber;
    unit: z.ZodEnum<["seconds", "minutes", "hours", "days", "weeks", "months"]>;
}, "strip", z.ZodTypeAny, {
    value?: number;
    unit?: "days" | "hours" | "weeks" | "minutes" | "seconds" | "months";
}, {
    value?: number;
    unit?: "days" | "hours" | "weeks" | "minutes" | "seconds" | "months";
}>;
export declare const coordinatesSchema: z.ZodObject<{
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    latitude?: number;
    longitude?: number;
}, {
    latitude?: number;
    longitude?: number;
}>;
export declare const versionSchema: z.ZodString;
export declare function createArraySchema<T extends z.ZodTypeAny>(itemSchema: T, minItems?: number, maxItems?: number): z.ZodArray<T, "many">;
export declare function createOptionalWithDefault<T extends z.ZodTypeAny>(schema: T, defaultValue: z.infer<T>): z.ZodDefault<T>;
export declare function createEnumSchema<T extends readonly [string, ...string[]]>(values: T, errorMessage?: string): z.ZodEnum<z.Writeable<T>>;
export declare const userCreateSchema: z.ZodObject<{
    username: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<["user", "moderator", "admin"]>>;
}, "strip", z.ZodTypeAny, {
    password?: string;
    email?: string;
    role?: "user" | "admin" | "moderator";
    username?: string;
}, {
    password?: string;
    email?: string;
    role?: "user" | "admin" | "moderator";
    username?: string;
}>;
export declare const userUpdateSchema: z.ZodObject<Omit<{
    username: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodOptional<z.ZodEnum<["user", "moderator", "admin"]>>>;
}, "password">, "strip", z.ZodTypeAny, {
    email?: string;
    role?: "user" | "admin" | "moderator";
    username?: string;
}, {
    email?: string;
    role?: "user" | "admin" | "moderator";
    username?: string;
}>;
export declare const threadCreateSchema: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
    forumId: z.ZodString;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    type: z.ZodOptional<z.ZodEnum<["discussion", "question", "announcement", "poll"]>>;
}, "strip", z.ZodTypeAny, {
    type?: "question" | "announcement" | "discussion" | "poll";
    title?: string;
    content?: string;
    tags?: string[];
    forumId?: string;
}, {
    type?: "question" | "announcement" | "discussion" | "poll";
    title?: string;
    content?: string;
    tags?: string[];
    forumId?: string;
}>;
export declare const postCreateSchema: z.ZodObject<{
    content: z.ZodString;
    threadId: z.ZodString;
    replyToPostId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    threadId?: string;
    replyToPostId?: string;
    content?: string;
}, {
    threadId?: string;
    replyToPostId?: string;
    content?: string;
}>;
export declare const paginatedQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
} & {
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
} & {
    query: z.ZodOptional<z.ZodString>;
    filters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    query?: string;
    offset?: number;
    limit?: number;
    sortOrder?: "asc" | "desc";
    page?: number;
    sortBy?: string;
    filters?: Record<string, any>;
}, {
    query?: string;
    offset?: number;
    limit?: number;
    sortOrder?: "asc" | "desc";
    page?: number;
    sortBy?: string;
    filters?: Record<string, any>;
}>;
export declare const apiQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
} & {
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
} & {
    query: z.ZodOptional<z.ZodString>;
    filters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    query?: string;
    offset?: number;
    limit?: number;
    sortOrder?: "asc" | "desc";
    page?: number;
    sortBy?: string;
    filters?: Record<string, any>;
}, {
    query?: string;
    offset?: number;
    limit?: number;
    sortOrder?: "asc" | "desc";
    page?: number;
    sortBy?: string;
    filters?: Record<string, any>;
}>;
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id?: string;
}, {
    id?: string;
}>;
export declare const slugParamSchema: z.ZodObject<{
    slug: z.ZodString;
}, "strip", z.ZodTypeAny, {
    slug?: string;
}, {
    slug?: string;
}>;
export declare function validateId(id: unknown): string;
export declare function validateEmail(emailValue: unknown): string;
export declare function validatePagination(query: unknown): {
    offset?: number;
    limit?: number;
    page?: number;
};
export declare function sanitizeInput(input: unknown): string;
