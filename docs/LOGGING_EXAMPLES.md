# Logging Examples & Patterns

## Common Logging Scenarios

### 1. Service Layer Logging

```typescript
// user.service.ts
import { logger } from '@core/logger';

export class UserService {
  async createUser(data: CreateUserDto): Promise<User> {
    logger.info('UserService', 'Creating new user', { 
      email: data.email,
      username: data.username 
    });

    try {
      const user = await this.userRepository.create(data);
      
      logger.info('UserService', 'User created successfully', { 
        userId: user.id,
        username: user.username 
      });
      
      return user;
    } catch (error) {
      logger.error('UserService', 'Failed to create user', {
        email: data.email,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
}
```

### 2. Controller/Route Logging

```typescript
// auth.controller.ts
import { logger } from '@core/logger';

export async function login(req: Request, res: Response) {
  const startTime = Date.now();
  
  logger.info('AuthController', 'Login attempt', {
    username: req.body.username,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });

  try {
    const result = await authService.login(req.body);
    
    logger.info('AuthController', 'Login successful', {
      userId: result.user.id,
      username: result.user.username,
      duration: Date.now() - startTime
    });
    
    res.json(result);
  } catch (error) {
    logger.warn('AuthController', 'Login failed', {
      username: req.body.username,
      reason: error.message,
      duration: Date.now() - startTime
    });
    
    res.status(401).json({ error: 'Invalid credentials' });
  }
}
```

### 3. Repository Layer Logging

```typescript
// user.repository.ts
import { logger } from '@core/logger';

export class UserRepository {
  async findById(userId: UserId): Promise<User | null> {
    logger.debug('UserRepository', 'Finding user by ID', { userId });
    
    const queryStart = Date.now();
    
    try {
      const user = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      logger.debug('UserRepository', 'Query completed', {
        userId,
        found: !!user[0],
        queryTime: Date.now() - queryStart
      });
      
      return user[0] || null;
    } catch (error) {
      logger.error('UserRepository', 'Database query failed', {
        operation: 'findById',
        userId,
        error: error.message,
        queryTime: Date.now() - queryStart
      });
      throw error;
    }
  }
}
```

### 4. Middleware Logging

```typescript
// request-logger.middleware.ts
import { logger } from '@core/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  
  // Log request
  logger.info('HTTP', `${req.method} ${req.path}`, {
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined,
    headers: {
      'user-agent': req.headers['user-agent'],
      'content-type': req.headers['content-type']
    }
  });

  // Log response
  const originalSend = res.send;
  res.send = function(data) {
    logger.info('HTTP', `Response ${res.statusCode}`, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: Date.now() - startTime,
      size: Buffer.byteLength(data)
    });
    
    return originalSend.call(this, data);
  };

  next();
}
```

### 5. Background Job Logging

```typescript
// email-queue.processor.ts
import { logger } from '@core/logger';

export async function processEmailQueue() {
  logger.info('EmailQueue', 'Starting email processing job');
  
  const emails = await getQueuedEmails();
  logger.info('EmailQueue', 'Found emails to process', { count: emails.length });
  
  for (const email of emails) {
    try {
      logger.debug('EmailQueue', 'Processing email', {
        emailId: email.id,
        to: email.to,
        subject: email.subject
      });
      
      await sendEmail(email);
      
      logger.info('EmailQueue', 'Email sent successfully', {
        emailId: email.id,
        to: email.to
      });
    } catch (error) {
      logger.error('EmailQueue', 'Failed to send email', {
        emailId: email.id,
        to: email.to,
        error: error.message,
        willRetry: email.attempts < 3
      });
    }
  }
  
  logger.info('EmailQueue', 'Email processing job completed', {
    processed: emails.length,
    duration: Date.now() - startTime
  });
}
```

### 6. WebSocket Event Logging

```typescript
// websocket.service.ts
import { logger } from '@core/logger';

export function handleWebSocketConnection(ws: WebSocket, req: Request) {
  const clientId = generateClientId();
  
  logger.info('WebSocket', 'New connection', {
    clientId,
    ip: req.socket.remoteAddress,
    userAgent: req.headers['user-agent']
  });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      logger.debug('WebSocket', 'Message received', {
        clientId,
        type: message.type,
        size: data.length
      });
      
      handleMessage(ws, message);
    } catch (error) {
      logger.error('WebSocket', 'Invalid message format', {
        clientId,
        error: error.message,
        rawData: data.toString().substring(0, 100)
      });
    }
  });

  ws.on('close', (code, reason) => {
    logger.info('WebSocket', 'Connection closed', {
      clientId,
      code,
      reason: reason.toString()
    });
  });
}
```

### 7. Cache Operations Logging

