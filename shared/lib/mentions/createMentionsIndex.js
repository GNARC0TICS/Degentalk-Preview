/**
 * @deprecated This function has been moved to server-only service.
 * Use MentionsIndexService.createMentionsIndex() on the server side.
 * For client-side usage, call the appropriate API endpoint.
 */
export function createMentionsIndex(params) {
    throw new Error('createMentionsIndex() has been moved to server-only service. ' +
        'Use MentionsIndexService.createMentionsIndex() on server or call API endpoint from client.');
}
