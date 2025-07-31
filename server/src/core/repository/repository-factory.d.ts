/**
 * Repository Factory
 *
 * QUALITY IMPROVEMENT: Centralized repository management with dependency injection
 * Provides singleton instances of all repositories with proper initialization
 */
import type { IRepositoryFactory, IUserRepository, IForumRepository, IThreadRepository, IPostRepository, ITransactionRepository, IXPRepository, RepositoryConfig } from './interfaces';
export declare class RepositoryFactory implements IRepositoryFactory {
    private config;
    private instances;
    constructor(config?: Partial<RepositoryConfig>);
    /**
     * Get User Repository instance
     */
    getUserRepository(): IUserRepository;
    /**
     * Get Transaction Repository instance
     */
    getTransactionRepository(): ITransactionRepository;
    /**
     * Get Forum Repository instance (placeholder for future implementation)
     */
    getForumRepository(): IForumRepository;
    /**
     * Get Thread Repository instance
     */
    getThreadRepository(): IThreadRepository;
    /**
     * Get Post Repository instance (placeholder for future implementation)
     */
    getPostRepository(): IPostRepository;
    /**
     * Get XP Repository instance (placeholder for future implementation)
     */
    getXPRepository(): IXPRepository;
    /**
     * Clear all repository instances (useful for testing)
     */
    clearInstances(): void;
    /**
     * Get current configuration
     */
    getConfig(): RepositoryConfig;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<RepositoryConfig>): void;
    /**
     * Health check for all repositories
     */
    healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        repositories: Record<string, boolean>;
        timestamp: string;
    }>;
    /**
     * Get repository usage statistics
     */
    getUsageStats(): {
        instanceCount: number;
        instances: string[];
        config: RepositoryConfig;
    };
}
export declare const repositoryFactory: RepositoryFactory;
export declare const getUserRepository: () => IUserRepository;
export declare const getTransactionRepository: () => ITransactionRepository;
export declare const getForumRepository: () => IForumRepository;
export declare const getThreadRepository: () => IThreadRepository;
export declare const getPostRepository: () => IPostRepository;
export declare const getXPRepository: () => IXPRepository;
