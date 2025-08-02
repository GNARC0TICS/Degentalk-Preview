# Agent 4: The API Contract Enforcer ⚖️

## Mission Statement
**Align client-server API contracts to ensure type-safe communication**

## Domain & Scope
- **Files**: API routes, client queries, response handlers
- **Duration**: 60-90 minutes  
- **Priority**: HIGH (critical for frontend functionality)

## Target Error Patterns
```typescript
// 1. Response type mismatches
// Client expects: ApiResponse<User[]>
// Server returns: { users: User[], total: number }

// 2. API error format inconsistencies
// Client expects: ApiError
// Server throws: StandardApiResponse

// 3. Query parameter type mismatches
error TS2345: Argument of type 'string' is not assignable to parameter of type 'UserId'

// 4. Pagination inconsistencies
// Some endpoints: { data: [], pagination: {} }
// Others: { items: [], total: number }

// 5. Hook type mismatches
error TS2322: Type 'unknown' is not assignable to type 'User[]'
```

## API Contract Standards

### Unified Response Format
```typescript
// ✅ STANDARD - All endpoints must use this format
// In shared/types/api.types.ts

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    [key: string]: unknown;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;
```

### Pagination Standard
```typescript
// ✅ CONSISTENT - Use everywhere
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
```

## Server-Side Contract Enforcement

### Route Response Standardization
```typescript
// ❌ WRONG - Inconsistent response format
app.get('/api/users', async (req, res) => {
  const users = await userService.getAll();
  res.json({ users, total: users.length }); // Non-standard format!
});

// ✅ RIGHT - Standard ApiResponse format
app.get('/api/users', async (req, res) => {
  const users = await userService.getAll();
  const response: ApiResponse<User[]> = {
    success: true,
    data: users,
    meta: {
      pagination: {
        page: 1,
        limit: 50,
        total: users.length,
        totalPages: Math.ceil(users.length / 50)
      }
    }
  };
  res.json(response);
});
```

### Error Response Standardization
```typescript
// ❌ WRONG - Custom error formats
res.status(404).json({ message: 'User not found' });
res.status(400).json({ errors: ['Invalid input'] });

// ✅ RIGHT - Standard ApiError format
res.status(404).json({
  success: false,
  error: {
    code: 'USER_NOT_FOUND',
    message: 'User not found'
  }
} as ApiError);

res.status(400).json({
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input',
    details: ['Username required', 'Email invalid']
  }
} as ApiError);
```

## Client-Side Contract Enforcement

### Query Hook Type Safety
```typescript
// ❌ WRONG - Untyped queries
const { data } = useQuery('users', fetchUsers);
// data is unknown, causes type errors

// ✅ RIGHT - Properly typed queries
const { data } = useQuery<ApiResponse<User[]>>('users', fetchUsers);
// data is properly typed as ApiResponse<User[]>

// Even better - with utility types
const { data: users, error } = useTypedQuery<User[]>('users', fetchUsers);
// users is User[] | undefined, error is ApiError | null
```

### API Client Type Safety
```typescript
// ❌ WRONG - Untyped fetch calls
const response = await fetch('/api/users');
const users = await response.json(); // any type!

// ✅ RIGHT - Typed API client
const response = await apiClient.get<User[]>('/api/users');
// response is ApiResponse<User[]>

if (response.success) {
  const users = response.data; // Properly typed as User[]
} else {
  const error = response.error; // Properly typed as ApiError['error']
}
```

## High Priority Files to Fix

### 1. Server Route Files
Focus on heavily used endpoints:

**Auth Routes** (`server/src/domains/auth/*.routes.ts`):
```typescript
// Fix login response
POST /api/auth/login -> ApiResponse<{ user: User; token: string }>
POST /api/auth/register -> ApiResponse<{ user: User; token: string }>
GET /api/auth/me -> ApiResponse<User>
```

**User Routes** (`server/src/domains/users/*.routes.ts`):
```typescript
// Fix user endpoints
GET /api/users -> PaginatedResponse<User>
GET /api/users/:id -> ApiResponse<User>
PUT /api/users/:id -> ApiResponse<User>
```

