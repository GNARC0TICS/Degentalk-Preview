import {
	users,
	posts,
	threads,
	forumStructure,
	threadTags,
	tags,
	postReactions,
	systemNotifications as notifications,
	customEmojis,
	userGroups,
	conversations,
	conversationParticipants,
	messages,
	messageReads,
	products,
	productCategories,
	orders,
	orderItems,
	inventoryTransactions,
	userInventory,
	threadDrafts,
	threadFeaturePermissions,
	siteSettings,
	forumRules,
	userRulesAgreements,
	verificationTokens,
	type User,
	type InsertUser,
	type Thread,
	type InsertThread,
	type Post,
	type InsertPost,
	type ForumStructureNode,
	type NewForumStructureNode,
	type CustomEmoji,
	type InsertCustomEmoji,
	type Notification,
	type Product,
	type Order,
	type Conversation,
	type ConversationParticipant,
	type Message,
	type MessageRead,
	type UserInventoryItem,
	type InsertUserInventoryItem,
	type ThreadDraft,
	type InsertThreadDraft,
	type SiteSetting,
	type InsertSiteSetting,
	type ForumRule,
	type InsertForumRule,
	type UserRulesAgreement,
	contentEditStatusEnum
} from '@schema';
import { db, pool } from '@db';
import { and, eq, desc, sql, count, isNull, not, inArray, ne, lte } from 'drizzle-orm';
import type {
	ForumStructureWithStats,
	ThreadWithUser,
	PostWithUser
} from '../db/types/forum.types.ts';
import type { UserPluginData } from '../db/types/user.types.ts';
import type { EmojiWithAvailability } from '../db/types/emoji.types.ts';
import session from 'express-session';
import connectPGSink from 'connect-pg-simple';
import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { xpCloutService } from './services/xp-clout-service';
import { logger, LogLevel, LogAction } from './src/core/logger';
import { PgTransaction } from 'drizzle-orm/pg-core';
// import multerS3 from "multer-s3"; // Removed as not a dependency
// import { S3Client } from "@aws-sdk/client-s3"; // Removed as not a dependency

const environment = process.env.NODE_ENV || 'development';

const PGStore = connectPGSink(session);

// Define Store type
type SessionStore = connectPGSink.PGStore;

export interface IStorage {
	// User methods
	getUser(id: number): Promise<User | undefined>;
	getUserByUsername(username: string): Promise<User | undefined>;
	getUserByEmail(email: string): Promise<User | undefined>;
	createUser(user: InsertUser): Promise<User>;
	updateUser(id: number, userData: Partial<User>): Promise<User>;
	getUsersInGroup(groupId: number): Promise<User[]>;
	hashPassword(password: string): Promise<string>;

	// Staff and groups methods
	getUserGroups(): Promise<(typeof userGroups.$inferSelect)[]>;
	getUserGroup(id: number): Promise<typeof userGroups.$inferSelect | undefined>;
	createUserGroup(group: typeof userGroups.$inferInsert): Promise<typeof userGroups.$inferSelect>;
	updateUserGroup(
		id: number,
		data: Partial<typeof userGroups.$inferSelect>
	): Promise<typeof userGroups.$inferSelect>;
	deleteUserGroup(id: number): Promise<void>;

	// Forum rules methods
	getForumRules(section?: string, status?: string): Promise<ForumRule[]>;
	getForumRule(id: number): Promise<ForumRule | undefined>;
	createForumRule(rule: InsertForumRule & { createdBy?: number }): Promise<ForumRule>;
	updateForumRule(
		id: number,
		rule: Partial<ForumRule> & { updatedBy?: number }
	): Promise<ForumRule>;
	deleteForumRule(id: number): Promise<void>;
	getUserRuleAgreements(userId: number): Promise<UserRulesAgreement[]>;
	agreeToRule(userId: number, ruleId: number, versionHash: string): Promise<void>;

	// Forum structure methods
	getStructures(): Promise<ForumStructureWithStats[]>;
	getStructure(id: number): Promise<ForumStructureWithStats | undefined>;
	getStructureBySlug(slug: string): Promise<ForumStructureWithStats | undefined>;
	createStructure(structure: NewForumStructureNode): Promise<ForumStructureNode>;

	// Thread methods
	getThreads(
		structureId?: number,
		limit?: number,
		offset?: number,
		sortBy?: string
	): Promise<ThreadWithUser[]>;
	getThread(id: number): Promise<ThreadWithUser | undefined>;
	getThreadBySlug(slug: string): Promise<ThreadWithUser | undefined>;
	createThread(thread: InsertThread & { userId: number }): Promise<Thread>;
	incrementThreadViewCount(id: number): Promise<void>;

	// Thread draft methods
	getDraft(id: number): Promise<ThreadDraft | undefined>;
	getDraftsByUser(userId: number, structureId?: number): Promise<ThreadDraft[]>;
	saveDraft(draft: InsertThreadDraft): Promise<ThreadDraft>;
	updateDraft(id: number, data: Partial<ThreadDraft>): Promise<ThreadDraft>;
	deleteDraft(id: number): Promise<void>;
	publishDraft(id: number): Promise<Thread>;

	// Thread feature permissions methods
	getThreadFeaturePermissions(): Promise<(typeof threadFeaturePermissions.$inferSelect)[]>;
	getThreadFeaturePermissionsForUser(userId: number): Promise<Record<string, boolean>>;

	// Post methods
	getPosts(threadId: number, limit?: number, offset?: number): Promise<PostWithUser[]>;
	getPost(id: number): Promise<PostWithUser | undefined>;
	createPost(post: InsertPost & { userId: number; isFirstPost?: boolean }): Promise<Post>;
	updatePost(id: number, postData: Partial<Post> & { editorId: number }): Promise<Post>;
	deletePost(id: number): Promise<void>;

	// Reaction methods
	addReaction(userId: number, postId: number, reaction: string): Promise<void>;
	removeReaction(userId: number, postId: number, reaction: string): Promise<void>;

	// Notification methods
	getNotifications(userId: number, limit?: number, offset?: number): Promise<Notification[]>;
	markNotificationAsRead(id: number): Promise<void>;

	// Custom emoji methods
	getEmojis(category?: string): Promise<CustomEmoji[]>;
	getEmoji(id: number): Promise<CustomEmoji | undefined>;
	createEmoji(emoji: InsertCustomEmoji): Promise<CustomEmoji>;
	updateEmoji(id: number, emoji: Partial<CustomEmoji>): Promise<CustomEmoji>;
	deleteEmoji(id: number): Promise<void>;
	getAvailableEmojisForUser(userId: number): Promise<EmojiWithAvailability[]>;
	unlockEmojiForUser(userId: number, emojiId: number): Promise<void>;

	// Shop and products methods
	getProducts(category?: string): Promise<Product[]>;
	getProduct(id: number): Promise<Product | undefined>;
	createProduct(product: typeof products.$inferInsert): Promise<Product>;
	updateProduct(id: number, data: Partial<Product>): Promise<Product>;
	deleteProduct(id: number): Promise<void>;
	purchaseProduct(userId: number, productId: number, quantity?: number): Promise<Order>;

	// Messaging system
	getConversations(
		userId: number
	): Promise<(Conversation & { participants: ConversationParticipant[] })[]>;
	getConversation(id: number): Promise<Conversation | undefined>;
	createConversation(data: {
		title?: string;
		isGroup: boolean;
		createdBy: number;
		participants: number[];
	}): Promise<Conversation>;
	getMessages(
		conversationId: number,
		limit?: number,
		offset?: number
	): Promise<(Message & { sender: User })[]>;
	sendMessage(data: {
		conversationId: number;
		senderId: number;
		content: string;
		attachmentUrl?: string;
		attachmentType?: string;
	}): Promise<Message>;
	markMessagesAsRead(conversationId: number, userId: number): Promise<void>;

