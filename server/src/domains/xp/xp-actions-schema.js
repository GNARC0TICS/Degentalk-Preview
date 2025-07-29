"use strict";
/**
 * XP Actions Schema
 *
 * Schema definition for the XP actions logs table
 * This will be used to track all XP awards from actions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.xpActionLimits = exports.xpActionLogs = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var _schema_1 = require("@schema");
/**
 * xpActionLogs table schema
 *
 * This table tracks when users earn XP through system actions.
 * Unlike xpAdjustmentLogs (which tracks admin adjustments),
 * this tracks automatic XP awards from regular platform usage.
 */
exports.xpActionLogs = (0, pg_core_1.pgTable)('xp_action_logs', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id')
        .notNull()
        .references(function () { return _schema_1.users.id; }, { onDelete: 'cascade' }),
    action: (0, pg_core_1.text)('action').notNull(), // Matches XP_ACTION enum values
    amount: (0, pg_core_1.integer)('amount').notNull(),
    metadata: (0, pg_core_1.jsonb)('metadata'), // Store related data (e.g., postId, threadId)
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow()
    // No need for oldXp/newXp fields as this isn't about adjustments
});
/**
 * Future schema for tracking XP action rate limits
 * Will be used to enforce cooldowns and daily limits
 */
exports.xpActionLimits = (0, pg_core_1.pgTable)('xp_action_limits', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id')
        .notNull()
        .references(function () { return _schema_1.users.id; }, { onDelete: 'cascade' }),
    action: (0, pg_core_1.text)('action').notNull(), // Matches XP_ACTION enum values
    count: (0, pg_core_1.integer)('count').notNull().default(1),
    lastAwarded: (0, pg_core_1.timestamp)('last_awarded').notNull().defaultNow(),
    dayStartedAt: (0, pg_core_1.timestamp)('day_started_at').notNull().defaultNow() // To track daily limits
});
