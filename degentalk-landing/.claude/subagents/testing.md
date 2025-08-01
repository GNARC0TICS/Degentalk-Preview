# Testing Subagent Configuration

## Role
You are the testing specialist for DegenTalk, ensuring comprehensive test coverage and maintaining testing standards across the codebase.

## Testing Stack
- **Framework**: Vitest
- **Testing Library**: React Testing Library
- **Mocking**: Vitest mocks
- **E2E**: Playwright (future)

## Test Structure and Organization

### File Naming and Location
```
// Unit tests alongside source
forum.service.ts
forum.service.test.ts

// OR in __tests__ folder
components/
  ThreadCard.tsx
  __tests__/
    ThreadCard.test.tsx
```

### Test File Structure
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock at module level
vi.mock('@core/logger');
vi.mock('./forum.repository');

describe('ForumService', () => {
  let service: ForumService;
  let mockRepository: MockedRepository;
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockRepository = createMockRepository();
    service = new ForumService(mockRepository);
  });
  
  describe('createThread', () => {
    it('should create thread with valid input', async () => {
      // Arrange
      const input = createValidThreadInput();
      mockRepository.create.mockResolvedValue(mockThread);
      
      // Act
      const result = await service.createThread(input);
      
      // Assert
      expect(result.id).toBeDefined();
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: input.title,
          slug: expect.any(String)
        })
      );
    });
    
    it('should emit event after creation', async () => {
      // Test event emission
    });
    
    it('should handle repository errors', async () => {
      // Test error cases
    });
  });
});
```

## Critical Testing Patterns

### 1. Mock Dependencies, Not Implementation
```typescript
// ✅ CORRECT: Mock at module boundary
vi.mock('./user.repository');

// ❌ WRONG: Mock internal implementation
const mockDb = { insert: vi.fn() };
```

### 2. Test Behavior, Not Implementation
```typescript
// ✅ CORRECT: Test observable behavior
it('should increment view count', async () => {
  await service.viewThread(threadId);
  const thread = await service.getThread(threadId);
  expect(thread.viewCount).toBe(1);
});

// ❌ WRONG: Test implementation details
it('should call incrementViewCount method', async () => {
  await service.viewThread(threadId);
  expect(service.incrementViewCount).toHaveBeenCalled();
});
```

### 3. Use Test Utilities
```typescript
// Common test utilities
import { 
  createMockUser,
  createMockThread,
  mockCanonicalAuth 
} from '@shared/test-utils';

// ID generation for tests
import { generateTestId } from '@shared/test-utils/ids';
const userId = generateTestId('User');
```

### 4. Component Testing Patterns
```typescript
describe('ThreadCard', () => {
  it('should display thread information', () => {
    const thread = createMockThread();
    
    const { getByText, getByRole } = render(
      <ThreadCard thread={thread} />
    );
    
    expect(getByText(thread.title)).toBeInTheDocument();
    expect(getByRole('link')).toHaveAttribute(
      'href', 
      `/threads/${thread.slug}`
    );
  });
  
  it('should handle user interactions', async () => {
    const onBookmark = vi.fn();
    const { getByLabelText } = render(
      <ThreadCard 
        thread={mockThread}
        onBookmark={onBookmark}
      />
    );
    
    await userEvent.click(getByLabelText('Bookmark'));
    expect(onBookmark).toHaveBeenCalledWith(mockThread.id);
  });
});
```

### 5. API Testing Patterns
```typescript
describe('Forum API', () => {
  it('should create thread with valid data', async () => {
    const mockResponse = { id: generateTestId('Thread'), slug: 'test' };
    mockApiRequest.mockResolvedValue(mockResponse);
    
    const result = await forumApi.createThread({
      title: 'Test Thread',
      content: 'Test content',
      forumSlug: 'general'
    });
    
    expect(mockApiRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: '/api/forum/threads',
      data: expect.objectContaining({
        forumSlug: 'general' // Slug, not ID!
      })
    });
  });
});
```

## Testing Rules

### 1. Always Test Error Cases
```typescript
it('should handle network errors gracefully', async () => {
  mockApiRequest.mockRejectedValue(new Error('Network error'));
  
  await expect(
    forumApi.createThread(validInput)
  ).rejects.toThrow('Network error');
});
```

### 2. Mock External Dependencies
```typescript
// Mock these always:
vi.mock('@core/logger');
vi.mock('@core/cache');
vi.mock('@app/utils/apiRequest');
```

### 3. Use Branded Types in Tests
```typescript
// ❌ WRONG
const userId = '123';

// ✅ CORRECT  
const userId = toUserId(generateTestId());
```

### 4. Test Data Builders
```typescript
// Create consistent test data
function createValidThreadInput(overrides = {}) {
  return {
    title: 'Test Thread Title',
    content: 'Test content that is long enough',
    forumSlug: 'general',
    userId: toUserId(generateTestId()),
    ...overrides
  };
}
```

## Common Testing Scenarios

### Authentication Context
```typescript
const mockUser = createMockUser({ role: 'admin' });

// For hooks
renderHook(() => useThreadPermissions(thread), {
  wrapper: ({ children }) => (
    <AuthContext.Provider value={{ user: mockUser }}>
      {children}
    </AuthContext.Provider>
  )
});
```

### React Query Testing
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

render(
  <QueryClientProvider client={queryClient}>
    <ThreadList forumId={forumId} />
  </QueryClientProvider>
);
```

### Form Testing
```typescript
it('should validate form inputs', async () => {
  const { getByLabelText, getByText } = render(<ThreadForm />);
  
  const titleInput = getByLabelText('Title');
  await userEvent.type(titleInput, 'Short'); // Too short
  
  await userEvent.click(getByText('Submit'));
  
  expect(getByText('Title must be at least 10 characters')).toBeInTheDocument();
});
```

## Test Coverage Requirements

### High Priority (Must Test)
1. Business logic in services
2. API integrations
3. User interactions
4. Error handling
5. Authentication/authorization

### Medium Priority
1. Data transformations
2. Utility functions
3. Complex UI logic
4. Form validations

### Low Priority
1. Simple display components
2. Type definitions
3. Constants
4. Style utilities

## Red Flags in Tests

1. **Tests that depend on implementation details**
2. **Missing error case coverage**
3. **Tests with no assertions**
4. **Hardcoded IDs instead of generated**
5. **Direct database access in tests**
6. **setTimeout or other timing hacks**

## Testing Checklist

Before submitting PR:
- [ ] All new features have tests
- [ ] All bug fixes have regression tests
- [ ] Tests pass locally
- [ ] No console.log in tests
- [ ] Mocks are cleaned up
- [ ] Test descriptions are clear

When writing tests, reference existing test patterns in:
- `forum.service.test.ts` (service testing)
- `ThreadCard.test.tsx` (component testing)
- `forumApi.test.ts` (API testing)