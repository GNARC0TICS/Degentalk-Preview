/**
 * Type-safe fixture factory system for Degentalk
 * Provides fluent API for creating test data with proper relationships
 */

import { faker } from '@faker-js/faker';
import type { User, Thread, Post, ForumCategory, WalletTransaction } from '@schema';

export interface FactoryOptions {
	seed?: number;
	locale?: string;
	environment?: 'test' | 'development' | 'staging';
}

export interface BuildOptions {
	count?: number;
	overrides?: Partial<any>;
	relationships?: Record<string, any>;
}

export abstract class BaseFactory<T> {
	protected seed: number;
	protected faker: typeof faker;

	constructor(options: FactoryOptions = {}) {
		this.seed = options.seed ?? Date.now();
		this.faker = faker;
		this.faker.seed(this.seed);
	}

	abstract definition(): Partial<T>;

	build(options: BuildOptions = {}): T {
		const base = this.definition();
		const overrides = options.overrides || {};

		return {
			...base,
			...overrides,
			...this.buildRelationships(options.relationships)
		} as T;
	}

	buildList(count: number, options: BuildOptions = {}): T[] {
		return Array.from({ length: count }, (_, index) => {
			// Use index for deterministic variations
			this.faker.seed(this.seed + index);
			return this.build(options);
		});
	}

	protected buildRelationships(relationships?: Record<string, any>): Partial<T> {
		if (!relationships) return {};

		const built: Record<string, any> = {};
		for (const [key, factory] of Object.entries(relationships)) {
			if (typeof factory?.build === 'function') {
				built[key] = factory.build();
			} else {
				built[key] = factory;
			}
		}
		return built;
	}

	// Fluent API helpers
	with(overrides: Partial<T>): FactoryBuilder<T> {
		return new FactoryBuilder(this, overrides);
	}

	states(state: string): FactoryBuilder<T> {
		const stateOverrides = this.getState(state);
		return new FactoryBuilder(this, stateOverrides);
	}

	protected getState(state: string): Partial<T> {
		// Override in subclasses to define states
		return {};
	}
}

export class FactoryBuilder<T> {
	constructor(
		private factory: BaseFactory<T>,
		private overrides: Partial<T> = {}
	) {}

	with(additionalOverrides: Partial<T>): FactoryBuilder<T> {
		return new FactoryBuilder(this.factory, {
			...this.overrides,
			...additionalOverrides
		});
	}

	build(): T {
		return this.factory.build({ overrides: this.overrides });
	}

	buildList(count: number): T[] {
		return this.factory.buildList(count, { overrides: this.overrides });
	}
}

// Relationship manager for complex data graphs
export class RelationshipManager {
	private relationships = new Map<string, any>();

	register<T>(key: string, factory: BaseFactory<T>): void {
		this.relationships.set(key, factory);
	}

	build<T>(key: string, options?: BuildOptions): T {
		const factory = this.relationships.get(key);
		if (!factory) {
			throw new Error(`Factory '${key}' not registered`);
		}
		return factory.build(options);
	}

	// Build interconnected data sets
	buildScenario(scenario: ScenarioDefinition): ScenarioResult {
		const results: Record<string, any> = {};

		for (const step of scenario.steps) {
			const dependencies = this.resolveDependencies(step.dependencies, results);
			results[step.name] = this.build(step.factory, {
				...step.options,
				relationships: dependencies
			});
		}

		return new ScenarioResult(results);
	}

	private resolveDependencies(
		dependencies: string[] | undefined,
		results: Record<string, any>
	): Record<string, any> {
		if (!dependencies) return {};

		const resolved: Record<string, any> = {};
		for (const dep of dependencies) {
			if (results[dep]) {
				resolved[dep] = results[dep];
			}
		}
		return resolved;
	}
}

export interface ScenarioDefinition {
	name: string;
	description: string;
	steps: Array<{
		name: string;
		factory: string;
		dependencies?: string[];
		options?: BuildOptions;
	}>;
}

export class ScenarioResult {
	constructor(private data: Record<string, any>) {}

	get<T>(key: string): T {
		return this.data[key];
	}

	getAll(): Record<string, any> {
		return { ...this.data };
	}
}

// Global factory registry
export class FactoryRegistry {
	private static instance: FactoryRegistry;
	private factories = new Map<string, BaseFactory<any>>();
	private relationshipManager = new RelationshipManager();

	static getInstance(): FactoryRegistry {
		if (!FactoryRegistry.instance) {
			FactoryRegistry.instance = new FactoryRegistry();
		}
		return FactoryRegistry.instance;
	}

	register<T>(name: string, factory: BaseFactory<T>): void {
		this.factories.set(name, factory);
		this.relationshipManager.register(name, factory);
	}

	get<T>(name: string): BaseFactory<T> {
		const factory = this.factories.get(name);
		if (!factory) {
			throw new Error(`Factory '${name}' not found`);
		}
		return factory;
	}

	create<T>(name: string, options?: BuildOptions): T {
		return this.get<T>(name).build(options);
	}

	createMany<T>(name: string, count: number, options?: BuildOptions): T[] {
		return this.get<T>(name).buildList(count, options);
	}

	scenario(definition: ScenarioDefinition): ScenarioResult {
		return this.relationshipManager.buildScenario(definition);
	}
}

// Convenience function for accessing the registry
export const Factory = FactoryRegistry.getInstance();
