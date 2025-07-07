/**
 * UUID Test Utilities
 * 
 * Provides consistent UUID mocking for tests in the UUID-first architecture
 */

import type { UserId, ThreadId, PostId, MissionId, AchievementId } from '@shared/types/ids';

/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * Deterministic UUID generator for tests
 * Generates consistent UUIDs based on an incremental counter
 */
let uuidCounter = 1;

export function mockUuid(): string {
  const id = uuidCounter.toString().padStart(12, '0');
  uuidCounter++;
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-4000-8000-${id.padEnd(12, '0')}`;
}

export function resetUuidCounter(): void {
  uuidCounter = 1;
}

/**
 * Typed UUID generators for different entity types
 */
export function mockUserId(): UserId {
  return mockUuid() as UserId;
}

export function mockThreadId(): ThreadId {
  return mockUuid() as ThreadId;
}

export function mockPostId(): PostId {
  return mockUuid() as PostId;
}

export function mockMissionId(): MissionId {
  return mockUuid() as MissionId;
}

export function mockAchievementId(): AchievementId {
  return mockUuid() as AchievementId;
}

/**
 * Specific test UUIDs for consistent test scenarios
 */
export const TEST_UUIDS = {
  // Users
  ADMIN_USER: '00000001-0000-4000-8000-000000000001' as UserId,
  TEST_USER_1: '00000002-0000-4000-8000-000000000002' as UserId,
  TEST_USER_2: '00000003-0000-4000-8000-000000000003' as UserId,
  
  // Threads
  TEST_THREAD_1: '10000001-0000-4000-8000-000000000001' as ThreadId,
  TEST_THREAD_2: '10000002-0000-4000-8000-000000000002' as ThreadId,
  
  // Posts
  TEST_POST_1: '20000001-0000-4000-8000-000000000001' as PostId,
  TEST_POST_2: '20000002-0000-4000-8000-000000000002' as PostId,
  
  // Missions
  TEST_MISSION_1: '30000001-0000-4000-8000-000000000001' as MissionId,
  TEST_MISSION_2: '30000002-0000-4000-8000-000000000002' as MissionId,
  
  // Achievements
  TEST_ACHIEVEMENT_1: '40000001-0000-4000-8000-000000000001' as AchievementId,
  TEST_ACHIEVEMENT_2: '40000002-0000-4000-8000-000000000002' as AchievementId
} as const;

/**
 * Mock request objects with UUID parameters
 */
export function mockRequestWithUUID(paramName: string, uuid: string) {
  return {
    params: { [paramName]: uuid },
    query: {},
    body: {},
    headers: {},
    user: { id: TEST_UUIDS.TEST_USER_1 }
  } as any;
}

/**
 * Jest/Vitest helpers for mocking crypto.randomUUID
 */
export function mockCryptoRandomUUID() {
  const originalRandomUUID = global.crypto?.randomUUID;
  
  beforeEach(() => {
    resetUuidCounter();
    
    if (global.crypto) {
      global.crypto.randomUUID = jest.fn(mockUuid);
    } else {
      // For Node.js environments without crypto.randomUUID
      const crypto = require('crypto');
      crypto.randomUUID = jest.fn(mockUuid);
    }
  });
  
  afterEach(() => {
    if (originalRandomUUID && global.crypto) {
      global.crypto.randomUUID = originalRandomUUID;
    }
  });
}

/**
 * Validation helpers for tests
 */
export function isTestUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

export function expectValidUUID(uuid: unknown): void {
  expect(typeof uuid).toBe('string');
  expect(isTestUUID(uuid as string)).toBe(true);
}

/**
 * Database test helpers
 */
export interface MockEntity {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export function createMockUser(overrides: Partial<any> = {}): any {
  return {
    id: mockUserId(),
    username: 'testuser',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

export function createMockThread(overrides: Partial<any> = {}): any {
  return {
    id: mockThreadId(),
    title: 'Test Thread',
    userId: mockUserId(),
    structureId: mockUuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

export function createMockPost(overrides: Partial<any> = {}): any {
  return {
    id: mockPostId(),
    content: 'Test post content',
    userId: mockUserId(),
    threadId: mockThreadId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

/**
 * Array helpers for generating test data
 */
export function generateMockUsers(count: number): any[] {
  return Array.from({ length: count }, (_, i) => createMockUser({
    username: `testuser${i + 1}`,
    email: `test${i + 1}@example.com`
  }));
}

export function generateMockThreads(count: number, userId?: UserId): any[] {
  const defaultUserId = userId || mockUserId();
  return Array.from({ length: count }, (_, i) => createMockThread({
    title: `Test Thread ${i + 1}`,
    userId: defaultUserId
  }));
}

export function generateMockPosts(count: number, threadId?: ThreadId, userId?: UserId): any[] {
  const defaultThreadId = threadId || mockThreadId();
  const defaultUserId = userId || mockUserId();
  return Array.from({ length: count }, (_, i) => createMockPost({
    content: `Test post content ${i + 1}`,
    threadId: defaultThreadId,
    userId: defaultUserId
  }));
}