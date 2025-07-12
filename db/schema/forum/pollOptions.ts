import { pgTable, integer, text, uuid } from 'drizzle-orm/pg-core';
import { polls } from './polls';
export const pollOptions = pgTable('poll_options', {
	id: uuid('id').primaryKey().defaultRandom(),
	pollId: integer('poll_id')
		.notNull()
		.references(() => polls.id, { onDelete: 'cascade' }),
	optionText: text('option_text').notNull(),
	voteCount: integer('vote_count').notNull().default(0)
});
export type PollOption = typeof pollOptions.$inferSelect;
