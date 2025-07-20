// Type guards
export function isForum(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'name' in value &&
        'slug' in value &&
        'settings' in value &&
        'stats' in value &&
        typeof value.displayOrder === 'number' &&
        typeof value.isActive === 'boolean');
}
export function isThread(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'forumId' in value &&
        'authorId' in value &&
        'title' in value &&
        'content' in value &&
        'status' in value &&
        'metadata' in value &&
        typeof value.viewCount === 'number' &&
        typeof value.replyCount === 'number');
}
export function isPost(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'threadId' in value &&
        'authorId' in value &&
        'content' in value &&
        'status' in value &&
        'metadata' in value &&
        typeof value.isDeleted === 'boolean' &&
        Array.isArray(value.reactions));
}
export function isThreadSubscription(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'threadId' in value &&
        'userId' in value &&
        'subscribedAt' in value &&
        typeof value.notifyOnReply === 'boolean' &&
        typeof value.notifyOnMention === 'boolean');
}
export function isThreadView(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'threadId' in value &&
        'userId' in value &&
        'viewedAt' in value);
}
export function isPostReaction(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'userId' in value &&
        'emoji' in value &&
        'createdAt' in value &&
        typeof value.emoji === 'string');
}