	// XP engine methods
	addUserXp(userId: number, amount: number, path?: string): Promise<void>;
	getUserPathXp(userId: number, path?: string): Promise<Record<string, number>>;
	recalculateUserPathMultipliers(userId: number): Promise<Record<string, number>>;

	// User inventory methods
	getUserInventory(userId: number): Promise<UserInventoryItem[]>;
	checkUserOwnsProduct(userId: number, productId: number): Promise<boolean>;
	addProductToUserInventory(item: InsertUserInventoryItem): Promise<UserInventoryItem>;
	updateUserInventoryItem(
		userId: number,
		productId: number,
		updates: Partial<UserInventoryItem>
	): Promise<UserInventoryItem | undefined>;
	createInventoryTransaction(data: {
		userId: number;
		productId: number;
		transactionType: string;
		amount: number;
		currency: string;
		currencyAmount: number;
		status?: string;
		metadata?: Record<string, any>;
	}): Promise<typeof inventoryTransactions.$inferSelect>;

	// Session store
	sessionStore: SessionStore;

	// Site settings methods
	getSiteSettings(): Promise<SiteSetting[]>;
	getSiteSetting(key: string): Promise<SiteSetting | undefined>;
	setSiteSetting(
		key: string,
		value: string,
		valueType?: string,
		group?: string,
		description?: string,
		isPublic?: boolean
	): Promise<SiteSetting>;
	getPublicSiteSettings(): Promise<Record<string, any>>;
}

export class DatabaseStorage implements IStorage {
	sessionStore: SessionStore;

	constructor() {
		this.sessionStore = new PGStore({
			pool: pool,
			createTableIfMissing: true
		});
		logger.info(
			'DATABASE',
			"🐘 PostgreSQL session store initialized (using default table name 'session')."
		);
	}

	// User methods
	async getUser(id: number): Promise<User | undefined> {
		try {
			// First try with id column and handle schema mismatches
			const query = db.select().from(users).where(eq(users.id, id));
			const [user] = await query;

			if (user) {
				return user;
			}
		} catch (err) {
			console.warn('Error fetching user with id column, trying with user_id', err);
		}

		// Try with user_id column as fallback
		try {
			// For development mode, try a direct SQL query to bypass schema mismatches
			if (process.env.NODE_ENV === 'development') {
				const result = await db.execute(sql`
          SELECT * 
          FROM users WHERE user_id = ${id} LIMIT 1
        `);

				if (result.rows && result.rows.length > 0) {
					const user = result.rows[0] as any;
					return user as User;
				}
			}
		} catch (err) {
			console.warn('Direct SQL query for user failed', err);
		}

		return undefined;
	}

	async storeVerificationToken(userId: number, token: string): Promise<void> {
		// Create a verification token that expires in 24 hours
		const expiresAt = new Date();
		expiresAt.setHours(expiresAt.getHours() + 24);

		try {
			// First check if there's an existing token for this user and delete it
			await db.delete(verificationTokens).where(eq(verificationTokens.userId, userId));

			// Then create a new token
			await db.insert(verificationTokens).values({
				userId,
				token,
				expiresAt,
				createdAt: new Date()
			});

			console.log(`Verification token stored for user ${userId}, expires at ${expiresAt}`);
		} catch (error) {
			console.error('Error storing verification token:', error);
			throw error;
		}
	}

	async getUserByUsername(username: string): Promise<User | undefined> {
		try {
			// First try with ORM approach
			const [user] = await db
				.select()
				.from(users)
				.where(and(eq(users.username, username), eq(users.isDeleted, false)));

			if (user) return user;
		} catch (err) {
			console.warn('Error fetching user by username with ORM, falling back to SQL', err);
		}

		// Fall back to direct SQL query in development mode
		if (process.env.NODE_ENV === 'development') {
			try {
				const result = await db.execute(sql`
          SELECT * FROM users 
          WHERE username = ${username} 
          AND (is_deleted = false OR is_deleted IS NULL)
          LIMIT 1
        `);

				if (result.rows && result.rows.length > 0) {
					return result.rows[0] as any as User;
				}
			} catch (sqlErr) {
				console.warn('Direct SQL query for user by username failed', sqlErr);
			}
		}

		return undefined;
	}

	async getUserByEmail(email: string): Promise<User | undefined> {
		try {
			// First try with ORM approach
			const [user] = await db
				.select()
				.from(users)
				.where(and(eq(users.email, email), eq(users.isDeleted, false)));

			if (user) return user;
		} catch (err) {
			console.warn('Error fetching user by email with ORM, falling back to SQL', err);
		}

		// Fall back to direct SQL query in development mode
		if (process.env.NODE_ENV === 'development') {
			try {
				const result = await db.execute(sql`
          SELECT * FROM users 
          WHERE email = ${email} 
          AND (is_deleted = false OR is_deleted IS NULL)
          LIMIT 1
        `);

				if (result.rows && result.rows.length > 0) {
					return result.rows[0] as any as User;
				}
			} catch (sqlErr) {
				console.warn('Direct SQL query for user by email failed', sqlErr);
			}
		}

		return undefined;
	}

	async hashPassword(password: string): Promise<string> {
		const scryptAsync = promisify(scrypt);
		const salt = randomBytes(16).toString('hex');
		const buf = (await scryptAsync(password, salt, 64)) as Buffer;
		return `${buf.toString('hex')}.${salt}`;
	}

	async createUser(insertUser: InsertUser): Promise<User> {
		const [user] = await db.insert(users).values(insertUser).returning();
		return user;
	}

	async updateUser(id: number, userData: Partial<User>): Promise<User> {
		const [updatedUser] = await db
			.update(users)
			.set({
				...userData,
				updatedAt: new Date()
			})
			.where(eq(users.id, id))
			.returning();

		return updatedUser;
	}

	// Forum category methods
	async getStructures(): Promise<ForumStructureWithStats[]> {
		const structures = await db
			.select({
				...forumStructure,
				threadCount: count(threads.id).as('thread_count')
			})
			.from(forumStructure)
			.leftJoin(threads, eq(forumStructure.id, threads.structureId))
			.groupBy(forumStructure.id)
			.orderBy(forumStructure.position);

		// Convert to ForumStructureWithStats type
		const structuresWithStats: ForumStructureWithStats[] = structures.map((structure) => ({
			...structure,
			threadCount: Number(structure.threadCount) || 0,
			postCount: 0, // We'll update this with a separate query
			childStructures: [] as ForumStructureWithStats[], // Initialize children array
			canHaveThreads: structure.type === 'forum'
		}));

		// Create a map for quick lookup
		const structureMap = new Map<number, ForumStructureWithStats>();
		structuresWithStats.forEach((structure) => {
			structureMap.set(structure.id, structure);
		});

		// Organize into parent-child hierarchy
		const rootStructures: ForumStructureWithStats[] = [];

		// Populate children arrays
		structuresWithStats.forEach((structure) => {
			if (structure.parentId === null) {
				// This is a root structure (zone)
				rootStructures.push(structure);
			} else {
				// This is a child structure (forum)
				const parent = structureMap.get(structure.parentId);
				if (parent) {
					// Add it to its parent's children array if parent exists
					(parent.childStructures || (parent.childStructures = [])).push(structure);
				} else {
					// If parent doesn't exist, treat as root structure
					rootStructures.push(structure);
				}
			}
		});

		// For the API endpoint, we want a flat structure with all structures
		return structuresWithStats;
	}

	async getStructure(id: number): Promise<ForumStructureWithStats | undefined> {
		const [structure] = await db
			.select({
				...forumStructure,
				threadCount: count(threads.id).as('thread_count')
			})
			.from(forumStructure)
			.leftJoin(threads, eq(forumStructure.id, threads.structureId))
			.where(eq(forumStructure.id, id))
			.groupBy(forumStructure.id);

		if (!structure) return undefined;

		return {
			...structure,
			threadCount: Number(structure.threadCount) || 0,
			postCount: 0, // We'll update this with a separate query
			canHaveThreads: structure.type === 'forum'
		};
	}

