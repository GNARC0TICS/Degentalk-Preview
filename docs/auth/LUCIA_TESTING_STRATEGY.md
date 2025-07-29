# Lucia Auth Testing Strategy for DegenTalk

## Overview

This document outlines a comprehensive testing strategy for the Lucia Auth implementation, ensuring security, reliability, and maintainability of the authentication system.

## Testing Pyramid Structure

### 1. Unit Tests (Foundation)
- **Target**: 80%+ coverage of auth utilities
- **Focus**: Pure functions, crypto operations, validation logic
- **Tools**: Jest, Vitest for client-side

### 2. Integration Tests (Middle Layer)  
- **Target**: 70%+ coverage of auth flows
- **Focus**: Database interactions, middleware chains, API endpoints
- **Tools**: Jest + Supertest, Test containers

### 3. End-to-End Tests (Top Layer)
- **Target**: 90%+ coverage of critical user journeys
- **Focus**: Complete auth flows from UI interaction to database
- **Tools**: Playwright, Cypress

### 4. Security Tests (Cross-cutting)
- **Target**: 100% coverage of security-critical paths
- **Focus**: Session fixation, CSRF, timing attacks, role escalation
- **Tools**: Custom security test suite

## Test Categories

### A. Core Authentication Functions

#### Password Hashing (`server/src/lib/auth.ts`)
```typescript
describe('Password Hashing', () => {
  test('should hash password with Argon2', async () => {
    const password = 'test123!@#';
    const hash = await hashPassword(password);
    
    expect(hash).not.toBe(password);
    expect(hash).toMatch(/^\$argon2id\$/);
    expect(await verifyPassword(password, hash)).toBe(true);
  });

  test('should reject invalid passwords', async () => {
    const hash = await hashPassword('correct');
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });

  test('should handle malformed hashes safely', async () => {
    expect(await verifyPassword('test', 'invalid-hash')).toBe(false);
  });
});
```

#### Session Management (`server/src/lib/session.ts`)
```typescript
describe('Session Management', () => {
  test('should create valid session', async () => {
    const session = await createSession('user-123');
    
    expect(session.id).toBeDefined();
    expect(session.userId).toBe('user-123');
    expect(session.expiresAt).toBeInstanceOf(Date);
  });

  test('should validate active session', async () => {
    const session = await createSession('user-123');
    const result = await lucia.validateSession(session.id);
    
    expect(result.session).toBeTruthy();
    expect(result.user).toBeTruthy();
  });

  test('should reject expired session', async () => {
    // Create session with past expiration
    const expiredSession = await createTestSession('user-123', new Date(Date.now() - 1000));
    const result = await lucia.validateSession(expiredSession.id);
    
    expect(result.session).toBeNull();
  });
});
```

### B. Middleware Testing

#### Authentication Middleware (`server/src/middleware/lucia-auth.ts`)
```typescript
describe('Authentication Middleware', () => {
  let req: MockRequest;
  let res: MockResponse;
  let next: jest.Mock;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    next = jest.fn();
  });

  test('should attach user to request for valid session', async () => {
    const user = await createTestUser();
    const session = await createSession(user.id);
    req.cookies = { [lucia.sessionCookieName]: session.id };

    await authenticate(req, res, next);

    expect(req.user).toBeTruthy();
    expect(req.user?.id).toBe(user.id);
    expect(next).toHaveBeenCalled();
  });

  test('should handle missing session gracefully', async () => {
    await authenticate(req, res, next);

    expect(req.user).toBeNull();
    expect(next).toHaveBeenCalled();
  });

  test('should require authentication', async () => {
    await requireAuth(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });
});
```

#### Role-Based Access Control
```typescript
describe('Role-Based Access Control', () => {
  test('should allow admin access', async () => {
    const adminUser = await createTestUser({ role: 'admin' });
    const session = await createSession(adminUser.id);
    req.cookies = { [lucia.sessionCookieName]: session.id };

    await requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.statusCode).not.toBe(403);
  });

  test('should deny user admin access', async () => {
    const regularUser = await createTestUser({ role: 'user' });
    const session = await createSession(regularUser.id);
    req.cookies = { [lucia.sessionCookieName]: session.id };

    await requireAdmin(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });
});
```

### C. API Endpoint Testing

