/**
 * @deprecated This function has been moved to server-only service.
 * Use EmojiPackUnlockService.unlockEmojiPackForUser() on the server side.
 * For client-side usage, call the appropriate API endpoint.
 */
export function unlockEmojiPackForUser(params) {
    throw new Error('unlockEmojiPackForUser() has been moved to server-only service. ' +
        'Use EmojiPackUnlockService.unlockEmojiPackForUser() on server or call API endpoint from client.');
}