	async getStructureBySlug(slug: string): Promise<ForumStructureWithStats | undefined> {
		const [structure] = await db
			.select({
				...forumStructure,
				threadCount: count(threads.id).as('thread_count')
			})
			.from(forumStructure)
			.leftJoin(threads, eq(forumStructure.id, threads.structureId))
			.where(eq(forumStructure.slug, slug))
			.groupBy(forumStructure.id);

		if (!structure) return undefined;

		return {
			...structure,
			threadCount: Number(structure.threadCount) || 0,
			postCount: 0, // We'll update this with a separate query
			canHaveThreads: structure.type === 'forum'
		};
	}

	async createStructure(structure: NewForumStructureNode): Promise<ForumStructureNode> {
		const [newStructure] = await db
			.insert(forumStructure)
			.values({
				...structure,
				updatedAt: new Date()
			})
			.returning();
		return newStructure;
	}

	// Thread methods
	async getThreads(
		categoryId?: number,
		limit = 20,
		offset = 0,
		sortBy = 'latest'
	): Promise<ThreadWithUser[]> {
		let query = db
			.select({
				...threads,
				user: users,
				postCount: sql<number>`${threads.postCount}`
				// Ensure other relevant fields for sorting are selected if not already part of ...threads
				// For example, viewCount and lastPostAt are already in the threads schema
			})
			.from(threads)
			.innerJoin(users, eq(threads.userId, users.id))
			.where(
				and(
					eq(threads.isHidden, false),
					...(categoryId ? [eq(threads.categoryId, categoryId)] : [])
				)
			)
			.limit(limit)
			.offset(offset);

		// Apply sorting based on sortBy parameter
		switch (sortBy) {
			case 'popular':
				query = query.orderBy(
					desc(threads.isSticky),
					desc(threads.viewCount),
					desc(threads.createdAt)
				);
				break;
			case 'replies':
				query = query.orderBy(
					desc(threads.isSticky),
					desc(threads.postCount),
					desc(threads.createdAt)
				);
				break;
			case 'recent': // Recently active by last post time
				query = query.orderBy(
					desc(threads.isSticky),
					desc(threads.lastPostAt),
					desc(threads.createdAt)
				);
				break;
			case 'latest':
			default:
				query = query.orderBy(desc(threads.isSticky), desc(threads.createdAt));
				break;
		}

		return query;
	}

	async getThread(id: number): Promise<ThreadWithUser | undefined> {
		const [thread] = await db
			.select({
				...threads,
				user: users,
				postCount: sql<number>`${threads.postCount}`
			})
			.from(threads)
			.innerJoin(users, eq(threads.userId, users.id))
			.where(eq(threads.id, id));

		return thread;
	}

	async getThreadBySlug(slug: string): Promise<ThreadWithUser | undefined> {
		const [thread] = await db
			.select({
				...threads,
				user: users,
				postCount: sql<number>`${threads.postCount}`
			})
			.from(threads)
			.innerJoin(users, eq(threads.userId, users.id))
			.where(eq(threads.slug, slug));

		return thread;
	}

	async createThread(thread: InsertThread & { userId: number }): Promise<Thread> {
		// Create a URL-friendly slug from the title
		const slug = thread.title
			.toLowerCase()
			.replace(/[^\w\s]/g, '')
			.replace(/\s+/g, '-');

		const [newThread] = await db.transaction(async (tx: PgTransaction<any, any, any>) => {
			// Create the thread
			const [createdThread] = await tx
				.insert(threads)
				.values({
					title: thread.title,
					slug: `${slug}-${Date.now()}`, // Ensure uniqueness
					structureId: thread.structureId,
					userId: thread.userId,
					prefixId: thread.prefixId,
					updatedAt: new Date()
				})
				.returning();

			// Create the first post
			const [firstPost] = await tx
				.insert(posts)
				.values({
					threadId: createdThread.id,
					userId: thread.userId,
					content: thread.content,
					isFirstPost: true,
					updatedAt: new Date()
				})
				.returning();

			// Update thread with first post info
			const [updatedThread] = await tx
				.update(threads)
				.set({
					lastPostId: firstPost.id,
					lastPostAt: firstPost.createdAt,
					postCount: 1
				})
				.where(eq(threads.id, createdThread.id))
				.returning();

			return [updatedThread];
		});

		return newThread;
	}

	async incrementThreadViewCount(id: number): Promise<void> {
		await db
			.update(threads)
			.set({
				viewCount: sql`${threads.viewCount} + 1`
			})
			.where(eq(threads.id, id));
	}

	// Thread draft methods
	async getDraft(id: number): Promise<ThreadDraft | undefined> {
		const [draft] = await db.select().from(threadDrafts).where(eq(threadDrafts.id, id));

		return draft;
	}

	async getDraftsByUser(userId: number, structureId?: number): Promise<ThreadDraft[]> {
		const query = db
			.select()
			.from(threadDrafts)
			.where(
				and(
					eq(threadDrafts.userId, userId),
					eq(threadDrafts.isPublished, false),
					...(structureId ? [eq(threadDrafts.structureId, structureId)] : [])
				)
			)
			.orderBy(desc(threadDrafts.lastSavedAt));

		return query;
	}

	async saveDraft(draft: InsertThreadDraft): Promise<ThreadDraft> {
		const [newDraft] = await db
			.insert(threadDrafts)
			.values({
				...draft,
				lastSavedAt: new Date(),
				updatedAt: new Date()
			})
			.returning();

		return newDraft;
	}

	async updateDraft(id: number, data: Partial<ThreadDraft>): Promise<ThreadDraft> {
		const [updatedDraft] = await db
			.update(threadDrafts)
			.set({
				...data,
				lastSavedAt: new Date(),
				updatedAt: new Date()
			})
			.where(eq(threadDrafts.id, id))
			.returning();

		return updatedDraft;
	}

	async deleteDraft(id: number): Promise<void> {
		await db.delete(threadDrafts).where(eq(threadDrafts.id, id));
	}

	async publishDraft(id: number): Promise<Thread> {
		return db.transaction(async (tx: PgTransaction<any, any, any>) => {
			// Get the draft
			const [draft] = await tx.select().from(threadDrafts).where(eq(threadDrafts.id, id));

			if (!draft) {
				throw new Error('Draft not found');
			}

			// Create a URL-friendly slug from the title
			const slug = draft.title
				? draft.title
						.toLowerCase()
						.replace(/[^\w\s]/g, '')
						.replace(/\s+/g, '-')
				: `thread-${Date.now()}`;

			// Create the thread
			const [thread] = await tx
				.insert(threads)
				.values({
					title: draft.title || 'Untitled Thread',
					slug: `${slug}-${Date.now()}`, // Ensure uniqueness
					categoryId: draft.categoryId,
					userId: draft.userId,
					prefixId: draft.prefixId || null,
					updatedAt: new Date()
				})
				.returning();

			// Create the first post
			const [firstPost] = await tx
				.insert(posts)
				.values({
					threadId: thread.id,
					userId: draft.userId,
					content: draft.content || '',
					contentHtml: draft.contentHtml,
					isFirstPost: true,
					updatedAt: new Date()
				})
				.returning();

			// Update thread with first post info
			const [updatedThread] = await tx
				.update(threads)
				.set({
					lastPostId: firstPost.id,
					lastPostAt: firstPost.createdAt,
					postCount: 1
				})
				.where(eq(threads.id, thread.id))
				.returning();

			// Mark the draft as published
			await tx
				.update(threadDrafts)
				.set({
					isPublished: true,
					updatedAt: new Date()
				})
				.where(eq(threadDrafts.id, id));

			return updatedThread;
		});
	}

	// Thread feature permissions methods
	async getThreadFeaturePermissions(): Promise<(typeof threadFeaturePermissions.$inferSelect)[]> {
		return db.select().from(threadFeaturePermissions).orderBy(threadFeaturePermissions.featureName);
	}

