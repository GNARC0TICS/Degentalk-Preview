"use strict";
/**
 * Fixtures System - Main Entry Point
 * Comprehensive test data generation system for Degentalk
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
exports.SUPPORTED_ENTITIES = exports.FIXTURES_VERSION = exports.FixtureFactory = exports.expectValidPost = exports.expectValidThread = exports.expectValidUser = exports.setupQuickScenario = exports.createTestPost = exports.createTestThread = exports.createTestWhale = exports.createTestAdmin = exports.createTestUser = exports.testDataManager = exports.TestDataManager = exports.availableScenarios = exports.scenarioGenerator = exports.ScenarioGenerator = exports.ForumCategoryFactory = exports.PostFactory = exports.ThreadFactory = exports.NewbieUserFactory = exports.CryptoWhaleFactory = exports.AdminUserFactory = exports.UserFactory = exports.Factory = exports.FactoryRegistry = exports.FactoryBuilder = exports.BaseFactory = void 0;
exports.initializeFixtures = initializeFixtures;
// Core factory system
var factory_1 = require("./core/factory");
Object.defineProperty(exports, "BaseFactory", { enumerable: true, get: function () { return factory_1.BaseFactory; } });
Object.defineProperty(exports, "FactoryBuilder", { enumerable: true, get: function () { return factory_1.FactoryBuilder; } });
Object.defineProperty(exports, "FactoryRegistry", { enumerable: true, get: function () { return factory_1.FactoryRegistry; } });
Object.defineProperty(exports, "Factory", { enumerable: true, get: function () { return factory_1.Factory; } });
// Domain-specific factories
var user_factory_1 = require("./factories/user.factory");
Object.defineProperty(exports, "UserFactory", { enumerable: true, get: function () { return user_factory_1.UserFactory; } });
Object.defineProperty(exports, "AdminUserFactory", { enumerable: true, get: function () { return user_factory_1.AdminUserFactory; } });
Object.defineProperty(exports, "CryptoWhaleFactory", { enumerable: true, get: function () { return user_factory_1.CryptoWhaleFactory; } });
Object.defineProperty(exports, "NewbieUserFactory", { enumerable: true, get: function () { return user_factory_1.NewbieUserFactory; } });
var forum_factory_1 = require("./factories/forum.factory");
Object.defineProperty(exports, "ThreadFactory", { enumerable: true, get: function () { return forum_factory_1.ThreadFactory; } });
Object.defineProperty(exports, "PostFactory", { enumerable: true, get: function () { return forum_factory_1.PostFactory; } });
Object.defineProperty(exports, "ForumCategoryFactory", { enumerable: true, get: function () { return forum_factory_1.ForumCategoryFactory; } });
// Scenario generation
var scenario_generator_1 = require("./utilities/scenario-generator");
Object.defineProperty(exports, "ScenarioGenerator", { enumerable: true, get: function () { return scenario_generator_1.ScenarioGenerator; } });
Object.defineProperty(exports, "scenarioGenerator", { enumerable: true, get: function () { return scenario_generator_1.scenarioGenerator; } });
Object.defineProperty(exports, "availableScenarios", { enumerable: true, get: function () { return scenario_generator_1.availableScenarios; } });
// Test helpers and utilities
var test_helpers_1 = require("./utilities/test-helpers");
Object.defineProperty(exports, "TestDataManager", { enumerable: true, get: function () { return test_helpers_1.TestDataManager; } });
Object.defineProperty(exports, "testDataManager", { enumerable: true, get: function () { return test_helpers_1.testDataManager; } });
Object.defineProperty(exports, "createTestUser", { enumerable: true, get: function () { return test_helpers_1.createTestUser; } });
Object.defineProperty(exports, "createTestAdmin", { enumerable: true, get: function () { return test_helpers_1.createTestAdmin; } });
Object.defineProperty(exports, "createTestWhale", { enumerable: true, get: function () { return test_helpers_1.createTestWhale; } });
Object.defineProperty(exports, "createTestThread", { enumerable: true, get: function () { return test_helpers_1.createTestThread; } });
Object.defineProperty(exports, "createTestPost", { enumerable: true, get: function () { return test_helpers_1.createTestPost; } });
Object.defineProperty(exports, "setupQuickScenario", { enumerable: true, get: function () { return test_helpers_1.setupQuickScenario; } });
Object.defineProperty(exports, "expectValidUser", { enumerable: true, get: function () { return test_helpers_1.expectValidUser; } });
Object.defineProperty(exports, "expectValidThread", { enumerable: true, get: function () { return test_helpers_1.expectValidThread; } });
Object.defineProperty(exports, "expectValidPost", { enumerable: true, get: function () { return test_helpers_1.expectValidPost; } });
// Factory registration and initialization
var factory_2 = require("./core/factory");
Object.defineProperty(exports, "FixtureFactory", { enumerable: true, get: function () { return factory_2.Factory; } });
var user_factory_2 = require("./factories/user.factory");
var forum_factory_2 = require("./factories/forum.factory");
// TODO: Replace with proper shared logger
// import { logger } from "../../server/src/core/logger";
// Register all factories globally
factory_2.Factory.register('user', new user_factory_2.UserFactory());
factory_2.Factory.register('admin', new user_factory_2.AdminUserFactory());
factory_2.Factory.register('whale', new user_factory_2.CryptoWhaleFactory());
factory_2.Factory.register('thread', new forum_factory_2.ThreadFactory());
factory_2.Factory.register('post', new forum_factory_2.PostFactory());
factory_2.Factory.register('forum', new forum_factory_2.ForumCategoryFactory());
/**
 * Quick Start Examples:
 *
 * // Create single entities
 * const user = Factory.create('user');
 * const admin = Factory.create('admin');
 * const whale = Factory.create('whale');
 *
 * // Create with overrides
 * const customUser = Factory.create('user', {
 *   overrides: { username: 'testuser', role: 'moderator' }
 * });
 *
 * // Create multiple entities
 * const users = Factory.createMany('user', 10);
 *
 * // Use fluent API
 * const richUser = Factory.get('user')
 *   .states('whale')
 *   .with({ username: 'crypto_millionaire' })
 *   .build();
 *
 * // Generate scenarios
 * import { scenarioGenerator } from '@fixtures';
 * const scenario = await scenarioGenerator.generateScenario('forum-discussion');
 *
 * // Quick test setup
 * import { setupQuickScenario } from '@fixtures';
 * const testData = await setupQuickScenario('basic');
 */
// Version and metadata
exports.FIXTURES_VERSION = '1.0.0';
exports.SUPPORTED_ENTITIES = [
    'user',
    'admin',
    'whale',
    'thread',
    'post',
    'forum',
    'transaction',
    'tip'
];
// Initialize fixtures with configuration
function initializeFixtures(config) {
    if (config === void 0) { config = {}; }
    var defaultConfig = {
        seed: config.seed || Date.now(),
        locale: config.locale || 'en',
        environment: config.environment || 'test',
        defaults: __assign({ userCount: 10, threadCount: 5, postCount: 20 }, config.defaults)
    };
    // Apply configuration to all factories
    // This would be implemented to configure the faker instances
    console.log('Fixtures initialized with config:', defaultConfig);
}
