/**
 * Type-Safe Amount Utilities
 * 
 * Provides utilities for safely working with branded amount types,
 * ensuring type safety in financial calculations.
 */

import {
  DgtAmount,
  UsdAmount,
  XpAmount,
  FeeAmount,
  ExchangeRate,
  toDgtAmount,
  toUsdAmount,
  toXpAmount,
  ECONOMY_CONSTANTS
} from '@shared/types';

/**
 * Amount arithmetic operations
 */
export class AmountCalculator {
  /**
   * Add two DGT amounts safely
   */
  static addDgt(a: DgtAmount, b: DgtAmount): DgtAmount {
    return toDgtAmount(a + b);
  }
  
  /**
   * Subtract DGT amounts safely (ensures non-negative result)
   */
  static subtractDgt(a: DgtAmount, b: DgtAmount): DgtAmount {
    const result = a - b;
    if (result < 0) {
      throw new Error(`Negative amount not allowed: ${a} - ${b} = ${result}`);
    }
    return toDgtAmount(result);
  }
  
  /**
   * Multiply DGT amount by a factor
   */
  static multiplyDgt(amount: DgtAmount, factor: number): DgtAmount {
    if (factor < 0) {
      throw new Error('Negative factor not allowed');
    }
    return toDgtAmount(amount * factor);
  }
  
  /**
   * Calculate percentage of DGT amount
   */
  static percentageDgt(amount: DgtAmount, percentage: number): DgtAmount {
    if (percentage < 0 || percentage > 100) {
      throw new Error('Percentage must be between 0 and 100');
    }
    return toDgtAmount(amount * (percentage / 100));
  }
  
  /**
   * Convert DGT to USD using exchange rate
   */
  static dgtToUsd(amount: DgtAmount, rate: ExchangeRate): UsdAmount {
    return toUsdAmount(amount * rate);
  }
  
  /**
   * Convert USD to DGT using exchange rate
   */
  static usdToDgt(amount: UsdAmount, rate: ExchangeRate): DgtAmount {
    if (rate === 0) {
      throw new Error('Exchange rate cannot be zero');
    }
    return toDgtAmount(amount / rate);
  }
  
  /**
   * Calculate transaction fee
   */
  static calculateFee(amount: DgtAmount, feePercentage: number): FeeAmount {
    const fee = this.percentageDgt(amount, feePercentage);
    const minFee = toDgtAmount(ECONOMY_CONSTANTS.MIN_WITHDRAWAL_FEE);
    
    // Return the greater of calculated fee or minimum fee
    return (fee > minFee ? fee : minFee) as FeeAmount;
  }
  
  /**
   * Calculate net amount after fee
   */
  static calculateNetAmount(amount: DgtAmount, fee: FeeAmount): DgtAmount {
    return this.subtractDgt(amount, fee as DgtAmount);
  }
  
  /**
   * Split amount evenly among recipients
   */
  static splitAmount(total: DgtAmount, recipientCount: number): DgtAmount {
    if (recipientCount <= 0) {
      throw new Error('Recipient count must be positive');
    }
    return toDgtAmount(total / recipientCount);
  }
  
  /**
   * Round DGT amount to specified decimal places
   */
  static roundDgt(amount: DgtAmount, decimals: number = ECONOMY_CONSTANTS.DGT_DECIMAL_PLACES): DgtAmount {
    const factor = Math.pow(10, decimals);
    return toDgtAmount(Math.round(amount * factor) / factor);
  }
  
  /**
   * Format DGT amount for display
   */
  static formatDgt(amount: DgtAmount): string {
    return amount.toFixed(ECONOMY_CONSTANTS.DGT_DECIMAL_PLACES);
  }
  
  /**
   * Format USD amount for display
   */
  static formatUsd(amount: UsdAmount): string {
    return `$${amount.toFixed(2)}`;
  }
}

/**
 * Amount validation utilities
 */
export class AmountValidator {
  /**
   * Check if amount meets minimum tip requirement
   */
  static isValidTipAmount(amount: DgtAmount): boolean {
    return amount >= ECONOMY_CONSTANTS.MIN_TIP_AMOUNT;
  }
  
