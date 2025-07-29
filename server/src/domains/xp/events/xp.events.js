"use strict";
/**
 * XP Event Handlers
 *
 * Centralized event handlers for XP-related actions in the system.
 * This separates event logic from service logic for better modularity.
 */
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LevelUpEvent = exports.XpLossEvent = exports.XpGainEvent = void 0;
exports.handleXpAward = handleXpAward;
exports.handleLevelUp = handleLevelUp;
exports.handleXpLoss = handleXpLoss;
var _db_1 = require("@db");
var _schema_1 = require("@schema");
var drizzle_orm_1 = require("drizzle-orm");
var logger_1 = require("@core/logger");
var dgtService_1 = require("@domains/wallet/services/dgtService");
var titles_service_1 = require("@domains/gamification/titles.service");
// Initialize titles service
var titlesService = new titles_service_1.TitlesService();
// Re-export event types from the main events file
var xp_events_1 = require("../xp.events");
Object.defineProperty(exports, "XpGainEvent", { enumerable: true, get: function () { return xp_events_1.XpGainEvent; } });
Object.defineProperty(exports, "XpLossEvent", { enumerable: true, get: function () { return xp_events_1.XpLossEvent; } });
Object.defineProperty(exports, "LevelUpEvent", { enumerable: true, get: function () { return xp_events_1.LevelUpEvent; } });
/**
 * Handle XP award event
 * Central function to process XP gain and trigger appropriate side effects
 */
function handleXpAward(userId, amount, source, reason) {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger_1.logger.info('XP_EVENTS', "Awarding ".concat(amount, " XP to user ").concat(userId, " for ").concat(source));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, _db_1.db.transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                            var userResult, user, oldXp, oldLevel, newXp, levelsData, newLevel, leveledUp, xpEvent;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, tx
                                            .select({
                                            id: _schema_1.users.id,
                                            xp: _schema_1.users.xp,
                                            level: _schema_1.users.level,
                                            username: _schema_1.users.username
                                        })
                                            .from(_schema_1.users)
                                            .where((0, drizzle_orm_1.eq)(_schema_1.users.id, userId))
                                            .limit(1)];
                                    case 1:
                                        userResult = _a.sent();
                                        if (userResult.length === 0) {
                                            throw new Error("User ".concat(userId, " not found"));
                                        }
                                        user = userResult[0];
                                        oldXp = user.xp;
                                        oldLevel = user.level;
                                        newXp = oldXp + amount;
                                        // Update user's XP
                                        return [4 /*yield*/, tx
                                                .update(_schema_1.users)
                                                .set({
                                                xp: newXp,
                                                lastXpGainDate: new Date(),
                                                dailyXpGained: _db_1.db.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["COALESCE(daily_xp_gained, 0) + ", ""], ["COALESCE(daily_xp_gained, 0) + ", ""])), amount)
                                            })
                                                .where((0, drizzle_orm_1.eq)(_schema_1.users.id, userId))];
                                    case 2:
                                        // Update user's XP
                                        _a.sent();
                                        // Log the XP adjustment
                                        return [4 /*yield*/, tx.insert(_schema_1.xpAdjustmentLogs).values({
                                                userId: userId,
                                                adminId: 1, // System user ID
                                                adjustmentType: 'add',
                                                amount: amount,
                                                reason: "".concat(reason || source, " (").concat(source, ")"),
                                                oldXp: oldXp,
                                                newXp: newXp
                                            })];
                                    case 3:
                                        // Log the XP adjustment
                                        _a.sent();
                                        return [4 /*yield*/, tx
                                                .select()
                                                .from(_schema_1.levels)
                                                .where(_db_1.db.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["min_xp <= ", ""], ["min_xp <= ", ""])), newXp))
                                                .orderBy((0, drizzle_orm_1.desc)(_schema_1.levels.level))
                                                .limit(1)];
                                    case 4:
                                        levelsData = _a.sent();
                                        newLevel = levelsData.length > 0 ? levelsData[0].level : 1;
                                        leveledUp = newLevel > oldLevel;
                                        if (!leveledUp) return [3 /*break*/, 6];
                                        return [4 /*yield*/, handleLevelUp(tx, userId, oldLevel, newLevel, user.username)];
                                    case 5:
                                        _a.sent();
                                        _a.label = 6;
                                    case 6:
                                        xpEvent = new xp_events_1.XpGainEvent(userId, amount, source);
                                        // Return the results
                                        return [2 /*return*/, {
                                                oldXp: oldXp,
                                                newXp: newXp,
                                                oldLevel: oldLevel,
                                                newLevel: newLevel,
                                                leveledUp: leveledUp
                                            }];
                                }
                            });
                        }); })];
                case 2: 
                // Start transaction for atomic operations
                return [2 /*return*/, _a.sent()];
                case 3:
                    error_1 = _a.sent();
                    logger_1.logger.error('XP_EVENTS', 'Error handling XP award:', error_1 instanceof Error ? error_1.message : String(error_1));
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Handle user level up
 * Process rewards and notifications when a user levels up
 */
