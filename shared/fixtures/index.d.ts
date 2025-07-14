/**
 * Fixtures System - Main Entry Point
 * Comprehensive test data generation system for Degentalk
 */
export { BaseFactory, FactoryBuilder, FactoryRegistry, Factory } from './core/factory';
export type { FactoryOptions, BuildOptions, ScenarioDefinition, ScenarioResult } from './core/factory';
export { UserFactory, AdminUserFactory, CryptoWhaleFactory, NewbieUserFactory } from './factories/user.factory';
export { ThreadFactory, PostFactory, ForumCategoryFactory } from './factories/forum.factory';
export { ScenarioGenerator, scenarioGenerator, availableScenarios } from './utilities/scenario-generator';
export type { ScenarioConfig, ScenarioResult as GeneratedScenario, AvailableScenario } from './utilities/scenario-generator';
export { TestDataManager, testDataManager, createTestUser, createTestAdmin, createTestWhale, createTestThread, createTestPost, setupQuickScenario, expectValidUser, expectValidThread, expectValidPost } from './utilities/test-helpers';
import { Factory } from './core/factory';
import { UserFactory } from './factories/user.factory';
import { ThreadFactory, PostFactory, ForumCategoryFactory } from './factories/forum.factory';
export { Factory as FixtureFactory };
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
export declare const FIXTURES_VERSION = "1.0.0";
export declare const SUPPORTED_ENTITIES: readonly ["user", "admin", "whale", "thread", "post", "forum", "transaction", "tip"];
export type SupportedEntity = (typeof SUPPORTED_ENTITIES)[number];
export interface FixturesConfig {
    seed?: number;
    locale?: string;
    environment?: 'test' | 'development' | 'staging';
    defaults?: {
        userCount?: number;
        threadCount?: number;
        postCount?: number;
    };
}
export declare function initializeFixtures(config?: FixturesConfig): void;
export type FixtureUser = ReturnType<UserFactory['build']>;
export type FixtureThread = ReturnType<ThreadFactory['build']>;
export type FixturePost = ReturnType<PostFactory['build']>;
export type FixtureForum = ReturnType<ForumCategoryFactory['build']>;
