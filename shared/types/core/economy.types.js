// Type guards
export function isWallet(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'userId' in value &&
        'balance' in value &&
        'features' in value &&
        'limits' in value &&
        typeof value.balance === 'number' &&
        typeof value.isActive === 'boolean' &&
        typeof value.isLocked === 'boolean');
}
export function isTransaction(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'type' in value &&
        'amount' in value &&
        'status' in value &&
        'currency' in value &&
        'reference' in value &&
        'metadata' in value &&
        typeof value.amount === 'number' &&
        typeof value.fee === 'number');
}
export function isPendingTransaction(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'walletId' in value &&
        'amount' in value &&
        'type' in value &&
        'expiresAt' in value &&
        'reason' in value &&
        typeof value.canCancel === 'boolean');
}
export function isTip(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'fromUserId' in value &&
        'toUserId' in value &&
        'amount' in value &&
        'transactionId' in value &&
        typeof value.amount === 'number' &&
        typeof value.isAnonymous === 'boolean');
}
export function isWithdrawal(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'walletId' in value &&
        'amount' in value &&
        'address' in value &&
        'status' in value &&
        'transactionId' in value &&
        typeof value.amount === 'number' &&
        typeof value.fee === 'number');
}
// Constants
export const DGT_DECIMALS = 8;
export const DGT_PRECISION = Math.pow(10, DGT_DECIMALS);
// Helper functions
export function toDGTAmount(value) {
    return Math.round(value * DGT_PRECISION) / DGT_PRECISION;
}
export function fromDGTAmount(value) {
    return value / DGT_PRECISION;
}