function handleLevelUp(tx, // Transaction context
userId, oldLevel, newLevel, username) {
    return __awaiter(this, void 0, void 0, function () {
        var levelData, rewards, titleResult, title, existingTitle, badgeResult, badge, existingBadge, grantedTitles, error_2, rewardText, notificationMessage, levelUpEvent, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger_1.logger.info('XP_EVENTS', "User ".concat(userId, " leveled up from ").concat(oldLevel, " to ").concat(newLevel));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 18, , 19]);
                    // Update user's level
                    return [4 /*yield*/, tx.update(_schema_1.users).set({ level: newLevel }).where((0, drizzle_orm_1.eq)(_schema_1.users.id, userId))];
                case 2:
                    // Update user's level
                    _a.sent();
                    return [4 /*yield*/, tx.select().from(_schema_1.levels).where((0, drizzle_orm_1.eq)(_schema_1.levels.level, newLevel)).limit(1)];
                case 3:
                    levelData = _a.sent();
                    if (levelData.length === 0) {
                        throw new Error("Level ".concat(newLevel, " not found"));
                    }
                    rewards = {};
                    if (!(levelData[0].rewardDgt && levelData[0].rewardDgt > 0)) return [3 /*break*/, 5];
                    rewards.dgt = levelData[0].rewardDgt;
                    // Award DGT to user wallet using centralized DGT service
                    return [4 /*yield*/, dgtService_1.dgtService.processReward(userId, levelData[0].rewardDgt, 'level_up', "Level ".concat(newLevel, " reward"))];
                case 4:
                    // Award DGT to user wallet using centralized DGT service
                    _a.sent();
                    _a.label = 5;
                case 5:
                    if (!levelData[0].rewardTitleId) return [3 /*break*/, 9];
                    return [4 /*yield*/, tx
                            .select()
                            .from(_schema_1.titles)
                            .where((0, drizzle_orm_1.eq)(_schema_1.titles.id, levelData[0].rewardTitleId))
                            .limit(1)];
                case 6:
                    titleResult = _a.sent();
                    if (!(titleResult.length > 0)) return [3 /*break*/, 9];
                    title = titleResult[0];
                    return [4 /*yield*/, tx
                            .select()
                            .from(_schema_1.userTitles)
                            .where((0, drizzle_orm_1.eq)(_schema_1.userTitles.userId, userId), (0, drizzle_orm_1.eq)(_schema_1.userTitles.titleId, title.id))
                            .limit(1)];
                case 7:
                    existingTitle = _a.sent();
                    if (!(existingTitle.length === 0)) return [3 /*break*/, 9];
                    return [4 /*yield*/, tx.insert(_schema_1.userTitles).values({
                            userId: userId,
                            titleId: title.id,
                            awardedAt: new Date()
                        })];
                case 8:
                    _a.sent();
                    rewards.title = title.name;
                    _a.label = 9;
                case 9:
                    if (!levelData[0].rewardBadgeId) return [3 /*break*/, 13];
                    return [4 /*yield*/, tx
                            .select()
                            .from(_schema_1.badges)
                            .where((0, drizzle_orm_1.eq)(_schema_1.badges.id, levelData[0].rewardBadgeId))
                            .limit(1)];
                case 10:
                    badgeResult = _a.sent();
                    if (!(badgeResult.length > 0)) return [3 /*break*/, 13];
                    badge = badgeResult[0];
                    return [4 /*yield*/, tx
                            .select()
                            .from(_schema_1.userBadges)
                            .where((0, drizzle_orm_1.eq)(_schema_1.userBadges.userId, userId), (0, drizzle_orm_1.eq)(_schema_1.userBadges.badgeId, badge.id))
                            .limit(1)];
                case 11:
                    existingBadge = _a.sent();
                    if (!(existingBadge.length === 0)) return [3 /*break*/, 13];
                    return [4 /*yield*/, tx.insert(_schema_1.userBadges).values({
                            userId: userId,
                            badgeId: badge.id,
                            awardedAt: new Date()
                        })];
                case 12:
                    _a.sent();
                    rewards.badge = badge.name;
                    _a.label = 13;
                case 13:
                    _a.trys.push([13, 15, , 16]);
                    return [4 /*yield*/, titlesService.checkAndGrantLevelTitles(userId, newLevel)];
                case 14:
                    grantedTitles = _a.sent();
                    if (grantedTitles.length > 0) {
                        logger_1.logger.info('XP_EVENTS', "Granted ".concat(grantedTitles.length, " level-based titles to user ").concat(userId, " for reaching level ").concat(newLevel));
                    }
                    return [3 /*break*/, 16];
                case 15:
                    error_2 = _a.sent();
                    logger_1.logger.error('XP_EVENTS', "Failed to grant level-based titles for user ".concat(userId, ":"), error_2);
                    return [3 /*break*/, 16];
                case 16:
                    rewardText = [
                        rewards.dgt ? "".concat(rewards.dgt, " DGT") : '',
                        rewards.title ? "\"".concat(rewards.title, "\" title") : '',
                        rewards.badge ? "\"".concat(rewards.badge, "\" badge") : ''
                    ]
                        .filter(Boolean)
                        .join(', ');
                    notificationMessage = rewardText
                        ? "Congratulations! You've reached level ".concat(newLevel, " and received ").concat(rewardText, "!")
                        : "Congratulations! You've reached level ".concat(newLevel, "!");
                    return [4 /*yield*/, tx.insert(_schema_1.notifications).values({
                            userId: userId,
                            type: 'achievement',
                            title: 'Level Up!',
                            body: notificationMessage,
                            data: {
                                oldLevel: oldLevel,
                                newLevel: newLevel,
                                rewards: rewards
                            }
                        })];
                case 17:
                    _a.sent();
                    levelUpEvent = new xp_events_1.LevelUpEvent(userId, oldLevel, newLevel, 0);
                    return [2 /*return*/, { rewards: rewards }];
                case 18:
                    error_3 = _a.sent();
                    logger_1.logger.error('XP_EVENTS', "Error handling level up for user ".concat(userId, ":"), error_3 instanceof Error ? error_3.message : String(error_3));
                    throw error_3;
                case 19: return [2 /*return*/];
            }
        });
    });
}
/**
 * Handle XP loss
 * Process logic when a user loses XP (admin adjustment, penalty, etc.)
 */
