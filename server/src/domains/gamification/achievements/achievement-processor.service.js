"use strict";
/**
 * Achievement Processor Service
 *
 * Processes achievement events and updates user progress.
 * Handles the core logic for checking requirements and awarding achievements.
 */
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
exports.AchievementProcessorService = void 0;
var _db_1 = require("@db");
var drizzle_orm_1 = require("drizzle-orm");
var _schema_1 = require("@schema");
var logger_1 = require("@core/logger");
var xp_service_1 = require("../../xp/xp.service");
var degen_evaluators_1 = require("./evaluators/degen-evaluators");
var report_error_1 = require("@lib/report-error");
var AchievementProcessorService = /** @class */ (function () {
    function AchievementProcessorService() {
        this.xpService = new xp_service_1.XpService();
        this.evaluators = new degen_evaluators_1.DegenAchievementEvaluators();
    }
    /**
     * Process a single achievement event
     */
    AchievementProcessorService.prototype.processEvent = function (eventType, userId, eventData) {
        return __awaiter(this, void 0, void 0, function () {
            var triggeredAchievements, _i, triggeredAchievements_1, achievement, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 9]);
                        return [4 /*yield*/, this.getTriggeredAchievements(eventType)];
                    case 1:
                        triggeredAchievements = _a.sent();
                        _i = 0, triggeredAchievements_1 = triggeredAchievements;
                        _a.label = 2;
                    case 2:
                        if (!(_i < triggeredAchievements_1.length)) return [3 /*break*/, 5];
                        achievement = triggeredAchievements_1[_i];
                        return [4 /*yield*/, this.updateUserProgress(userId, achievement, eventData)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: 
                    // Mark event as processed
                    return [4 /*yield*/, this.markEventProcessed(eventType, userId, eventData)];
                    case 6:
                        // Mark event as processed
                        _a.sent();
                        logger_1.logger.info('ACHIEVEMENT_PROCESSOR', "Processed ".concat(eventType, " for user ").concat(userId), {
                            eventType: eventType,
                            userId: userId,
                            achievementCount: triggeredAchievements.length
                        });
                        return [3 /*break*/, 9];
                    case 7:
                        error_1 = _a.sent();
                        return [4 /*yield*/, (0, report_error_1.reportErrorServer)(error_1, {
                                service: 'AchievementProcessorService',
                                operation: 'processEvent',
                                action: logger_1.LogAction.FAILURE,
                                data: { eventType: eventType, userId: userId, eventData: eventData }
                            })];
                    case 8:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get achievements that can be triggered by an event type
     */
    AchievementProcessorService.prototype.getTriggeredAchievements = function (eventType) {
        return __awaiter(this, void 0, void 0, function () {
            var allAchievements;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _db_1.db
                            .select()
                            .from(_schema_1.achievements)
                            .where((0, drizzle_orm_1.eq)(_schema_1.achievements.isActive, true))];
                    case 1:
                        allAchievements = _a.sent();
                        return [2 /*return*/, allAchievements.filter(function (achievement) {
                                var _a, _b;
                                var config = achievement.triggerConfig;
                                // Check different trigger types
                                switch (achievement.triggerType) {
                                    case 'count':
                                    case 'threshold':
                                        return config.action && _this.mapEventToAction(eventType) === config.action;
                                    case 'event':
                                        return config.eventType === eventType;
                                    case 'custom':
                                        return (((_a = config.eventTypes) === null || _a === void 0 ? void 0 : _a.includes(eventType)) ||
                                            _this.evaluators.canHandle(config.evaluator, eventType));
                                    case 'composite':
                                        return (_b = config.requirements) === null || _b === void 0 ? void 0 : _b.some(function (req) { return _this.mapEventToAction(eventType) === req.action; });
                                    default:
                                        return false;
                                }
                            })];
                }
            });
        });
    };
    /**
     * Map event types to action names for trigger matching
     */
    AchievementProcessorService.prototype.mapEventToAction = function (eventType) {
        var mapping = {
            post_created: 'posts_created',
            thread_created: 'threads_created',
            user_login: 'login_count',
            tip_sent: 'tips_sent',
            tip_received: 'tips_received',
            shoutbox_message: 'shoutbox_messages',
            like_given: 'likes_given',
            like_received: 'likes_received',
            user_mentioned: 'mentions_received',
            daily_streak: 'daily_streaks',
            wallet_loss: 'wallet_losses',
            thread_necromancy: 'thread_necromancies',
            crash_sentiment: 'crash_sentiments',
            diamond_hands: 'diamond_hands_events',
            paper_hands: 'paper_hands_events',
            market_prediction: 'market_predictions',
            thread_locked: 'threads_locked',
            custom_event: 'custom_events'
        };
        return mapping[eventType] || eventType;
    };
    /**
     * Update user progress for a specific achievement
     */
    AchievementProcessorService.prototype.updateUserProgress = function (userId, achievement, eventData) {
        return __awaiter(this, void 0, void 0, function () {
            var userAchievement, progress, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 9]);
                        return [4 /*yield*/, this.getUserAchievement(userId, achievement.id)];
                    case 1:
                        userAchievement = _a.sent();
                        // Skip if already completed
                        if (userAchievement === null || userAchievement === void 0 ? void 0 : userAchievement.isCompleted) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.calculateProgress(achievement, userId, eventData)];
                    case 2:
                        progress = _a.sent();
                        if (!(progress.isCompleted && !(userAchievement === null || userAchievement === void 0 ? void 0 : userAchievement.isCompleted))) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.completeAchievement(userId, achievement, progress)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        if (!(progress.current > 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.updateProgress(userId, achievement, progress)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        error_2 = _a.sent();
                        return [4 /*yield*/, (0, report_error_1.reportErrorServer)(error_2, {
                                service: 'AchievementProcessorService',
                                operation: 'updateUserProgress',
                                action: logger_1.LogAction.FAILURE,
                                data: { userId: userId, achievementId: achievement.id, achievementKey: achievement.key }
                            })];
                    case 8:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calculate achievement progress based on trigger type
     */
    AchievementProcessorService.prototype.calculateProgress = function (achievement, userId, eventData) {
        return __awaiter(this, void 0, void 0, function () {
            var config, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        config = achievement.triggerConfig;
                        _a = achievement.triggerType;
                        switch (_a) {
                            case 'count': return [3 /*break*/, 1];
                            case 'threshold': return [3 /*break*/, 3];
                            case 'event': return [3 /*break*/, 5];
                            case 'composite': return [3 /*break*/, 7];
                            case 'custom': return [3 /*break*/, 9];
                        }
                        return [3 /*break*/, 11];
                    case 1: return [4 /*yield*/, this.calculateCountProgress(achievement, userId, config)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.calculateThresholdProgress(achievement, userId, config)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.calculateEventProgress(achievement, userId, config, eventData)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [4 /*yield*/, this.calculateCompositeProgress(achievement, userId, config)];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9: return [4 /*yield*/, this.calculateCustomProgress(achievement, userId, config, eventData)];
                    case 10: return [2 /*return*/, _b.sent()];
                    case 11: return [2 /*return*/, { current: 0, target: 1, percentage: 0, isCompleted: false }];
                }
            });
        });
    };
    /**
     * Calculate progress for count-based achievements
     */
    AchievementProcessorService.prototype.calculateCountProgress = function (achievement, userId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var action, target, eventType, result, current, percentage;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        action = config.action;
                        target = config.target || 1;
                        eventType = this.actionToEventType(action);
                        return [4 /*yield*/, _db_1.db
                                .select({ count: (0, drizzle_orm_1.count)() })
                                .from(_schema_1.achievementEvents)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(_schema_1.achievementEvents.userId, userId), (0, drizzle_orm_1.eq)(_schema_1.achievementEvents.eventType, eventType), (0, drizzle_orm_1.eq)(_schema_1.achievementEvents.processingStatus, 'completed')))];
                    case 1:
                        result = _b.sent();
                        current = ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
                        percentage = Math.min((current / target) * 100, 100);
                        return [2 /*return*/, {
                                current: current,
                                target: target,
                                percentage: percentage,
                                isCompleted: current >= target
                            }];
                }
            });
        });
    };
    /**
     * Calculate progress for threshold-based achievements
     */
    AchievementProcessorService.prototype.calculateThresholdProgress = function (achievement, userId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var metric, target, current, percentage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        metric = config.metric;
                        target = config.target;
                        return [4 /*yield*/, this.getUserMetric(userId, metric)];
                    case 1:
                        current = _a.sent();
                        percentage = Math.min((current / target) * 100, 100);
                        return [2 /*return*/, {
                                current: current,
                                target: target,
                                percentage: percentage,
                                isCompleted: current >= target
                            }];
                }
            });
        });
    };
    /**
     * Calculate progress for event-based achievements (single occurrence)
     */
    AchievementProcessorService.prototype.calculateEventProgress = function (achievement, userId, config, eventData) {
        return __awaiter(this, void 0, void 0, function () {
            var conditionsMet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkEventConditions(config.conditions || [], eventData)];
                    case 1:
                        conditionsMet = _a.sent();
                        return [2 /*return*/, {
                                current: conditionsMet ? 1 : 0,
                                target: 1,
                                percentage: conditionsMet ? 100 : 0,
                                isCompleted: conditionsMet
                            }];
                }
            });
        });
    };
    /**
     * Calculate progress for composite achievements (multiple requirements)
     */
    AchievementProcessorService.prototype.calculateCompositeProgress = function (achievement, userId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var requirements, operator, completedRequirements, _i, requirements_1, requirement, reqProgress, isCompleted, percentage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requirements = config.requirements || [];
                        operator = config.operator || 'AND';
                        completedRequirements = 0;
                        _i = 0, requirements_1 = requirements;
                        _a.label = 1;
                    case 1:
                        if (!(_i < requirements_1.length)) return [3 /*break*/, 4];
                        requirement = requirements_1[_i];
                        return [4 /*yield*/, this.calculateCountProgress(achievement, userId, requirement)];
                    case 2:
                        reqProgress = _a.sent();
                        if (reqProgress.isCompleted) {
                            completedRequirements++;
                        }
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        isCompleted = operator === 'AND'
                            ? completedRequirements === requirements.length
                            : completedRequirements > 0;
                        percentage = (completedRequirements / requirements.length) * 100;
                        return [2 /*return*/, {
                                current: completedRequirements,
                                target: requirements.length,
                                percentage: percentage,
                                isCompleted: isCompleted
                            }];
                }
            });
        });
    };
    /**
     * Calculate progress for custom achievements using evaluators
     */
    AchievementProcessorService.prototype.calculateCustomProgress = function (achievement, userId, config, eventData) {
        return __awaiter(this, void 0, void 0, function () {
            var evaluator, isCompleted;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        evaluator = config.evaluator;
                        if (!this.evaluators.canHandle(evaluator)) {
                            logger_1.logger.warn('ACHIEVEMENT_PROCESSOR', "Unknown evaluator: ".concat(evaluator));
                            return [2 /*return*/, { current: 0, target: 1, percentage: 0, isCompleted: false }];
                        }
                        return [4 /*yield*/, this.evaluators.evaluate(evaluator, userId, config.config || {})];
                    case 1:
                        isCompleted = _a.sent();
                        return [2 /*return*/, {
                                current: isCompleted ? 1 : 0,
                                target: 1,
                                percentage: isCompleted ? 100 : 0,
                                isCompleted: isCompleted,
                                data: eventData
                            }];
                }
            });
        });
    };
    /**
     * Complete an achievement for a user
     */
    AchievementProcessorService.prototype.completeAchievement = function (userId, achievement, progress) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 5]);
                        // Mark achievement as completed
                        return [4 /*yield*/, _db_1.db
                                .insert(_schema_1.userAchievements)
                                .values({
                                userId: userId,
                                achievementId: achievement.id,
                                currentProgress: progress.data || {},
                                progressPercentage: progress.percentage.toString(),
                                isCompleted: true,
                                completedAt: new Date(),
                                completionData: {
                                    completedAt: new Date().toISOString(),
                                    finalProgress: progress
                                }
                            })
                                .onConflictDoUpdate({
                                target: [_schema_1.userAchievements.userId, _schema_1.userAchievements.achievementId],
                                set: {
                                    isCompleted: true,
                                    completedAt: new Date(),
                                    progressPercentage: progress.percentage.toString(),
                                    completionData: {
                                        completedAt: new Date().toISOString(),
                                        finalProgress: progress
                                    }
                                }
                            })];
                    case 1:
                        // Mark achievement as completed
                        _a.sent();
                        // Distribute rewards
                        return [4 /*yield*/, this.distributeRewards(userId, achievement)];
                    case 2:
                        // Distribute rewards
                        _a.sent();
                        // Log achievement completion
                        logger_1.logger.info('ACHIEVEMENT_COMPLETED', "User ".concat(userId, " completed achievement ").concat(achievement.key), {
                            userId: userId,
                            achievementId: achievement.id,
                            achievementKey: achievement.key,
                            achievementName: achievement.name,
                            rewardXp: achievement.rewardXp,
                            rewardDgt: achievement.rewardDgt
                        });
                        return [3 /*break*/, 5];
                    case 3:
                        error_3 = _a.sent();
                        return [4 /*yield*/, (0, report_error_1.reportErrorServer)(error_3, {
                                service: 'AchievementProcessorService',
                                operation: 'completeAchievement',
                                action: logger_1.LogAction.FAILURE,
                                data: { userId: userId, achievementId: achievement.id, achievementKey: achievement.key }
                            })];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update achievement progress (partial completion)
     */
    AchievementProcessorService.prototype.updateProgress = function (userId, achievement, progress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _db_1.db
                            .insert(_schema_1.userAchievements)
                            .values({
                            userId: userId,
                            achievementId: achievement.id,
                            currentProgress: progress.data || {},
                            progressPercentage: progress.percentage.toString(),
                            isCompleted: false
                        })
                            .onConflictDoUpdate({
                            target: [_schema_1.userAchievements.userId, _schema_1.userAchievements.achievementId],
                            set: {
                                currentProgress: progress.data || {},
                                progressPercentage: progress.percentage.toString()
                            }
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Distribute rewards for completed achievement
     */
    AchievementProcessorService.prototype.distributeRewards = function (userId, achievement) {
        return __awaiter(this, void 0, void 0, function () {
            var walletService, error_4, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, , 11]);
                        if (!(achievement.rewardXp > 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.xpService.awardXP(userId, achievement.rewardXp, 'achievement_unlock')];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!(achievement.rewardDgt > 0)) return [3 /*break*/, 8];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 6, , 8]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../wallet/services/wallet.service'); })];
                    case 4:
                        walletService = (_a.sent()).walletService;
                        return [4 /*yield*/, walletService.creditDgt(userId, achievement.rewardDgt, {
                                source: 'achievement_unlock',
                                reason: "Achievement reward: ".concat(achievement.name),
                                achievementId: achievement.id
                            })];
                    case 5:
                        _a.sent();
                        logger_1.logger.info('ACHIEVEMENT_REWARD', "Awarded ".concat(achievement.rewardDgt, " DGT to user ").concat(userId, " for achievement ").concat(achievement.name));
                        return [3 /*break*/, 8];
                    case 6:
                        error_4 = _a.sent();
                        return [4 /*yield*/, (0, report_error_1.reportErrorServer)(error_4, {
                                service: 'AchievementProcessorService',
                                operation: 'distributeRewards.awardDGT',
                                action: logger_1.LogAction.FAILURE,
                                data: { userId: userId, achievementId: achievement.id, achievementName: achievement.name, rewardDgt: achievement.rewardDgt }
                            })];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 8:
                        // Award Reputation (integrate with existing Reputation service)
                        if (achievement.rewardReputation > 0) {
                            // TODO: Integrate with Reputation service
                            logger_1.logger.info('ACHIEVEMENT_REWARD', "Would award ".concat(achievement.rewardReputation, " Reputation to user ").concat(userId));
                        }
                        return [3 /*break*/, 11];
                    case 9:
                        error_5 = _a.sent();
                        return [4 /*yield*/, (0, report_error_1.reportErrorServer)(error_5, {
                                service: 'AchievementProcessorService',
                                operation: 'distributeRewards',
                                action: logger_1.LogAction.FAILURE,
                                data: { userId: userId, achievementId: achievement.id, achievementName: achievement.name }
                            })];
                    case 10:
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Helper methods
     */
    AchievementProcessorService.prototype.getUserAchievement = function (userId, achievementId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _db_1.db
                            .select()
                            .from(_schema_1.userAchievements)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(_schema_1.userAchievements.userId, userId), (0, drizzle_orm_1.eq)(_schema_1.userAchievements.achievementId, achievementId)))
                            .limit(1)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0] || null];
                }
            });
        });
    };
    AchievementProcessorService.prototype.getUserMetric = function (userId, metric) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, posts, threads;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = metric;
                        switch (_a) {
                            case 'total_posts': return [3 /*break*/, 1];
                            case 'total_threads': return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 5];
                    case 1: return [4 /*yield*/, _db_1.db
                            .select({ count: (0, drizzle_orm_1.count)() })
                            .from(_schema_1.achievementEvents)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(_schema_1.achievementEvents.userId, userId), (0, drizzle_orm_1.eq)(_schema_1.achievementEvents.eventType, 'post_created')))];
                    case 2:
                        posts = _d.sent();
                        return [2 /*return*/, ((_b = posts[0]) === null || _b === void 0 ? void 0 : _b.count) || 0];
                    case 3: return [4 /*yield*/, _db_1.db
                            .select({ count: (0, drizzle_orm_1.count)() })
                            .from(_schema_1.achievementEvents)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(_schema_1.achievementEvents.userId, userId), (0, drizzle_orm_1.eq)(_schema_1.achievementEvents.eventType, 'thread_created')))];
                    case 4:
                        threads = _d.sent();
                        return [2 /*return*/, ((_c = threads[0]) === null || _c === void 0 ? void 0 : _c.count) || 0];
                    case 5: return [2 /*return*/, 0];
                }
            });
        });
    };
    AchievementProcessorService.prototype.checkEventConditions = function (conditions, eventData) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, conditions.every(function (condition) {
                        var fieldValue = _this.getNestedValue(eventData, condition.field);
                        switch (condition.operation) {
                            case 'equals':
                                return fieldValue === condition.value;
                            case 'greater_than':
                                return fieldValue > condition.value;
                            case 'less_than':
                                return fieldValue < condition.value;
                            case 'contains':
                                return String(fieldValue).includes(condition.value);
                            case 'within_seconds':
                                var timeDiff = Date.now() - new Date(fieldValue).getTime();
                                return timeDiff <= condition.value * 1000;
                            default:
                                return false;
                        }
                    })];
            });
        });
    };
    AchievementProcessorService.prototype.getNestedValue = function (obj, path) {
        return path.split('.').reduce(function (current, key) { return current === null || current === void 0 ? void 0 : current[key]; }, obj);
    };
    AchievementProcessorService.prototype.actionToEventType = function (action) {
        var mapping = {
            posts_created: 'post_created',
            threads_created: 'thread_created',
            login_count: 'user_login',
            tips_sent: 'tip_sent',
            tips_received: 'tip_received',
            shoutbox_messages: 'shoutbox_message',
            likes_given: 'like_given',
            likes_received: 'like_received'
        };
        return mapping[action] || 'custom_event';
    };
    AchievementProcessorService.prototype.markEventProcessed = function (eventType, userId, eventData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _db_1.db
                            .update(_schema_1.achievementEvents)
                            .set({
                            processingStatus: 'completed',
                            processedAt: new Date()
                        })
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(_schema_1.achievementEvents.userId, userId), (0, drizzle_orm_1.eq)(_schema_1.achievementEvents.eventType, eventType), (0, drizzle_orm_1.eq)(_schema_1.achievementEvents.processingStatus, 'pending')))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return AchievementProcessorService;
}());
exports.AchievementProcessorService = AchievementProcessorService;
