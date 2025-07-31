import type { UserId } from './ids.js';
/**
 * Shared Configuration Types
 *
 * Standardized interfaces for configuration objects across domains
 * Eliminates scattered config interface duplication
 */
export interface BaseConfig {
    enabled: boolean;
    version?: string;
    lastUpdated?: Date;
}
export interface FeatureGate extends BaseConfig {
    id: string;
    name: string;
    description: string;
    minLevel?: number;
    devOnly?: boolean;
    rolloutPercentage?: number;
}
export interface ModuleConfig extends BaseConfig {
    module: string;
    dependencies?: string[];
    settings: Record<string, unknown>;
}
export interface ApiConfig extends BaseConfig {
    endpoint: string;
    timeout?: number;
    retries?: number;
    rateLimits?: {
        requests: number;
        window: number;
    };
}
export interface DatabaseConfig extends BaseConfig {
    connectionString: string;
    poolSize?: number;
    timeout?: number;
    ssl?: boolean;
}
export interface CacheConfig extends BaseConfig {
    provider: 'redis' | 'memory' | 'none';
    ttl: number;
    maxSize?: number;
    connectionUrl?: string;
}
export interface SecurityConfig extends BaseConfig {
    encryption: {
        algorithm: string;
        keyLength: number;
    };
    session: {
        secret: string;
        maxAge: number;
        secure: boolean;
    };
    cors: {
        origins: string[];
        credentials: boolean;
    };
}
export interface NotificationConfig extends BaseConfig {
    channels: ('email' | 'sms' | 'push' | 'webhook')[];
    templates: Record<string, {
        subject?: string;
        body: string;
        html?: string;
    }>;
    providers: Record<string, {
        apiKey: string;
        endpoint?: string;
    }>;
}
export interface UIConfig extends BaseConfig {
    theme: {
        colors: Record<string, string>;
        fonts: Record<string, string>;
        spacing: Record<string, string>;
    };
    features: FeatureGate[];
    layout: {
        sidebar: boolean;
        header: boolean;
        footer: boolean;
    };
}
export interface EconomyConfig extends BaseConfig {
    currency: {
        symbol: string;
        decimals: number;
        minAmount: number;
        maxAmount: number;
    };
    exchange: {
        enabled: boolean;
        rates: Record<string, number>;
    };
    fees: {
        transaction: number;
        withdrawal: number;
        deposit: number;
    };
}
export interface GamificationConfig extends BaseConfig {
    levels: {
        maxLevel: number;
        xpRequired: number[];
    };
    achievements: {
        enabled: boolean;
        categories: string[];
    };
    rewards: Record<string, {
        xp: number;
        currency?: number;
        items?: string[];
    }>;
}
export interface ForumConfig extends BaseConfig {
    posting: {
        maxThreadsPerDay: number;
        maxPostsPerDay: number;
        cooldownSeconds: number;
    };
    moderation: {
        autoModEnabled: boolean;
        spamThreshold: number;
        profanityFilter: boolean;
    };
    features: {
        voting: boolean;
        tagging: boolean;
        mentions: boolean;
    };
}
export interface SocialConfig extends BaseConfig {
    features: {
        friends: boolean;
        following: boolean;
        messaging: boolean;
        groups: boolean;
    };
    limits: {
        maxFriends: number;
        maxFollowing: number;
        maxGroupMembers: number;
    };
    privacy: {
        defaultVisibility: 'public' | 'friends' | 'private';
        allowMessages: boolean;
        allowFollowing: boolean;
    };
}
export interface ConfigValidation<T> {
    schema: unknown;
    validate: (config: T) => boolean;
    migrate?: (oldConfig: unknown) => T;
}
export interface ConfigStore<T extends BaseConfig> {
    get(): Promise<T>;
    set(config: T): Promise<void>;
    reset(): Promise<T>;
    backup(): Promise<string>;
    restore(backup: string): Promise<T>;
}
export interface EnvironmentConfig {
    development: Partial<BaseConfig>;
    staging: Partial<BaseConfig>;
    production: Partial<BaseConfig>;
}
export interface ConfigChange<T> {
    timestamp: Date;
    userId?: UserId;
    field: keyof T;
    oldValue: unknown;
    newValue: unknown;
    reason?: string;
}
export interface ConfigAuditLog<T extends BaseConfig> {
    configType: string;
    changes: ConfigChange<T>[];
    version: number;
    createdAt: Date;
}
export interface ConfigService<T extends BaseConfig> {
    getConfig(): Promise<T>;
    updateConfig(updates: Partial<T>): Promise<T>;
    validateConfig(config: T): Promise<boolean>;
    getHistory(): Promise<ConfigAuditLog<T>[]>;
    rollback(version: number): Promise<T>;
}
