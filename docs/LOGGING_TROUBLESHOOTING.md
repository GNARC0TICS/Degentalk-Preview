# Logging Troubleshooting Guide

## Common Issues & Solutions

### 1. Logs Not Appearing

**Problem**: Expected logs aren't showing in console or files.

**Solutions**:
```bash
# Check if category is suppressed
grep "suppressCategories" server/src/core/logger-config.ts

# Enable verbose logging
VERBOSE_LOGS=true pnpm dev

# Check minimum log level
# Ensure your log level is >= configured minimum
```

**Runtime fix**:
```javascript
// In server console
loggerControl.showAll();
loggerControl.setMinLevel('DEBUG');
```

### 2. Too Many Logs (Console Flooding)

**Problem**: Console is flooded with repetitive logs.

**Quick fixes**:
```javascript
// Suppress specific noisy categories
loggerControl.suppress('WebSocket', 'Cache', 'RateLimit');

// Show only errors
loggerControl.setMinLevel('ERROR');

// Focus on specific features
loggerControl.showOnly('AUTH', 'DATABASE', 'ERROR');
```

**Permanent fix**:
Add category to `server/src/core/logger-config.ts`:
```typescript
suppressCategories: [
  'WebSocket',
  'YourNoisyCategory', // Add here
  // ...
]
```

### 3. Log Files Not Being Created

**Problem**: Log files aren't being written to disk.

**Check**:
```bash
# Verify log directory exists
ls -la ./logs

# Check permissions
ls -la ./logs/*.log

# Check environment
echo $NODE_ENV
```

**Fix**:
```bash
# Create logs directory
mkdir -p ./logs

# Fix permissions
chmod 755 ./logs
```

### 4. Structured Data Not Showing

**Problem**: Additional data passed to logger isn't displayed.

**Issue**: Console might be truncating objects.

**Solutions**:
```javascript
// Force full object display
logger.info('Test', 'Message', JSON.stringify(complexObject, null, 2));

// Use console directly for debugging
console.dir(complexObject, { depth: null });
```

### 5. Performance Impact from Logging

**Problem**: Logging is slowing down the application.

**Solutions**:
1. Increase minimum log level:
```javascript
loggerControl.setMinLevel('WARN'); // Skip DEBUG and INFO
```

2. Disable file logging in dev:
```javascript
logger.init({ file: false });
```

3. Suppress heavy categories:
```javascript
loggerControl.suppress('DatabaseQuery', 'HTTPRequest');
```

### 6. Missing Context in Logs

**Problem**: Logs don't have enough information to debug issues.

**Best practices**:
```typescript
// Bad - no context
logger.error('Service', 'Operation failed');

// Good - includes context
logger.error('UserService', 'Failed to update user', {
  userId: user.id,
  operation: 'updateProfile',
  error: error.message,
  changes: attemptedChanges
});
```

### 7. Log Rotation Issues

**Problem**: Log files growing too large.

**Check current configuration**:
```typescript
// In logger.ts
maxFileSize: 10 * 1024 * 1024, // 10MB
maxFiles: 10
```

**Manual rotation**:
```bash
# Archive current logs
mv logs/app.log logs/app.log.$(date +%Y%m%d)

# Restart server to create new log file
```

### 8. Debugging Specific Requests

**Problem**: Need to trace a specific user or request.

**Solution - Temporary filtering**:
```javascript
// Show only logs for specific user
const targetUserId = '123';

// Override logger temporarily
const originalLog = logger.info;
logger.info = (namespace, message, data) => {
  if (data?.userId === targetUserId) {
    originalLog(namespace, `[USER ${targetUserId}] ${message}`, data);
  }
};
```

### 9. Logs in Production vs Development

**Problem**: Different log behavior between environments.

**Understanding the difference**:
```javascript
// Development (default)
- Console output: true
- File output: true
- Format: Human-readable
- Min level: DEBUG
- Suppressions: Active

// Production
- Console output: false
- File output: true
- Format: JSON
- Min level: INFO
- Suppressions: None
```

**Override production settings**:
```bash
# Force console output in production
NODE_ENV=production VERBOSE_LOGS=true node server/index.js
```

### 10. Memory Leaks from Logging

**Problem**: Memory usage increases over time.

**Common causes**:
1. Logging large objects
2. Circular references in logged data
3. Accumulating log buffers

**Solutions**:
```typescript
// Sanitize large objects
logger.info('Service', 'Processing complete', {
  resultCount: results.length, // Don't log entire array
  sample: results.slice(0, 3)  // Log sample only
});

// Avoid circular references
const safeUser = {
  id: user.id,
  username: user.username
  // Don't include references that point back
};
```

## Debug Commands Reference

### Check Current Logger State
```javascript
// In server console
console.log('Suppressed:', loggerControl.getOverrides().suppressCategories);
console.log('Min Level:', loggerControl.getOverrides().minLevel);
console.log('Show Only:', loggerControl.getOverrides().onlyShowCategories);
```

### Emergency Logging Reset
```javascript
// Reset everything to defaults
loggerControl.reset();
logger.init(); // Reinitialize
```

### Trace Specific Operations
```javascript
// Temporarily increase verbosity for debugging
const oldLevel = loggerControl.getOverrides().minLevel;
loggerControl.setMinLevel('DEBUG');

// ... perform operation ...

// Restore previous level
loggerControl.setMinLevel(oldLevel || 'INFO');
```

## Environment Variable Reference

```bash
# Enable all logs
VERBOSE_LOGS=true

# Set minimum log level
LOG_LEVEL=ERROR

# Disable file logging
LOG_TO_FILE=false

# Change log format
LOG_FORMAT=json

# Development mode (enables suppressions)
NODE_ENV=development
```

## Getting Help

If you're still experiencing issues:

1. Check the main logger configuration: `server/src/core/logger.ts`
2. Review suppression rules: `server/src/core/logger-config.ts`
3. Verify environment variables are set correctly
4. Look for errors in application startup logs
5. Try running with `VERBOSE_LOGS=true` to see all output