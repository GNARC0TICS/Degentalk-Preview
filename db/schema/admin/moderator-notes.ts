import { pgTable, varchar, text, timestamp, uuid, pgEnum, index } from 'drizzle-orm/pg-core';
import { users } from '../user/users';
export const moderatorNoteTypeEnum = pgEnum('moderator_note_type', ['thread', 'post', 'user']);
export const moderatorNotes = pgTable('moderator_notes', {
	id: uuid('id').primaryKey().defaultRandom(),
	type: moderatorNoteTypeEnum('type').notNull(),
	itemId: varchar('item_id', { length: 255 }).notNull(), // Can be thread_id, post_id, or user_id
	note: text('note').notNull(),
	createdBy: uuid('created_by')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at')
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
});
export const selectModeratorNoteSchema = {
	id: true,
	type: true,
	itemId: true,
	note: true,
	createdBy: true,
	createdAt: true,
	updatedAt: true
};
export const insertModeratorNoteSchema = {
	type: moderatorNotes.type,
	itemId: moderatorNotes.itemId,
	note: moderatorNotes.note,
	createdBy: moderatorNotes.createdBy
};
