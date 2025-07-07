/**
 * Admin Settings Validators
 *
 * Zod validation schemas for platform settings management.
 */

import { z } from 'zod';

// Base schema for setting values of different types
const SettingValueSchema = z.union([
	z.string(),
	z.number(),
	z.boolean(),
	z.array(z.string()),
	z.array(z.number()),
	z.record(z.any())
]);

// Schema for updating a single setting
export const UpdateSettingSchema = z.object({
	key: z.string().min(1, 'Setting key is required'),
	value: SettingValueSchema,
	description: z.string().optional()
});

// Schema for updating multiple settings at once
export const UpdateSettingsSchema = z.object({
	settings: z.array(UpdateSettingSchema)
});

// Schema for setting groups
export const SettingGroupSchema = z.object({
	name: z.string().min(2, 'Group name must be at least 2 characters').max(100),
	key: z
		.string()
		.min(2)
		.max(50)
		.regex(
			/^[a-z0-9_]+$/,
			'Group key must contain only lowercase letters, numbers, and underscores'
		),
	description: z.string().optional().nullable(),
	sortOrder: z.number().int().min(0).default(0)
});

// Schema for a new setting
export const CreateSettingSchema = z.object({
	key: z
		.string()
		.min(2)
		.max(50)
		.regex(
			/^[a-z0-9_]+$/,
			'Setting key must contain only lowercase letters, numbers, and underscores'
		),
	name: z.string().min(2, 'Setting name must be at least 2 characters').max(100),
	description: z.string().optional().nullable(),
	type: z.enum(['string', 'number', 'boolean', 'json', 'array']),
	defaultValue: SettingValueSchema.optional(),
	value: SettingValueSchema.optional(),
	group: z.string().optional(),
	isPublic: z.boolean().default(false),
	isRequired: z.boolean().default(false),
	validationRules: z.record(z.any()).optional(),
	options: z
		.array(
			z.object({
				label: z.string(),
				value: z.union([z.string(), z.number(), z.boolean()])
			})
		)
		.optional(),
	sortOrder: z.number().int().min(0).default(0)
});

// Schema for updating setting metadata
export const UpdateSettingMetadataSchema = z.object({
	name: z.string().min(2, 'Setting name must be at least 2 characters').max(100).optional(),
	description: z.string().optional().nullable(),
	isPublic: z.boolean().optional(),
	isRequired: z.boolean().optional(),
	group: z.string().optional().nullable(),
	validationRules: z.record(z.any()).optional(),
	options: z
		.array(
			z.object({
				label: z.string(),
				value: z.union([z.string(), z.number(), z.boolean()])
			})
		)
		.optional(),
	sortOrder: z.number().int().min(0).optional()
});

// Schema for filtering settings
export const FilterSettingsSchema = z.object({
	group: z.string().optional(),
	isPublic: z.boolean().optional(),
	search: z.string().optional()
});

export type UpdateSettingInput = z.infer<typeof UpdateSettingSchema>;
export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;
export type SettingGroupInput = z.infer<typeof SettingGroupSchema>;
export type CreateSettingInput = z.infer<typeof CreateSettingSchema>;
export type UpdateSettingMetadataInput = z.infer<typeof UpdateSettingMetadataSchema>;
export type FilterSettingsInput = z.infer<typeof FilterSettingsSchema>;
