// Temporary compatibility layer for legacy AdminError codes.
// The canonical exports now live in `server/src/core/errors.ts` where `ErrorCodes` is defined.
// We re-export `AdminError` directly and alias `ErrorCodes` → `AdminErrorCodes` so that
// existing imports `import { AdminError, AdminErrorCodes } from './admin.errors'` keep working.

import {
	AppError,
	ErrorCodes,
	ErrorSeverity,
	BadRequestError,
	UnauthorizedError,
	NotFoundError,
	ConflictError,
	ValidationError
} from '@core/errors';

// Re-export ErrorCodes for compatibility
export const AdminErrorCodes = ErrorCodes;

// Enhanced AdminError class with static factory methods
export class AdminError extends AppError {
	// Static factory methods for backward compatibility
	static duplicate(resource: string, field?: string, value?: string) {
		const message = field && value 
			? `${resource} with ${field} '${value}' already exists`
			: field 
			? `${resource} with ${field} already exists`
			: `${resource} already exists`;
		return new ConflictError(message, { field, value });
	}

	static notFound(resource: string, id?: string) {
		const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
		return new NotFoundError(message);
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

	static database(message: string, details?: unknown) {
		return new AppError(message, 500, ErrorCodes.DB_QUERY_FAILED, ErrorSeverity.HIGH, details);
	}
}