	async getThreadFeaturePermissionsForUser(userId: number): Promise<Record<string, boolean>> {
		// Get the user to check their level and role
		const [user] = await db.select().from(users).where(eq(users.id, userId));

		if (!user) {
			return {};
		}

		// Get all thread feature permissions
		const permissions = await db.select().from(threadFeaturePermissions);

		// Convert to Record<string, boolean>
		const result: Record<string, boolean> = {};

		for (const perm of permissions) {
			// Check if the user meets the level requirement
			const meetsLevelRequirement = user.level >= perm.minLevel;

			// Check if the user has a role that can bypass level requirements
			const canBypassLevelReq = (perm.bypassRoles || []).includes(user.role || 'user');

			// User can use the feature if they meet level requirements or can bypass
			result[perm.featureName] = meetsLevelRequirement || canBypassLevelReq;
		}

		return result;
	}

	// Post methods
	async getPosts(threadId: number, limit = 20, offset = 0): Promise<PostWithUser[]> {
		return db
			.select({
				...posts,
				user: users
			})
			.from(posts)
			.innerJoin(users, eq(posts.userId, users.id))
			.where(and(eq(posts.threadId, threadId), eq(posts.isHidden, false)))
			.orderBy(posts.createdAt)
			.limit(limit)
			.offset(offset);
	}

	async getPost(id: number): Promise<PostWithUser | undefined> {
		const [post] = await db
			.select({
				...posts,
				user: users
			})
			.from(posts)
			.innerJoin(users, eq(posts.userId, users.id))
			.where(eq(posts.id, id));

		return post;
	}

	async createPost(post: InsertPost & { userId: number; isFirstPost?: boolean }): Promise<Post> {
		const [newPost] = await db.transaction(async (tx: PgTransaction<any, any, any>) => {
			// Create the post
			const [createdPost] = await tx
				.insert(posts)
				.values({
					threadId: post.threadId,
					userId: post.userId,
					content: post.content,
					replyToPostId: post.replyToPostId,
					isFirstPost: post.isFirstPost || false,
					updatedAt: new Date()
				})
				.returning();

			// Update thread with last post info and increment post count
			await tx
				.update(threads)
				.set({
					lastPostId: createdPost.id,
					lastPostAt: createdPost.createdAt,
					postCount: sql`${threads.postCount} + 1`,
					updatedAt: new Date()
				})
				.where(eq(threads.id, post.threadId));

			return [createdPost];
		});

		return newPost;
	}

	async updatePost(id: number, postData: Partial<Post> & { editorId: number }): Promise<Post> {
		const { editorId, ...updateData } = postData;

		const [updatedPost] = await db.transaction(async (tx: PgTransaction<any, any, any>) => {
			// Get the post first to check permissions and get the thread ID
			const [existingPost] = await tx.select().from(posts).where(eq(posts.id, id));

			if (!existingPost) {
				throw new Error('Post not found');
			}

			// Update the post
			const [post] = await tx
				.update(posts)
				.set({
					...updateData,
					isEdited: true,
					editedAt: new Date(),
					editedBy: editorId,
					updatedAt: new Date()
				})
				.where(eq(posts.id, id))
				.returning();

			// Update thread lastUpdatedAt if this is the last post
			const [thread] = await tx.select().from(threads).where(eq(threads.id, existingPost.threadId));

			if (thread && thread.lastPostId === id) {
				await tx
					.update(threads)
					.set({
						updatedAt: new Date()
					})
					.where(eq(threads.id, existingPost.threadId));
			}

			return [post];
		});

		return updatedPost;
	}

	async deletePost(id: number): Promise<void> {
		await db.transaction(async (tx: PgTransaction<any, any, any>) => {
			// Get the post first to check permissions and get thread info
			const [post] = await tx.select().from(posts).where(eq(posts.id, id));

			if (!post) {
				throw new Error('Post not found');
			}

			// Check if this is the first post of a thread
			if (post.isFirstPost) {
				throw new Error('Cannot delete the first post of a thread. Delete the thread instead.');
			}

			// Soft delete the post (set isHidden = true)
			await tx
				.update(posts)
				.set({
					isHidden: true,
					updatedAt: new Date()
				})
				.where(eq(posts.id, id));

			// Decrement thread post count
			await tx
				.update(threads)
				.set({
					postCount: sql`${threads.postCount} - 1`,
					updatedAt: new Date()
				})
				.where(eq(threads.id, post.threadId));

			// If this was the last post, update thread's lastPostId to the previous post
			const [thread] = await tx.select().from(threads).where(eq(threads.id, post.threadId));

			if (thread && thread.lastPostId === id) {
				// Find the previous post
				const [previousPost] = await tx
					.select()
					.from(posts)
					.where(
						and(eq(posts.threadId, post.threadId), eq(posts.isHidden, false), not(eq(posts.id, id)))
					)
					.orderBy(desc(posts.createdAt))
					.limit(1);

				if (previousPost) {
					await tx
						.update(threads)
						.set({
							lastPostId: previousPost.id,
							lastPostAt: previousPost.createdAt
						})
						.where(eq(threads.id, post.threadId));
				}
			}
		});
	}

	// Reaction methods
	async addReaction(userId: number, postId: number, reaction: string): Promise<void> {
		await db.transaction(async (tx: PgTransaction<any, any, any>) => {
			// Add reaction
			await tx
				.insert(postReactions)
				.values({
					userId,
					postId,
					reaction: reaction as any, // Type cast as we're validating before this call
					createdAt: new Date()
				})
				.onConflictDoNothing();

			// Update post like count if it's a like reaction
			if (reaction === 'like') {
				await tx
					.update(posts)
					.set({
						likeCount: sql`${posts.likeCount} + 1`
					})
					.where(eq(posts.id, postId));
			}

			// --- XP/Clout Award Logic ---
			// Fetch post to get author
			const [post] = await tx.select().from(posts).where(eq(posts.id, postId));
			if (post && post.userId !== userId) {
				const actionKey = `REACTION_RECEIVE_${reaction.toUpperCase()}`;
				try {
					await xpCloutService.awardPoints(post.userId, actionKey);
				} catch (err) {
					logger.error('XpCloutService', `Error awarding points for reaction:`, err);
				}
			}
			// --- End XP/Clout Award Logic ---
		});
	}

	async removeReaction(userId: number, postId: number, reaction: string): Promise<void> {
		await db.transaction(async (tx: PgTransaction<any, any, any>) => {
			// Remove reaction
			const deleteResult = await tx.delete(postReactions).where(
				and(
					eq(postReactions.userId, userId),
					eq(postReactions.postId, postId),
					eq(postReactions.reaction, reaction as any) // Type cast as we're validating before this call
				)
			);

			// Update post like count if it's a like reaction
			if (reaction === 'like') {
				await tx
					.update(posts)
					.set({
						likeCount: sql`${posts.likeCount} - 1`
					})
					.where(eq(posts.id, postId));
			}

			// --- XP/Clout Subtraction Logic ---
			// Fetch post to get author
			const [post] = await tx.select().from(posts).where(eq(posts.id, postId));
			if (deleteResult.rowCount > 0 && post && post.userId !== userId) {
				const actionKey = `REACTION_RECEIVE_${reaction.toUpperCase()}`;
				const values = await xpCloutService.getActionValues(actionKey);
				if (values) {
					// Fetch current XP/Clout to avoid going below zero
					const [author] = await tx.select().from(users).where(eq(users.id, post.userId));
					const xpToRemove = Math.min(values.xpValue, author?.xp || 0);
					const cloutToRemove = Math.min(values.cloutValue, author?.clout || 0);
					try {
						await tx
							.update(users)
							.set({
								xp: sql`${users.xp} - ${xpToRemove}`,
								clout: sql`${users.clout} - ${cloutToRemove}`,
								updatedAt: new Date()
							})
							.where(eq(users.id, post.userId));
						logger.info(
							'XpCloutService',
							`Subtracted ${xpToRemove} XP and ${cloutToRemove} Clout from user ${post.userId} for reaction removal ${actionKey}`
						);
					} catch (updateError) {
						logger.error(
							'XpCloutService',
							`Error subtracting points from user ${post.userId}:`,
							updateError
						);
					}
				}
			}
			// --- End XP/Clout Subtraction Logic ---
		});
	}

