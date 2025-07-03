import {
	pgTable,
	serial,
	varchar,
	text,
	timestamp,
	integer,
	jsonb,
	boolean,
	doublePrecision,
	uuid,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

export const titles = pgTable('titles', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 100 }).notNull(),
	description: text('description'),
	iconUrl: varchar('icon_url', { length: 255 }),
	rarity: varchar('rarity', { length: 50 }).default('common'),

	// Enhanced customization fields
	emoji: varchar('emoji', { length: 10 }),
	fontFamily: varchar('font_family', { length: 100 }),
	fontSize: integer('font_size'),
	fontWeight: varchar('font_weight', { length: 20 }),
	textColor: varchar('text_color', { length: 25 }),
	backgroundColor: varchar('background_color', { length: 25 }),
	borderColor: varchar('border_color', { length: 25 }),
	borderWidth: integer('border_width'),
	borderStyle: varchar('border_style', { length: 20 }),
	borderRadius: integer('border_radius'),
	glowColor: varchar('glow_color', { length: 25 }),
	glowIntensity: integer('glow_intensity'),
	shadowColor: varchar('shadow_color', { length: 25 }),
	shadowBlur: integer('shadow_blur'),
	shadowOffsetX: integer('shadow_offset_x'),
	shadowOffsetY: integer('shadow_offset_y'),
	gradientStart: varchar('gradient_start', { length: 25 }),
	gradientEnd: varchar('gradient_end', { length: 25 }),
	gradientDirection: varchar('gradient_direction', { length: 30 }),
	animation: varchar('animation', { length: 20 }),
	animationDuration: doublePrecision('animation_duration'),

	// Role binding
	roleId: varchar('role_id', { length: 50 }), // @uuid-exception - string role identifier

	// Metadata
	isShopItem: boolean('is_shop_item').default(false),
	isUnlockable: boolean('is_unlockable').default(false),
	unlockConditions: jsonb('unlock_conditions'),
	shopPrice: doublePrecision('shop_price'),
	shopCurrency: varchar('shop_currency', { length: 10 }),

	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
});

export const insertTitleSchema = createInsertSchema(titles);
export type Title = typeof titles.$inferSelect;
export type InsertTitle = typeof titles.$inferInsert;
