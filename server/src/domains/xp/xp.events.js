/**
 * XP Events
 *
 * Event classes for XP-related events in the system
 * These are used for triggering notifications and other actions when XP changes occur
 */
/**
 * Event emitted when a user gains XP
 */
export class XpGainEvent {
    userId;
    amount;
    source;
    metadata;
    constructor(userId, amount, source, metadata) {
        this.userId = userId;
        this.amount = amount;
        this.source = source;
        this.metadata = metadata;
    }
}
/**
 * Event emitted when a user loses XP
 */
export class XpLossEvent {
    userId;
    amount;
    reason;
    metadata;
    constructor(userId, amount, reason, metadata) {
        this.userId = userId;
        this.amount = amount;
        this.reason = reason;
        this.metadata = metadata;
    }
}
/**
 * Event emitted when a user levels up
 */
export class LevelUpEvent {
    userId;
    oldLevel;
    newLevel;
    newXp;
    metadata;
    constructor(userId, oldLevel, newLevel, newXp, metadata) {
        this.userId = userId;
        this.oldLevel = oldLevel;
        this.newLevel = newLevel;
        this.newXp = newXp;
        this.metadata = metadata;
    }
}