	// Notification methods
	async getNotifications(userId: number, limit = 20, offset = 0): Promise<Notification[]> {
		return db
			.select()
			.from(notifications)
			.where(eq(notifications.userId, userId))
			.orderBy(desc(notifications.createdAt))
			.limit(limit)
			.offset(offset);
	}

	async markNotificationAsRead(id: number): Promise<void> {
		await db
			.update(notifications)
			.set({
				isRead: true,
				readAt: new Date()
			})
			.where(eq(notifications.id, id));
	}

	// Custom emoji methods
	async getEmojis(category?: string): Promise<CustomEmoji[]> {
		let query = db.select().from(customEmojis).where(eq(customEmojis.isDeleted, false));

		if (category) {
			query = query.where(eq(customEmojis.category, category));
		}

		return query.orderBy(customEmojis.name);
	}

	async getEmoji(id: number): Promise<CustomEmoji | undefined> {
		const [emoji] = await db
			.select()
			.from(customEmojis)
			.where(and(eq(customEmojis.id, id), eq(customEmojis.isDeleted, false)));

		return emoji;
	}

	async createEmoji(emoji: InsertCustomEmoji): Promise<CustomEmoji> {
		const [newEmoji] = await db
			.insert(customEmojis)
			.values({
				...emoji,
				updatedAt: new Date()
			})
			.returning();

		return newEmoji;
	}

	async updateEmoji(id: number, emoji: Partial<CustomEmoji>): Promise<CustomEmoji> {
		const [updatedEmoji] = await db
			.update(customEmojis)
			.set({
				...emoji,
				updatedAt: new Date()
			})
			.where(eq(customEmojis.id, id))
			.returning();

		return updatedEmoji;
	}

	async deleteEmoji(id: number): Promise<void> {
		await db
			.update(customEmojis)
			.set({
				isDeleted: true,
				deletedAt: new Date()
			})
			.where(eq(customEmojis.id, id));
	}

	async getAvailableEmojisForUser(userId: number): Promise<EmojiWithAvailability[]> {
		// Get user first to check their unlocked emojis
		const [user] = await db.select().from(users).where(eq(users.id, userId));
		if (!user) {
			throw new Error('User not found');
		}

		// Get all emojis
		const allEmojis = await db.select().from(customEmojis).where(eq(customEmojis.isDeleted, false));

		// Get user's unlocked emojis from direct table field
		const unlockedEmojiIds = user.unlockedEmojis || [];

		// Determine emoji availability based on unlock conditions
		return allEmojis.map((emoji) => {
			let isAvailable = false;
			let unlockRequirement = '';

			// Check if emoji is free for all
			if (!emoji.isLocked || emoji.unlockType === 'free') {
				isAvailable = true;
			}
			// Check if user has already unlocked this emoji
			else if (unlockedEmojiIds.includes(emoji.id)) {
				isAvailable = true;
			}
			// Otherwise set unlock requirements text
			else {
				if (emoji.unlockType === 'path_xp') {
					const pathName = emoji.requiredPath || 'unknown';
					unlockRequirement = `Requires ${emoji.requiredPathXP} XP in ${pathName} path`;
				} else if (emoji.unlockType === 'shop') {
					unlockRequirement = 'Available in the shop';
				}
			}

			return {
				...emoji,
				isAvailable,
				unlockRequirement: isAvailable ? undefined : unlockRequirement
			};
		});
	}

	async unlockEmojiForUser(userId: number, emojiId: number): Promise<void> {
		// Get user and emoji
		const [user] = await db.select().from(users).where(eq(users.id, userId));
		const [emoji] = await db.select().from(customEmojis).where(eq(customEmojis.id, emojiId));

		if (!user || !emoji) {
			throw new Error('User or emoji not found');
		}

		if (!emoji.isLocked) {
			return; // Emoji is already unlocked for all users
		}

		// Check if user already has this emoji unlocked
		const unlockedEmojis = user.unlockedEmojis || [];
		if (unlockedEmojis.includes(emojiId)) {
			return; // User already has this emoji
		}

		// Add emoji to user's unlocked emojis list
		await db
			.update(users)
			.set({
				unlockedEmojis: [...unlockedEmojis, emojiId],
				updatedAt: new Date()
			})
			.where(eq(users.id, userId));
	}

	// Staff Groups methods
	async getUsersInGroup(groupId: number): Promise<User[]> {
		return db.select().from(users).where(eq(users.groupId, groupId));
	}

	async getUserGroups(): Promise<(typeof userGroups.$inferSelect)[]> {
		return db.select().from(userGroups).orderBy(userGroups.staffPriority);
	}

	async getUserGroup(id: number): Promise<typeof userGroups.$inferSelect | undefined> {
		const [group] = await db.select().from(userGroups).where(eq(userGroups.id, id));
		return group;
	}

	// Forum rules methods
	async getForumRules(section?: string, status?: string): Promise<ForumRule[]> {
		let query = db.select().from(forumRules).orderBy(forumRules.position);

		if (section) {
			query = query.where(eq(forumRules.section, section));
		}

		if (status) {
			query = query.where(eq(forumRules.status, status as any));
		} else {
			// Default to published rules only if no status specified
			query = query.where(eq(forumRules.status, 'published'));
		}

		const rules = await query;
		return rules;
	}

	async getForumRule(id: number): Promise<ForumRule | undefined> {
		const [rule] = await db.select().from(forumRules).where(eq(forumRules.id, id));
		return rule;
	}

