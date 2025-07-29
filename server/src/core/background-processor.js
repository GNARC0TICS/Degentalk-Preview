"use strict";
/**
 * Background Processor
 *
 * Handles background processing of achievement events and other asynchronous tasks.
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
exports.backgroundProcessor = exports.BackgroundProcessor = void 0;
var _db_1 = require("@db");
var drizzle_orm_1 = require("drizzle-orm");
var _schema_1 = require("@schema");
var achievement_processor_service_1 = require("../domains/gamification/achievements/achievement-processor.service");
var logger_1 = require("./logger");
var BackgroundProcessor = /** @class */ (function () {
    function BackgroundProcessor() {
        this.processorService = new achievement_processor_service_1.AchievementProcessorService();
        this.intervalId = null;
        this.isProcessing = false;
    }
    /**
     * Process pending achievement events
     */
    BackgroundProcessor.prototype.processAchievementEvents = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pendingEvents, _i, pendingEvents_1, event_1, error_1, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isProcessing) {
                            logger_1.logger.debug('BACKGROUND_PROCESSOR', 'Achievement processing already in progress, skipping');
                            return [2 /*return*/];
                        }
                        this.isProcessing = true;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 11, 12, 13]);
                        return [4 /*yield*/, _db_1.db
                                .select()
                                .from(_schema_1.achievementEvents)
                                .where((0, drizzle_orm_1.eq)(_schema_1.achievementEvents.processingStatus, 'pending'))
                                .limit(100)];
                    case 2:
                        pendingEvents = _a.sent();
                        if (pendingEvents.length === 0) {
                            return [2 /*return*/];
                        }
                        logger_1.logger.info('BACKGROUND_PROCESSOR', "Processing ".concat(pendingEvents.length, " achievement events"));
                        _i = 0, pendingEvents_1 = pendingEvents;
                        _a.label = 3;
                    case 3:
                        if (!(_i < pendingEvents_1.length)) return [3 /*break*/, 10];
                        event_1 = pendingEvents_1[_i];
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 7, , 9]);
                        // Mark as processing to avoid duplicate processing
                        return [4 /*yield*/, _db_1.db
                                .update(_schema_1.achievementEvents)
                                .set({ processingStatus: 'processing' })
                                .where((0, drizzle_orm_1.eq)(_schema_1.achievementEvents.id, event_1.id))];
                    case 5:
                        // Mark as processing to avoid duplicate processing
                        _a.sent();
                        // Process the event
                        return [4 /*yield*/, this.processorService.processEvent(event_1.eventType, event_1.userId, event_1.eventData)];
                    case 6:
                        // Process the event
                        _a.sent();
                        logger_1.logger.debug('BACKGROUND_PROCESSOR', "Processed achievement event ".concat(event_1.id), {
                            eventType: event_1.eventType,
                            userId: event_1.userId
                        });
                        return [3 /*break*/, 9];
                    case 7:
                        error_1 = _a.sent();
                        logger_1.logger.error('BACKGROUND_PROCESSOR', "Failed to process achievement event ".concat(event_1.id), {
                            eventId: event_1.id,
                            eventType: event_1.eventType,
                            userId: event_1.userId,
                            error: error_1 instanceof Error ? error_1.message : String(error_1)
                        });
                        // Mark as failed
                        return [4 /*yield*/, _db_1.db
                                .update(_schema_1.achievementEvents)
                                .set({
                                processingStatus: 'failed',
                                processedAt: new Date()
                            })
                                .where((0, drizzle_orm_1.eq)(_schema_1.achievementEvents.id, event_1.id))];
                    case 8:
                        // Mark as failed
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 9:
                        _i++;
                        return [3 /*break*/, 3];
                    case 10:
                        logger_1.logger.info('BACKGROUND_PROCESSOR', "Completed processing ".concat(pendingEvents.length, " achievement events"));
                        return [3 /*break*/, 13];
                    case 11:
                        error_2 = _a.sent();
                        logger_1.logger.error('BACKGROUND_PROCESSOR', 'Error in achievement event processing', {
                            error: error_2 instanceof Error ? error_2.message : String(error_2)
                        });
                        return [3 /*break*/, 13];
                    case 12:
                        this.isProcessing = false;
                        return [7 /*endfinally*/];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Start the background processor
     */
    BackgroundProcessor.prototype.start = function () {
        var _this = this;
        if (this.intervalId) {
            logger_1.logger.warn('BACKGROUND_PROCESSOR', 'Background processor already started');
            return;
        }
        logger_1.logger.info('BACKGROUND_PROCESSOR', 'Starting background processor');
        // Process events every 30 seconds
        this.intervalId = setInterval(function () {
            _this.processAchievementEvents().catch(function (error) {
                logger_1.logger.error('BACKGROUND_PROCESSOR', 'Unhandled error in achievement processing', {
                    error: error instanceof Error ? error.message : String(error)
                });
            });
        }, 30000); // 30 seconds
        // Process once immediately
        this.processAchievementEvents().catch(function (error) {
            logger_1.logger.error('BACKGROUND_PROCESSOR', 'Initial achievement processing failed', {
                error: error instanceof Error ? error.message : String(error)
            });
        });
    };
    /**
     * Stop the background processor
     */
    BackgroundProcessor.prototype.stop = function () {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            logger_1.logger.info('BACKGROUND_PROCESSOR', 'Background processor stopped');
        }
    };
    /**
     * Get processor status
     */
    BackgroundProcessor.prototype.getStatus = function () {
        return {
            isRunning: this.intervalId !== null,
            isProcessing: this.isProcessing
        };
    };
    return BackgroundProcessor;
}());
exports.BackgroundProcessor = BackgroundProcessor;
// Create singleton instance
exports.backgroundProcessor = new BackgroundProcessor();
// Auto-start in production and development (but not in tests)
if (process.env.NODE_ENV !== 'test') {
    exports.backgroundProcessor.start();
    // Graceful shutdown
    process.on('SIGINT', function () {
        logger_1.logger.info('BACKGROUND_PROCESSOR', 'Received SIGINT, stopping background processor');
        exports.backgroundProcessor.stop();
    });
    process.on('SIGTERM', function () {
        logger_1.logger.info('BACKGROUND_PROCESSOR', 'Received SIGTERM, stopping background processor');
        exports.backgroundProcessor.stop();
    });
}
