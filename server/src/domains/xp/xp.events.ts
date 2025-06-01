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
  constructor(
    public userId: number,
    public amount: number,
    public source: string,
    public metadata?: any
  ) {}
}

/**
 * Event emitted when a user loses XP
 */
export class XpLossEvent {
  constructor(
    public userId: number,
    public amount: number,
    public reason: string,
    public metadata?: any
  ) {}
}

/**
 * Event emitted when a user levels up
 */
export class LevelUpEvent {
  constructor(
    public userId: number,
    public oldLevel: number,
    public newLevel: number,
    public newXp: number,
    public metadata?: any
  ) {}
} 