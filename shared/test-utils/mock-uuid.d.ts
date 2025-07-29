/**
 * UUID Test Utilities
 *
 * Provides consistent UUID mocking for tests in the UUID-first architecture
 */
import type { UserId, ThreadId, PostId, MissionId, AchievementId } from '../types/ids.js';
declare global {
    function beforeEach(fn: () => void): void;
    function afterEach(fn: () => void): void;
    function expect(value: any): any;
    namespace jest {
        function fn(implementation?: (...args: any[]) => any): any;
    }
}
export declare function mockUuid(): string;
export declare function resetUuidCounter(): void;
/**
 * Typed UUID generators for different entity types
 */
export declare function mockUserId(): UserId;
export declare function mockThreadId(): ThreadId;
export declare function mockPostId(): PostId;
export declare function mockMissionId(): MissionId;
export declare function mockAchievementId(): AchievementId;
/**
 * Specific test UUIDs for consistent test scenarios
 */
export declare const TEST_UUIDS: {
    readonly ADMIN_USER: UserId;
    readonly TEST_USER_1: UserId;
    readonly TEST_USER_2: UserId;
    readonly TEST_THREAD_1: ThreadId;
    readonly TEST_THREAD_2: ThreadId;
    readonly TEST_POST_1: PostId;
    readonly TEST_POST_2: PostId;
    readonly TEST_MISSION_1: MissionId;
    readonly TEST_MISSION_2: MissionId;
    readonly TEST_ACHIEVEMENT_1: AchievementId;
    readonly TEST_ACHIEVEMENT_2: AchievementId;
};
/**
 * Mock request objects with UUID parameters
 */
export declare function mockRequestWithUUID(paramName: string, uuid: string): any;
/**
 * Jest/Vitest helpers for mocking crypto.randomUUID
 */
export declare function mockCryptoRandomUUID(): void;
/**
 * Validation helpers for tests
 */
export declare function isTestUUID(uuid: string): boolean;
export declare function expectValidUUID(uuid: unknown): void;
/**
 * Database test helpers
 */
export interface MockEntity {
    id: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare function createMockUser(overrides?: Partial<any>): any;
export declare function createMockThread(overrides?: Partial<any>): any;
export declare function createMockPost(overrides?: Partial<any>): any;
/**
 * Array helpers for generating test data
 */
export declare function generateMockUsers(count: number): any[];
export declare function generateMockThreads(count: number, userId?: UserId): any[];
export declare function generateMockPosts(count: number, threadId?: ThreadId, userId?: UserId): any[];
//# sourceMappingURL=mock-uuid.d.ts.map