"use strict";
/**
 * XP Actions Registry
 *
 * This module defines all actions that can award XP in the system.
 * These actions are used by the XP service to grant XP to users.
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.XP_ACTIONS = exports.DEFAULT_XP_ACTIONS = exports.XP_ACTION = void 0;
exports.loadXpActionsFromDb = loadXpActionsFromDb;
exports.getXpActions = getXpActions;
exports.getXpAction = getXpAction;
exports.getXpValueForAction = getXpValueForAction;
exports.getXpActionSync = getXpActionSync;
exports.getXpValueForActionSync = getXpValueForActionSync;
var _schema_1 = require("@schema");
var drizzle_orm_1 = require("drizzle-orm");
var _db_1 = require("@db");
// Removed unused imports from xp-actions-schema
var logger_1 = require("@core/logger");
/**
 * Enum of all possible XP-granting actions in the system
 */
var XP_ACTION;
(function (XP_ACTION) {
    XP_ACTION["POST_CREATED"] = "post_created";
    XP_ACTION["THREAD_CREATED"] = "thread_created";
    XP_ACTION["RECEIVED_LIKE"] = "received_like";
    XP_ACTION["DAILY_LOGIN"] = "daily_login";
    XP_ACTION["USER_MENTIONED"] = "user_mentioned";
    XP_ACTION["REPLY_RECEIVED"] = "reply_received";
    XP_ACTION["PROFILE_COMPLETED"] = "profile_completed";
    XP_ACTION["FRAME_EQUIPPED"] = "frame_equipped";
    XP_ACTION["TIP_GIVEN"] = "tip_given";
    XP_ACTION["TIP_RECEIVED"] = "tip_received";
    XP_ACTION["DGT_PURCHASE"] = "dgt_purchase";
})(XP_ACTION || (exports.XP_ACTION = XP_ACTION = {}));
/**
 * Default XP action configurations
 *
 * These are used as fallbacks if database values aren't available
 * They're also used to seed the database initially
 */
exports.DEFAULT_XP_ACTIONS = (_a = {},
    _a[XP_ACTION.POST_CREATED] = {
        key: XP_ACTION.POST_CREATED,
        baseValue: 10,
        description: 'Created a post',
        maxPerDay: 100
    },
    _a[XP_ACTION.THREAD_CREATED] = {
        key: XP_ACTION.THREAD_CREATED,
        baseValue: 30,
        description: 'Started a thread'
    },
    _a[XP_ACTION.RECEIVED_LIKE] = {
        key: XP_ACTION.RECEIVED_LIKE,
        baseValue: 5,
        description: 'Received a like',
        maxPerDay: 50
    },
    _a[XP_ACTION.DAILY_LOGIN] = {
        key: XP_ACTION.DAILY_LOGIN,
        baseValue: 5,
        description: 'Daily login bonus',
        cooldownSeconds: 86400 // 24 hours
    },
    _a[XP_ACTION.USER_MENTIONED] = {
        key: XP_ACTION.USER_MENTIONED,
        baseValue: 2,
        description: 'Mentioned another user',
        maxPerDay: 20
    },
    _a[XP_ACTION.REPLY_RECEIVED] = {
        key: XP_ACTION.REPLY_RECEIVED,
        baseValue: 3,
        description: 'Received a reply to post',
        maxPerDay: 50
    },
    _a[XP_ACTION.PROFILE_COMPLETED] = {
        key: XP_ACTION.PROFILE_COMPLETED,
        baseValue: 50,
        description: 'Completed user profile',
        cooldownSeconds: 604800 // One-time bonus (1 week cooldown as safety)
    },
    _a[XP_ACTION.FRAME_EQUIPPED] = {
        key: XP_ACTION.FRAME_EQUIPPED,
        baseValue: 5,
        description: 'Equipped an avatar frame'
    },
    _a[XP_ACTION.TIP_GIVEN] = {
        key: XP_ACTION.TIP_GIVEN,
        baseValue: 2,
        description: 'Gave a tip to another user',
        maxPerDay: 20
    },
    _a[XP_ACTION.TIP_RECEIVED] = {
        key: XP_ACTION.TIP_RECEIVED,
        baseValue: 5,
        description: 'Received a tip from another user',
        maxPerDay: 50
    },
    _a[XP_ACTION.DGT_PURCHASE] = {
        key: XP_ACTION.DGT_PURCHASE,
        baseValue: 10,
        description: 'Purchased DGT with cryptocurrency',
        maxPerDay: 5
    },
    _a);