```typescript
// cache.service.ts
import { logger } from '@core/logger';

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    logger.debug('Cache', 'Getting value', { key });
    
    try {
      const value = await redis.get(key);
      
      if (value) {
        logger.debug('Cache', 'Cache hit', { key });
        return JSON.parse(value);
      } else {
        logger.debug('Cache', 'Cache miss', { key });
        return null;
      }
    } catch (error) {
      logger.error('Cache', 'Cache operation failed', {
        operation: 'get',
        key,
        error: error.message
      });
      return null; // Fail gracefully
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    logger.debug('Cache', 'Setting value', { key, ttl });
    
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttl || 3600);
      logger.debug('Cache', 'Value cached', { key, ttl });
    } catch (error) {
      logger.error('Cache', 'Failed to cache value', {
        key,
        error: error.message
      });
    }
  }
}
```

### 8. Transaction Logging

```typescript
// payment.service.ts
import { logger } from '@core/logger';

export async function processPayment(payment: PaymentRequest): Promise<PaymentResult> {
  const transactionId = generateTransactionId();
  
  logger.info('Payment', 'Starting payment transaction', {
    transactionId,
    userId: payment.userId,
    amount: payment.amount,
    currency: payment.currency
  });

  try {
    // Begin transaction
    const tx = await db.transaction();
    
    try {
      // Process payment steps
      logger.debug('Payment', 'Validating payment details', { transactionId });
      await validatePayment(payment);
      
      logger.debug('Payment', 'Processing with payment provider', { transactionId });
      const providerResult = await paymentProvider.charge(payment);
      
      logger.debug('Payment', 'Updating user balance', { 
        transactionId,
        userId: payment.userId 
      });
      await updateUserBalance(tx, payment.userId, payment.amount);
      
      logger.debug('Payment', 'Recording transaction', { transactionId });
      await recordTransaction(tx, transactionId, payment, providerResult);
      
      await tx.commit();
      
      logger.info('Payment', 'Payment completed successfully', {
        transactionId,
        userId: payment.userId,
        amount: payment.amount,
        providerRef: providerResult.reference
      });
      
      return { success: true, transactionId };
    } catch (error) {
      await tx.rollback();
      
      logger.error('Payment', 'Payment transaction failed', {
        transactionId,
        userId: payment.userId,
        amount: payment.amount,
        error: error.message,
        stage: error.stage || 'unknown'
      });
      
      throw error;
    }
  } catch (error) {
    logger.critical('Payment', 'Critical payment error', {
      transactionId,
      userId: payment.userId,
      error: error.message,
      stack: error.stack
    });
    
    throw new PaymentError('Payment processing failed', error);
  }
}
```

### 9. Performance Monitoring

```typescript
// performance.decorator.ts
import { logger } from '@core/logger';

export function LogPerformance(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function(...args: any[]) {
    const startTime = Date.now();
    const className = target.constructor.name;
    
    logger.debug(className, `${propertyKey} started`);
    
    try {
      const result = await originalMethod.apply(this, args);
      
      const duration = Date.now() - startTime;
      logger.info(className, `${propertyKey} completed`, {
        duration,
        slow: duration > 1000 // Flag slow operations
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(className, `${propertyKey} failed`, {
        duration,
        error: error.message
      });
      throw error;
    }
  };

  return descriptor;
}

// Usage
class UserService {
  @LogPerformance
  async bulkImportUsers(users: User[]): Promise<void> {
    // Method implementation
  }
}
```

### 10. Debug Mode Logging

```typescript
// debug-helpers.ts
import { logger } from '@core/logger';

export function debugLog(namespace: string, operation: string, data?: any) {
  if (process.env.DEBUG_MODE === 'true') {
    logger.debug(namespace, `[DEBUG] ${operation}`, {
      ...data,
      timestamp: new Date().toISOString(),
      stack: new Error().stack?.split('\n').slice(2, 5)
    });
  }
}

// Usage in development
debugLog('UserService', 'State before update', { 
  user: currentUser,
  updates: pendingUpdates 
});
```

## Logging Patterns by Feature

### Authentication Flow
```typescript
// Complete auth flow logging
logger.info('AUTH', 'Login flow started', { username });
logger.debug('AUTH', 'Validating credentials');
logger.info('AUTH', 'User authenticated', { userId });
logger.debug('AUTH', 'Generating tokens');
logger.info('AUTH', 'Session created', { sessionId });
```

### API Request Lifecycle
```typescript
// Request lifecycle
logger.info('API', 'Request received', { method, path });
logger.debug('API', 'Parsing request body');
logger.debug('API', 'Validating request');
logger.info('API', 'Processing request', { action });
logger.info('API', 'Response sent', { status, duration });
```

### Error Handling Chain
```typescript
// Error propagation
logger.debug('Repository', 'Query failed', { query, error });
logger.error('Service', 'Operation failed', { operation, cause });
logger.error('Controller', 'Request failed', { endpoint, userId });
logger.critical('System', 'Unhandled error', { error, impact });
```