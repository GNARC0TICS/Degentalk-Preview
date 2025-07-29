import { z } from 'zod';
export declare const forumEconomySchema: z.ZodObject<{
    xp: z.ZodObject<{
        createThread: z.ZodNumber;
        reply: z.ZodNumber;
        likeReceived: z.ZodNumber;
        dailyCap: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        dailyCap?: number;
        reply?: number;
        createThread?: number;
        likeReceived?: number;
    }, {
        dailyCap?: number;
        reply?: number;
        createThread?: number;
        likeReceived?: number;
    }>;
    tipping: z.ZodObject<{
        min: z.ZodNumber;
        max: z.ZodNumber;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        max?: number;
        min?: number;
        currency?: string;
    }, {
        max?: number;
        min?: number;
        currency?: string;
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
        dailyCap?: number;
        reply?: number;
        createThread?: number;
        likeReceived?: number;
    };
    tipping?: {
        max?: number;
        min?: number;
        currency?: string;
    };
    uploads?: {
        maxAvatarSizeMB?: number;
        allowedTypes?: string[];
    };
    themes?: {
        defaultZoneColor?: string;
        fallbackBannerUrl?: string;
    };
}, {
    xp?: {
        dailyCap?: number;
        reply?: number;
        createThread?: number;
        likeReceived?: number;
    };
    tipping?: {
        max?: number;
        min?: number;
        currency?: string;
    };
    uploads?: {
        maxAvatarSizeMB?: number;
        allowedTypes?: string[];
    };
    themes?: {
        defaultZoneColor?: string;
        fallbackBannerUrl?: string;
    };
}>;
export type ForumEconomyConfig = z.infer<typeof forumEconomySchema>;
export declare const forumEconomyConfig: ForumEconomyConfig;
