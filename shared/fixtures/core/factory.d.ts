/**
 * Type-safe fixture factory system for Degentalk
 * Provides fluent API for creating test data with proper relationships
 */
import { faker } from '@faker-js/faker';
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
export declare abstract class BaseFactory<T> {
    protected seed: number;
    protected faker: typeof faker;
    constructor(options?: FactoryOptions);
    abstract definition(): Partial<T>;
    build(options?: BuildOptions): T;
    buildList(count: number, options?: BuildOptions): T[];
    protected buildRelationships(relationships?: Record<string, any>): Partial<T>;
    with(overrides: Partial<T>): FactoryBuilder<T>;
    states(state: string): FactoryBuilder<T>;
    protected getState(state: string): Partial<T>;
}
export declare class FactoryBuilder<T> {
    private factory;
    private overrides;
    constructor(factory: BaseFactory<T>, overrides?: Partial<T>);
    with(additionalOverrides: Partial<T>): FactoryBuilder<T>;
    build(): T;
    buildList(count: number): T[];
}
export declare class RelationshipManager {
    private relationships;
    register<T>(key: string, factory: BaseFactory<T>): void;
    build<T>(key: string, options?: BuildOptions): T;
    buildScenario(scenario: ScenarioDefinition): ScenarioResult;
    private resolveDependencies;
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
export declare class ScenarioResult {
    private data;
    constructor(data: Record<string, any>);
    get<T>(key: string): T;
    getAll(): Record<string, any>;
}
export declare class FactoryRegistry {
    private static instance;
    private factories;
    private relationshipManager;
    static getInstance(): FactoryRegistry;
    register<T>(name: string, factory: BaseFactory<T>): void;
    get<T>(name: string): BaseFactory<T>;
    create<T>(name: string, options?: BuildOptions): T;
    createMany<T>(name: string, count: number, options?: BuildOptions): T[];
    scenario(definition: ScenarioDefinition): ScenarioResult;
}
export declare const Factory: FactoryRegistry;
