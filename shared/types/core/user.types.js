// Type guards
export function isUser(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'username' in value &&
        'email' in value &&
        'role' in value &&
        'level' in value &&
        'settings' in value &&
        'stats' in value);
}
export function isUserProfile(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'username' in value &&
        'displayName' in value &&
        'badges' in value &&
        Array.isArray(value.badges));
}
export function isUserAchievement(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'achievementId' in value &&
        'userId' in value &&
        'unlockedAt' in value &&
        typeof value.progress === 'number' &&
        typeof value.isCompleted === 'boolean');
}
export function isInventoryItem(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'itemId' in value &&
        'quantity' in value &&
        'acquiredAt' in value &&
        'source' in value &&
        typeof value.quantity === 'number');
}
export function isUserInventory(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'userId' in value &&
        'items' in value &&
        'capacity' in value &&
        'used' in value &&
        Array.isArray(value.items) &&
        typeof value.capacity === 'number');
}