**Forum Routes** (`server/src/domains/forum/*.routes.ts`):
```typescript
// Fix forum endpoints
GET /api/threads -> PaginatedResponse<Thread>
POST /api/threads -> ApiResponse<Thread>
GET /api/threads/:id/posts -> PaginatedResponse<Post>
```

### 2. Client Query Files
Focus on data fetching:

**Auth Queries** (`client/src/features/auth/hooks/*.ts`):
```typescript
// Fix useAuth hook
export const useAuth = () => {
  return useQuery<ApiResponse<User>>(['auth', 'me'], () => 
    apiClient.get<User>('/api/auth/me')
  );
};
```

**User Queries** (`client/src/features/users/hooks/*.ts`):
```typescript
// Fix user queries
export const useUsers = (params: UserListParams) => {
  return useQuery<PaginatedResponse<User>>(['users', params], () =>
    apiClient.get<User[]>('/api/users', { params })
  );
};
```

## Error Response Utility
Create helper functions for consistent responses:

```typescript
// In server/src/utils/api-responses.ts
export const createSuccessResponse = <T>(data: T, meta?: any): ApiResponse<T> => ({
  success: true,
  data,
  meta
});

export const createErrorResponse = (code: string, message: string, details?: unknown): ApiError => ({
  success: false,
  error: { code, message, details }
});

export const createPaginatedResponse = <T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> => ({
  success: true,
  data,
  meta: {
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
});
```

## Client API Utility
Create typed API client:

```typescript
// In client/src/utils/api-client.ts
export const apiClient = {
  async get<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const response = await fetch(url, { ...options, method: 'GET' });
    return response.json();
  },

  async post<T>(url: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    const response = await fetch(url, {
      ...options,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      body: JSON.stringify(body)
    });
    return response.json();
  }
  // ... other methods
};
```

## Workflow

### Step 1: Standardize Server Responses
```bash
# Find inconsistent response patterns
grep -r "res\.json" server/src/domains/ --include="*.ts" | head -20

# Look for non-standard formats:
grep -r "res\.json.*{.*[^success]" server/src/domains/ --include="*.ts"
```

### Step 2: Fix Client Query Types
```bash
# Find untyped queries
grep -r "useQuery" client/src/ --include="*.ts" | grep -v "<"

# Find fetch calls without types
grep -r "fetch(" client/src/ --include="*.ts" | grep -v "ApiResponse"
```

### Step 3: Align Response Formats
For each endpoint, ensure:
1. Server returns `ApiResponse<T>` or `ApiError`
2. Client expects the same type
3. Error handling uses standard format

## Testing Commands
```bash
# Test API contract alignment
npx tsc --noEmit client/src/features/auth/hooks/useAuth.ts
npx tsc --noEmit server/src/domains/auth/auth.routes.ts

# Check for response type mismatches
grep -r "ApiResponse" client/src/ server/src/ --include="*.ts" | grep -c "unknown"
```

## Success Criteria
- [ ] All API routes return consistent `ApiResponse<T>` format
- [ ] All client queries expect correct response types
- [ ] Error responses use standard `ApiError` format
- [ ] Pagination follows consistent `PaginatedResponse<T>` pattern
- [ ] No type 'unknown' in API responses
- [ ] Auth flow has proper type contracts

## Commit Strategy
```bash
# Commit by API domain
git add server/src/domains/auth/ client/src/features/auth/
git commit -m "fix(api): align auth endpoint contracts between client/server"

git add server/src/domains/users/ client/src/features/users/
git commit -m "fix(api): standardize user API response types"
```

## Rules
- ✅ Use shared types from `@shared/types/api.types`
- ✅ Both client and server must use identical response types
- ✅ All endpoints return `ApiResponse<T>` or `ApiError`
- ✅ Create utility functions for response creation
- ❌ Don't create endpoint-specific response formats
- ❌ Don't use `any` or `unknown` for API responses
- ❌ Don't ignore client-server type mismatches

**Mission: Make client and server speak the same typed language!**