"use strict";
/**
 * UUID Test Utilities
 *
 * Provides consistent UUID mocking for tests in the UUID-first architecture
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEST_UUIDS = void 0;
exports.mockUuid = mockUuid;
exports.resetUuidCounter = resetUuidCounter;
exports.mockUserId = mockUserId;
exports.mockThreadId = mockThreadId;
exports.mockPostId = mockPostId;
exports.mockMissionId = mockMissionId;
exports.mockAchievementId = mockAchievementId;
exports.mockRequestWithUUID = mockRequestWithUUID;
exports.mockCryptoRandomUUID = mockCryptoRandomUUID;
exports.isTestUUID = isTestUUID;
exports.expectValidUUID = expectValidUUID;
exports.createMockUser = createMockUser;
exports.createMockThread = createMockThread;
exports.createMockPost = createMockPost;
exports.generateMockUsers = generateMockUsers;
exports.generateMockThreads = generateMockThreads;
exports.generateMockPosts = generateMockPosts;
/**
 * Deterministic UUID generator for tests
 * Generates consistent UUIDs based on an incremental counter
 */
var uuidCounter = 1;
function mockUuid() {
    var id = uuidCounter.toString().padStart(12, '0');
    uuidCounter++;
    return "".concat(id.slice(0, 8), "-").concat(id.slice(8, 12), "-4000-8000-").concat(id.padEnd(12, '0'));
}
function resetUuidCounter() {
    uuidCounter = 1;
}
/**
 * Typed UUID generators for different entity types
 */
function mockUserId() {
    return mockUuid();
}
function mockThreadId() {
    return mockUuid();
}
function mockPostId() {
    return mockUuid();
}
function mockMissionId() {
    return mockUuid();
}
function mockAchievementId() {
    return mockUuid();
}
/**
 * Specific test UUIDs for consistent test scenarios
 */
exports.TEST_UUIDS = {
    // Users
    ADMIN_USER: '00000001-0000-4000-8000-000000000001',
    TEST_USER_1: '00000002-0000-4000-8000-000000000002',
    TEST_USER_2: '00000003-0000-4000-8000-000000000003',
    // Threads
    TEST_THREAD_1: '10000001-0000-4000-8000-000000000001',
    TEST_THREAD_2: '10000002-0000-4000-8000-000000000002',
    // Posts
    TEST_POST_1: '20000001-0000-4000-8000-000000000001',
    TEST_POST_2: '20000002-0000-4000-8000-000000000002',
    // Missions
    TEST_MISSION_1: '30000001-0000-4000-8000-000000000001',
    TEST_MISSION_2: '30000002-0000-4000-8000-000000000002',
    // Achievements
    TEST_ACHIEVEMENT_1: '40000001-0000-4000-8000-000000000001',
    TEST_ACHIEVEMENT_2: '40000002-0000-4000-8000-000000000002'
};
/**
 * Mock request objects with UUID parameters
 */
function mockRequestWithUUID(paramName, uuid) {
    var _a;
    return {
        params: (_a = {}, _a[paramName] = uuid, _a),
        query: {},
        body: {},
        headers: {},
        user: { id: exports.TEST_UUIDS.TEST_USER_1 }
    };
}
/**
 * Jest/Vitest helpers for mocking crypto.randomUUID
 */
function mockCryptoRandomUUID() {
    var _a;
    var originalRandomUUID = (_a = global.crypto) === null || _a === void 0 ? void 0 : _a.randomUUID;
    beforeEach(function () {
        resetUuidCounter();
        if (global.crypto) {
            global.crypto.randomUUID = jest.fn(mockUuid);
        }
        else {
            // For Node.js environments without crypto.randomUUID
            var crypto_1 = require('crypto');
            crypto_1.randomUUID = jest.fn(mockUuid);
        }
    });
    afterEach(function () {
        if (originalRandomUUID && global.crypto) {
            global.crypto.randomUUID = originalRandomUUID;
        }
    });
}
/**
 * Validation helpers for tests
 */
function isTestUUID(uuid) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}
function expectValidUUID(uuid) {
    expect(typeof uuid).toBe('string');
    expect(isTestUUID(uuid)).toBe(true);
}
function createMockUser(overrides) {
    if (overrides === void 0) { overrides = {}; }
    return __assign({ id: mockUserId(), username: 'testuser', email: 'test@example.com', createdAt: new Date(), updatedAt: new Date() }, overrides);
}
function createMockThread(overrides) {
    if (overrides === void 0) { overrides = {}; }
    return __assign({ id: mockThreadId(), title: 'Test Thread', userId: mockUserId(), structureId: mockUuid(), createdAt: new Date(), updatedAt: new Date() }, overrides);
}
function createMockPost(overrides) {
    if (overrides === void 0) { overrides = {}; }
    return __assign({ id: mockPostId(), content: 'Test post content', userId: mockUserId(), threadId: mockThreadId(), createdAt: new Date(), updatedAt: new Date() }, overrides);
}
/**
 * Array helpers for generating test data
 */
function generateMockUsers(count) {
    return Array.from({ length: count }, function (_, i) {
        return createMockUser({
            username: "testuser".concat(i + 1),
            email: "test".concat(i + 1, "@example.com")
        });
    });
}
function generateMockThreads(count, userId) {
    var defaultUserId = userId || mockUserId();
    return Array.from({ length: count }, function (_, i) {
        return createMockThread({
            title: "Test Thread ".concat(i + 1),
            userId: defaultUserId
        });
    });
}
function generateMockPosts(count, threadId, userId) {
    var defaultThreadId = threadId || mockThreadId();
    var defaultUserId = userId || mockUserId();
    return Array.from({ length: count }, function (_, i) {
        return createMockPost({
            content: "Test post content ".concat(i + 1),
            threadId: defaultThreadId,
            userId: defaultUserId
        });
    });
}
