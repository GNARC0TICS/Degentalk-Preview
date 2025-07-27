# Logger API Reference

## Core Logger Methods

### `logger.debug(namespace: string, message: string, data?: any)`
Logs debug-level information. Typically suppressed in production.

```typescript
logger.debug('UserService', 'Fetching user from database', { userId: 123 });
```

### `logger.info(namespace: string, message: string, data?: any)`
Logs general informational messages.

```typescript
logger.info('AUTH', 'User logged in successfully', { 
  userId: user.id, 
  username: user.username 
});
```

### `logger.warn(namespace: string, message: string, data?: any)`
Logs warning messages that don't prevent operation.

```typescript
logger.warn('RateLimit', 'User approaching rate limit', { 
  userId, 
  requests: 95, 
  limit: 100 
});
```

### `logger.error(namespace: string, message: string, data?: any)`
Logs error messages for recoverable errors.

```typescript
logger.error('Database', 'Query failed, retrying', { 
  query: 'SELECT * FROM users',
  error: error.message,
  attempt: 2 
});
```

### `logger.critical(namespace: string, message: string, data?: any)`
Logs critical errors that may affect system stability.

```typescript
logger.critical('System', 'Database connection lost', { 
  error: error.message,
  timestamp: new Date() 
});
```

## Advanced Logging

### `log(options: LogOptions)`
Low-level logging function with full control.

```typescript
interface LogOptions {
  level: LogLevel;
  action?: LogAction;
  namespace?: string;
  message: string;
  data?: any;
}

log({
  level: LogLevel.INFO,
  action: LogAction.USER_LOGIN,
  namespace: 'AUTH',
  message: 'User authentication successful',
  data: { userId, sessionId }
});
```

## Log Actions (Predefined Categories)

```typescript
enum LogAction {
  // System
  SYSTEM_STARTUP = 'SYSTEM_STARTUP',
  SYSTEM_SHUTDOWN = 'SYSTEM_SHUTDOWN',
  SCHEDULED_TASK = 'SCHEDULED_TASK',
  
  // User
  USER_REGISTER = 'USER_REGISTER',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_UPDATE = 'USER_UPDATE',
  
  // Forum
  THREAD_CREATE = 'THREAD_CREATE',
  POST_CREATE = 'POST_CREATE',
  POST_EDIT = 'POST_EDIT',
  POST_DELETE = 'POST_DELETE',
  
  // XP/Gamification
  XP_AWARD = 'XP_AWARD',
  LEVEL_UP = 'LEVEL_UP',
  
  // API
  API_REQUEST = 'API_REQUEST',
  API_RESPONSE = 'API_RESPONSE',
  API_ERROR = 'API_ERROR',
  
  // Custom
  CUSTOM = 'CUSTOM'
}
```

## Logger Control API (Dev Mode)

### `loggerControl.suppress(...categories: string[])`
Temporarily suppress specific log categories.

```typescript
// Suppress multiple categories
loggerControl.suppress('WebSocket', 'Cache', 'RateLimit');
```

### `loggerControl.unsuppress(...categories: string[])`
Remove suppression for specific categories.

```typescript
// Re-enable WebSocket logs
loggerControl.unsuppress('WebSocket');
```

### `loggerControl.showOnly(...categories: string[])`
Only show logs from specific categories.

```typescript
// Focus on auth and database logs
loggerControl.showOnly('AUTH', 'DATABASE', 'ERROR');
```

### `loggerControl.showAll()`
Reset category filtering to show all logs.

```typescript
loggerControl.showAll();
```

### `loggerControl.setMinLevel(level: LogLevel)`
Set minimum log level dynamically.

```typescript
// Only show warnings and above
loggerControl.setMinLevel(LogLevel.WARN);
```

### `loggerControl.reset()`
Reset all logging overrides to defaults.

```typescript
loggerControl.reset();
```

### `loggerControl.getOverrides()`
Get current logging overrides.

```typescript
const overrides = loggerControl.getOverrides();
console.log('Current suppressions:', overrides.suppressCategories);
```

## Configuration API

### `initLogger(config?: LoggerConfig)`
Initialize logger with custom configuration.

```typescript
interface LoggerConfig {
  console?: boolean;      // Log to console (default: true in dev)
  file?: boolean;         // Log to file (default: true)
  jsonOutput?: boolean;   // JSON format (default: true in prod)
  filePath?: string;      // Log directory
  fileName?: string;      // Log filename
  maxFileSize?: number;   // Max size before rotation
  maxFiles?: number;      // Max rotated files to keep
  minLevel?: LogLevel;    // Minimum log level
}

// Custom initialization
logger.init({
  minLevel: LogLevel.WARN,
  maxFileSize: 50 * 1024 * 1024, // 50MB
  jsonOutput: false
});
```

## Environment Variables

### `VERBOSE_LOGS=true`
Enable all logs regardless of configuration.

```bash
VERBOSE_LOGS=true pnpm dev
```

### `NODE_ENV=production`
Switches to production logging configuration.

### `LOG_LEVEL=<level>`
Set minimum log level via environment.

```bash
LOG_LEVEL=ERROR pnpm dev
```

## Structured Data Best Practices

### User Context
```typescript
logger.info('UserAction', 'Profile updated', {
  userId: user.id,
  username: user.username,
  changes: ['email', 'avatar'],
  timestamp: new Date()
});
```

### Error Context
```typescript
logger.error('API', 'Request failed', {
  method: req.method,
  path: req.path,
  statusCode: 500,
  error: {
    message: error.message,
    stack: error.stack,
    code: error.code
  },
  userId: req.user?.id
});
```

### Performance Metrics
```typescript
const startTime = Date.now();
// ... operation ...
logger.info('Performance', 'Database query completed', {
  query: 'getUserById',
  duration: Date.now() - startTime,
  rowCount: result.length
});
```

### Request Context
```typescript
logger.info('HTTP', 'Request processed', {
  method: req.method,
  path: req.path,
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  responseTime: Date.now() - req.startTime,
  statusCode: res.statusCode
});
```