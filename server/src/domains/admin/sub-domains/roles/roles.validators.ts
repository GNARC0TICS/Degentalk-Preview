import * as z from 'zod';

export const baseRoleSchema = z.object({
	name: z.string().min(1),
	slug: z
		.string()
		.min(1)
		.regex(/^[a-z0-9-]+$/),
	rank: z.number().int().min(0),
	xpMultiplier: z.number().min(0.1),
	badgeImage: z.string().url().optional().nullable(),
	textColor: z.string().optional().nullable(),
	backgroundColor: z.string().optional().nullable(),
	description: z.string().optional().nullable(),
	permissions: z.array(z.string()).optional().default([]),
	isSystemRole: z.boolean().optional().default(false)
});

export const createRoleSchema = baseRoleSchema;
export const updateRoleSchema = baseRoleSchema.partial();

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
