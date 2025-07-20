/**
 * Economy Value Types
 *
 * Branded types for economic values to prevent mixing currencies,
 * amounts, and ensure type safety in financial calculations.
 */
// Amount validation helpers
export const isValidAmount = (amount) => {
    return typeof amount === 'number' && !isNaN(amount) && isFinite(amount) && amount >= 0;
};
export const isDgtAmount = (amount) => {
    return isValidAmount(amount);
};
export const isUsdAmount = (amount) => {
    return isValidAmount(amount);
};
export const isXpAmount = (amount) => {
    return isValidAmount(amount);
};
// Amount casting helpers (use with caution, prefer validation)
export const asDgtAmount = (amount) => amount;
export const asUsdAmount = (amount) => amount;
export const asXpAmount = (amount) => amount;
export const asTipAmount = (amount) => amount;
export const asRainAmount = (amount) => amount;
// Safe conversion helpers
export const toDgtAmount = (amount) => {
    if (!isValidAmount(amount)) {
        throw new Error(`Invalid DGT amount: ${amount}`);
    }
    return amount;
};
export const toUsdAmount = (amount) => {
    if (!isValidAmount(amount)) {
        throw new Error(`Invalid USD amount: ${amount}`);
    }
    return amount;
};
export const toXpAmount = (amount) => {
    if (!isValidAmount(amount)) {
        throw new Error(`Invalid XP amount: ${amount}`);
    }
    return amount;
};
// Constants for economy calculations
export const ECONOMY_CONSTANTS = {
    // XP system
    XP_PER_LEVEL: 100,
    MIN_XP_FOR_TIPPING: 50,
    // DGT system
    DGT_DECIMAL_PLACES: 6,
    MIN_TIP_AMOUNT: 0.000001,
    MIN_WITHDRAWAL_AMOUNT: 1.0,
    // Conversion
    DGT_TO_USD_DEFAULT_RATE: 0.01, // Fallback rate
    // Limits
    MAX_TIP_AMOUNT: 1000000,
    MAX_RAIN_AMOUNT: 10000000,
    MAX_DAILY_WITHDRAWAL: 100000,
    // Fees
    WITHDRAWAL_FEE_PERCENTAGE: 0.02, // 2%
    MIN_WITHDRAWAL_FEE: 0.1
};
