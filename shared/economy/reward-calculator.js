import { economyConfig, getXpForLevel } from './economy.config.js';
import { rainTipConfig } from './rain-tip-config.js';
// Re-export for convenience
export { getXpForLevel };
// -------- XP → Level helpers --------
export const getLevelForXp = (totalXp) => {
    const levels = economyConfig.levelXPMap;
    // Determine level up to 10 using explicit map
    let lvl = 1;
    for (const [levelStr, xpNeeded] of Object.entries(levels)) {
        const level = Number(levelStr);
        if (totalXp >= xpNeeded)
            lvl = level;
    }
    // For >10, use formula until xp less than next level requirement
    while (totalXp >= getXpForLevel(lvl + 1)) {
        lvl += 1;
    }
    return lvl;
};
export const getProgressWithinLevel = (totalXp) => {
    const level = getLevelForXp(totalXp);
    const currentLevelStart = getXpForLevel(level);
    const nextLevelXp = getXpForLevel(level + 1);
    const progress = (totalXp - currentLevelStart) / (nextLevelXp - currentLevelStart);
    return { level, progress, nextLevelXp };
};
// -------- Action-based XP helpers --------
export function calculateTipXp(dgtAmount, xpGainedFromTipsToday) {
    const xpPerDgt = 10; // Manifesto rule
    const rawXp = dgtAmount * xpPerDgt;
    const remainingCap = economyConfig.MAX_TIP_XP_PER_DAY - xpGainedFromTipsToday;
    return Math.max(0, Math.min(rawXp, remainingCap));
}
export function applyDailyXpCap(xpEarnedToday, incomingXp) {
    const remaining = economyConfig.MAX_XP_PER_DAY - xpEarnedToday;
    return Math.max(0, Math.min(incomingXp, remaining));
}
export function calculateXp(action, ctx = {}) {
    const { amount = 0, xpEarnedToday = 0, xpFromTipsToday = 0 } = ctx;
    switch (action) {
        case 'first_post':
            return 50;
        case 'daily_post':
            return applyDailyXpCap(xpEarnedToday, 25);
        case 'reaction_received':
            return applyDailyXpCap(xpEarnedToday, 5);
        case 'faucet_claim':
            return economyConfig.FAUCET_REWARD_XP;
        case 'referral_signup':
            return economyConfig.referralRewards.referee.xp;
        case 'referral_levelup':
            return economyConfig.referralRewards.referrer.xp;
        case 'tipped': {
            const rawXp = amount * rainTipConfig.tip.xpPerDgt;
            const remainingTipCap = economyConfig.MAX_TIP_XP_PER_DAY - xpFromTipsToday;
            return Math.max(0, Math.min(rawXp, remainingTipCap));
        }
        default:
            return 0;
    }
}