  /**
   * Check if amount meets minimum withdrawal requirement
   */
  static isValidWithdrawalAmount(amount: DgtAmount): boolean {
    return amount >= ECONOMY_CONSTANTS.MIN_WITHDRAWAL_AMOUNT;
  }
  
  /**
   * Check if amount is within tip limits
   */
  static isWithinTipLimits(amount: DgtAmount): boolean {
    return amount > 0 && amount <= ECONOMY_CONSTANTS.MAX_TIP_AMOUNT;
  }
  
  /**
   * Check if amount is within rain limits
   */
  static isWithinRainLimits(amount: DgtAmount): boolean {
    return amount > 0 && amount <= ECONOMY_CONSTANTS.MAX_RAIN_AMOUNT;
  }
  
  /**
   * Check if amount is within daily withdrawal limit
   */
  static isWithinDailyWithdrawalLimit(amount: DgtAmount): boolean {
    return amount <= ECONOMY_CONSTANTS.MAX_DAILY_WITHDRAWAL;
  }
  
  /**
   * Validate and sanitize amount input
   */
  static sanitizeAmount(input: unknown): DgtAmount {
    if (typeof input === 'string') {
      const parsed = parseFloat(input);
      if (isNaN(parsed)) {
        throw new Error('Invalid amount format');
      }
      return toDgtAmount(parsed);
    }
    
    if (typeof input === 'number') {
      return toDgtAmount(input);
    }
    
    throw new Error('Amount must be a number or numeric string');
  }
}

/**
 * XP amount utilities
 */
export class XpCalculator {
  /**
   * Calculate level from XP
   */
  static calculateLevel(xp: XpAmount): number {
    return Math.floor(xp / ECONOMY_CONSTANTS.XP_PER_LEVEL);
  }
  
  /**
   * Calculate XP progress within current level
   */
  static calculateProgress(xp: XpAmount): number {
    return xp % ECONOMY_CONSTANTS.XP_PER_LEVEL;
  }
  
  /**
   * Calculate XP needed for next level
   */
  static xpToNextLevel(xp: XpAmount): XpAmount {
    const progress = this.calculateProgress(xp);
    return toXpAmount(ECONOMY_CONSTANTS.XP_PER_LEVEL - progress);
  }
  
  /**
   * Check if user meets minimum XP for tipping
   */
  static canTip(xp: XpAmount): boolean {
    return xp >= ECONOMY_CONSTANTS.MIN_XP_FOR_TIPPING;
  }
  
  /**
   * Add XP amounts safely
   */
  static addXp(current: XpAmount, earned: XpAmount): XpAmount {
    return toXpAmount(current + earned);
  }
}

/**
 * Batch amount operations
 */
export class AmountBatch {
  private amounts: DgtAmount[] = [];
  
  /**
   * Add amount to batch
   */
  add(amount: DgtAmount): this {
    this.amounts.push(amount);
    return this;
  }
  
  /**
   * Calculate total of all amounts
   */
  total(): DgtAmount {
    return this.amounts.reduce(
      (sum, amount) => AmountCalculator.addDgt(sum, amount),
      toDgtAmount(0)
    );
  }
  
  /**
   * Calculate average amount
   */
  average(): DgtAmount {
    if (this.amounts.length === 0) {
      return toDgtAmount(0);
    }
    return toDgtAmount(this.total() / this.amounts.length);
  }
  
  /**
   * Get minimum amount
   */
  min(): DgtAmount {
    if (this.amounts.length === 0) {
      return toDgtAmount(0);
    }
    return toDgtAmount(Math.min(...this.amounts));
  }
  
  /**
   * Get maximum amount
   */
  max(): DgtAmount {
    if (this.amounts.length === 0) {
      return toDgtAmount(0);
    }
    return toDgtAmount(Math.max(...this.amounts));
  }
  
  /**
   * Get count of amounts
   */
  count(): number {
    return this.amounts.length;
  }
  
  /**
   * Create new batch
   */
  static create(): AmountBatch {
    return new AmountBatch();
  }
}

/**
 * Helper to create amount batch
 */
export function amountBatch(): AmountBatch {
  return AmountBatch.create();
}