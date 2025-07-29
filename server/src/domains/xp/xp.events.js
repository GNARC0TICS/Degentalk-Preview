"use strict";
/**
 * XP Events
 *
 * Event classes for XP-related events in the system
 * These are used for triggering notifications and other actions when XP changes occur
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LevelUpEvent = exports.XpLossEvent = exports.XpGainEvent = void 0;
/**
 * Event emitted when a user gains XP
 */
var XpGainEvent = /** @class */ (function () {
    function XpGainEvent(userId, amount, source, metadata) {
        this.userId = userId;
        this.amount = amount;
        this.source = source;
        this.metadata = metadata;
    }
    return XpGainEvent;
}());
exports.XpGainEvent = XpGainEvent;
/**
 * Event emitted when a user loses XP
 */
var XpLossEvent = /** @class */ (function () {
    function XpLossEvent(userId, amount, reason, metadata) {
        this.userId = userId;
        this.amount = amount;
        this.reason = reason;
        this.metadata = metadata;
    }
    return XpLossEvent;
}());
exports.XpLossEvent = XpLossEvent;
/**
 * Event emitted when a user levels up
 */
var LevelUpEvent = /** @class */ (function () {
    function LevelUpEvent(userId, oldLevel, newLevel, newXp, metadata) {
        this.userId = userId;
        this.oldLevel = oldLevel;
        this.newLevel = newLevel;
        this.newXp = newXp;
        this.metadata = metadata;
    }
    return LevelUpEvent;
}());
exports.LevelUpEvent = LevelUpEvent;
