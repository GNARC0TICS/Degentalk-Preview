import { getXpForLevel } from './economy.config';
export { getXpForLevel };
export declare const getLevelForXp: (totalXp: number) => number;
export declare const getProgressWithinLevel: (totalXp: number) => {
    level: number;
    progress: number;
    nextLevelXp: number;
};
export declare function calculateTipXp(dgtAmount: number, xpGainedFromTipsToday: number): number;
export declare function applyDailyXpCap(xpEarnedToday: number, incomingXp: number): number;
export type XPAction = 'first_post' | 'daily_post' | 'reaction_received' | 'faucet_claim' | 'referral_signup' | 'referral_levelup' | 'tipped';
export interface XPContext {
    amount?: number;
    userId?: string;
    date?: Date;
    xpEarnedToday?: number;
    xpFromTipsToday?: number;
}
export declare function calculateXp(action: XPAction, ctx?: XPContext): number;
