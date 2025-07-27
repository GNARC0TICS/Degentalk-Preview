/**
 * Logger Type Definitions
 * 
 * Shared types for the logging system to avoid circular dependencies
 */

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
	THREAD_VIEW = 'THREAD_VIEW',
	POST_CREATE = 'POST_CREATE',
	POST_EDIT = 'POST_EDIT',

	// Security actions
	AUTH_ATTEMPT = 'AUTH_ATTEMPT',
	PERMISSION_DENIED = 'PERMISSION_DENIED',
	RATE_LIMIT_HIT = 'RATE_LIMIT_HIT',

	// Error actions
	ERROR_CAUGHT = 'ERROR_CAUGHT',
	ERROR_HANDLED = 'ERROR_HANDLED',
	ERROR_CRITICAL = 'ERROR_CRITICAL'
}

// Logger configuration interface
export interface LoggerConfig {
	minLevel: LogLevel;
	suppressCategories?: string[];
	onlyShowCategories?: string[];
	suppressPatterns?: RegExp[];
}