function handleXpLoss(userId, amount, reason) {
    return __awaiter(this, void 0, void 0, function () {
        var error_4;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger_1.logger.info('XP_EVENTS', "Removing ".concat(amount, " XP from user ").concat(userId, " for ").concat(reason));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, _db_1.db.transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                            var userResult, user, oldXp, oldLevel, amountToRemove, newXp, levelsData, newLevel, levelChanged, xpEvent;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, tx
                                            .select({
                                            id: _schema_1.users.id,
                                            xp: _schema_1.users.xp,
                                            level: _schema_1.users.level
                                        })
                                            .from(_schema_1.users)
                                            .where((0, drizzle_orm_1.eq)(_schema_1.users.id, userId))
                                            .limit(1)];
                                    case 1:
                                        userResult = _a.sent();
                                        if (userResult.length === 0) {
                                            throw new Error("User ".concat(userId, " not found"));
                                        }
                                        user = userResult[0];
                                        oldXp = user.xp;
                                        oldLevel = user.level;
                                        amountToRemove = Math.min(amount, oldXp);
                                        newXp = oldXp - amountToRemove;
                                        // Update user's XP
                                        return [4 /*yield*/, tx
                                                .update(_schema_1.users)
                                                .set({
                                                xp: newXp
                                            })
                                                .where((0, drizzle_orm_1.eq)(_schema_1.users.id, userId))];
                                    case 2:
                                        // Update user's XP
                                        _a.sent();
                                        // Log the XP adjustment
                                        return [4 /*yield*/, tx.insert(_schema_1.xpAdjustmentLogs).values({
                                                userId: userId,
                                                adminId: 1, // System user ID
                                                adjustmentType: 'subtract',
                                                amount: amountToRemove,
                                                reason: reason,
                                                oldXp: oldXp,
                                                newXp: newXp
                                            })];
                                    case 3:
                                        // Log the XP adjustment
                                        _a.sent();
                                        return [4 /*yield*/, tx
                                                .select()
                                                .from(_schema_1.levels)
                                                .where(_db_1.db.sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["min_xp <= ", ""], ["min_xp <= ", ""])), newXp))
                                                .orderBy((0, drizzle_orm_1.desc)(_schema_1.levels.level))
                                                .limit(1)];
                                    case 4:
                                        levelsData = _a.sent();
                                        newLevel = levelsData.length > 0 ? levelsData[0].level : 1;
                                        levelChanged = newLevel < oldLevel;
                                        if (!levelChanged) return [3 /*break*/, 7];
                                        return [4 /*yield*/, tx.update(_schema_1.users).set({ level: newLevel }).where((0, drizzle_orm_1.eq)(_schema_1.users.id, userId))];
                                    case 5:
                                        _a.sent();
                                        // Create notification for level change
                                        return [4 /*yield*/, tx.insert(_schema_1.notifications).values({
                                                userId: userId,
                                                type: 'info',
                                                title: 'Level Changed',
                                                body: "Your level has changed from ".concat(oldLevel, " to ").concat(newLevel, " due to an XP adjustment."),
                                                data: {
                                                    oldLevel: oldLevel,
                                                    newLevel: newLevel,
                                                    reason: reason
                                                }
                                            })];
                                    case 6:
                                        // Create notification for level change
                                        _a.sent();
                                        _a.label = 7;
                                    case 7:
                                        xpEvent = new xp_events_1.XpLossEvent(userId, amountToRemove, reason);
                                        return [2 /*return*/, {
                                                oldXp: oldXp,
                                                newXp: newXp,
                                                levelChanged: levelChanged,
                                                newLevel: newLevel
                                            }];
                                }
                            });
                        }); })];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    error_4 = _a.sent();
                    logger_1.logger.error('XP_EVENTS', 'Error handling XP loss:', error_4 instanceof Error ? error_4.message : String(error_4));
                    throw error_4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
var templateObject_1, templateObject_2, templateObject_3;
