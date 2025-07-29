"use strict";
/**
 * Degen Achievement Evaluators
 *
 * Custom evaluators for culturally-specific "degen" achievements that require
 * complex logic beyond simple counting or thresholds.
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
exports.DegenAchievementEvaluators = void 0;
var _db_1 = require("@db");
var drizzle_orm_1 = require("drizzle-orm");
var _schema_1 = require("@schema");
var logger_1 = require("@core/logger");
var DegenAchievementEvaluators = /** @class */ (function () {
    function DegenAchievementEvaluators() {
    }
    /**
     * Check if this evaluator can handle a specific achievement
     */
    DegenAchievementEvaluators.prototype.canHandle = function (evaluator, eventType) {
        var handlers = [
            'check_wallet_loss',
            'check_diamond_hands',
            'check_paper_hands',
            'check_crash_sentiment',
            'check_thread_necromancy',
            'check_shoutbox_spam',
            'check_tip_whale',
            'check_market_prophet',
            'check_degen_combo',
            'check_panic_poster',
            'check_hodl_mentality',
            'check_fomo_master',
            'check_loss_recovery',
            'check_weekend_warrior',
            'check_night_owl',
            'check_meme_lord',
            'check_contrarian',
            'check_moon_mission'
        ];
        return handlers.includes(evaluator);
    };
    /**
     * Evaluate a specific achievement condition
     */
    DegenAchievementEvaluators.prototype.evaluate = function (evaluator, userId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 39, , 40]);
                        _a = evaluator;
                        switch (_a) {
                            case 'check_wallet_loss': return [3 /*break*/, 1];
                            case 'check_diamond_hands': return [3 /*break*/, 3];
                            case 'check_paper_hands': return [3 /*break*/, 5];
                            case 'check_crash_sentiment': return [3 /*break*/, 7];
                            case 'check_thread_necromancy': return [3 /*break*/, 9];
                            case 'check_shoutbox_spam': return [3 /*break*/, 11];
                            case 'check_tip_whale': return [3 /*break*/, 13];
                            case 'check_market_prophet': return [3 /*break*/, 15];
                            case 'check_degen_combo': return [3 /*break*/, 17];
                            case 'check_panic_poster': return [3 /*break*/, 19];
                            case 'check_hodl_mentality': return [3 /*break*/, 21];
                            case 'check_fomo_master': return [3 /*break*/, 23];
                            case 'check_loss_recovery': return [3 /*break*/, 25];
                            case 'check_weekend_warrior': return [3 /*break*/, 27];
                            case 'check_night_owl': return [3 /*break*/, 29];
                            case 'check_meme_lord': return [3 /*break*/, 31];
                            case 'check_contrarian': return [3 /*break*/, 33];
                            case 'check_moon_mission': return [3 /*break*/, 35];
                        }
                        return [3 /*break*/, 37];
                    case 1: return [4 /*yield*/, this.checkWalletLoss(userId, config)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.checkDiamondHands(userId, config)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.checkPaperHands(userId, config)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [4 /*yield*/, this.checkCrashSentiment(userId, config)];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9: return [4 /*yield*/, this.checkThreadNecromancy(userId, config)];
                    case 10: return [2 /*return*/, _b.sent()];
                    case 11: return [4 /*yield*/, this.checkShoutboxSpam(userId, config)];
                    case 12: return [2 /*return*/, _b.sent()];
                    case 13: return [4 /*yield*/, this.checkTipWhale(userId, config)];
                    case 14: return [2 /*return*/, _b.sent()];
                    case 15: return [4 /*yield*/, this.checkMarketProphet(userId, config)];
                    case 16: return [2 /*return*/, _b.sent()];
                    case 17: return [4 /*yield*/, this.checkDegenCombo(userId, config)];
                    case 18: return [2 /*return*/, _b.sent()];
                    case 19: return [4 /*yield*/, this.checkPanicPoster(userId, config)];
                    case 20: return [2 /*return*/, _b.sent()];
                    case 21: return [4 /*yield*/, this.checkHodlMentality(userId, config)];
                    case 22: return [2 /*return*/, _b.sent()];
                    case 23: return [4 /*yield*/, this.checkFomoMaster(userId, config)];
                    case 24: return [2 /*return*/, _b.sent()];
                    case 25: return [4 /*yield*/, this.checkLossRecovery(userId, config)];
                    case 26: return [2 /*return*/, _b.sent()];
                    case 27: return [4 /*yield*/, this.checkWeekendWarrior(userId, config)];
                    case 28: return [2 /*return*/, _b.sent()];
                    case 29: return [4 /*yield*/, this.checkNightOwl(userId, config)];
                    case 30: return [2 /*return*/, _b.sent()];
                    case 31: return [4 /*yield*/, this.checkMemeLord(userId, config)];
                    case 32: return [2 /*return*/, _b.sent()];
                    case 33: return [4 /*yield*/, this.checkContrarian(userId, config)];
                    case 34: return [2 /*return*/, _b.sent()];
                    case 35: return [4 /*yield*/, this.checkMoonMission(userId, config)];
                    case 36: return [2 /*return*/, _b.sent()];
                    case 37:
                        logger_1.logger.warn('DEGEN_EVALUATOR', "Unknown evaluator: ".concat(evaluator));
                        return [2 /*return*/, false];
                    case 38: return [3 /*break*/, 40];
                    case 39:
                        error_1 = _b.sent();
                        logger_1.logger.error('DEGEN_EVALUATOR', "Failed to evaluate ".concat(evaluator), {
                            evaluator: evaluator,
                            userId: userId,
                            error: error_1 instanceof Error ? error_1.message : String(error_1)
                        });
                        return [2 /*return*/, false];
                    case 40: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check for significant wallet losses (bag holder achievements)
     */
    DegenAchievementEvaluators.prototype.checkWalletLoss = function (userId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, minimumLoss, _b, timeframe, lossEvents, totalLoss;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = config.minimumLoss, minimumLoss = _a === void 0 ? 1000 : _a, _b = config.timeframe, timeframe = _b === void 0 ? 24 : _b;
                        return [4 /*yield*/, _db_1.db
                                .select()
                                .from(_schema_1.achievementEvents)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(_schema_1.achievementEvents.userId, userId), (0, drizzle_orm_1.eq)(_schema_1.achievementEvents.eventType, 'wallet_loss'), (0, drizzle_orm_1.gte)(_schema_1.achievementEvents.triggeredAt, (0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["now() - interval '", " hours'"], ["now() - interval '", " hours'"])), timeframe))))];
                    case 1:
                        lossEvents = _c.sent();
                        totalLoss = lossEvents.reduce(function (sum, event) {
                            var data = event.eventData;
                            return sum + (data.lossAmount || 0);
                        }, 0);
                        return [2 /*return*/, totalLoss >= minimumLoss];
                }
            });
        });
    };
    /**
     * Check for diamond hands behavior (holding through adversity)
     */
    DegenAchievementEvaluators.prototype.checkDiamondHands = function (userId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, minimumHoldDays, _b, minimumDrawdown, diamondEvents;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = config.minimumHoldDays, minimumHoldDays = _a === void 0 ? 30 : _a, _b = config.minimumDrawdown, minimumDrawdown = _b === void 0 ? 50 : _b;
                        return [4 /*yield*/, _db_1.db
                                .select()
                                .from(_schema_1.achievementEvents)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(_schema_1.achievementEvents.userId, userId), (0, drizzle_orm_1.eq)(_schema_1.achievementEvents.eventType, 'diamond_hands')))];
                    case 1:
                        diamondEvents = _c.sent();
                        return [2 /*return*/, diamondEvents.some(function (event) {
                                var data = event.eventData;
                                return data.holdDuration >= minimumHoldDays && data.maxDrawdown >= minimumDrawdown;
                            })];
                }
            });
        });
    };
    /**
     * Check for paper hands behavior (panic selling)
     */
    DegenAchievementEvaluators.prototype.checkPaperHands = function (userId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, requiredPanicSells, _b, timeframe, panicSells;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = config.requiredPanicSells, requiredPanicSells = _a === void 0 ? 3 : _a, _b = config.timeframe, timeframe = _b === void 0 ? 168 : _b;
                        return [4 /*yield*/, _db_1.db
                                .select({ count: (0, drizzle_orm_1.count)() })
                                .from(_schema_1.achievementEvents)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(_schema_1.achievementEvents.userId, userId), (0, drizzle_orm_1.eq)(_schema_1.achievementEvents.eventType, 'paper_hands'), (0, drizzle_orm_1.gte)(_schema_1.achievementEvents.triggeredAt, (0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["now() - interval '", " hours'"], ["now() - interval '", " hours'"])), timeframe))))];
                    case 1:
                        panicSells = _d.sent();
                        return [2 /*return*/, (((_c = panicSells[0]) === null || _c === void 0 ? void 0 : _c.count) || 0) >= requiredPanicSells];
                }
            });
        });
    };
    /**
     * Check for crash sentiment posting (doom posting during market crashes)
     */
    DegenAchievementEvaluators.prototype.checkCrashSentiment = function (userId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, requiredPosts, _b, sentimentThreshold, crashPosts, qualifyingPosts;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = config.requiredPosts, requiredPosts = _a === void 0 ? 5 : _a, _b = config.sentimentThreshold, sentimentThreshold = _b === void 0 ? 0.7 : _b;
                        return [4 /*yield*/, _db_1.db
                                .select()
                                .from(_schema_1.achievementEvents)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(_schema_1.achievementEvents.userId, userId), (0, drizzle_orm_1.eq)(_schema_1.achievementEvents.eventType, 'crash_sentiment')))];
                    case 1:
                        crashPosts = _c.sent();
                        qualifyingPosts = crashPosts.filter(function (event) {
                            var data = event.eventData;
                            return data.confidence >= sentimentThreshold;
                        });
                        return [2 /*return*/, qualifyingPosts.length >= requiredPosts];
                }
            });
        });
    };
    /**
     * Check for thread necromancy (reviving old threads)
     */
    DegenAchievementEvaluators.prototype.checkThreadNecromancy = function (userId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, requiredNecromancies, _b, minimumThreadAge, necromancies, qualifyingNecromancies;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = config.requiredNecromancies, requiredNecromancies = _a === void 0 ? 3 : _a, _b = config.minimumThreadAge, minimumThreadAge = _b === void 0 ? 90 : _b;
                        return [4 /*yield*/, _db_1.db
                                .select()
                                .from(_schema_1.achievementEvents)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(_schema_1.achievementEvents.userId, userId), (0, drizzle_orm_1.eq)(_schema_1.achievementEvents.eventType, 'thread_necromancy')))];
                    case 1:
                        necromancies = _c.sent();
                        qualifyingNecromancies = necromancies.filter(function (event) {
                            var data = event.eventData;
                            return data.threadAge >= minimumThreadAge;
                        });
                        return [2 /*return*/, qualifyingNecromancies.length >= requiredNecromancies];
                }
            });
        });
    };
    /**
     * Check for shoutbox spam patterns
     */
    DegenAchievementEvaluators.prototype.checkShoutboxSpam = function (userId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, messagesPerHour, _b, timeframe, messages;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = config.messagesPerHour, messagesPerHour = _a === void 0 ? 50 : _a, _b = config.timeframe, timeframe = _b === void 0 ? 1 : _b;
                        return [4 /*yield*/, _db_1.db
                                .select({ count: (0, drizzle_orm_1.count)() })
                                .from(_schema_1.achievementEvents)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(_schema_1.achievementEvents.userId, userId), (0, drizzle_orm_1.eq)(_schema_1.achievementEvents.eventType, 'shoutbox_message'), (0, drizzle_orm_1.gte)(_schema_1.achievementEvents.triggeredAt, (0, drizzle_orm_1.sql)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["now() - interval '", " hours'"], ["now() - interval '", " hours'"])), timeframe))))];
                    case 1:
                        messages = _d.sent();
                        return [2 /*return*/, (((_c = messages[0]) === null || _c === void 0 ? void 0 : _c.count) || 0) >= messagesPerHour];
                }
            });
        });
    };
    /**
     * Check for whale-level tipping behavior
     */
    DegenAchievementEvaluators.prototype.checkTipWhale = function (userId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, minimumTipAmount, _b, timeframe, tips;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = config.minimumTipAmount, minimumTipAmount = _a === void 0 ? 10000 : _a, _b = config.timeframe, timeframe = _b === void 0 ? 24 : _b;
                        return [4 /*yield*/, _db_1.db
                                .select()
                                .from(_schema_1.achievementEvents)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(_schema_1.achievementEvents.userId, userId), (0, drizzle_orm_1.eq)(_schema_1.achievementEvents.eventType, 'tip_sent'), (0, drizzle_orm_1.gte)(_schema_1.achievementEvents.triggeredAt, (0, drizzle_orm_1.sql)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["now() - interval '", " hours'"], ["now() - interval '", " hours'"])), timeframe))))];
                    case 1:
                        tips = _c.sent();
                        return [2 /*return*/, tips.some(function (tip) {
                                var data = tip.eventData;
                                return data.amount >= minimumTipAmount;
                            })];
                }
            });
        });
    };
    /**
     * Check for accurate market predictions
     */
    DegenAchievementEvaluators.prototype.checkMarketProphet = function (userId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, minimumAccuracy, _b, minimumPredictions, predictions, accuratePredictions, overallAccuracy;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = config.minimumAccuracy, minimumAccuracy = _a === void 0 ? 0.8 : _a, _b = config.minimumPredictions, minimumPredictions = _b === void 0 ? 10 : _b;
                        return [4 /*yield*/, _db_1.db
                                .select()
                                .from(_schema_1.achievementEvents)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(_schema_1.achievementEvents.userId, userId), (0, drizzle_orm_1.eq)(_schema_1.achievementEvents.eventType, 'market_prediction')))];
                    case 1:
                        predictions = _c.sent();
                        if (predictions.length < minimumPredictions)
                            return [2 /*return*/, false];
                        accuratePredictions = predictions.filter(function (pred) {
                            var data = pred.eventData;
                            return data.accuracy >= minimumAccuracy;
                        });
                        overallAccuracy = accuratePredictions.length / predictions.length;
                        return [2 /*return*/, overallAccuracy >= minimumAccuracy];
                }
            });
        });
    };
    /**
     * Check for multiple degen activities in sequence
     */
    DegenAchievementEvaluators.prototype.checkDegenCombo = function (userId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, requiredEvents, _b, timeframe, events, eventTypes;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = config.requiredEvents, requiredEvents = _a === void 0 ? ['wallet_loss', 'paper_hands', 'crash_sentiment'] : _a, _b = config.timeframe, timeframe = _b === void 0 ? 24 : _b;
                        return [4 /*yield*/, _db_1.db
                                .select()
                                .from(_schema_1.achievementEvents)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(_schema_1.achievementEvents.userId, userId), (0, drizzle_orm_1.gte)(_schema_1.achievementEvents.triggeredAt, (0, drizzle_orm_1.sql)(templateObject_5 || (templateObject_5 = __makeTemplateObject(["now() - interval '", " hours'"], ["now() - interval '", " hours'"])), timeframe))))
                                .orderBy((0, drizzle_orm_1.desc)(_schema_1.achievementEvents.triggeredAt))];
                    case 1:
                        events = _c.sent();
                        eventTypes = events.map(function (e) { return e.eventType; });
                        return [2 /*return*/, requiredEvents.every(function (eventType) {
                                return eventTypes.includes(eventType);
                            })];
                }
            });
        });
    };
    /**
     * Check for panic posting behavior (high activity during market stress)
     */
    DegenAchievementEvaluators.prototype.checkPanicPoster = function (userId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, postsPerHour, _b, crashKeywords, _c, timeframe, posts, crashSentiments;
            var _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _a = config.postsPerHour, postsPerHour = _a === void 0 ? 10 : _a, _b = config.crashKeywords, crashKeywords = _b === void 0 ? ['crash', 'dump', 'rekt', 'bear'] : _b, _c = config.timeframe, timeframe = _c === void 0 ? 4 : _c;
                        return [4 /*yield*/, _db_1.db
                                .select({ count: (0, drizzle_orm_1.count)() })
                                .from(_schema_1.achievementEvents)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(_schema_1.achievementEvents.userId, userId), (0, drizzle_orm_1.eq)(_schema_1.achievementEvents.eventType, 'post_created'), (0, drizzle_orm_1.gte)(_schema_1.achievementEvents.triggeredAt, (0, drizzle_orm_1.sql)(templateObject_6 || (templateObject_6 = __makeTemplateObject(["now() - interval '", " hours'"], ["now() - interval '", " hours'"])), timeframe))))];
                    case 1:
                        posts = _f.sent();
                        return [4 /*yield*/, _db_1.db
                                .select({ count: (0, drizzle_orm_1.count)() })
                                .from(_schema_1.achievementEvents)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(_schema_1.achievementEvents.userId, userId), (0, drizzle_orm_1.eq)(_schema_1.achievementEvents.eventType, 'crash_sentiment'), (0, drizzle_orm_1.gte)(_schema_1.achievementEvents.triggeredAt, (0, drizzle_orm_1.sql)(templateObject_7 || (templateObject_7 = __makeTemplateObject(["now() - interval '", " hours'"], ["now() - interval '", " hours'"])), timeframe))))];
                    case 2:
                        crashSentiments = _f.sent();
                        return [2 /*return*/, (((_d = posts[0]) === null || _d === void 0 ? void 0 : _d.count) || 0) >= postsPerHour && (((_e = crashSentiments[0]) === null || _e === void 0 ? void 0 : _e.count) || 0) > 0];
                }
            });
        });
    };
    /**
     * Check for long-term holding mentality
     */
    DegenAchievementEvaluators.prototype.checkHodlMentality = function (userId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, minimumHoldPeriod, _b, resistedSellSignals, holdEvents;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = config.minimumHoldPeriod, minimumHoldPeriod = _a === void 0 ? 365 : _a, _b = config.resistedSellSignals, resistedSellSignals = _b === void 0 ? 5 : _b;
                        return [4 /*yield*/, _db_1.db
                                .select()
                                .from(_schema_1.achievementEvents)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(_schema_1.achievementEvents.userId, userId), (0, drizzle_orm_1.eq)(_schema_1.achievementEvents.eventType, 'diamond_hands')))];
                    case 1:
                        holdEvents = _c.sent();
                        return [2 /*return*/, holdEvents.some(function (event) {
                                var data = event.eventData;
                                return data.holdDuration >= minimumHoldPeriod;
                            })];
                }
            });
        });
    };
    /**
     * Check for FOMO behavior patterns
     */
    DegenAchievementEvaluators.prototype.checkFomoMaster = function (userId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, requiredFomoActions, _b, timeframe, fomoActivities;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = config.requiredFomoActions, requiredFomoActions = _a === void 0 ? 10 : _a, _b = config.timeframe, timeframe = _b === void 0 ? 168 : _b;
                        return [4 /*yield*/, _db_1.db
                                .select({ count: (0, drizzle_orm_1.count)() })
                                .from(_schema_1.achievementEvents)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(_schema_1.achievementEvents.userId, userId), (0, drizzle_orm_1.gte)(_schema_1.achievementEvents.triggeredAt, (0, drizzle_orm_1.sql)(templateObject_8 || (templateObject_8 = __makeTemplateObject(["now() - interval '", " hours'"], ["now() - interval '", " hours'"])), timeframe))))];
                    case 1:
                        fomoActivities = _d.sent();
                        return [2 /*return*/, (((_c = fomoActivities[0]) === null || _c === void 0 ? void 0 : _c.count) || 0) >= requiredFomoActions];
                }
            });
        });
    };
    /**
     * Check for recovery from major losses
     */
    DegenAchievementEvaluators.prototype.checkLossRecovery = function (userId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, minimumLoss, _b, recoveryMultiplier, lossEvents, diamondEvents;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = config.minimumLoss, minimumLoss = _a === void 0 ? 5000 : _a, _b = config.recoveryMultiplier, recoveryMultiplier = _b === void 0 ? 1.5 : _b;
                        return [4 /*yield*/, _db_1.db
                                .select()
                                .from(_schema_1.achievementEvents)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(_schema_1.achievementEvents.userId, userId), (0, drizzle_orm_1.eq)(_schema_1.achievementEvents.eventType, 'wallet_loss')))];
                    case 1:
                        lossEvents = _c.sent();
                        return [4 /*yield*/, _db_1.db
                                .select()
                                .from(_schema_1.achievementEvents)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(_schema_1.achievementEvents.userId, userId), (0, drizzle_orm_1.eq)(_schema_1.achievementEvents.eventType, 'diamond_hands')))];
                    case 2:
                        diamondEvents = _c.sent();
                        // Check if there's a diamond hands event after a significant loss
                        return [2 /*return*/, lossEvents.some(function (loss) {
                                var lossData = loss.eventData;
                                if (lossData.lossAmount < minimumLoss)
                                    return false;
                                return diamondEvents.some(function (diamond) {
                                    var diamondData = diamond.eventData;
                                    return (diamond.triggeredAt > loss.triggeredAt &&
                                        diamondData.finalReturn >= lossData.lossAmount * recoveryMultiplier);
                                });
                            })];
                }
            });
        });
    };
    /**
     * Check for weekend trading activity
     */
    DegenAchievementEvaluators.prototype.checkWeekendWarrior = function (userId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, weekendPostsRequired, weekendPosts;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = config.weekendPostsRequired, weekendPostsRequired = _a === void 0 ? 20 : _a;
                        return [4 /*yield*/, _db_1.db
                                .select({ count: (0, drizzle_orm_1.count)() })
                                .from(_schema_1.achievementEvents)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(_schema_1.achievementEvents.userId, userId), (0, drizzle_orm_1.eq)(_schema_1.achievementEvents.eventType, 'post_created'), (0, drizzle_orm_1.sql)(templateObject_9 || (templateObject_9 = __makeTemplateObject(["EXTRACT(DOW FROM triggered_at) IN (0, 6)"], ["EXTRACT(DOW FROM triggered_at) IN (0, 6)" // Sunday = 0, Saturday = 6
                            ])))))];
                    case 1:
                        weekendPosts = _c.sent();
                        return [2 /*return*/, (((_b = weekendPosts[0]) === null || _b === void 0 ? void 0 : _b.count) || 0) >= weekendPostsRequired];
                }
            });
        });
    };
    /**
     * Check for late night posting activity
     */
    DegenAchievementEvaluators.prototype.checkNightOwl = function (userId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, nightPostsRequired, _b, startHour, _c, endHour, nightPosts;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _a = config.nightPostsRequired, nightPostsRequired = _a === void 0 ? 50 : _a, _b = config.startHour, startHour = _b === void 0 ? 22 : _b, _c = config.endHour, endHour = _c === void 0 ? 6 : _c;
                        return [4 /*yield*/, _db_1.db
                                .select({ count: (0, drizzle_orm_1.count)() })
                                .from(_schema_1.achievementEvents)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(_schema_1.achievementEvents.userId, userId), (0, drizzle_orm_1.eq)(_schema_1.achievementEvents.eventType, 'post_created'), (0, drizzle_orm_1.sql)(templateObject_10 || (templateObject_10 = __makeTemplateObject(["EXTRACT(HOUR FROM triggered_at) >= ", " OR EXTRACT(HOUR FROM triggered_at) <= ", ""], ["EXTRACT(HOUR FROM triggered_at) >= ", " OR EXTRACT(HOUR FROM triggered_at) <= ", ""])), startHour, endHour)))];
                    case 1:
                        nightPosts = _e.sent();
                        return [2 /*return*/, (((_d = nightPosts[0]) === null || _d === void 0 ? void 0 : _d.count) || 0) >= nightPostsRequired];
                }
            });
        });
    };
    /**
     * Check for meme posting mastery
     */
    DegenAchievementEvaluators.prototype.checkMemeLord = function (userId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, memePostsRequired, posts, memePosts;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = config.memePostsRequired, memePostsRequired = _a === void 0 ? 100 : _a;
                        return [4 /*yield*/, _db_1.db
                                .select()
                                .from(_schema_1.achievementEvents)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(_schema_1.achievementEvents.userId, userId), (0, drizzle_orm_1.eq)(_schema_1.achievementEvents.eventType, 'post_created')))];
                    case 1:
                        posts = _b.sent();
                        memePosts = posts.filter(function (post) {
                            var _a;
                            var data = post.eventData;
                            var content = ((_a = data.content) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
                            var memeKeywords = [
                                'pepe',
                                'wojak',
                                'chad',
                                'based',
                                'cringe',
                                'moon',
                                'lambo',
                                'diamond hands',
                                'paper hands'
                            ];
                            return memeKeywords.some(function (keyword) { return content.includes(keyword); });
                        });
                        return [2 /*return*/, memePosts.length >= memePostsRequired];
                }
            });
        });
    };
    /**
     * Check for contrarian behavior (posting opposite sentiment)
     */
    DegenAchievementEvaluators.prototype.checkContrarian = function (userId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, contrarianPostsRequired, contrarianEvents;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = config.contrarianPostsRequired, contrarianPostsRequired = _a === void 0 ? 25 : _a;
                        return [4 /*yield*/, _db_1.db
                                .select({ count: (0, drizzle_orm_1.count)() })
                                .from(_schema_1.achievementEvents)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(_schema_1.achievementEvents.userId, userId), (0, drizzle_orm_1.eq)(_schema_1.achievementEvents.eventType, 'crash_sentiment')))];
                    case 1:
                        contrarianEvents = _c.sent();
                        // Simple implementation - could be enhanced with sentiment analysis
                        return [2 /*return*/, (((_b = contrarianEvents[0]) === null || _b === void 0 ? void 0 : _b.count) || 0) >= contrarianPostsRequired];
                }
            });
        });
    };
    /**
     * Check for moon mission posting (extreme optimism)
     */
    DegenAchievementEvaluators.prototype.checkMoonMission = function (userId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, moonPostsRequired, posts, moonPosts;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = config.moonPostsRequired, moonPostsRequired = _a === void 0 ? 50 : _a;
                        return [4 /*yield*/, _db_1.db
                                .select()
                                .from(_schema_1.achievementEvents)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(_schema_1.achievementEvents.userId, userId), (0, drizzle_orm_1.eq)(_schema_1.achievementEvents.eventType, 'post_created')))];
                    case 1:
                        posts = _b.sent();
                        moonPosts = posts.filter(function (post) {
                            var _a;
                            var data = post.eventData;
                            var content = ((_a = data.content) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
                            var moonKeywords = [
                                'moon',
                                'lambo',
                                'rocket',
                                '🚀',
                                'to the moon',
                                '100x',
                                '1000x',
                                'diamond hands'
                            ];
                            return moonKeywords.some(function (keyword) { return content.includes(keyword); });
                        });
                        return [2 /*return*/, moonPosts.length >= moonPostsRequired];
                }
            });
        });
    };
    return DegenAchievementEvaluators;
}());
exports.DegenAchievementEvaluators = DegenAchievementEvaluators;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10;