	async createForumRule(rule: InsertForumRule & { createdBy?: number }): Promise<ForumRule> {
		// Generate content hash for version tracking
		const versionHash = Buffer.from(rule.content).toString('base64').substring(0, 20);

		const [newRule] = await db
			.insert(forumRules)
			.values({
				...rule,
				lastAgreedVersionHash: versionHash,
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning();

		return newRule;
	}

	async updateForumRule(
		id: number,
		rule: Partial<ForumRule> & { updatedBy?: number }
	): Promise<ForumRule> {
		// If content is being updated, generate a new version hash
		let versionHash = undefined;
		if (rule.content) {
			versionHash = Buffer.from(rule.content).toString('base64').substring(0, 20);
		}

		const [updatedRule] = await db
			.update(forumRules)
			.set({
				...rule,
				...(versionHash ? { lastAgreedVersionHash: versionHash } : {}),
				updatedAt: new Date()
			})
			.where(eq(forumRules.id, id))
			.returning();

		return updatedRule;
	}

	async deleteForumRule(id: number): Promise<void> {
		await db.delete(forumRules).where(eq(forumRules.id, id));
	}

	async getUserRuleAgreements(userId: number): Promise<UserRulesAgreement[]> {
		const agreements = await db
			.select()
			.from(userRulesAgreements)
			.where(eq(userRulesAgreements.userId, userId));
		return agreements;
	}

	async agreeToRule(userId: number, ruleId: number, versionHash: string): Promise<void> {
		// Check if the user has already agreed to this rule
		const [existingAgreement] = await db
			.select()
			.from(userRulesAgreements)
			.where(and(eq(userRulesAgreements.userId, userId), eq(userRulesAgreements.ruleId, ruleId)));

		if (existingAgreement) {
			// Update the existing agreement with the new version hash
			await db
				.update(userRulesAgreements)
				.set({
					versionHash,
					agreedAt: new Date()
				})
				.where(and(eq(userRulesAgreements.userId, userId), eq(userRulesAgreements.ruleId, ruleId)));
		} else {
			// Create a new agreement
			await db.insert(userRulesAgreements).values({
				userId,
				ruleId,
				versionHash,
				agreedAt: new Date()
			});
		}
	}

	// Site settings methods
	async getSiteSettings(): Promise<SiteSetting[]> {
		return db.select().from(siteSettings);
	}

	async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
		const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
		return setting;
	}

	async setSiteSetting(
		key: string,
		value: string,
		valueType: string = 'string',
		group: string = 'general',
		description: string = '',
		isPublic: boolean = false
	): Promise<SiteSetting> {
		// Check if setting exists
		const existingSetting = await this.getSiteSetting(key);

		if (existingSetting) {
			// Update existing setting
			const [updatedSetting] = await db
				.update(siteSettings)
				.set({
					value,
					valueType,
					group,
					description,
					isPublic,
					updatedAt: new Date()
				})
				.where(eq(siteSettings.key, key))
				.returning();

			return updatedSetting;
		} else {
			// Create new setting
			const [newSetting] = await db
				.insert(siteSettings)
				.values({
					key,
					value,
					valueType,
					group,
					description,
					isPublic,
					updatedAt: new Date()
				})
				.returning();

			return newSetting;
		}
	}

	async getPublicSiteSettings(): Promise<Record<string, any>> {
		const settings = await db.select().from(siteSettings).where(eq(siteSettings.isPublic, true));

		// Convert to a key-value object
		const result: Record<string, any> = {};

		settings.forEach((setting) => {
			// Convert value based on valueType
			let parsedValue = setting.value;

			switch (setting.valueType) {
				case 'number':
					parsedValue = Number(setting.value);
					break;
				case 'boolean':
					parsedValue = setting.value === 'true';
					break;
				case 'json':
					try {
						parsedValue = JSON.parse(setting.value || '{}');
					} catch (error) {
						console.error(`Error parsing JSON for setting ${setting.key}:`, error);
						parsedValue = {};
					}
					break;
			}

			result[setting.key] = parsedValue;
		});

		return result;
	}

	async createUserGroup(
		group: typeof userGroups.$inferInsert
	): Promise<typeof userGroups.$inferSelect> {
		const [newGroup] = await db
			.insert(userGroups)
			.values({
				...group,
				updatedAt: new Date()
			})
			.returning();

		return newGroup;
	}

	async updateUserGroup(
		id: number,
		data: Partial<typeof userGroups.$inferSelect>
	): Promise<typeof userGroups.$inferSelect> {
		const [updatedGroup] = await db
			.update(userGroups)
			.set({
				...data,
				updatedAt: new Date()
			})
			.where(eq(userGroups.id, id))
			.returning();

		return updatedGroup;
	}

	async deleteUserGroup(id: number): Promise<void> {
		// Check if it's a default group
		const [group] = await db.select().from(userGroups).where(eq(userGroups.id, id));
		if (group && group.isDefault) {
			throw new Error('Cannot delete a default user group');
		}

		// Reset users in this group to the default group
		const [defaultGroup] = await db.select().from(userGroups).where(eq(userGroups.isDefault, true));

		if (defaultGroup) {
			await db.update(users).set({ groupId: defaultGroup.id }).where(eq(users.groupId, id));
		}

		// Delete the group
		await db.delete(userGroups).where(eq(userGroups.id, id));
	}

	// Shop and products methods
	async getProducts(category?: string): Promise<Product[]> {
		// Use specific columns to avoid issues with schema changes
		let query = db
			.select({
				id: products.id,
				name: products.name,
				description: products.description,
				price: products.price,
				pointsPrice: products.pointsPrice,
				stock: products.stock,
				isDeleted: products.isDeleted,
				categoryId: products.categoryId,
				availableFrom: products.availableFrom,
				availableUntil: products.availableUntil,
				stockLimit: products.stockLimit,
				status: products.status,
				featuredUntil: products.featuredUntil,
				promotionLabel: products.promotionLabel,
				metadata: products.metadata
			})
			.from(products)
			.where(eq(products.isDeleted, false));

		if (category) {
			const [categoryObj] = await db
				.select()
				.from(productCategories)
				.where(eq(productCategories.name, category));

			if (categoryObj) {
				query = query.where(eq(products.categoryId, categoryObj.id));
			}
		}

		return query.orderBy(products.name);
	}

	async getProduct(id: number): Promise<Product | undefined> {
		const [product] = await db
			.select({
				id: products.id,
				name: products.name,
				description: products.description,
				price: products.price,
				pointsPrice: products.pointsPrice,
				stock: products.stock,
				isDeleted: products.isDeleted,
				categoryId: products.categoryId,
				availableFrom: products.availableFrom,
				availableUntil: products.availableUntil,
				stockLimit: products.stockLimit,
				status: products.status,
				featuredUntil: products.featuredUntil,
				promotionLabel: products.promotionLabel,
				metadata: products.metadata
			})
			.from(products)
			.where(and(eq(products.id, id), eq(products.isDeleted, false)));

		return product;
	}

	async createProduct(product: typeof products.$inferInsert): Promise<Product> {
		const [newProduct] = await db
			.insert(products)
			.values({
				...product,
				updatedAt: new Date()
			})
			.returning();

		return newProduct;
	}

	async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
		const [updatedProduct] = await db
			.update(products)
			.set({
				...data,
				updatedAt: new Date()
			})
			.where(eq(products.id, id))
			.returning();

		return updatedProduct;
	}

	async deleteProduct(id: number): Promise<void> {
		await db
			.update(products)
			.set({
				isDeleted: true,
				deletedAt: new Date()
			})
			.where(eq(products.id, id));
	}

	async purchaseProduct(userId: number, productId: number, quantity: number = 1): Promise<Order> {
		const [user] = await db.select().from(users).where(eq(users.id, userId));
		const [product] = await db.select().from(products).where(eq(products.id, productId));

		if (!user || !product) {
			throw new Error('User or product not found');
		}

		if (product.stock !== null && product.stock < quantity) {
			throw new Error('Not enough product in stock');
		}

		const totalPrice = product.price * quantity;

		if (user.dgtWalletBalance < totalPrice) {
			throw new Error('Insufficient wallet balance');
		}

		return db.transaction(async (tx: PgTransaction<any, any, any>) => {
			// Deduct from wallet
			await tx
				.update(users)
				.set({
					dgtWalletBalance: user.dgtWalletBalance - totalPrice,
					updatedAt: new Date()
				})
				.where(eq(users.id, userId));

			// Update stock if needed
			if (product.stock !== null) {
				await tx
					.update(products)
					.set({
						stock: product.stock - quantity,
						updatedAt: new Date()
					})
					.where(eq(products.id, productId));
			}

			// Create order
			const [order] = await tx
				.insert(orders)
				.values({
					userId,
					status: 'completed',
					totalAmount: totalPrice,
					paymentMethod: 'wallet',
					notes: `Purchase of ${quantity} x ${product.name}`,
					updatedAt: new Date()
				})
				.returning();

			// Create order item
			await tx.insert(orderItems).values({
				orderId: order.id,
				productId,
				quantity,
				price: product.price,
				discount: 0
			});

			// Record inventory transaction
			await tx.insert(inventoryTransactions).values({
				productId,
				type: 'sale',
				quantity: -quantity,
				reference: `Order #${order.id}`,
				createdBy: userId
			});

			// Process plugin rewards if any
			if (product.pluginReward) {
				// Process emoji unlocks
				if (product.pluginReward.emojiUnlocks) {
					const emojiIds = product.pluginReward.emojiUnlocks;
					const currentUnlocks = user.unlockedEmojis || [];

					await tx
						.update(users)
						.set({
							unlockedEmojis: [...new Set([...currentUnlocks, ...emojiIds])]
						})
						.where(eq(users.id, userId));
				}

				// Process badge unlocks
				if (product.pluginReward.badgeUnlocks) {
					const badgeIds = product.pluginReward.badgeUnlocks;
					const currentUnlocks = user.unlockedBadges || [];

					await tx
						.update(users)
						.set({
							unlockedBadges: [...new Set([...currentUnlocks, ...badgeIds])]
						})
						.where(eq(users.id, userId));
				}

				// Process title unlocks
				if (product.pluginReward.titleUnlocks) {
					const titleIds = product.pluginReward.titleUnlocks;
					const currentUnlocks = user.unlockedTitles || [];

					await tx
						.update(users)
						.set({
							unlockedTitles: [...new Set([...currentUnlocks, ...titleIds])]
						})
						.where(eq(users.id, userId));
				}

				// Process XP rewards
				if (product.pluginReward.xpGrant) {
					const xpAmount = product.pluginReward.xpGrant.amount || 0;
					const pathId = product.pluginReward.xpGrant.pathId;

					if (xpAmount > 0) {
						await this.addUserXp(userId, xpAmount, pathId);
					}
				}
			}

			return order;
		});
	}

