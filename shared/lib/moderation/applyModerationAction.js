/**
 * @deprecated This function has been moved to server-only service.
 * Use ModerationActionService.applyModerationAction() on the server side.
 * For client-side usage, call the appropriate API endpoint.
 */
export function applyModerationAction(params) {
    throw new Error('applyModerationAction() has been moved to server-only service. ' +
        'Use ModerationActionService.applyModerationAction() on server or call API endpoint from client.');
}
