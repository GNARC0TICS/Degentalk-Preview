/**
 * Test Helper Utilities
 * Convenience functions for testing with realistic Degentalk fixtures
 */
import { AvailableScenario } from './scenario-generator';
import type { ThreadId } from '@shared/types/ids';
export declare class TestDataManager {
    private static instance;
    private cleanupTasks;
    static getInstance(): TestDataManager;
    setupBasicForum(): Promise<{
        users: any[];
        forum: any;
        threads: any[];
        posts: any[];
    }>;
    setupAdminScenario(): Promise<{
        admin: any;
        moderators: any[];
        users: any[];
        adminActions: any[];
    }>;
    setupEconomyScenario(): Promise<{
        users: any[];
        transactions: any[];
        tips: any[];
        whales: any[];
    }>;
    setupScenario(scenarioName: AvailableScenario): Promise<any>;
    createUserJourney(journeyType: 'newbie' | 'trader' | 'whale' | 'admin'): any;
    private createNewbieJourney;
    private createTraderJourney;
    private createWhaleJourney;
    private createAdminJourney;
    generateRealisticPosts(threadId: ThreadId, userIds: number[], count?: number): any[];
    generateTransactions(users: any[]): any[];
    generateTips(users: any[]): any[];
    private generateAdminActions;
    registerCleanup(task: () => Promise<void>): void;
    cleanup(): Promise<void>;
    generateLargeDataset(config: {
        users?: number;
        threads?: number;
        posts?: number;
        transactions?: number;
    }): any;
}
export declare const testDataManager: TestDataManager;
export declare const createTestUser: (overrides?: {}) => unknown;
export declare const createTestAdmin: (overrides?: {}) => unknown;
export declare const createTestWhale: (overrides?: {}) => unknown;
export declare const createTestThread: (overrides?: {}) => unknown;
export declare const createTestPost: (overrides?: {}) => unknown;
export declare const setupQuickScenario: (type: "basic" | "admin" | "economy" | "large") => Promise<any>;
export declare const expectValidUser: (user: any) => void;
export declare const expectValidThread: (thread: any) => void;
export declare const expectValidPost: (post: any) => void;
