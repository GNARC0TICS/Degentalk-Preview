// Temporary compatibility layer for legacy AdminError codes.
// The canonical exports now live in `server/src/core/errors.ts` where `ErrorCodes` is defined.
// We re-export `AdminError` directly and alias `ErrorCodes` → `AdminErrorCodes` so that
// existing imports `import { AdminError, AdminErrorCodes } from './admin.errors'` keep working.

import { AdminError, ErrorCodes } from '../../core/errors';

export { AdminError };
export const AdminErrorCodes = ErrorCodes; 