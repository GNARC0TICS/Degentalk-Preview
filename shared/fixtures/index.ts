/**
 * Fixtures System - Main Entry Point
 * Comprehensive test data generation system for Degentalk
 */

// Core factory system
export { BaseFactory, FactoryBuilder, FactoryRegistry, Factory } from './core/factory';
export type {
	FactoryOptions,
	BuildOptions,
	ScenarioDefinition,
	ScenarioResult
} from './core/factory';

// Domain-specific factories
export {
	UserFactory,
	AdminUserFactory,
	CryptoWhaleFactory,
	NewbieUserFactory
} from './factories/user.factory';

export { ThreadFactory, PostFactory, ForumCategoryFactory } from './factories/forum.factory';

// Scenario generation
export {
	ScenarioGenerator,
	scenarioGenerator,
	availableScenarios
} from './utilities/scenario-generator';
export type {
	ScenarioConfig,
	ScenarioResult as GeneratedScenario,
	AvailableScenario
} from './utilities/scenario-generator';

// Test helpers and utilities
export {
	TestDataManager,
	testDataManager,
	createTestUser,
	createTestAdmin,
	createTestWhale,
	createTestThread,
	createTestPost,
	setupQuickScenario,
	expectValidUser,
	expectValidThread,
	expectValidPost
} from './utilities/test-helpers';

// Factory registration and initialization
import { Factory } from './core/factory';
import { UserFactory, AdminUserFactory, CryptoWhaleFactory } from './factories/user.factory';
import { ThreadFactory, PostFactory, ForumCategoryFactory } from './factories/forum.factory';
import { logger } from "../../server/src/core/logger";

// Register all factories globally
Factory.register('user', new UserFactory());
Factory.register('admin', new AdminUserFactory());
Factory.register('whale', new CryptoWhaleFactory());
Factory.register('thread', new ThreadFactory());
Factory.register('post', new PostFactory());
Factory.register('forum', new ForumCategoryFactory());

// Export initialized factory instance
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

// Version and metadata
export const FIXTURES_VERSION = '1.0.0';
export const SUPPORTED_ENTITIES = [
	'user',
	'admin',
	'whale',
	'thread',
	'post',
	'forum',
	'transaction',
	'tip'
] as const;

export type SupportedEntity = (typeof SUPPORTED_ENTITIES)[number];

// Configuration interface for the fixtures system
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

// Initialize fixtures with configuration
export function initializeFixtures(config: FixturesConfig = {}): void {
	const defaultConfig: Required<FixturesConfig> = {
		seed: config.seed || Date.now(),
		locale: config.locale || 'en',
		environment: config.environment || 'test',
		defaults: {
			userCount: 10,
			threadCount: 5,
			postCount: 20,
			...config.defaults
		}
	};

	// Apply configuration to all factories
	// This would be implemented to configure the faker instances
	logger.info('Fixtures initialized with config:', defaultConfig);
}

// Export convenience types for TypeScript users
export type FixtureUser = ReturnType<UserFactory['build']>;
export type FixtureThread = ReturnType<ThreadFactory['build']>;
export type FixturePost = ReturnType<PostFactory['build']>;
export type FixtureForum = ReturnType<ForumCategoryFactory['build']>;