#### Login Endpoint
```typescript
describe('POST /api/auth/login', () => {
  test('should login with valid credentials', async () => {
    const user = await createTestUser({
      username: 'testuser',
      password: await hashPassword('password123')
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'password123'
      })
      .expect(200);

    expect(response.body.user.id).toBe(user.id);
    expect(response.headers['set-cookie']).toBeDefined();
  });

  test('should reject invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'nonexistent',
        password: 'wrong'
      })
      .expect(401);

    expect(response.body.error).toContain('Invalid credentials');
  });

  test('should prevent brute force attacks', async () => {
    // Make multiple failed attempts
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({ username: 'test', password: 'wrong' });
    }

    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test', password: 'wrong' })
      .expect(429);

    expect(response.body.error).toContain('Too many requests');
  });
});
```

#### Logout Endpoint
```typescript
describe('POST /api/auth/logout', () => {
  test('should logout and clear session', async () => {
    const user = await createTestUser();
    const session = await createSession(user.id);

    const response = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', `${lucia.sessionCookieName}=${session.id}`)
      .expect(200);

    // Session should be invalidated
    const result = await lucia.validateSession(session.id);
    expect(result.session).toBeNull();

    // Cookie should be cleared
    expect(response.headers['set-cookie']).toContain('Max-Age=0');
  });
});
```

### D. Client-Side Testing

#### React Auth Hook (`client/src/hooks/use-lucia-auth.tsx`)
```tsx
describe('useLuciaAuth Hook', () => {
  test('should provide authentication state', () => {
    const wrapper = createAuthWrapper();
    const { result } = renderHook(() => useLuciaAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(true); // Initial loading
  });

  test('should handle login success', async () => {
    const wrapper = createAuthWrapper();
    const { result } = renderHook(() => useLuciaAuth(), { wrapper });

    mockApiRequest.mockResolvedValueOnce({
      user: mockUser
    });

    act(() => {
      result.current.login({ username: 'test', password: 'test' });
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  test('should handle development mode role switching', () => {
    process.env.NODE_ENV = 'development';
    const wrapper = createAuthWrapper();
    const { result } = renderHook(() => useLuciaAuth(), { wrapper });

    expect(result.current.isDevMode).toBe(true);

    act(() => {
      result.current.setMockRole('admin');
    });

    expect(result.current.currentMockRole).toBe('admin');
  });
});
```

### E. Security Testing

#### Session Security
```typescript
describe('Session Security', () => {
  test('should prevent session fixation', async () => {
    // Create initial session
    const session1 = await createSession('user-123');
    
    // Login should create new session
    const response = await request(app)
      .post('/api/auth/login')
      .set('Cookie', `${lucia.sessionCookieName}=${session1.id}`)
      .send({ username: 'testuser', password: 'password' })
      .expect(200);

    // Should get new session cookie
    const newSessionCookie = extractSessionCookie(response);
    expect(newSessionCookie).not.toBe(session1.id);
  });

  test('should prevent concurrent session hijacking', async () => {
    const user = await createTestUser();
    const session = await createSession(user.id);

    // Simulate concurrent requests
    const promises = Array(10).fill(null).map(() =>
      request(app)
        .get('/api/auth/user')
        .set('Cookie', `${lucia.sessionCookieName}=${session.id}`)
    );

    const responses = await Promise.all(promises);
    
    // All should succeed with same user
    responses.forEach(response => {
      expect(response.status).toBe(200);
      expect(response.body.user.id).toBe(user.id);
    });
  });

  test('should enforce session expiration', async () => {
    const user = await createTestUser();
    const session = await createSession(user.id);

    // Fast-forward time
    jest.advanceTimersByTime(30 * 24 * 60 * 60 * 1000 + 1); // 30 days + 1ms

    const response = await request(app)
      .get('/api/auth/user')
      .set('Cookie', `${lucia.sessionCookieName}=${session.id}`)
      .expect(401);

    expect(response.body.user).toBeUndefined();
  });
});
```

#### CSRF Protection
```typescript
describe('CSRF Protection', () => {
  test('should accept same-origin requests', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Origin', 'https://degentalk.com')
      .set('Host', 'degentalk.com')
      .expect(200);
  });

  test('should reject cross-origin requests', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Origin', 'https://evil.com')
      .set('Host', 'degentalk.com')
      .expect(403);

    expect(response.body.error).toContain('Invalid request origin');
  });

  test('should allow GET requests without origin check', async () => {
    const response = await request(app)
      .get('/api/auth/user')
      .set('Origin', 'https://evil.com')
      .expect(200);
  });
});
```

