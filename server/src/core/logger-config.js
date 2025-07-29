"use strict";
/**
 * Logger Configuration for Development
 *
 * Controls which log categories are enabled/disabled in development mode
 * to reduce console noise while maintaining useful debugging information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.prodLoggerConfig = exports.devLoggerConfig = void 0;
exports.getLoggerConfig = getLoggerConfig;
var logger_types_1 = require("./logger-types");
// Development mode logger configuration
exports.devLoggerConfig = {
    minLevel: logger_types_1.LogLevel.INFO,
    // Categories to suppress in development
    suppressCategories: [
        'WebSocket', // Connection/disconnection spam
        'RateLimit', // Redis connection status
        'CategoryService', // Cache hit/miss logs
        'AnalyticsService', // Dashboard cache logs
        'LOAD_ENV', // Environment loading details
        'TASK_SCHEDULER', // Recurring task logs
        'DevAuth', // Dev authentication logs
        'SERVER' // Reduce startup verbosity
    ],
    // Patterns to suppress (regex)
    suppressPatterns: [
        /cache (hit|miss|cleared)/i,
        /connected to redis/i,
        /websocket client (connected|disconnected)/i,
        /returning cached/i,
        /scheduled tasks completed/i
    ]
};
// Production logger configuration
exports.prodLoggerConfig = {
    minLevel: logger_types_1.LogLevel.INFO,
    // In production, we want all logs
    suppressCategories: [],
    suppressPatterns: []
};
// Get config based on environment
function getLoggerConfig() {
    // Allow verbose logging override via environment variable
    if (process.env.VERBOSE_LOGS === 'true') {
        return {
            minLevel: logger_types_1.LogLevel.DEBUG,
            suppressCategories: [],
            suppressPatterns: []
        };
    }
    return process.env.NODE_ENV === 'production' ? exports.prodLoggerConfig : exports.devLoggerConfig;
}
