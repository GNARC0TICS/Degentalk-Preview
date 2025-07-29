import { z } from 'zod';
export declare const forumEconomySchema: z.ZodObject<{
    xp: z.ZodObject<{
        createThread: z.ZodNumber;
        reply: z.ZodNumber;
        likeReceived: z.ZodNumber;
        dailyCap: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        reply?: number;
        dailyCap?: number;
        createThread?: number;
        likeReceived?: number;
    }, {
        reply?: number;
        dailyCap?: number;
        createThread?: number;
        likeReceived?: number;
    }>;
    tipping: z.ZodObject<{
        min: z.ZodNumber;
        max: z.ZodNumber;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        currency?: string;
        max?: number;
        min?: number;
    }, {
        currency?: string;
        max?: number;
        min?: number;
    }>;
    uploads: z.ZodObject<{
        maxAvatarSizeMB: z.ZodNumber;
        allowedTypes: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        maxAvatarSizeMB?: number;
        allowedTypes?: string[];
    }, {
        maxAvatarSizeMB?: number;
        allowedTypes?: string[];
    }>;
    themes: z.ZodObject<{
        defaultZoneColor: z.ZodString;
        fallbackBannerUrl: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        defaultZoneColor?: string;
        fallbackBannerUrl?: string;
    }, {
        defaultZoneColor?: string;
        fallbackBannerUrl?: string;
    }>;
}, "strip", z.ZodTypeAny, {
    xp?: {
        reply?: number;
        dailyCap?: number;
        createThread?: number;
        likeReceived?: number;
    };
    themes?: {
        defaultZoneColor?: string;
        fallbackBannerUrl?: string;
    };
    tipping?: {
        currency?: string;
        max?: number;
        min?: number;
    };
    uploads?: {
        maxAvatarSizeMB?: number;
        allowedTypes?: string[];
    };
}, {
    xp?: {
        reply?: number;
        dailyCap?: number;
        createThread?: number;
        likeReceived?: number;
    };
    themes?: {
        defaultZoneColor?: string;
        fallbackBannerUrl?: string;
    };
    tipping?: {
        currency?: string;
        max?: number;
        min?: number;
    };
    uploads?: {
        maxAvatarSizeMB?: number;
        allowedTypes?: string[];
    };
}>;
export type ForumEconomyConfig = z.infer<typeof forumEconomySchema>;
export declare const forumEconomyConfig: ForumEconomyConfig;
