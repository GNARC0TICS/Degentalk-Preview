import { ZodSchema } from 'zod';

/**
 * Throws a descriptive error if data does not conform to schema.
 */
export function assertValid<T>(schema: ZodSchema<T>, data: unknown): asserts data is T {
	const res = schema.safeParse(data);
	if (!res.success) {
		throw new Error(res.error.errors.map((e) => e.message).join(', '));
	}
}
