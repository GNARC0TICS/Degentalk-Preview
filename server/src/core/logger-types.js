/**
 * Logger Type Definitions
 *
 * Shared types for the logging system to avoid circular dependencies
 */
// Log levels
export var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
    LogLevel["CRITICAL"] = "CRITICAL";
})(LogLevel || (LogLevel = {}));
// Log action categories for better filtering and analysis
export var LogAction;
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
    LogAction["THREAD_VIEW"] = "THREAD_VIEW";
    LogAction["POST_CREATE"] = "POST_CREATE";
    LogAction["POST_EDIT"] = "POST_EDIT";
    // Security actions
    LogAction["AUTH_ATTEMPT"] = "AUTH_ATTEMPT";
    LogAction["PERMISSION_DENIED"] = "PERMISSION_DENIED";
    LogAction["RATE_LIMIT_HIT"] = "RATE_LIMIT_HIT";
    // Error actions
    LogAction["ERROR_CAUGHT"] = "ERROR_CAUGHT";
    LogAction["ERROR_HANDLED"] = "ERROR_HANDLED";
    LogAction["ERROR_CRITICAL"] = "ERROR_CRITICAL";
})(LogAction || (LogAction = {}));
