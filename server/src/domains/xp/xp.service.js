"use strict";
/**
 * Core XP Service
 *
 * Central service for managing user XP, levels, and related functionality.
 * This service is used by both admin and public-facing features.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
exports.xpService = exports.XpService = void 0;
var _schema_1 = require("@schema");
var drizzle_orm_1 = require("drizzle-orm");
var _db_1 = require("@db");
var logger_1 = require("@core/logger");
var xp_actions_1 = require("./xp-actions");
var xp_actions_schema_1 = require("./xp-actions-schema");
// Import the centralized event handlers
var xp_events_1 = require("./events/xp.events");
var economy_config_1 = require("@shared/config/economy.config");
var repository_factory_1 = require("@core/repository/repository-factory");
var MAX_XP_PER_DAY = economy_config_1.economyConfig.MAX_XP_PER_DAY, MAX_TIP_XP_PER_DAY = economy_config_1.economyConfig.MAX_TIP_XP_PER_DAY;
var XpService = /** @class */ (function () {
    function XpService() {
        this.userRepository = (0, repository_factory_1.getUserRepository)();
    }
    /**
     * Update a user's XP and handle level recalculation
     *
     * @param userId - User ID to update
     * @param amount - Amount to add, subtract, or set
     * @param adjustmentType - How to modify XP ('add', 'subtract', or 'set')
     * @param options - Additional options
     * @returns Object with old and new XP values and level information
     */
    XpService.prototype.updateUserXp = function (userId_1, amount_1) {
        return __awaiter(this, arguments, void 0, function (userId, amount, adjustmentType, options) {
            var _a, reason, adminId, _b, logAdjustment, _c, skipLevelCheck, _d, skipTriggers, result, _e, user, oldXp, addAmount, subtractAmount, error_1;
            if (adjustmentType === void 0) { adjustmentType = 'add'; }
            if (options === void 0) { options = {}; }
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        logger_1.logger.info('Updating user XP', { userId: userId, amount: amount, adjustmentType: adjustmentType, options: options });
                        _a = options.reason, reason = _a === void 0 ? 'System adjustment' : _a, adminId = options.adminId, _b = options.logAdjustment, logAdjustment = _b === void 0 ? true : _b, _c = options.skipLevelCheck, skipLevelCheck = _c === void 0 ? false : _c, _d = options.skipTriggers, skipTriggers = _d === void 0 ? false : _d;
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 17, , 18]);
                        result = void 0;
                        _e = adjustmentType;
                        switch (_e) {
                            case 'add': return [3 /*break*/, 2];
                            case 'subtract': return [3 /*break*/, 4];
                            case 'set': return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 13];
                    case 2: return [4 /*yield*/, (0, xp_events_1.handleXpAward)(userId, amount, 'ADMIN_ADJUSTMENT', reason)];
                    case 3:
                        // Use handleXpAward for 'add' operations
                        result = _f.sent();
                        return [3 /*break*/, 14];
                    case 4: return [4 /*yield*/, (0, xp_events_1.handleXpLoss)(userId, amount, reason)];
                    case 5:
                        // Use handleXpLoss for 'subtract' operations
                        result = _f.sent();
                        return [3 /*break*/, 14];
                    case 6: return [4 /*yield*/, this.userRepository.findById(userId)];
                    case 7:
                        user = _f.sent();
                        if (!user) {
                            throw new Error("User with ID ".concat(userId, " not found."));
                        }
                        oldXp = user.xp;
                        if (!(amount > oldXp)) return [3 /*break*/, 9];
                        addAmount = amount - oldXp;
                        return [4 /*yield*/, (0, xp_events_1.handleXpAward)(userId, addAmount, 'ADMIN_ADJUSTMENT', "Set to ".concat(amount))];
                    case 8:
                        result = _f.sent();
                        return [3 /*break*/, 12];
                    case 9:
                        if (!(amount < oldXp)) return [3 /*break*/, 11];
                        subtractAmount = oldXp - amount;
                        return [4 /*yield*/, (0, xp_events_1.handleXpLoss)(userId, subtractAmount, "Set to ".concat(amount))];
                    case 10:
                        result = _f.sent();
                        return [3 /*break*/, 12];
                    case 11:
                        // No change needed
                        result = {
                            oldXp: oldXp,
                            newXp: oldXp,
                            oldLevel: user.level,
                            newLevel: user.level,
                            leveledUp: false,
                            levelChanged: false
                        };
                        _f.label = 12;
                    case 12: return [3 /*break*/, 14];
                    case 13: throw new Error("Invalid adjustment type: ".concat(adjustmentType));
                    case 14:
                        if (!(logAdjustment && adminId)) return [3 /*break*/, 16];
                        return [4 /*yield*/, this.logXpAdjustment(userId, adminId, adjustmentType, amount, reason, result.oldXp, result.newXp)];
                    case 15:
                        _f.sent();
                        _f.label = 16;
                    case 16: return [2 /*return*/, {
                            userId: userId,
                            oldXp: result.oldXp,
                            newXp: result.newXp,
                            xpChange: result.newXp - result.oldXp,
                            oldLevel: result.oldLevel,
                            newLevel: result.newLevel,
                            levelChanged: result.leveledUp
                        }];
                    case 17:
                        error_1 = _f.sent();
                        logger_1.logger.error('XP_SERVICE', 'Error in updateUserXp:', error_1);
                        throw error_1;
                    case 18: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Log an XP adjustment for auditing purposes
     */
    XpService.prototype.logXpAdjustment = function (userId, adminId, adjustmentType, amount, reason, oldXp, newXp) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, _db_1.db.insert(_schema_1.xpAdjustmentLogs).values({
                                userId: userId,
                                adminId: adminId,
                                adjustmentType: adjustmentType,
                                amount: amount,
                                reason: reason,
                                oldXp: oldXp,
                                newXp: newXp,
                                createdAt: new Date()
                            })];
                    case 1:
                        _a.sent();
                        logger_1.logger.info('XP_SERVICE', 'XP adjustment logged successfully', {
                            userId: userId,
                            adminId: adminId,
                            adjustmentType: adjustmentType,
                            amount: amount
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        logger_1.logger.error('XP_SERVICE', 'Error logging XP adjustment:', error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get level information for a specific level
     */
    XpService.prototype.getLevel = function (levelNumber) {
        return __awaiter(this, void 0, void 0, function () {
            var levelData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _db_1.db.select().from(_schema_1.levels).where((0, drizzle_orm_1.eq)(_schema_1.levels.level, levelNumber)).limit(1)];
                    case 1:
                        levelData = _a.sent();
                        return [2 /*return*/, levelData[0] || null];
                }
            });
        });
    };
    /**
     * Get all levels in ascending order
     */
    XpService.prototype.getAllLevels = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, _db_1.db.select().from(_schema_1.levels).orderBy((0, drizzle_orm_1.asc)(_schema_1.levels.level))];
            });
        });
    };
    /**
     * Get user XP information
     */
    XpService.prototype.getUserXpInfo = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var userArray, user, currentLevelData, nextLevelData, nextLevel, xpForNextLevel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _db_1.db
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
                        userArray = _a.sent();
                        if (userArray.length === 0) {
                            throw new Error("User with ID ".concat(userId, " not found."));
                        }
                        user = userArray[0];
                        return [4 /*yield*/, this.getLevel(user.level)];
                    case 2:
                        currentLevelData = _a.sent();
                        return [4 /*yield*/, _db_1.db
                                .select()
                                .from(_schema_1.levels)
                                .where((0, drizzle_orm_1.gt)(_schema_1.levels.level, user.level))
                                .orderBy((0, drizzle_orm_1.asc)(_schema_1.levels.level))
                                .limit(1)];
                    case 3:
                        nextLevelData = _a.sent();
                        nextLevel = nextLevelData.length > 0 ? nextLevelData[0] : null;
                        xpForNextLevel = nextLevel ? nextLevel.minXp - user.xp : 0;
                        return [2 /*return*/, {
                                userId: user.id,
                                username: user.username,
                                currentXp: user.xp,
                                currentLevel: user.level,
                                currentLevelData: currentLevelData,
                                nextLevel: (nextLevel === null || nextLevel === void 0 ? void 0 : nextLevel.level) || null,
                                nextLevelData: nextLevel || null,
                                xpForNextLevel: xpForNextLevel,
                                progress: nextLevel
                                    ? (user.xp - currentLevelData.minXp) / (nextLevel.minXp - currentLevelData.minXp)
                                    : 1
                            }];
                }
            });
        });
    };
    /**
     * Award XP to a user for completing an action
     *
     * @param userId User ID to award XP to
     * @param action The action that grants XP
     * @param metadata Optional metadata about the action
     * @returns Result of the XP update operation
     */
    XpService.prototype.awardXp = function (userId, action, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.awardXpWithContext(userId, action, metadata)];
            });
        });
    };
    /**
     * Award XP to a user for completing an action with forum context
     *
     * @param userId User ID to award XP to
     * @param action The action that grants XP
     * @param metadata Optional metadata about the action
     * @param forumId Optional forum ID for forum-specific multipliers
     * @returns Result of the XP update operation
     */
    XpService.prototype.awardXpWithContext = function (userId, action, metadata, forumId) {
        return __awaiter(this, void 0, void 0, function () {
            var canReceive, actionConfig, roleMultiplier, forumMultiplier, _a, multiplierResult, baseXp, finalXp, result, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 10, , 11]);
                        return [4 /*yield*/, this.checkActionLimits(userId, action)];
                    case 1:
                        canReceive = _b.sent();
                        if (!canReceive) {
                            logger_1.logger.info('XP_SERVICE', "XP not awarded due to limits: ".concat(action), { userId: userId, action: action });
                            return [2 /*return*/]; // Do not award XP if limits are hit
                        }
                        return [4 /*yield*/, (0, xp_actions_1.getXpAction)(action)];
                    case 2:
                        actionConfig = _b.sent();
                        if (!actionConfig || !actionConfig.enabled) {
                            logger_1.logger.warn('XP_SERVICE', "Unknown or disabled XP action attempted: ".concat(action), {
                                userId: userId,
                                action: action
                            });
                            return [2 /*return*/]; // Do not award for unknown or disabled actions
                        }
                        return [4 /*yield*/, this.getUserRoleMultiplier(userId)];
                    case 3:
                        roleMultiplier = _b.sent();
                        if (!forumId) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.getForumMultiplier(forumId)];
                    case 4:
                        _a = _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        _a = 1.0;
                        _b.label = 6;
                    case 6:
                        forumMultiplier = _a;
                        multiplierResult = (0, economy_config_1.sanitizeMultiplier)(roleMultiplier, forumMultiplier, {
                            userId: userId,
                            forumId: forumId,
                            action: action
                        });
                        baseXp = actionConfig.baseValue;
                        finalXp = Math.floor(baseXp * multiplierResult.finalMultiplier);
                        // Log multiplier violations if any
                        if (multiplierResult.wasCapped) {
                            logger_1.logger.warn('XP_SERVICE', 'XP multiplier was capped', {
                                userId: userId,
                                forumId: forumId,
                                action: action,
                                baseXp: baseXp,
                                originalMultiplier: multiplierResult.originalMultiplier,
                                finalMultiplier: multiplierResult.finalMultiplier,
                                violations: multiplierResult.violations
                            });
                        }
                        // Log the action with final XP amount
                        return [4 /*yield*/, this.logXpAction(userId, action, finalXp, __assign(__assign({}, metadata), { baseXp: baseXp, roleMultiplier: roleMultiplier, forumMultiplier: forumMultiplier, finalMultiplier: multiplierResult.finalMultiplier, wasCapped: multiplierResult.wasCapped }))];
                    case 7:
                        // Log the action with final XP amount
                        _b.sent();
                        return [4 /*yield*/, this.updateUserXp(userId, finalXp, 'add', {
                                reason: "Action: ".concat(action, " (").concat(finalXp, "XP = ").concat(baseXp, " * ").concat(multiplierResult.finalMultiplier.toFixed(2), ")"),
                                skipLevelCheck: false,
                                skipTriggers: false
                            })];
                    case 8:
                        result = _b.sent();
                        // Update action limits after successful award
                        return [4 /*yield*/, this.updateActionLimits(userId, action)];
                    case 9:
                        // Update action limits after successful award
                        _b.sent();
                        logger_1.logger.info('XP_SERVICE', "Awarding XP for action: ".concat(action), {
                            userId: userId,
                            action: action,
                            baseXp: baseXp,
                            finalXp: finalXp,
                            multiplierUsed: multiplierResult.finalMultiplier,
                            forumId: forumId,
                            metadata: metadata
                        });
                        return [2 /*return*/, result];
                    case 10:
                        error_3 = _b.sent();
                        logger_1.logger.error('XP_SERVICE', "Error awarding XP for action ".concat(action, ":"), error_3);
                        throw error_3;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if a user can receive XP for a given action based on limits (daily max, cooldown)
     */
    XpService.prototype.checkActionLimits = function (userId, action) {
        return __awaiter(this, void 0, void 0, function () {
            var actionConfig, now, startOfDay, endOfDay, dailyCountResult, lastAction, timeSinceLastAward, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, (0, xp_actions_1.getXpAction)(action)];
                    case 1:
                        actionConfig = _a.sent();
                        if (!actionConfig || !actionConfig.enabled) {
                            // If action is not configured or disabled, no limits apply (or maybe always allow?)
                            // For now, assuming if it's not configured, limits don't block
                            return [2 /*return*/, true];
                        }
                        now = new Date();
                        if (!(actionConfig.maxPerDay !== undefined)) return [3 /*break*/, 3];
                        startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                        return [4 /*yield*/, _db_1.db
                                .select({ count: (0, drizzle_orm_1.count)() })
                                .from(xp_actions_schema_1.xpActionLogs)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(xp_actions_schema_1.xpActionLogs.userId, userId), (0, drizzle_orm_1.eq)(xp_actions_schema_1.xpActionLogs.action, action), (0, drizzle_orm_1.gte)(xp_actions_schema_1.xpActionLogs.createdAt, startOfDay), (0, drizzle_orm_1.lt)(xp_actions_schema_1.xpActionLogs.createdAt, endOfDay)))];
                    case 2:
                        dailyCountResult = (_a.sent())[0];
                        if (dailyCountResult && dailyCountResult.count >= actionConfig.maxPerDay) {
                            logger_1.logger.warn('XP_SERVICE', "Daily limit reached for XP action ".concat(action, " for user ").concat(userId));
                            return [2 /*return*/, false]; // Daily limit reached
                        }
                        _a.label = 3;
                    case 3:
                        if (!(actionConfig.cooldownSeconds !== undefined && actionConfig.cooldownSeconds > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, _db_1.db
                                .select()
                                .from(xp_actions_schema_1.xpActionLogs)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(xp_actions_schema_1.xpActionLogs.userId, userId), (0, drizzle_orm_1.eq)(xp_actions_schema_1.xpActionLogs.action, action)))
                                .orderBy((0, drizzle_orm_1.desc)(xp_actions_schema_1.xpActionLogs.createdAt))
                                .limit(1)];
                    case 4:
                        lastAction = (_a.sent())[0];
                        if (lastAction) {
                            timeSinceLastAward = (now.getTime() - new Date(lastAction.createdAt).getTime()) / 1000;
                            if (timeSinceLastAward < actionConfig.cooldownSeconds) {
                                logger_1.logger.warn('XP_SERVICE', "Cooldown active for XP action ".concat(action, " for user ").concat(userId));
                                return [2 /*return*/, false]; // Cooldown active
                            }
                        }
                        _a.label = 5;
                    case 5: return [2 /*return*/, true]; // No limits hit
                    case 6:
                        error_4 = _a.sent();
                        logger_1.logger.error('XP_SERVICE', "Error checking action limits for action ".concat(action, ":"), error_4);
                        return [2 /*return*/, false]; // Assume limits block on error
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update action limits for a user after an XP award
     */
    XpService.prototype.updateActionLimits = function (userId, action) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    /**
     * Log an XP action for auditing and limit tracking
     */
    XpService.prototype.logXpAction = function (userId, action, amount, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, _db_1.db.insert(xp_actions_schema_1.xpActionLogs).values({
                                userId: userId,
                                action: action,
                                amount: amount,
                                metadata: metadata,
                                createdAt: new Date()
                            })];
                    case 1:
                        _a.sent();
                        logger_1.logger.info('XP_SERVICE', "XP Action Logged: ".concat(action), { userId: userId, action: action, amount: amount });
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        logger_1.logger.error('XP_SERVICE', 'Error logging XP action:', error_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get action limits for a user
     *
     * @param userId User ID
     * @param action The action key
     * @returns Object with limit information or null if no limits
     */
    XpService.prototype.getActionLimitsForUser = function (userId, action) {
        return __awaiter(this, void 0, void 0, function () {
            var actionConfig, now, dailyCount, timeSinceLastAward, onCooldown, cooldownRemaining, startOfDay, endOfDay, dailyCountResult, lastAction, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, (0, xp_actions_1.getXpAction)(action)];
                    case 1:
                        actionConfig = _a.sent();
                        if (!actionConfig || !actionConfig.enabled) {
                            return [2 /*return*/, null]; // No limits defined for this action
                        }
                        now = new Date();
                        dailyCount = 0;
                        timeSinceLastAward = -1;
                        onCooldown = false;
                        cooldownRemaining = 0;
                        if (!(actionConfig.maxPerDay !== undefined)) return [3 /*break*/, 3];
                        startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                        return [4 /*yield*/, _db_1.db
                                .select({ count: (0, drizzle_orm_1.count)() })
                                .from(xp_actions_schema_1.xpActionLogs)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(xp_actions_schema_1.xpActionLogs.userId, userId), (0, drizzle_orm_1.eq)(xp_actions_schema_1.xpActionLogs.action, action), (0, drizzle_orm_1.gte)(xp_actions_schema_1.xpActionLogs.createdAt, startOfDay), (0, drizzle_orm_1.lt)(xp_actions_schema_1.xpActionLogs.createdAt, endOfDay)))];
                    case 2:
                        dailyCountResult = (_a.sent())[0];
                        dailyCount = (dailyCountResult === null || dailyCountResult === void 0 ? void 0 : dailyCountResult.count) || 0;
                        _a.label = 3;
                    case 3:
                        if (!(actionConfig.cooldownSeconds !== undefined && actionConfig.cooldownSeconds > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, _db_1.db
                                .select()
                                .from(xp_actions_schema_1.xpActionLogs)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(xp_actions_schema_1.xpActionLogs.userId, userId), (0, drizzle_orm_1.eq)(xp_actions_schema_1.xpActionLogs.action, action)))
                                .orderBy((0, drizzle_orm_1.desc)(xp_actions_schema_1.xpActionLogs.createdAt))
                                .limit(1)];
                    case 4:
                        lastAction = (_a.sent())[0];
                        if (lastAction) {
                            timeSinceLastAward = (now.getTime() - new Date(lastAction.createdAt).getTime()) / 1000;
                            onCooldown = timeSinceLastAward < actionConfig.cooldownSeconds;
                            cooldownRemaining = onCooldown
                                ? Math.ceil(actionConfig.cooldownSeconds - timeSinceLastAward)
                                : 0;
                        }
                        _a.label = 5;
                    case 5: return [2 /*return*/, {
                            dailyLimit: actionConfig.maxPerDay || null,
                            dailyCount: dailyCount,
                            isOnCooldown: onCooldown,
                            cooldownSeconds: actionConfig.cooldownSeconds || null,
                            cooldownRemaining: cooldownRemaining,
                            timeSinceLastAward: timeSinceLastAward >= 0 ? timeSinceLastAward : null,
                            canReceive: !onCooldown &&
                                (actionConfig.maxPerDay === undefined || dailyCount < actionConfig.maxPerDay)
                        }];
                    case 6:
                        error_6 = _a.sent();
                        logger_1.logger.error('XP_SERVICE', "Error getting action limits for user ".concat(userId, " action ").concat(action, ":"), error_6);
                        return [2 /*return*/, null]; // Return null on error
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get the effective XP multiplier for a user based on their roles.
     * If the user has multiple roles, the highest multiplier is applied.
     * If the user has no roles with a multiplier > 0, a default of 1 is returned.
     */
    XpService.prototype.getUserRoleMultiplier = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var roleMultipliers, maxMultiplier, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, _db_1.db
                                .select({ multiplier: _schema_1.roles.xpMultiplier })
                                .from(_schema_1.userRoles)
                                .innerJoin(_schema_1.roles, (0, drizzle_orm_1.eq)(_schema_1.userRoles.roleId, _schema_1.roles.id))
                                .where((0, drizzle_orm_1.eq)(_schema_1.userRoles.userId, userId))];
                    case 1:
                        roleMultipliers = _a.sent();
                        if (roleMultipliers.length === 0)
                            return [2 /*return*/, 1];
                        maxMultiplier = Math.max.apply(Math, roleMultipliers.map(function (r) { var _a; return (_a = r.multiplier) !== null && _a !== void 0 ? _a : 1; }));
                        return [2 /*return*/, maxMultiplier > 0 ? maxMultiplier : 1];
                    case 2:
                        error_7 = _a.sent();
                        logger_1.logger.error('XP_SERVICE', "Error fetching role XP multiplier for user ".concat(userId, ":"), error_7);
                        return [2 /*return*/, 1];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get the XP multiplier for a specific forum
     */
    XpService.prototype.getForumMultiplier = function (forumId) {
        return __awaiter(this, void 0, void 0, function () {
            var forum, error_8;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, _db_1.db
                                .select({ xpMultiplier: _schema_1.forumStructure.xpMultiplier })
                                .from(_schema_1.forumStructure)
                                .where((0, drizzle_orm_1.eq)(_schema_1.forumStructure.id, forumId))
                                .limit(1)];
                    case 1:
                        forum = (_b.sent())[0];
                        return [2 /*return*/, (_a = forum === null || forum === void 0 ? void 0 : forum.xpMultiplier) !== null && _a !== void 0 ? _a : 1.0];
                    case 2:
                        error_8 = _b.sent();
                        logger_1.logger.error('XP_SERVICE', "Error fetching forum XP multiplier for forum ".concat(forumId, ":"), error_8);
                        return [2 /*return*/, 1.0];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return XpService;
}());
exports.XpService = XpService;
exports.xpService = new XpService();
