/**
 * Thread Repository Implementation
 *
 * QUALITY IMPROVEMENT: Repository pattern for Thread data access
 * Implements IThreadRepository interface with proper error handling and type safety
 */
import { BaseRepository, type QueryOptions, type PaginatedResult } from '../base-repository';
import type { IThreadRepository } from '../interfaces';
import type { Thread } from '@schema';
import type { CategoryId, AuthorId, ThreadId, PostId } from '@shared/types/ids';
export declare class ThreadRepository extends BaseRepository<Thread> implements IThreadRepository {
    protected table: import("drizzle-orm/pg-core").PgTableWithColumns<{
        name: "threads";
        schema: undefined;
        columns: {
            id: import("drizzle-orm/pg-core").PgColumn<{
                name: "id";
                tableName: "threads";
                dataType: "string";
                columnType: "PgUUID";
                data: string;
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: true;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            uuid: import("drizzle-orm/pg-core").PgColumn<{
                name: "uuid";
                tableName: "threads";
                dataType: "string";
                columnType: "PgUUID";
                data: string;
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            title: import("drizzle-orm/pg-core").PgColumn<{
                name: "title";
                tableName: "threads";
                dataType: "string";
                columnType: "PgVarchar";
                data: string;
                driverParam: string;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: [string, ...string[]];
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {
                length: 255;
            }>;
            slug: import("drizzle-orm/pg-core").PgColumn<{
                name: "slug";
                tableName: "threads";
                dataType: "string";
                columnType: "PgVarchar";
                data: string;
                driverParam: string;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: [string, ...string[]];
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {
                length: 255;
            }>;
            structureId: import("drizzle-orm/pg-core").PgColumn<{
                name: "structure_id";
                tableName: "threads";
                dataType: "string";
                columnType: "PgUUID";
                data: string;
                driverParam: string;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            userId: import("drizzle-orm/pg-core").PgColumn<{
                name: "user_id";
                tableName: "threads";
                dataType: "string";
                columnType: "PgUUID";
                data: string;
                driverParam: string;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            prefixId: import("drizzle-orm/pg-core").PgColumn<{
                name: "prefix_id";
                tableName: "threads";
                dataType: "string";
                columnType: "PgUUID";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            isSticky: import("drizzle-orm/pg-core").PgColumn<{
                name: "is_sticky";
                tableName: "threads";
                dataType: "boolean";
                columnType: "PgBoolean";
                data: boolean;
                driverParam: boolean;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            isLocked: import("drizzle-orm/pg-core").PgColumn<{
                name: "is_locked";
                tableName: "threads";
                dataType: "boolean";
                columnType: "PgBoolean";
                data: boolean;
                driverParam: boolean;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            isHidden: import("drizzle-orm/pg-core").PgColumn<{
                name: "is_hidden";
                tableName: "threads";
                dataType: "boolean";
                columnType: "PgBoolean";
                data: boolean;
                driverParam: boolean;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            isFeatured: import("drizzle-orm/pg-core").PgColumn<{
                name: "is_featured";
                tableName: "threads";
                dataType: "boolean";
                columnType: "PgBoolean";
                data: boolean;
                driverParam: boolean;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            featuredAt: import("drizzle-orm/pg-core").PgColumn<{
                name: "featured_at";
                tableName: "threads";
                dataType: "date";
                columnType: "PgTimestamp";
                data: Date;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            featuredBy: import("drizzle-orm/pg-core").PgColumn<{
                name: "featured_by";
                tableName: "threads";
                dataType: "string";
                columnType: "PgUUID";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            featuredExpiresAt: import("drizzle-orm/pg-core").PgColumn<{
                name: "featured_expires_at";
                tableName: "threads";
                dataType: "date";
                columnType: "PgTimestamp";
                data: Date;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            isDeleted: import("drizzle-orm/pg-core").PgColumn<{
                name: "is_deleted";
                tableName: "threads";
                dataType: "boolean";
                columnType: "PgBoolean";
                data: boolean;
                driverParam: boolean;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            deletedAt: import("drizzle-orm/pg-core").PgColumn<{
                name: "deleted_at";
                tableName: "threads";
                dataType: "date";
                columnType: "PgTimestamp";
                data: Date;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            deletedBy: import("drizzle-orm/pg-core").PgColumn<{
                name: "deleted_by";
                tableName: "threads";
                dataType: "string";
                columnType: "PgUUID";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            viewCount: import("drizzle-orm/pg-core").PgColumn<{
                name: "view_count";
                tableName: "threads";
                dataType: "number";
                columnType: "PgInteger";
                data: number;
                driverParam: string | number;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            postCount: import("drizzle-orm/pg-core").PgColumn<{
                name: "post_count";
                tableName: "threads";
                dataType: "number";
                columnType: "PgInteger";
                data: number;
                driverParam: string | number;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            firstPostLikeCount: import("drizzle-orm/pg-core").PgColumn<{
                name: "first_post_like_count";
                tableName: "threads";
                dataType: "number";
                columnType: "PgInteger";
                data: number;
                driverParam: string | number;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            dgtStaked: import("drizzle-orm/pg-core").PgColumn<{
                name: "dgt_staked";
                tableName: "threads";
                dataType: "number";
                columnType: "PgBigInt53";
                data: number;
                driverParam: string | number;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            hotScore: import("drizzle-orm/pg-core").PgColumn<{
                name: "hot_score";
                tableName: "threads";
                dataType: "number";
                columnType: "PgReal";
                data: number;
                driverParam: string | number;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            isBoosted: import("drizzle-orm/pg-core").PgColumn<{
                name: "is_boosted";
                tableName: "threads";
                dataType: "boolean";
                columnType: "PgBoolean";
                data: boolean;
                driverParam: boolean;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            boostAmountDgt: import("drizzle-orm/pg-core").PgColumn<{
                name: "boost_amount_dgt";
                tableName: "threads";
                dataType: "number";
                columnType: "PgBigInt53";
                data: number;
                driverParam: string | number;
                notNull: false;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            boostExpiresAt: import("drizzle-orm/pg-core").PgColumn<{
                name: "boost_expires_at";
                tableName: "threads";
                dataType: "date";
                columnType: "PgTimestamp";
                data: Date;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            lastPostId: import("drizzle-orm/pg-core").PgColumn<{
                name: "last_post_id";
                tableName: "threads";
                dataType: "number";
                columnType: "PgBigInt53";
                data: number;
                driverParam: string | number;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            lastPostAt: import("drizzle-orm/pg-core").PgColumn<{
                name: "last_post_at";
                tableName: "threads";
                dataType: "date";
                columnType: "PgTimestamp";
                data: Date;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            createdAt: import("drizzle-orm/pg-core").PgColumn<{
                name: "created_at";
                tableName: "threads";
                dataType: "date";
                columnType: "PgTimestamp";
                data: Date;
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            updatedAt: import("drizzle-orm/pg-core").PgColumn<{
                name: "updated_at";
                tableName: "threads";
                dataType: "date";
                columnType: "PgTimestamp";
                data: Date;
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            isArchived: import("drizzle-orm/pg-core").PgColumn<{
                name: "is_archived";
                tableName: "threads";
                dataType: "boolean";
                columnType: "PgBoolean";
                data: boolean;
                driverParam: boolean;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            pollId: import("drizzle-orm/pg-core").PgColumn<{
                name: "poll_id";
                tableName: "threads";
                dataType: "number";
                columnType: "PgBigInt53";
                data: number;
                driverParam: string | number;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            isSolved: import("drizzle-orm/pg-core").PgColumn<{
                name: "is_solved";
                tableName: "threads";
                dataType: "boolean";
                columnType: "PgBoolean";
                data: boolean;
                driverParam: boolean;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            solvingPostId: import("drizzle-orm/pg-core").PgColumn<{
                name: "solving_post_id";
                tableName: "threads";
                dataType: "string";
                columnType: "PgUUID";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            pluginData: import("drizzle-orm/pg-core").PgColumn<{
                name: "plugin_data";
                tableName: "threads";
                dataType: "json";
                columnType: "PgJsonb";
                data: unknown;
                driverParam: unknown;
                notNull: false;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            visibilityStatus: import("drizzle-orm/pg-core").PgColumn<{
                name: "visibility_status";
                tableName: "threads";
                dataType: "string";
                columnType: "PgEnumColumn";
                data: "draft" | "published" | "hidden" | "shadowbanned" | "archived" | "deleted";
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: ["draft", "published", "hidden", "shadowbanned", "archived", "deleted"];
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            moderationReason: import("drizzle-orm/pg-core").PgColumn<{
                name: "moderation_reason";
                tableName: "threads";
                dataType: "string";
                columnType: "PgVarchar";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: [string, ...string[]];
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {
                length: 255;
            }>;
            xpMultiplier: import("drizzle-orm/pg-core").PgColumn<{
                name: "xp_multiplier";
                tableName: "threads";
                dataType: "number";
                columnType: "PgReal";
                data: number;
                driverParam: string | number;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            rewardRules: import("drizzle-orm/pg-core").PgColumn<{
                name: "reward_rules";
                tableName: "threads";
                dataType: "json";
                columnType: "PgJsonb";
                data: unknown;
                driverParam: unknown;
                notNull: false;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
        };
        dialect: "pg";
    }>;
    protected entityName: string;
    /**
     * Find thread by slug
     */
    findBySlug(slug: string): Promise<Thread | null>;
    /**
     * Find threads by category ID with pagination
     */
    findByCategoryId(categoryId: CategoryId, options?: QueryOptions): Promise<PaginatedResult<Thread>>;
    /**
     * Find threads by author ID with pagination
     */
    findByAuthorId(authorId: AuthorId, options?: QueryOptions): Promise<PaginatedResult<Thread>>;
    /**
     * Search threads by query
     */
    searchThreads(query: string, options?: QueryOptions): Promise<PaginatedResult<Thread>>;
    /**
     * Increment thread view count
     */
    incrementViewCount(id: ThreadId): Promise<void>;
    /**
     * Update thread post count
     */
    updatePostCount(id: ThreadId): Promise<void>;
    /**
     * Mark thread as solved
     */
    markAsSolved(id: ThreadId, solvingPostId?: PostId): Promise<Thread>;
    /**
     * Override prepareCreateData to set thread-specific defaults
     */
    protected prepareCreateData(data: Partial<Thread>): any;
}
