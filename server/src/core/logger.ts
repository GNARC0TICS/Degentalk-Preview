/**
 * ForumFusion - Consolidated Logging System
 *
 * This is the centralized logging utility for the entire application.
 * It handles different log levels, formats, and outputs (console, file).
 */

import fs from 'fs';
import path from 'path';
import { createWriteStream, WriteStream } from 'fs';

// Log levels
export enum LogLevel {
	DEBUG = 'DEBUG',
	INFO = 'INFO',
	WARN = 'WARN',
	ERROR = 'ERROR',
	CRITICAL = 'CRITICAL'
}

// Log action categories for better filtering and analysis
export enum LogAction {
	// System actions
	SYSTEM_STARTUP = 'SYSTEM_STARTUP',
	SYSTEM_SHUTDOWN = 'SYSTEM_SHUTDOWN',
	SCHEDULED_TASK = 'SCHEDULED_TASK',

	// User actions
	USER_REGISTER = 'USER_REGISTER',
	USER_LOGIN = 'USER_LOGIN',
	USER_LOGOUT = 'USER_LOGOUT',
	USER_UPDATE = 'USER_UPDATE',

	// Wallet actions
	WALLET_CREATE = 'WALLET_CREATE',
	WALLET_IMPORT = 'WALLET_IMPORT',
	WALLET_TRANSACTION = 'WALLET_TRANSACTION',
	TRANSACTION_VERIFY = 'TRANSACTION_VERIFY',

	// Vault actions
	VAULT_CREATE = 'VAULT_CREATE',
	VAULT_UNLOCK = 'VAULT_UNLOCK',
	VAULT_AUTO_UNLOCK = 'VAULT_AUTO_UNLOCK',

	// Forum actions
	THREAD_CREATE = 'THREAD_CREATE',
	POST_CREATE = 'POST_CREATE',
	POST_EDIT = 'POST_EDIT',
	POST_DELETE = 'POST_DELETE',

	// XP actions
	XP_AWARD = 'XP_AWARD',
	XP_ADJUSTMENT = 'XP_ADJUSTMENT',
	LEVEL_UP = 'LEVEL_UP',

	// API actions
	API_REQUEST = 'API_REQUEST',
	API_RESPONSE = 'API_RESPONSE',
	API_ERROR = 'API_ERROR',

	// Custom
	CUSTOM = 'CUSTOM'
}

// Default configuration
const DEFAULT_CONFIG = {
	console: process.env.NODE_ENV !== 'production',
	file: process.env.NODE_ENV !== 'test',
	jsonOutput: process.env.NODE_ENV === 'production',
	filePath: './logs',
	fileName: 'app.log',
	maxFileSize: 10 * 1024 * 1024, // 10MB
	maxFiles: 10,
	formatTimestamp: true,
	minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG
};

// Logger configuration
let config = { ...DEFAULT_CONFIG };
let logStream: WriteStream | null = null;
let currentLogFile: string | null = null;
let currentFileSize = 0;

/**
 * Initialize the logger with custom configuration
 */
export function initLogger(customConfig = {}) {
	config = { ...DEFAULT_CONFIG, ...customConfig };

	// Create log directory if it doesn't exist
	if (config.file) {
		try {
			if (!fs.existsSync(config.filePath)) {
				fs.mkdirSync(config.filePath, { recursive: true });
			}

			const logFilePath = path.join(config.filePath, config.fileName);
			currentLogFile = logFilePath;
			
			// Check current file size for rotation
			if (fs.existsSync(logFilePath)) {
				currentFileSize = fs.statSync(logFilePath).size;
			}
			
			logStream = createWriteStream(logFilePath, { flags: 'a' });

			// Ensure logs are flushed on process exit
			process.on('exit', () => {
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
		} catch (error) {
			console.error('Failed to initialize file logging:', error);
		}
	}
}

/**
 * Rotate log file when it exceeds max size
 */
function rotateLogFile() {
	if (!currentLogFile || !logStream) return;
	
	try {
		// Close current stream
		logStream.end();
		
		// Rotate existing files
		for (let i = config.maxFiles - 1; i > 0; i--) {
			const oldFile = currentLogFile + (i === 1 ? '' : `.${i - 1}`);
			const newFile = currentLogFile + `.${i}`;
			
			if (fs.existsSync(oldFile)) {
				if (i === config.maxFiles - 1) {
					fs.unlinkSync(oldFile); // Delete oldest
				} else {
					fs.renameSync(oldFile, newFile);
				}
			}
		}
		
		// Create new log stream
		logStream = createWriteStream(currentLogFile, { flags: 'w' });
		currentFileSize = 0;
		
		log({
			level: LogLevel.INFO,
			action: LogAction.SYSTEM_STARTUP,
			message: 'Log file rotated',
			data: { file: currentLogFile }
		});
	} catch (error) {
		console.error('Failed to rotate log file:', error);
	}
}

/**
 * Format a log message with timestamp, level, and namespace
 */
function formatLogMessage(level: LogLevel, namespace: string, message: string): string {
	const timestamp = config.formatTimestamp ? `[${new Date().toISOString()}] ` : '';

	return `${timestamp}[${level}] [${namespace}] ${message}`;
}

/**
 * Main logging function
 */
export function log(options: {
	level: LogLevel;
	action?: LogAction;
	namespace?: string;
	message: string;
	data?: any;
}) {
	const { level, action, namespace, message, data } = options;

	// Skip if level is below minimum
	const levels = Object.values(LogLevel);
	if (levels.indexOf(level) < levels.indexOf(config.minLevel)) {
		return;
	}

	// Use action as namespace if no namespace is provided
	const logNamespace = namespace || (action ? action : 'APP');

	const formattedMessage = formatLogMessage(level, logNamespace, message);

	// Format data if present
	let dataString = '';
	if (data) {
		try {
			if (typeof data === 'object') {
				dataString = '\n' + JSON.stringify(data, null, 2);
			} else {
				dataString = '\n' + String(data);
			}
		} catch (e) {
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
		const logEntry = config.jsonOutput 
			? JSON.stringify({
				timestamp: new Date().toISOString(),
				level,
				namespace: logNamespace,
				message,
				action,
				data,
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
export function debug(namespace: string, message: string, data?: any) {
	log({
		level: LogLevel.DEBUG,
		namespace,
		message,
		data
	});
}

/**
 * Info level logger
 */
export function info(namespace: string, message: string, data?: any) {
	log({
		level: LogLevel.INFO,
		namespace,
		message,
		data
	});
}

/**
 * Warning level logger
 */
export function warn(namespace: string, message: string, data?: any) {
	log({
		level: LogLevel.WARN,
		namespace,
		message,
		data
	});
}

/**
 * Error level logger
 */
export function error(namespace: string, message: string, data?: any) {
	log({
		level: LogLevel.ERROR,
		namespace,
		message,
		data
	});
}

/**
 * Critical error level logger
 */
export function critical(namespace: string, message: string, data?: any) {
	log({
		level: LogLevel.CRITICAL,
		namespace,
		message,
		data
	});
}

// Initialize the logger with default config
initLogger();

// Create and export a logger instance with convenient methods
export const logger = {
	debug,
	info,
	warn,
	error,
	critical,
	init: initLogger
};
