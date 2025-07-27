# Logging Quick Reference

## 🚀 Quick Start

```bash
# Normal dev mode (quiet)
pnpm dev

# Verbose mode
VERBOSE_LOGS=true pnpm dev
```

## 🎮 Runtime Controls

```javascript
// Show only errors
loggerControl.setMinLevel('ERROR');

// Focus on specific features  
loggerControl.showOnly('AUTH', 'DATABASE');

// Suppress noisy categories
loggerControl.suppress('WebSocket', 'Cache');

// Reset everything
loggerControl.reset();
```

## 📊 Log Levels

```typescript
logger.debug('Feature', 'Detailed info for debugging');
logger.info('Feature', 'General information');
logger.warn('Feature', 'Warning - something concerning');
logger.error('Feature', 'Error - operation failed');
logger.critical('Feature', 'Critical - system impact');
```

## 🏷️ Auto-Suppressed in Dev

- `WebSocket` - Connections
- `RateLimit` - Redis status  
- `Cache` - Hit/miss logs
- `LOAD_ENV` - Environment loading
- `TASK_SCHEDULER` - Recurring tasks
- `SERVER` - Startup verbosity

## 💡 Best Practices

```typescript
// ✅ Good - Consistent namespace + context
logger.info('UserService', 'User created', { userId, email });

// ❌ Bad - No context
logger.info('Service', 'Success');

// ✅ Good - Structured error data
logger.error('API', 'Request failed', {
  endpoint: req.path,
  error: error.message,
  userId: req.user?.id
});

// ❌ Bad - Just error message
logger.error('API', error.message);
```

## 🛠️ Common Tasks

### See all logs temporarily
```javascript
loggerControl.showAll();
```

### Debug specific user
```javascript
loggerControl.showOnly('AUTH', 'UserService');
// Perform user action
loggerControl.reset();
```

### Production debugging
```bash
VERBOSE_LOGS=true NODE_ENV=production node server/index.js
```

### Add permanent suppression
Edit `server/src/core/logger-config.ts`:
```typescript
suppressCategories: [
  'YourNoisyCategory',
  // ...
]
```

## 🔍 Troubleshooting

**No logs showing?**
```javascript
loggerControl.reset();
loggerControl.setMinLevel('DEBUG');
```

**Too many logs?**
```javascript
loggerControl.setMinLevel('WARN');
loggerControl.suppress('NoisyCategory');
```

**Need specific context?**
```javascript
loggerControl.showOnly('TargetFeature', 'ERROR');
```