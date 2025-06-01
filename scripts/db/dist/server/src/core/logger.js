"use strict";
/**
 * ForumFusion - Consolidated Logging System
 *
 * This is the centralized logging utility for the entire application.
 * It handles different log levels, formats, and outputs (console, file).
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.LogAction = exports.LogLevel = void 0;
exports.initLogger = initLogger;
exports.log = log;
exports.debug = debug;
exports.info = info;
exports.warn = warn;
exports.error = error;
exports.critical = critical;
var fs_1 = require("fs");
var path_1 = require("path");
var fs_2 = require("fs");
// Log levels
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
    LogLevel["CRITICAL"] = "CRITICAL";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
// Log action categories for better filtering and analysis
var LogAction;
(function (LogAction) {
    // System actions
    LogAction["SYSTEM_STARTUP"] = "SYSTEM_STARTUP";
    LogAction["SYSTEM_SHUTDOWN"] = "SYSTEM_SHUTDOWN";
    LogAction["SCHEDULED_TASK"] = "SCHEDULED_TASK";
    // User actions
    LogAction["USER_REGISTER"] = "USER_REGISTER";
    LogAction["USER_LOGIN"] = "USER_LOGIN";
    LogAction["USER_LOGOUT"] = "USER_LOGOUT";
    LogAction["USER_UPDATE"] = "USER_UPDATE";
    // Wallet actions
    LogAction["WALLET_CREATE"] = "WALLET_CREATE";
    LogAction["WALLET_IMPORT"] = "WALLET_IMPORT";
    LogAction["WALLET_TRANSACTION"] = "WALLET_TRANSACTION";
    LogAction["TRANSACTION_VERIFY"] = "TRANSACTION_VERIFY";
    // Vault actions
    LogAction["VAULT_CREATE"] = "VAULT_CREATE";
    LogAction["VAULT_UNLOCK"] = "VAULT_UNLOCK";
    LogAction["VAULT_AUTO_UNLOCK"] = "VAULT_AUTO_UNLOCK";
    // Forum actions
    LogAction["THREAD_CREATE"] = "THREAD_CREATE";
    LogAction["POST_CREATE"] = "POST_CREATE";
    LogAction["POST_EDIT"] = "POST_EDIT";
    LogAction["POST_DELETE"] = "POST_DELETE";
    // XP actions
    LogAction["XP_AWARD"] = "XP_AWARD";
    LogAction["XP_ADJUSTMENT"] = "XP_ADJUSTMENT";
    LogAction["LEVEL_UP"] = "LEVEL_UP";
    // API actions
    LogAction["API_REQUEST"] = "API_REQUEST";
    LogAction["API_RESPONSE"] = "API_RESPONSE";
    LogAction["API_ERROR"] = "API_ERROR";
    // Custom
    LogAction["CUSTOM"] = "CUSTOM";
})(LogAction || (exports.LogAction = LogAction = {}));
// Default configuration
var DEFAULT_CONFIG = {
    console: true,
    file: process.env.NODE_ENV !== 'test',
    filePath: './logs',
    fileName: 'app.log',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 5,
    formatTimestamp: true,
    minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG
};
// Logger configuration
var config = __assign({}, DEFAULT_CONFIG);
var logStream = null;
/**
 * Initialize the logger with custom configuration
 */
function initLogger(customConfig) {
    if (customConfig === void 0) { customConfig = {}; }
    config = __assign(__assign({}, DEFAULT_CONFIG), customConfig);
    // Create log directory if it doesn't exist
    if (config.file) {
        try {
            if (!fs_1.default.existsSync(config.filePath)) {
                fs_1.default.mkdirSync(config.filePath, { recursive: true });
            }
            var logFilePath = path_1.default.join(config.filePath, config.fileName);
            logStream = (0, fs_2.createWriteStream)(logFilePath, { flags: 'a' });
            // Ensure logs are flushed on process exit
            process.on('exit', function () {
                if (logStream) {
                    logStream.end();
                }
            });
            // Log initial startup message
            log({
                level: LogLevel.INFO,
                action: LogAction.SYSTEM_STARTUP,
                message: 'Logger initialized',
                data: {
                    env: process.env.NODE_ENV,
                    logPath: logFilePath
                }
            });
        }
        catch (error) {
            console.error('Failed to initialize file logging:', error);
        }
    }
}
/**
 * Format a log message with timestamp, level, and namespace
 */
function formatLogMessage(level, namespace, message) {
    var timestamp = config.formatTimestamp ?
        "[".concat(new Date().toISOString(), "] ") : '';
    return "".concat(timestamp, "[").concat(level, "] [").concat(namespace, "] ").concat(message);
}
/**
 * Main logging function
 */
function log(options) {
    var level = options.level, action = options.action, namespace = options.namespace, message = options.message, data = options.data;
    // Skip if level is below minimum
    var levels = Object.values(LogLevel);
    if (levels.indexOf(level) < levels.indexOf(config.minLevel)) {
        return;
    }
    // Use action as namespace if no namespace is provided
    var logNamespace = namespace || (action ? action : 'APP');
    var formattedMessage = formatLogMessage(level, logNamespace, message);
    // Format data if present
    var dataString = '';
    if (data) {
        try {
            if (typeof data === 'object') {
                dataString = '\n' + JSON.stringify(data, null, 2);
            }
            else {
                dataString = '\n' + String(data);
            }
        }
        catch (e) {
            dataString = '\n[Error formatting data]';
        }
    }
    // Log to console
    if (config.console) {
        switch (level) {
            case LogLevel.DEBUG:
                console.debug(formattedMessage, data);
                break;
            case LogLevel.INFO:
                console.info(formattedMessage, data);
                break;
            case LogLevel.WARN:
                console.warn(formattedMessage, data);
                break;
            case LogLevel.ERROR:
            case LogLevel.CRITICAL:
                console.error(formattedMessage, data);
                break;
            default:
                console.log(formattedMessage, data);
        }
    }
    // Log to file
    if (config.file && logStream) {
        logStream.write(formattedMessage + dataString + '\n');
    }
}
/**
 * Debug level logger
 */
function debug(namespace, message, data) {
    log({
        level: LogLevel.DEBUG,
        namespace: namespace,
        message: message,
        data: data
    });
}
/**
 * Info level logger
 */
function info(namespace, message, data) {
    log({
        level: LogLevel.INFO,
        namespace: namespace,
        message: message,
        data: data
    });
}
/**
 * Warning level logger
 */
function warn(namespace, message, data) {
    log({
        level: LogLevel.WARN,
        namespace: namespace,
        message: message,
        data: data
    });
}
/**
 * Error level logger
 */
function error(namespace, message, data) {
    log({
        level: LogLevel.ERROR,
        namespace: namespace,
        message: message,
        data: data
    });
}
/**
 * Critical error level logger
 */
function critical(namespace, message, data) {
    log({
        level: LogLevel.CRITICAL,
        namespace: namespace,
        message: message,
        data: data
    });
}
// Initialize the logger with default config
initLogger();
// Create and export a logger instance with convenient methods
exports.logger = {
    debug: debug,
    info: info,
    warn: warn,
    error: error,
    critical: critical,
    init: initLogger
};