// Cache for XP actions
var xpActionsCache = null;
var cacheLastUpdated = 0;
var CACHE_TTL = 60 * 1000; // 1 minute
/**
 * Load XP action configurations from the database
 * Includes caching to reduce database queries
 */
function loadXpActionsFromDb() {
    return __awaiter(this, arguments, void 0, function (forceRefresh) {
        var now, actions, map_1, error_1;
        if (forceRefresh === void 0) { forceRefresh = false; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    now = Date.now();
                    // Return from cache if it's still valid and no force refresh requested
                    if (xpActionsCache && !forceRefresh && now - cacheLastUpdated < CACHE_TTL) {
                        return [2 /*return*/, xpActionsCache];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, _db_1.db
                            .select()
                            .from(_schema_1.xpActionSettings)
                            .where((0, drizzle_orm_1.eq)(_schema_1.xpActionSettings.enabled, true))];
                case 2:
                    actions = _a.sent();
                    // If no actions found in database, use defaults
                    if (!actions || actions.length === 0) {
                        logger_1.logger.warn('XP_ACTIONS', 'No XP actions found in database, using defaults');
                        xpActionsCache = exports.DEFAULT_XP_ACTIONS;
                        cacheLastUpdated = now;
                        return [2 /*return*/, exports.DEFAULT_XP_ACTIONS];
                    }
                    map_1 = {};
                    actions.forEach(function (action) {
                        map_1[action.action] = {
                            key: action.action,
                            baseValue: action.baseValue,
                            description: action.description,
                            maxPerDay: action.maxPerDay || undefined,
                            cooldownSeconds: action.cooldownSec || undefined,
                            enabled: true
                        };
                    });
                    // Update cache
                    xpActionsCache = map_1;
                    cacheLastUpdated = now;
                    return [2 /*return*/, map_1];
                case 3:
                    error_1 = _a.sent();
                    // On error, log and fall back to defaults
                    logger_1.logger.error('XP_ACTIONS', 'Error loading XP actions from database:', error_1 instanceof Error ? error_1.message : String(error_1));
                    return [2 /*return*/, exports.DEFAULT_XP_ACTIONS];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get all configured XP actions
 */
function getXpActions() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, loadXpActionsFromDb()];
        });
    });
}
/**
 * Get an XP action configuration
 */
function getXpAction(key) {
    return __awaiter(this, void 0, void 0, function () {
        var actions, action;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadXpActionsFromDb()];
                case 1:
                    actions = _a.sent();
                    action = actions[key];
                    if (!action) {
                        logger_1.logger.warn('XP_ACTIONS', "Unknown XP action requested: ".concat(key));
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, action];
            }
        });
    });
}
/**
 * Get the base XP value for an action
 */
function getXpValueForAction(key) {
    return __awaiter(this, void 0, void 0, function () {
        var action;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getXpAction(key)];
                case 1:
                    action = _a.sent();
                    return [2 /*return*/, action ? action.baseValue : 0];
            }
        });
    });
}
/**
 * Legacy synchronous functions for backward compatibility
 * These will be deprecated in favor of the async versions above
 */
// Backwards compatibility for code not yet updated to async
exports.XP_ACTIONS = exports.DEFAULT_XP_ACTIONS;
// Legacy sync methods - to be deprecated
function getXpActionSync(key) {
    var action = exports.XP_ACTIONS[key];
    if (!action) {
        logger_1.logger.warn('XP_ACTIONS', "Unknown XP action requested (sync): ".concat(key));
        return null;
    }
    return action;
}
function getXpValueForActionSync(key) {
    var action = getXpActionSync(key);
    return action ? action.baseValue : 0;
}
