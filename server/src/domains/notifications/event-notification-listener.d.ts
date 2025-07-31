/**
 * Event Notification Listener
 *
 * This module listens for events from the event logger and generates notifications.
 * Enhanced with type safety while maintaining backward compatibility.
 */
import { EventEmitter } from 'events';
import type { EventLog } from '@schema';
import { z } from 'zod';
export declare const DomainEvents: {
    readonly event_log_created: z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        timestamp: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        data: Record<string, unknown>;
        id: string;
        type: string;
        timestamp?: Date | undefined;
    }, {
        data: Record<string, unknown>;
        id: string;
        type: string;
        timestamp?: Date | undefined;
    }>;
    readonly 'admin.user.banned': z.ZodObject<{
        userId: z.ZodString;
        adminId: z.ZodString;
        reason: z.ZodString;
        duration: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        reason: string;
        adminId: string;
        duration?: number | undefined;
    }, {
        userId: string;
        reason: string;
        adminId: string;
        duration?: number | undefined;
    }>;
    readonly 'xp.award': z.ZodObject<{
        userId: z.ZodString;
        amount: z.ZodNumber;
        reason: z.ZodString;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        reason: string;
        amount: number;
        metadata?: Record<string, unknown> | undefined;
    }, {
        userId: string;
        reason: string;
        amount: number;
        metadata?: Record<string, unknown> | undefined;
    }>;
    readonly 'admin.route.error': z.ZodObject<{
        domain: z.ZodEnum<["users", "forum", "admin", "wallet", "collectibles", "gamification", "themes", "shoutbox", "advertising", "xp"]>;
        error: z.ZodUnion<[z.ZodString, z.ZodObject<{
            message: z.ZodString;
            stack: z.ZodOptional<z.ZodString>;
            name: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            message: string;
            name: string;
            code?: string | undefined;
            stack?: string | undefined;
        }, {
            message: string;
            name: string;
            code?: string | undefined;
            stack?: string | undefined;
        }>]>;
        timestamp: z.ZodDate;
        userId: z.ZodNullable<z.ZodString>;
        correlationId: z.ZodString;
        path: z.ZodString;
        method: z.ZodEnum<["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"]>;
    }, "strip", z.ZodTypeAny, {
        userId: string | null;
        path: string;
        timestamp: Date;
        domain: "admin" | "forum" | "users" | "xp" | "shoutbox" | "wallet" | "gamification" | "advertising" | "collectibles" | "themes";
        error: string | {
            message: string;
            name: string;
            code?: string | undefined;
            stack?: string | undefined;
        };
        method: "GET" | "DELETE" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH";
        correlationId: string;
    }, {
        userId: string | null;
        path: string;
        timestamp: Date;
        domain: "admin" | "forum" | "users" | "xp" | "shoutbox" | "wallet" | "gamification" | "advertising" | "collectibles" | "themes";
        error: string | {
            message: string;
            name: string;
            code?: string | undefined;
            stack?: string | undefined;
        };
        method: "GET" | "DELETE" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH";
        correlationId: string;
    }>;
    readonly 'admin.error.occurred': z.ZodObject<{
        domain: z.ZodEnum<["users", "forum", "admin", "wallet", "collectibles", "gamification", "themes", "shoutbox", "advertising", "xp"]>;
        error: z.ZodObject<{
            message: z.ZodString;
            name: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            message: string;
            name: string;
            code?: string | undefined;
        }, {
            message: string;
            name: string;
            code?: string | undefined;
        }>;
        timestamp: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        timestamp: Date;
        domain: "admin" | "forum" | "users" | "xp" | "shoutbox" | "wallet" | "gamification" | "advertising" | "collectibles" | "themes";
        error: {
            message: string;
            name: string;
            code?: string | undefined;
        };
    }, {
        timestamp: Date;
        domain: "admin" | "forum" | "users" | "xp" | "shoutbox" | "wallet" | "gamification" | "advertising" | "collectibles" | "themes";
        error: {
            message: string;
            name: string;
            code?: string | undefined;
        };
    }>;
};
export type DomainEventMap = {
    [K in keyof typeof DomainEvents]: z.infer<typeof DomainEvents[K]>;
};
declare class TypedEventEmitter extends EventEmitter {
    emit<K extends keyof DomainEventMap>(event: K, payload: DomainEventMap[K]): boolean;
    emit(event: string | symbol, ...args: any[]): boolean;
    on<K extends keyof DomainEventMap>(event: K, listener: (payload: DomainEventMap[K]) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
}
export declare const eventEmitter: TypedEventEmitter;
export declare const EVENT_LOG_CREATED = "event_log_created";
/**
 * Initialize the event notification listener
 * This should be called when the server starts
 */
export declare function initEventNotificationListener(): void;
/**
 * Emit an event log created event
 * This should be called whenever a new event log is created
 */
export declare function emitEventLogCreated(eventLog: EventLog): void;
/**
 * Get event performance metrics
 */
export declare function getEventMetrics(): {
    uptime: number;
    eventsPerSecond: number;
    failureRate: number;
    circuitBreakerStatus: string;
    emitted: number;
    handled: number;
    failed: number;
    avgHandleTime: number;
    startTime: number;
};
export {};
