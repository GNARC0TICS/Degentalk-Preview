import {
	pgTable,
	text,
	uuid,
	jsonb,
	boolean,
	timestamp,
	integer,
	index
} from 'drizzle-orm/pg-core';
import { users } from '../user/users';
/**
 * Brand Configuration table - stores dynamic brand settings
 */
export const brandConfigurations = pgTable('brand_configurations', {
	id: uuid('id').defaultRandom().primaryKey(),
	// Configuration metadata
	name: text('name').notNull(), // e.g. 'Production Theme', 'Holiday 2025'
	description: text('description'),
	version: text('version').notNull().default('1.0.0'),
	// Theme categorisation
	category: text('category').notNull(), // 'colors' | 'typography' | 'spacing' | 'animation'
	themeKey: text('theme_key').notNull(), // e.g. 'primary.emerald.500'
	// Configuration data (raw JSON matching brandConfig subset)
	configData: jsonb('config_data').notNull(),
	// Activation flags
	isActive: boolean('is_active').default(false),
	isDefault: boolean('is_default').default(false),
	environment: text('environment').default('dev'), // 'dev' | 'staging' | 'prod'
	// A/B testing fields
	variant: text('variant'), // 'A' | 'B' | 'control'
	weight: integer('weight').default(100),
	// Scheduling
	startDate: timestamp('start_date'),
	endDate: timestamp('end_date'),
	// Audit
	createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
	// Timestamps
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});
// Drizzle type helpers
export type BrandConfiguration = typeof brandConfigurations.$inferSelect;
export type NewBrandConfiguration = typeof brandConfigurations.$inferInsert;
