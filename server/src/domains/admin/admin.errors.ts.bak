// Temporary compatibility layer for legacy AdminError codes.
// The canonical exports now live in `server/src/core/errors.ts` where `ErrorCodes` is defined.
// We re-export `AdminError` directly and alias `ErrorCodes` → `AdminErrorCodes` so that
// existing imports `import { AdminError, AdminErrorCodes } from './admin.errors'` keep working.

import {
	AppError,
	ErrorCodes,
	BadRequestError,
	UnauthorizedError,
	NotFoundError,
	ConflictError,
	ValidationError
} from '../../core/errors';

// Re-export ErrorCodes for compatibility
export const AdminErrorCodes = ErrorCodes;

// Enhanced AdminError class with static factory methods
export class AdminError extends AppError {
	// Static factory methods for backward compatibility
	static duplicate(resource: string, field?: string) {
		return new ConflictError(`${resource} already exists`, { field });
	}

	static notFound(resource: string) {
		return new NotFoundError(resource);
	}

	static unauthorized(message?: string) {
		return new UnauthorizedError(message);
	}

	static validation(message: string, field?: string, errors?: unknown) {
		return new ValidationError(message, field, errors);
	}

	static operation(message: string, details?: unknown) {
		return new BadRequestError(message, details);
	}
}
