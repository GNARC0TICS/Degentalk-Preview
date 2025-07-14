"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProgressWithinLevel = exports.getLevelForXp = exports.getXpForLevel = void 0;
exports.calculateTipXp = calculateTipXp;
exports.applyDailyXpCap = applyDailyXpCap;
exports.calculateXp = calculateXp;
var economy_config_1 = require("./economy.config");
Object.defineProperty(exports, "getXpForLevel", { enumerable: true, get: function () { return economy_config_1.getXpForLevel; } });
var rain_tip_config_1 = require("./rain-tip-config");
// -------- XP → Level helpers --------
var getLevelForXp = function (totalXp) {
    var levels = economy_config_1.economyConfig.levelXPMap;
    // Determine level up to 10 using explicit map
    var lvl = 1;
    for (var _i = 0, _a = Object.entries(levels); _i < _a.length; _i++) {
        var _b = _a[_i], levelStr = _b[0], xpNeeded = _b[1];
        var level = Number(levelStr);
        if (totalXp >= xpNeeded)
            lvl = level;
    }
    // For >10, use formula until xp less than next level requirement
    while (totalXp >= (0, economy_config_1.getXpForLevel)(lvl + 1)) {
        lvl += 1;
    }
    return lvl;
};
exports.getLevelForXp = getLevelForXp;
var getProgressWithinLevel = function (totalXp) {
    var level = (0, exports.getLevelForXp)(totalXp);
    var currentLevelStart = (0, economy_config_1.getXpForLevel)(level);
    var nextLevelXp = (0, economy_config_1.getXpForLevel)(level + 1);
    var progress = (totalXp - currentLevelStart) / (nextLevelXp - currentLevelStart);
    return { level: level, progress: progress, nextLevelXp: nextLevelXp };
};
exports.getProgressWithinLevel = getProgressWithinLevel;
// -------- Action-based XP helpers --------
function calculateTipXp(dgtAmount, xpGainedFromTipsToday) {
    var xpPerDgt = 10; // Manifesto rule
    var rawXp = dgtAmount * xpPerDgt;
    var remainingCap = economy_config_1.economyConfig.MAX_TIP_XP_PER_DAY - xpGainedFromTipsToday;
    return Math.max(0, Math.min(rawXp, remainingCap));
}
function applyDailyXpCap(xpEarnedToday, incomingXp) {
    var remaining = economy_config_1.economyConfig.MAX_XP_PER_DAY - xpEarnedToday;
    return Math.max(0, Math.min(incomingXp, remaining));
}
function calculateXp(action, ctx) {
    if (ctx === void 0) { ctx = {}; }
    var _a = ctx.amount, amount = _a === void 0 ? 0 : _a, _b = ctx.xpEarnedToday, xpEarnedToday = _b === void 0 ? 0 : _b, _c = ctx.xpFromTipsToday, xpFromTipsToday = _c === void 0 ? 0 : _c;
    switch (action) {
        case 'first_post':
            return 50;
        case 'daily_post':
            return applyDailyXpCap(xpEarnedToday, 25);
        case 'reaction_received':
            return applyDailyXpCap(xpEarnedToday, 5);
        case 'faucet_claim':
            return economy_config_1.economyConfig.FAUCET_REWARD_XP;
        case 'referral_signup':
            return economy_config_1.economyConfig.referralRewards.referee.xp;
        case 'referral_levelup':
            return economy_config_1.economyConfig.referralRewards.referrer.xp;
        case 'tipped': {
            var rawXp = amount * rain_tip_config_1.rainTipConfig.tip.xpPerDgt;
            var remainingTipCap = economy_config_1.economyConfig.MAX_TIP_XP_PER_DAY - xpFromTipsToday;
            return Math.max(0, Math.min(rawXp, remainingTipCap));
        }
        default:
            return 0;
    }
}
