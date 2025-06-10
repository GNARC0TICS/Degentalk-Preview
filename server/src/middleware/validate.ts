import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Middleware to validate request body against a Zod schema
 * @param schema The Zod schema to validate against
 */
export const validateBody = (schema: AnyZodObject) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			schema.parse(req.body);
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				return res.status(400).json({
					error: 'Validation failed',
					details: error.errors
				});
			}
			return res.status(500).json({ error: 'Internal server error during validation' });
		}
	};
};

/**
 * Middleware to validate request query params against a Zod schema
 * @param schema The Zod schema to validate against
 */
export const validateQuery = (schema: AnyZodObject) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			schema.parse(req.query);
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				return res.status(400).json({
					error: 'Query validation failed',
					details: error.errors
				});
			}
			return res.status(500).json({ error: 'Internal server error during validation' });
		}
	};
};

/**
 * Middleware to validate request params against a Zod schema
 * @param schema The Zod schema to validate against
 */
export const validateParams = (schema: AnyZodObject) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			schema.parse(req.params);
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				return res.status(400).json({
					error: 'Path parameter validation failed',
					details: error.errors
				});
			}
			return res.status(500).json({ error: 'Internal server error during validation' });
		}
	};
};
