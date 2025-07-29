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
/* eslint-disable no-console */
var fs_1 = require("fs");
var path_1 = require("path");
var fs_2 = require("fs");
var logger_config_1 = require("./logger-config");
var logger_control_1 = require("./logger-control");
var logger_types_1 = require("./logger-types");
// Re-export for convenience
var logger_types_2 = require("./logger-types");
Object.defineProperty(exports, "LogLevel", { enumerable: true, get: function () { return logger_types_2.LogLevel; } });
Object.defineProperty(exports, "LogAction", { enumerable: true, get: function () { return logger_types_2.LogAction; } });
// Default configuration
var DEFAULT_CONFIG = {
    console: process.env.NODE_ENV !== 'production',
    file: process.env.NODE_ENV !== 'test',
    jsonOutput: process.env.NODE_ENV === 'production',
    filePath: './logs',
    fileName: 'app.log',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
    formatTimestamp: true,
    minLevel: process.env.NODE_ENV === 'production' ? logger_types_1.LogLevel.INFO : logger_types_1.LogLevel.DEBUG
};
// Logger configuration
var config = __assign({}, DEFAULT_CONFIG);
var logStream = null;
var currentLogFile = null;
var currentFileSize = 0;
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
            currentLogFile = logFilePath;
            // Check current file size for rotation
            if (fs_1.default.existsSync(logFilePath)) {
                currentFileSize = fs_1.default.statSync(logFilePath).size;
            }
            logStream = (0, fs_2.createWriteStream)(logFilePath, { flags: 'a' });
            // Ensure logs are flushed on process exit
            process.on('exit', function () {
                if (logStream) {
                    logStream.end();
                }
            });
            // Log initial startup message
            log({
                level: logger_types_1.LogLevel.INFO,
                action: logger_types_1.LogAction.SYSTEM_STARTUP,
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
 * Rotate log file when it exceeds max size
 */
function rotateLogFile() {
    if (!currentLogFile || !logStream)
        return;
    try {
        // Close current stream
        logStream.end();
        // Rotate existing files
        for (var i = config.maxFiles - 1; i > 0; i--) {
            var oldFile = currentLogFile + (i === 1 ? '' : ".".concat(i - 1));
            var newFile = currentLogFile + ".".concat(i);
            if (fs_1.default.existsSync(oldFile)) {
                if (i === config.maxFiles - 1) {
                    fs_1.default.unlinkSync(oldFile); // Delete oldest
                }
                else {
                    fs_1.default.renameSync(oldFile, newFile);
                }
            }
        }
        // Create new log stream
        logStream = (0, fs_2.createWriteStream)(currentLogFile, { flags: 'w' });
        currentFileSize = 0;
        log({
            level: logger_types_1.LogLevel.INFO,
            action: logger_types_1.LogAction.SYSTEM_STARTUP,
            message: 'Log file rotated',
            data: { file: currentLogFile }
        });
    }
    catch (error) {
        console.error('Failed to rotate log file:', error);
    }
}
/**
 * Format a log message with timestamp, level, and namespace
 */
function formatLogMessage(level, namespace, message) {
    var timestamp = config.formatTimestamp ? "[".concat(new Date().toISOString(), "] ") : '';
    return "".concat(timestamp, "[").concat(level, "] [").concat(namespace, "] ").concat(message);
}
/**
 * Main logging function
 */
function log(options) {
    var _a, _b;
    var level = options.level, action = options.action, namespace = options.namespace, message = options.message, data = options.data;
    // Skip if level is below minimum
    var levels = Object.values(logger_types_1.LogLevel);
    if (levels.indexOf(level) < levels.indexOf(config.minLevel)) {
        return;
    }
    // Use action as namespace if no namespace is provided
    var logNamespace = namespace || (action ? action : 'APP');
    // Apply development mode filtering
    var baseConfig = (0, logger_config_1.getLoggerConfig)();
    var loggerConfig = logger_control_1.loggerControl.applyToConfig(baseConfig);
    // Check minimum level with overrides
    var minLevel = loggerConfig.minLevel || config.minLevel;
    if (levels.indexOf(level) < levels.indexOf(minLevel)) {
        return;
    }
    // Check if category is suppressed
    if ((_a = loggerConfig.suppressCategories) === null || _a === void 0 ? void 0 : _a.includes(logNamespace)) {
        return;
    }
    // Check if message matches suppression patterns
    if ((_b = loggerConfig.suppressPatterns) === null || _b === void 0 ? void 0 : _b.some(function (pattern) { return pattern.test(message); })) {
        return;
    }
    // Check if we're only showing specific categories
    if (loggerConfig.onlyShowCategories &&
        loggerConfig.onlyShowCategories.length > 0 &&
        !loggerConfig.onlyShowCategories.includes(logNamespace)) {
        return;
    }
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
        var logArgs = data !== undefined ? [formattedMessage, data] : [formattedMessage];
        switch (level) {
            case logger_types_1.LogLevel.DEBUG:
                // eslint-disable-next-line no-console
                console.debug.apply(console, logArgs);
                break;
            case logger_types_1.LogLevel.INFO:
                // eslint-disable-next-line no-console
                console.info.apply(console, logArgs);
                break;
            case logger_types_1.LogLevel.WARN:
                // eslint-disable-next-line no-console
                console.warn.apply(console, logArgs);
                break;
            case logger_types_1.LogLevel.ERROR:
            case logger_types_1.LogLevel.CRITICAL:
                // eslint-disable-next-line no-console
                console.error.apply(console, logArgs);
                break;
            default:
                // eslint-disable-next-line no-console
                console.log.apply(console, logArgs);
        }
    }
    // Log to file
    if (config.file && logStream) {
        var logEntry = config.jsonOutput
            ? JSON.stringify({
                timestamp: new Date().toISOString(),
                level: level,
                namespace: logNamespace,
                message: message,
                action: action,
                data: data,
                pid: process.pid,
                env: process.env.NODE_ENV
            }) + '\n'
            : formattedMessage + dataString + '\n';
        // Check for log rotation
        if (currentFileSize + logEntry.length > config.maxFileSize) {
            rotateLogFile();
        }
        logStream.write(logEntry);
        currentFileSize += logEntry.length;
    }
}
/**
 * Debug level logger
 */
function debug(namespace, message, data) {
    log({
        level: logger_types_1.LogLevel.DEBUG,
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
        level: logger_types_1.LogLevel.INFO,
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
        level: logger_types_1.LogLevel.WARN,
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
        level: logger_types_1.LogLevel.ERROR,
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
        level: logger_types_1.LogLevel.CRITICAL,
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