	// Messaging system methods
	async getConversations(
		userId: number
	): Promise<(Conversation & { participants: ConversationParticipant[] })[]> {
		// Get all conversations where user is a participant
		const userConversations = await db
			.select({ conversationId: conversationParticipants.conversationId })
			.from(conversationParticipants)
			.where(
				and(
					eq(conversationParticipants.userId, userId),
					eq(conversationParticipants.isActive, true)
				)
			);

		const conversationIds = userConversations.map((c) => c.conversationId);

		if (conversationIds.length === 0) {
			return [];
		}

		// Get conversation details with participants
		const result = await db
			.select({
				conversation: conversations,
				participant: conversationParticipants,
				participantUser: users
			})
			.from(conversations)
			.innerJoin(
				conversationParticipants,
				eq(conversations.id, conversationParticipants.conversationId)
			)
			.innerJoin(users, eq(conversationParticipants.userId, users.id))
			.where(inArray(conversations.id, conversationIds))
			.orderBy(desc(conversations.lastMessageAt));

		// Group by conversation
		const conversationsMap = new Map<
			number,
			Conversation & { participants: ConversationParticipant[] }
		>();

		for (const row of result) {
			if (!conversationsMap.has(row.conversation.id)) {
				conversationsMap.set(row.conversation.id, {
					...row.conversation,
					participants: []
				});
			}

			const convo = conversationsMap.get(row.conversation.id)!;
			convo.participants.push({
				...row.participant,
				user: row.participantUser
			} as unknown as ConversationParticipant);
		}

		return Array.from(conversationsMap.values());
	}

	async getConversation(id: number): Promise<Conversation | undefined> {
		const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
		return conversation;
	}

	async createConversation(data: {
		title?: string;
		isGroup: boolean;
		createdBy: number;
		participants: number[];
	}): Promise<Conversation> {
		return db.transaction(async (tx: PgTransaction<any, any, any>) => {
			// Create the conversation
			const [conversation] = await tx
				.insert(conversations)
				.values({
					title: data.title,
					isGroup: data.isGroup,
					createdBy: data.createdBy,
					updatedAt: new Date(),
					lastMessageAt: new Date()
				})
				.returning();

			// Add participants
			const uniqueParticipants = [...new Set([data.createdBy, ...data.participants])];

			for (const userId of uniqueParticipants) {
				await tx.insert(conversationParticipants).values({
					conversationId: conversation.id,
					userId,
					isAdmin: userId === data.createdBy,
					lastReadAt: new Date()
				});
			}

			// Create system message about conversation creation
			if (data.isGroup) {
				await tx.insert(messages).values({
					conversationId: conversation.id,
					senderId: data.createdBy,
					content: 'Created this group conversation',
					systemMessageType: 'group_created'
				});
			}

			return conversation;
		});
	}

	async getMessages(
		conversationId: number,
		limit = 20,
		offset = 0
	): Promise<(Message & { sender: User })[]> {
		return db
			.select({
				...messages,
				sender: users
			})
			.from(messages)
			.innerJoin(users, eq(messages.senderId, users.id))
			.where(and(eq(messages.conversationId, conversationId), eq(messages.isDeleted, false)))
			.orderBy(desc(messages.createdAt))
			.limit(limit)
			.offset(offset);
	}

	async sendMessage(data: {
		conversationId: number;
		senderId: number;
		content: string;
		attachmentUrl?: string;
		attachmentType?: string;
	}): Promise<Message> {
		return db.transaction(async (tx: PgTransaction<any, any, any>) => {
			// Create the message
			const [message] = await tx
				.insert(messages)
				.values({
					conversationId: data.conversationId,
					senderId: data.senderId,
					content: data.content,
					attachmentUrl: data.attachmentUrl,
					attachmentType: data.attachmentType
				})
				.returning();

			// Update conversation last message timestamp
			await tx
				.update(conversations)
				.set({
					lastMessageAt: message.createdAt,
					updatedAt: new Date()
				})
				.where(eq(conversations.id, data.conversationId));

			// Mark as read for the sender
			await tx.insert(messageReads).values({
				messageId: message.id,
				userId: data.senderId
			});

			// Create notifications for other participants
			const participants = await tx
				.select()
				.from(conversationParticipants)
				.where(
					and(
						eq(conversationParticipants.conversationId, data.conversationId),
						ne(conversationParticipants.userId, data.senderId),
						eq(conversationParticipants.isActive, true),
						eq(conversationParticipants.isMuted, false)
					)
				);

			const [sender] = await tx.select().from(users).where(eq(users.id, data.senderId));
			const [conversation] = await tx
				.select()
				.from(conversations)
				.where(eq(conversations.id, data.conversationId));

			for (const participant of participants) {
				await tx.insert(notifications).values({
					userId: participant.userId,
					type: 'private_message',
					title: conversation.isGroup
						? `New message in ${conversation.title || 'group conversation'}`
						: `New message from ${sender.username}`,
					body: data.content.substring(0, 100) + (data.content.length > 100 ? '...' : ''),
					data: {
						conversationId: data.conversationId,
						messageId: message.id,
						senderId: data.senderId
					},
					isRead: false
				});
			}

			return message;
		});
	}

	async markMessagesAsRead(conversationId: number, userId: number): Promise<void> {
		await db.transaction(async (tx: PgTransaction<any, any, any>) => {
			// Get unread messages
			const unreadMessages = await tx
				.select()
				.from(messages)
				.leftJoin(
					messageReads,
					and(eq(messages.id, messageReads.messageId), eq(messageReads.userId, userId))
				)
				.where(and(eq(messages.conversationId, conversationId), isNull(messageReads.messageId)));

			// Mark each as read
			for (const message of unreadMessages) {
				await tx
					.insert(messageReads)
					.values({
						messageId: message.id,
						userId
					})
					.onConflictDoNothing();
			}

			// Update participant's last read timestamp
			await tx
				.update(conversationParticipants)
				.set({
					lastReadAt: new Date()
				})
				.where(
					and(
						eq(conversationParticipants.conversationId, conversationId),
						eq(conversationParticipants.userId, userId)
					)
				);
		});
	}

