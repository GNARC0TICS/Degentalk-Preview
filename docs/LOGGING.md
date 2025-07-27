# Logging Configuration Guide

## Overview

The Degentalk server includes a sophisticated logging system with dev-mode optimizations to reduce console noise while maintaining debugging capabilities.

## Related Documentation

- [API Reference](./LOGGING_API.md) - Complete API documentation for all logger methods
- [Examples & Patterns](./LOGGING_EXAMPLES.md) - Common logging scenarios and best practices  
- [Troubleshooting](./LOGGING_TROUBLESHOOTING.md) - Solutions for common logging issues

## Default Dev Mode Behavior

In development mode, the following log categories are automatically suppressed to reduce noise:

- `WebSocket` - Connection/disconnection messages
- `RateLimit` - Redis connection status
- `CategoryService` - Cache hit/miss logs
- `AnalyticsService` - Dashboard cache logs
- `LOAD_ENV` - Environment loading details
- `TASK_SCHEDULER` - Recurring task logs
- `DevAuth` - Dev authentication logs
- `SERVER` - Reduces startup verbosity

## Environment Variables

### `VERBOSE_LOGS=true`
Enable all logs regardless of dev/prod mode:
```bash
VERBOSE_LOGS=true pnpm dev
```

## Runtime Control

During development, you can control logging dynamically without restarting:

```javascript
// In the server console or via a debug endpoint:

// Suppress specific categories
loggerControl.suppress('WebSocket', 'RateLimit');

// Show only specific categories
loggerControl.showOnly('AUTH', 'ERROR');

// Show all categories again
loggerControl.showAll();

// Change minimum log level
loggerControl.setMinLevel('WARN'); // Only WARN, ERROR, CRITICAL

// Reset all overrides
loggerControl.reset();
```

## Creating Custom Log Categories

When adding new logging to your code:

```typescript
import { logger } from '@core/logger';

// Use consistent namespace for filtering
logger.info('MyFeature', 'Operation started');
logger.debug('MyFeature', 'Debug details', { data });
logger.error('MyFeature', 'Operation failed', error);
```

## Log Levels

- `DEBUG` - Detailed debugging information
- `INFO` - General informational messages
- `WARN` - Warning messages
- `ERROR` - Error messages that don't stop execution
- `CRITICAL` - Critical errors that may stop execution

## Suppression Patterns

The logger also suppresses messages matching these patterns in dev mode:
- `/cache (hit|miss|cleared)/i`
- `/connected to redis/i`
- `/websocket client (connected|disconnected)/i`
- `/returning cached/i`
- `/scheduled tasks completed/i`

## Production Mode

In production, all logs are enabled by default for monitoring and debugging.

## Tips for Clean Development Logs

1. Start with default settings - most noise is already filtered
2. Use `VERBOSE_LOGS=true` only when debugging specific issues
3. Use `loggerControl.showOnly()` to focus on specific features
4. Add your noisy categories to `logger-config.ts` suppressCategories

## Adding New Suppressions

To permanently suppress a new category in dev mode:

1. Edit `server/src/core/logger-config.ts`
2. Add the category to `devLoggerConfig.suppressCategories`
3. Or add a pattern to `devLoggerConfig.suppressPatterns`