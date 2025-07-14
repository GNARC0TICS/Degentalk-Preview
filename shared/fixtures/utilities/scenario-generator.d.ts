/**
 * Scenario Generator Utilities
 * Generates complex, realistic test scenarios for the Degentalk platform
 */
export interface ScenarioConfig {
    name: string;
    description: string;
    complexity: 'simple' | 'medium' | 'complex';
    estimatedDuration: string;
}
export interface ScenarioResult {
    config: ScenarioConfig;
    generatedData: Record<string, any[]>;
    relationships: Record<string, string[]>;
    statistics: {
        totalEntities: number;
        entitiesByType: Record<string, number>;
        generationTime: number;
    };
}
export declare class ScenarioGenerator {
    private startTime;
    generateScenario(scenarioName: string): Promise<ScenarioResult>;
    private getScenarioDefinition;
    private generateForumDiscussion;
    private generateWhaleActivity;
    private generateNewUserOnboarding;
    private generateAdminModeration;
    private generateCryptoMarketEvent;
    private generateCommunityGrowth;
    private generateThreadStarterContent;
    private generateWhaleTransactions;
    private generateWhaleTips;
    private generateEngagementData;
    private generateOnboardingProgression;
    private generateModerationActions;
    private generateAuditLogs;
    private generateSettingsChanges;
    private generateMarketEventContent;
    private generateMarketReactionData;
    private generateCommunityStats;
    private buildScenarioResult;
}
export declare const scenarioGenerator: ScenarioGenerator;
export declare const availableScenarios: readonly ["forum-discussion", "whale-activity", "new-user-onboarding", "admin-moderation", "crypto-market-event", "community-growth"];
export type AvailableScenario = (typeof availableScenarios)[number];