	// XP engine methods
	async addUserXp(userId: number, amount: number, path?: string): Promise<void> {
		if (amount <= 0) return;

		const [user] = await db.select().from(users).where(eq(users.id, userId));
		if (!user) {
			throw new Error('User not found');
		}

		await db.transaction(async (tx: PgTransaction<any, any, any>) => {
			// Update global XP
			await tx
				.update(users)
				.set({
					xp: user.xp + amount
				})
				.where(eq(users.id, userId));

			// Update path-specific XP if a path is specified
			if (path) {
				const pathXp = user.pathXp || {};
				const currentPathXp = pathXp[path] || 0;
				const multiplier = (user.pathMultipliers || {})[path] || 1;
				const adjustedAmount = Math.floor(amount * multiplier);

				// Update path XP
				const newPathXp = {
					...pathXp,
					[path]: currentPathXp + adjustedAmount
				};

				await tx
					.update(users)
					.set({
						pathXp: newPathXp
					})
					.where(eq(users.id, userId));

				// Check if user has reached path XP milestones for multiplier updates
				await this.recalculateUserPathMultipliers(userId);

				// For Category-based XP gain, check for and unlock any eligible emojis
				const emojiUnlocks = await tx
					.select()
					.from(customEmojis)
					.where(
						and(
							eq(customEmojis.isLocked, true),
							eq(customEmojis.unlockType, 'path_xp'),
							eq(customEmojis.requiredPath, path),
							lte(customEmojis.requiredPathXP, newPathXp[path])
						)
					);

				if (emojiUnlocks.length > 0) {
					const currentUnlocks = user.unlockedEmojis || [];
					const newUnlocks = emojiUnlocks
						.map((emoji) => emoji.id)
						.filter((id) => !currentUnlocks.includes(id));

					if (newUnlocks.length > 0) {
						await tx
							.update(users)
							.set({
								unlockedEmojis: [...currentUnlocks, ...newUnlocks]
							})
							.where(eq(users.id, userId));

						// Create notifications for unlocked emojis
						for (const emojiId of newUnlocks) {
							const emoji = emojiUnlocks.find((e) => e.id === emojiId);
							if (emoji) {
								await tx.insert(notifications).values({
									userId,
									type: 'achievement',
									title: `New Emoji Unlocked: ${emoji.name}`,
									body: `You've unlocked the ${emoji.name} emoji by reaching ${newPathXp[path]} XP in the ${path} path!`,
									data: { emojiId },
									isRead: false
								});
							}
						}
					}
				}
			}
		});
	}

	async getUserPathXp(userId: number, path?: string): Promise<Record<string, number>> {
		const [user] = await db
			.select({
				pathXp: users.pathXp
			})
			.from(users)
			.where(eq(users.id, userId));

		if (!user) {
			throw new Error('User not found');
		}

		const pathXp = user.pathXp || {};

		if (path) {
			return { [path]: pathXp[path] || 0 };
		}

		return pathXp;
	}

	async recalculateUserPathMultipliers(userId: number): Promise<Record<string, number>> {
		const [user] = await db.select().from(users).where(eq(users.id, userId));
		if (!user) {
			throw new Error('User not found');
		}

		const pathXp = user.pathXp || {};
		const currentMultipliers = user.pathMultipliers || {};
		let newMultipliers = { ...currentMultipliers };
		let multiplierChanged = false;

		// Apply multiplier rules - example rule: 1.2x multiplier at 1000 XP
		Object.entries(pathXp).forEach(([path, xp]) => {
			// Define multiplier thresholds and values
			let newMultiplier = 1; // Default multiplier

			if (xp >= 5000) {
				newMultiplier = 1.5; // 1.5x multiplier at 5000 XP
			} else if (xp >= 2500) {
				newMultiplier = 1.3; // 1.3x multiplier at 2500 XP
			} else if (xp >= 1000) {
				newMultiplier = 1.2; // 1.2x multiplier at 1000 XP
			}

			if (newMultiplier !== (currentMultipliers[path] || 1)) {
				newMultipliers[path] = newMultiplier;
				multiplierChanged = true;
			}
		});

		if (multiplierChanged) {
			await db
				.update(users)
				.set({
					pathMultipliers: newMultipliers
				})
				.where(eq(users.id, userId));

			// Create notification for multiplier change
			const changedPaths = Object.entries(newMultipliers)
				.filter(([path, multiplier]) => multiplier !== (currentMultipliers[path] || 1))
				.map(([path, multiplier]) => ({ path, multiplier }));

			for (const { path, multiplier } of changedPaths) {
				await db.insert(notifications).values({
					userId,
					type: 'achievement',
					title: `XP Multiplier Increased for ${path}`,
					body: `You now earn ${multiplier}x XP in the ${path} path!`,
					data: { path, multiplier },
					isRead: false
				});
			}
		}

		return newMultipliers;
	}

	// User inventory methods
	async getUserInventory(userId: number): Promise<UserInventoryItem[]> {
		// Select only the fields that actually exist in the database
		const inventoryItems = await db
			.select({
				id: userInventory.id,
				userId: userInventory.userId,
				productId: userInventory.productId,
				quantity: userInventory.quantity,
				isEquipped: userInventory.isEquipped,
				acquiredAt: userInventory.acquiredAt,
				expiresAt: userInventory.expiresAt,
				lastUsedAt: userInventory.lastUsedAt,
				transactionId: userInventory.transactionId,
				metadata: userInventory.metadata
			})
			.from(userInventory)
			.where(eq(userInventory.userId, userId))
			.orderBy(userInventory.acquiredAt);

		return inventoryItems;
	}

	async checkUserOwnsProduct(userId: number, productId: number): Promise<boolean> {
		const [item] = await db
			.select({
				id: userInventory.id
			})
			.from(userInventory)
			.where(and(eq(userInventory.userId, userId), eq(userInventory.productId, productId)));

		return !!item;
	}

	async addProductToUserInventory(item: InsertUserInventoryItem): Promise<UserInventoryItem> {
		// First record the transaction if not already provided
		let transactionId: number | null = null;

		if (item.transactionId === undefined) {
			// Create transaction record if not provided
			const [transaction] = await db
				.insert(inventoryTransactions)
				.values({
					userId: item.userId,
					productId: item.productId,
					transactionType: 'PURCHASE',
					amount: item.quantity || 1,
					currency: 'DGT',
					currencyAmount: 0, // This will be updated if price info is available
					status: 'completed'
				})
				.returning();

			transactionId = transaction.id;
		} else {
			transactionId = item.transactionId;
		}

		// Check if the user already owns this product
		const existingItem = await this.checkUserOwnsProduct(item.userId, item.productId);

		if (existingItem) {
			// Update existing inventory item
			const [updatedItem] = await db
				.update(userInventory)
				.set({
					quantity: sql`${userInventory.quantity} + ${item.quantity || 1}`,
					lastUsedAt: new Date()
				})
				.where(
					and(eq(userInventory.userId, item.userId), eq(userInventory.productId, item.productId))
				)
				.returning();

			return updatedItem;
		} else {
			// Insert new inventory item
			const [inventoryItem] = await db
				.insert(userInventory)
				.values({
					...item,
					transactionId,
					acquiredAt: new Date()
				})
				.returning();

			return inventoryItem;
		}
	}

	async updateUserInventoryItem(
		userId: number,
		productId: number,
		updates: Partial<UserInventoryItem>
	): Promise<UserInventoryItem | undefined> {
		const [updatedItem] = await db
			.update(userInventory)
			.set(updates)
			.where(and(eq(userInventory.userId, userId), eq(userInventory.productId, productId)))
			.returning();

		return updatedItem;
	}

	async getInventoryTransactions(
		userId: number
	): Promise<(typeof inventoryTransactions.$inferSelect)[]> {
		return db
			.select()
			.from(inventoryTransactions)
			.where(eq(inventoryTransactions.userId, userId))
			.orderBy(desc(inventoryTransactions.createdAt));
	}

	async createInventoryTransaction(data: {
		userId: number;
		productId: number;
		transactionType: string;
		amount: number;
		currency: string;
		currencyAmount: number;
		status?: string;
		metadata?: Record<string, any>;
	}): Promise<typeof inventoryTransactions.$inferSelect> {
		const [transaction] = await db
			.insert(inventoryTransactions)
			.values({
				userId: data.userId,
				productId: data.productId,
				transactionType: data.transactionType,
				amount: data.amount,
				currency: data.currency,
				currencyAmount: data.currencyAmount,
				status: data.status || 'completed',
				metadata: data.metadata || {},
				createdAt: new Date()
			})
			.returning();

		return transaction;
	}
}

export const storage = new DatabaseStorage();
