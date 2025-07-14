/**
 * User factory with crypto-community personas and realistic test data
 */
import { BaseFactory } from '../core/factory';
import type { User } from '@schema';
import type { UserStats, LevelConfig, DisplaySettings } from '../../types/core/user.types';
export declare class UserFactory extends BaseFactory<User> {
    private static readonly CRYPTO_USERNAMES;
    private static readonly CRYPTO_EMAILS;
    definition(): Partial<User>;
    private generateCryptoUsername;
    private calculateLevel;
    /**
     * Create mock UserStats with new fields
     */
    static createUserStats(): UserStats;
    /**
     * Create mock LevelConfig
     */
    static createLevelConfig(level?: number): LevelConfig;
    /**
     * Create mock DisplaySettings
     */
    static createDisplaySettings(): DisplaySettings;
    private generateCryptoBio;
    protected getState(state: string): Partial<User>;
}
export declare class AdminUserFactory extends UserFactory {
    definition(): Partial<User>;
}
export declare class CryptoWhaleFactory extends UserFactory {
    definition(): Partial<User>;
}
export declare class NewbieUserFactory extends UserFactory {
    definition(): Partial<User>;
}
