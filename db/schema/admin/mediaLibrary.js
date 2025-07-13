import { pgTable, integer, varchar, boolean, timestamp, jsonb, index, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users'; // Adjusted path
export const mediaLibrary = pgTable('media_library', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }), // User who uploaded
    type: varchar('type', { length: 50 }).notNull(), // e.g., image, video, document, avatar, banner
    fileName: varchar('file_name', { length: 255 }).notNull(),
    fileSize: integer('file_size').notNull(), // In bytes
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    path: varchar('path', { length: 255 }).notNull(), // Relative path in storage
    url: varchar('url', { length: 255 }).notNull(), // Full URL to access the file
    thumbnailUrl: varchar('thumbnail_url', { length: 255 }),
    isPublic: boolean('is_public').notNull().default(true),
    metadata: jsonb('metadata').default('{}'), // e.g., dimensions for images, duration for videos
    isDeleted: boolean('is_deleted').notNull().default(false),
    deletedAt: timestamp('deleted_at'),
    deletedBy: uuid('deleted_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at')
        .notNull()
        .default(sql `CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at')
        .notNull()
        .default(sql `CURRENT_TIMESTAMP`)
}, (table) => ({
    userIdx: index('idx_media_library_user_id').on(table.userId),
    typeIdx: index('idx_media_library_type').on(table.type),
    createdAtIdx: index('idx_media_library_created_at').on(table.createdAt)
    // fileNameUnique: unique('media_library_filename_unique').on(table.fileName) // Filenames might not be unique across users/types
}));
// Add InsertMediaLibrary if Zod schema is needed
//# sourceMappingURL=mediaLibrary.js.map