### F. Performance Testing

#### Session Validation Performance
```typescript
describe('Performance Tests', () => {
  test('should validate 1000 sessions within acceptable time', async () => {
    const users = await Promise.all(
      Array(1000).fill(null).map(() => createTestUser())
    );
    const sessions = await Promise.all(
      users.map(user => createSession(user.id))
    );

    const startTime = Date.now();
    const results = await Promise.all(
      sessions.map(session => lucia.validateSession(session.id))
    );
    const endTime = Date.now();

    expect(endTime - startTime).toBeLessThan(5000); // 5 seconds max
    expect(results.every(r => r.session !== null)).toBe(true);
  });

  test('should handle database connection failures gracefully', async () => {
    // Mock database failure
    jest.spyOn(db, 'select').mockRejectedValueOnce(new Error('Connection failed'));

    const response = await request(app)
      .get('/api/auth/user')
      .expect(500);

    expect(response.body.error).toContain('Database error');
  });
});
```

### G. End-to-End Testing

#### Complete Authentication Flow
```typescript
describe('E2E Authentication Flow', () => {
  test('should complete full login/logout cycle', async () => {
    await page.goto('/login');
    
    // Fill login form
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('should persist session across page refreshes', async () => {
    await loginAsUser(page, 'testuser', 'password123');
    
    // Refresh page
    await page.reload();
    
    // Should still be logged in
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should handle session expiration gracefully', async () => {
    await loginAsUser(page, 'testuser', 'password123');
    
    // Manually expire session
    await page.evaluate(() => {
      document.cookie = `lucia_session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
    
    // Navigate to protected page
    await page.goto('/admin');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });
});
```

## Test Data Management

### Database Setup
```typescript
// Test database configuration
export const testDbConfig = {
  database: ':memory:', // SQLite in-memory for speed
  migrations: './test/migrations',
  seed: './test/seeds'
};

// Test user factory
export const createTestUser = async (overrides = {}) => {
  const defaultUser = {
    username: `user_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: await hashPassword('testpassword'),
    isActive: true,
    role: 'user'
  };

  const userData = { ...defaultUser, ...overrides };
  const [user] = await db.insert(users).values(userData).returning();
  return user;
};
```

### Mock Services
```typescript
// API request mocking
export const mockApiRequest = jest.fn();
jest.mock('@/utils/api-request', () => ({
  apiRequest: mockApiRequest
}));

// Session cookie utilities
export const extractSessionCookie = (response: Response): string | null => {
  const cookies = response.headers['set-cookie'] || [];
  const sessionCookie = cookies.find(cookie => 
    cookie.startsWith(`${lucia.sessionCookieName}=`)
  );
  return sessionCookie ? sessionCookie.split('=')[1].split(';')[0] : null;
};
```

## Testing Environment Setup

### Development Testing
```bash
# Unit and integration tests
npm run test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e

# Security tests
npm run test:security
```

### CI/CD Pipeline Testing
```yaml
# .github/workflows/auth-tests.yml
name: Authentication Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run database migrations
        run: npm run db:migrate:test
        
      - name: Run unit tests
        run: npm run test:unit
        
      - name: Run integration tests
        run: npm run test:integration
        
      - name: Run security tests
        run: npm run test:security
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
```

## Test Coverage Goals

### Minimum Coverage Requirements
- **Unit Tests**: 85% line coverage
- **Integration Tests**: 80% branch coverage
- **E2E Tests**: 100% critical path coverage
- **Security Tests**: 100% security-sensitive code coverage

### Critical Coverage Areas
1. **Password handling**: 100% coverage required
2. **Session management**: 100% coverage required
3. **Role-based access**: 100% coverage required
4. **CSRF protection**: 100% coverage required
5. **Rate limiting**: 90% coverage required
6. **Error handling**: 85% coverage required

## Continuous Testing Strategy

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:security && npm run test:unit"
    }
  }
}
```

### Automated Security Scanning
- **SAST**: ESLint security rules, Semgrep
- **Dependency Scanning**: npm audit, Snyk
- **Container Scanning**: Trivy for Docker images
- **Runtime Monitoring**: Log analysis for auth failures

### Monitoring & Alerting
- Track authentication success/failure rates
- Monitor session creation/validation performance
- Alert on unusual auth patterns
- Dashboard for auth system health

This comprehensive testing strategy ensures the Lucia Auth implementation is secure, reliable, and maintains the high quality standards expected for a production authentication system.