import {
  users, posts, threads, forumCategories, threadTags, tags, postReactions, notifications, customEmojis, userGroups,
  conversations, conversationParticipants, messages, messageReads, products, productCategories, orders, orderItems, inventoryTransactions,
  userInventory, threadDrafts, threadFeaturePermissions, siteSettings, forumRules, userRulesAgreements, verificationTokens,
  type User, type InsertUser, type Thread, type InsertThread, type Post, type InsertPost, type ForumCategory,
  type InsertForumCategory, type CustomEmoji, type InsertCustomEmoji, type Notification, type Product, type Order,
  type Conversation, type ConversationParticipant, type Message, type MessageRead,
  type UserInventoryItem, type InsertUserInventoryItem, type ThreadDraft, type InsertThreadDraft, type SiteSetting, type InsertSiteSetting,
  type ForumRule, type InsertForumRule, type UserRulesAgreement, contentEditStatusEnum
} from "@schema";
import { db, pool } from '@db';
import { and, eq, desc, sql, count, isNull, not, inArray, ne, lte } from "drizzle-orm";
import { ThreadWithUser, PostWithUser, ForumCategoryWithStats, UserPluginData, EmojiWithAvailability } from "@shared/types";
import * as session from "express-session";
import * as connectPGSink from "connect-pg-simple";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";
// TODO: Adjust this import path or provide a stub if xpCloutService is not part of the workspace yet
import { xpCloutService } from './src/domains/xp/services/xp-clout-service.js';
import { logger, LogLevel, LogAction } from "./src/core/logger.js";
import { PgTransaction } from 'drizzle-orm/pg-core';
// import multerS3 from "multer-s3"; // Removed as not a dependency
// import { S3Client } from "@aws-sdk/client-s3"; // Removed as not a dependency

const environment = process.env.NODE_ENV || "development";

// Correctly get the function from the namespace import
const connectPgSimpleFunction = (connectPGSink as any).default || connectPGSink;
const PGStore = connectPgSimpleFunction(session.default || session); // Pass the actual session module

// Define Store type
type SessionStore = ReturnType<typeof connectPgSimpleFunction>;

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
  getUserGroups(): Promise<typeof userGroups.$inferSelect[]>;
  getUserGroup(id: number): Promise<typeof userGroups.$inferSelect | undefined>;
  createUserGroup(group: typeof userGroups.$inferInsert): Promise<typeof userGroups.$inferSelect>;
  updateUserGroup(id: number, data: Partial<typeof userGroups.$inferSelect>): Promise<typeof userGroups.$inferSelect>;
  deleteUserGroup(id: number): Promise<void>;

  // Forum rules methods
  getForumRules(section?: string, status?: string): Promise<ForumRule[]>;
  getForumRule(id: number): Promise<ForumRule | undefined>;
  createForumRule(rule: InsertForumRule & { createdBy?: number }): Promise<ForumRule>;
  updateForumRule(id: number, rule: Partial<ForumRule> & { updatedBy?: number }): Promise<ForumRule>;
  deleteForumRule(id: number): Promise<void>;
  getUserRuleAgreements(userId: number): Promise<UserRulesAgreement[]>;
  agreeToRule(userId: number, ruleId: number, versionHash: string): Promise<void>;

  // Forum category methods
  getCategories(): Promise<ForumCategoryWithStats[]>;
  getCategory(id: number): Promise<ForumCategoryWithStats | undefined>;
  getCategoryBySlug(slug: string): Promise<ForumCategoryWithStats | undefined>;
  createCategory(category: InsertForumCategory): Promise<ForumCategory>;

  // Thread methods
  getThreads(categoryId?: number, limit?: number, offset?: number, sortBy?: string): Promise<ThreadWithUser[]>;
  getThread(id: number): Promise<ThreadWithUser | undefined>;
  getThreadBySlug(slug: string): Promise<ThreadWithUser | undefined>;
  createThread(thread: InsertThread & { userId: number }): Promise<Thread>;
  incrementThreadViewCount(id: number): Promise<void>;

  // Thread draft methods
  getDraft(id: number): Promise<ThreadDraft | undefined>;
  getDraftsByUser(userId: number, categoryId?: number): Promise<ThreadDraft[]>;
  saveDraft(draft: InsertThreadDraft): Promise<ThreadDraft>;
  updateDraft(id: number, data: Partial<ThreadDraft>): Promise<ThreadDraft>;
  deleteDraft(id: number): Promise<void>;
  publishDraft(id: number): Promise<Thread>;

  // Thread feature permissions methods
  getThreadFeaturePermissions(): Promise<typeof threadFeaturePermissions.$inferSelect[]>;
  getThreadFeaturePermissionsForUser(userId: number): Promise<Record<string, boolean>>;

  // Post methods
  getPosts(threadId: number, limit?: number, offset?: number): Promise<PostWithUser[]>;
  getPost(id: number): Promise<PostWithUser | undefined>;
  createPost(post: InsertPost & { userId: number, isFirstPost?: boolean }): Promise<Post>;
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
  getConversations(userId: number): Promise<(Conversation & { participants: ConversationParticipant[] })[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  createConversation(data: { title?: string, isGroup: boolean, createdBy: number, participants: number[] }): Promise<Conversation>;
  getMessages(conversationId: number, limit?: number, offset?: number): Promise<(Message & { sender: User })[]>;
  sendMessage(data: { conversationId: number, senderId: number, content: string, attachmentUrl?: string, attachmentType?: string }): Promise<Message>;
  markMessagesAsRead(conversationId: number, userId: number): Promise<void>;

  // XP engine methods
  addUserXp(userId: number, amount: number, path?: string): Promise<void>;
  getUserPathXp(userId: number, path?: string): Promise<Record<string, number>>;
  recalculateUserPathMultipliers(userId: number): Promise<Record<string, number>>;

  // User inventory methods
  getUserInventory(userId: number): Promise<UserInventoryItem[]>;
  checkUserOwnsProduct(userId: number, productId: number): Promise<boolean>;
  addProductToUserInventory(item: InsertUserInventoryItem): Promise<UserInventoryItem>;
  updateUserInventoryItem(userId: number, productId: number, updates: Partial<UserInventoryItem>): Promise<UserInventoryItem | undefined>;
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
  setSiteSetting(key: string, value: string, valueType?: string, group?: string, description?: string, isPublic?: boolean): Promise<SiteSetting>;
  getPublicSiteSettings(): Promise<Record<string, any>>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: SessionStore;

  constructor() {
    this.sessionStore = new PGStore({
      pool: pool, // This will use the pool from Wallet-Workspace/server/src/core/db.ts
      createTableIfMissing: true,
    });
    // Assuming logger is available at ./src/core/logger.js relative to this file in Wallet-Workspace
    logger.info('DATABASE', '🐘 PostgreSQL session store initialized (using default table name \'session\').');
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const query = db.select().from(users).where(eq(users.id, id));
      const [user] = await query;
      if (user) return user;
    } catch (err) {
      console.warn('Error fetching user with id column, trying with user_id', err);
    }
    try {
      if (process.env.NODE_ENV === "development") {
        const result = await db.execute(sql`
          SELECT * 
          FROM users WHERE user_id = ${id} LIMIT 1
        `);
        if (result.rows && result.rows.length > 0) {
          return result.rows[0] as any as User;
        }
      }
    } catch (err) {
      console.warn('Direct SQL query for user failed', err);
    }
    return undefined;
  }

  async storeVerificationToken(userId: number, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    try {
      await db.delete(verificationTokens).where(eq(verificationTokens.userId, userId));
      await db.insert(verificationTokens).values({ userId, token, expiresAt, createdAt: new Date() });
      console.log(`Verification token stored for user ${userId}, expires at ${expiresAt}`);
    } catch (error) {
      console.error('Error storing verification token:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(and(eq(users.username, username), eq(users.isDeleted, false)));
      if (user) return user;
    } catch (err) {
      console.warn('Error fetching user by username with ORM, falling back to SQL', err);
    }
    if (process.env.NODE_ENV === "development") {
      try {
        const result = await db.execute(sql`
          SELECT * FROM users 
          WHERE username = ${username} 
          AND (is_deleted = false OR is_deleted IS NULL)
          LIMIT 1
        `);
        if (result.rows && result.rows.length > 0) return result.rows[0] as any as User;
      } catch (sqlErr) {
        console.warn('Direct SQL query for user by username failed', sqlErr);
      }
    }
    return undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(and(eq(users.email, email), eq(users.isDeleted, false)));
      if (user) return user;
    } catch (err) {
      console.warn('Error fetching user by email with ORM, falling back to SQL', err);
    }
    if (process.env.NODE_ENV === "development") {
      try {
        const result = await db.execute(sql`
          SELECT * FROM users 
          WHERE email = ${email} 
          AND (is_deleted = false OR is_deleted IS NULL)
          LIMIT 1
        `);
        if (result.rows && result.rows.length > 0) return result.rows[0] as any as User;
      } catch (sqlErr) {
        console.warn('Direct SQL query for user by email failed', sqlErr);
      }
    }
    return undefined;
  }

  async hashPassword(password: string): Promise<string> {
    const scryptAsync = promisify(scrypt);
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const [updatedUser] = await db.update(users).set({ ...userData, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return updatedUser;
  }

  async getCategories(): Promise<ForumCategoryWithStats[]> {
    const categoriesData = await db.select({
      id: forumCategories.id,
      name: forumCategories.name,
      slug: forumCategories.slug,
      description: forumCategories.description,
      parentId: forumCategories.parentId,
      position: forumCategories.position,
      isVip: forumCategories.isVip,
      isLocked: forumCategories.isLocked,
      minGroupIdRequired: forumCategories.minGroupIdRequired,
      pluginData: forumCategories.pluginData,
      minXp: forumCategories.minXp,
      color: forumCategories.color,
      icon: forumCategories.icon,
      isHidden: forumCategories.isHidden,
      createdAt: forumCategories.createdAt,
      updatedAt: forumCategories.updatedAt,
      threadCount: count(threads.id).as('thread_count'),
    })
      .from(forumCategories)
      .leftJoin(threads, eq(forumCategories.id, threads.categoryId))
      .groupBy(forumCategories.id, forumCategories.name, forumCategories.slug, forumCategories.description, forumCategories.parentId, forumCategories.position, forumCategories.isVip, forumCategories.isLocked, forumCategories.minGroupIdRequired, forumCategories.pluginData, forumCategories.minXp, forumCategories.color, forumCategories.icon, forumCategories.isHidden, forumCategories.createdAt, forumCategories.updatedAt)
      .orderBy(forumCategories.position);

    const categoriesWithStats: ForumCategoryWithStats[] = categoriesData.map(category => ({
      ...category,
      threadCount: Number(category.threadCount) || 0,
      postCount: 0,
      children: [] as ForumCategoryWithStats[]
    }));

    const categoryMap = new Map<number, ForumCategoryWithStats>();
    categoriesWithStats.forEach(category => categoryMap.set(category.id, category));

    const rootCategories: ForumCategoryWithStats[] = [];
    categoriesWithStats.forEach(category => {
      if (category.parentId === null) {
        rootCategories.push(category);
      } else {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          (parent.children || (parent.children = [])).push(category);
        } else {
          rootCategories.push(category);
        }
      }
    });
    return categoriesWithStats;
  }

  async getCategory(id: number): Promise<ForumCategoryWithStats | undefined> {
    const [categoryData] = await db.select({
      id: forumCategories.id,
      name: forumCategories.name,
      slug: forumCategories.slug,
      description: forumCategories.description,
      parentId: forumCategories.parentId,
      position: forumCategories.position,
      isVip: forumCategories.isVip,
      isLocked: forumCategories.isLocked,
      minGroupIdRequired: forumCategories.minGroupIdRequired,
      pluginData: forumCategories.pluginData,
      minXp: forumCategories.minXp,
      color: forumCategories.color,
      icon: forumCategories.icon,
      isHidden: forumCategories.isHidden,
      createdAt: forumCategories.createdAt,
      updatedAt: forumCategories.updatedAt,
      threadCount: count(threads.id).as('thread_count'),
    })
      .from(forumCategories)
      .leftJoin(threads, eq(forumCategories.id, threads.categoryId))
      .where(eq(forumCategories.id, id))
      .groupBy(forumCategories.id, forumCategories.name, forumCategories.slug, forumCategories.description, forumCategories.parentId, forumCategories.position, forumCategories.isVip, forumCategories.isLocked, forumCategories.minGroupIdRequired, forumCategories.pluginData, forumCategories.minXp, forumCategories.color, forumCategories.icon, forumCategories.isHidden, forumCategories.createdAt, forumCategories.updatedAt);

    if (!categoryData) return undefined;
    return { ...categoryData, threadCount: Number(categoryData.threadCount) || 0, postCount: 0 };
  }

  async getCategoryBySlug(slug: string): Promise<ForumCategoryWithStats | undefined> {
    const [categoryData] = await db.select({
      id: forumCategories.id,
      name: forumCategories.name,
      slug: forumCategories.slug,
      description: forumCategories.description,
      parentId: forumCategories.parentId,
      position: forumCategories.position,
      isVip: forumCategories.isVip,
      isLocked: forumCategories.isLocked,
      minGroupIdRequired: forumCategories.minGroupIdRequired,
      pluginData: forumCategories.pluginData,
      minXp: forumCategories.minXp,
      color: forumCategories.color,
      icon: forumCategories.icon,
      isHidden: forumCategories.isHidden,
      createdAt: forumCategories.createdAt,
      updatedAt: forumCategories.updatedAt,
      threadCount: count(threads.id).as('thread_count'),
    })
      .from(forumCategories)
      .leftJoin(threads, eq(forumCategories.id, threads.categoryId))
      .where(eq(forumCategories.slug, slug))
      .groupBy(forumCategories.id, forumCategories.name, forumCategories.slug, forumCategories.description, forumCategories.parentId, forumCategories.position, forumCategories.isVip, forumCategories.isLocked, forumCategories.minGroupIdRequired, forumCategories.pluginData, forumCategories.minXp, forumCategories.color, forumCategories.icon, forumCategories.isHidden, forumCategories.createdAt, forumCategories.updatedAt);

    if (!categoryData) return undefined;
    return { ...categoryData, threadCount: Number(categoryData.threadCount) || 0, postCount: 0 };
  }

  async createCategory(category: InsertForumCategory): Promise<ForumCategory> {
    const [newCategory] = await db.insert(forumCategories).values({ ...category, updatedAt: new Date() }).returning();
    return newCategory;
  }

  async getThreads(categoryId?: number, limit = 20, offset = 0, sortBy = 'latest'): Promise<ThreadWithUser[]> {
    let query = db.select({
      id: threads.id,
      title: threads.title,
      slug: threads.slug,
      categoryId: threads.categoryId,
      userId: threads.userId,
      isSticky: threads.isSticky,
      isLocked: threads.isLocked,
      isHidden: threads.isHidden,
      viewCount: threads.viewCount,
      postCount: sql<number>`${threads.postCount}`,
      lastPostId: threads.lastPostId,
      lastPostAt: threads.lastPostAt,
      prefixId: threads.prefixId,
      createdAt: threads.createdAt,
      updatedAt: threads.updatedAt,
      user: users,
    })
      .from(threads)
      .innerJoin(users, eq(threads.userId, users.id))
      .where(and(eq(threads.isHidden, false), ...(categoryId ? [eq(threads.categoryId, categoryId)] : [])))
      .limit(limit)
      .offset(offset);

    switch (sortBy) {
      case 'popular': query = query.orderBy(desc(threads.isSticky), desc(threads.viewCount), desc(threads.createdAt)); break;
      case 'replies': query = query.orderBy(desc(threads.isSticky), desc(threads.postCount), desc(threads.createdAt)); break;
      case 'recent': query = query.orderBy(desc(threads.isSticky), desc(threads.lastPostAt), desc(threads.createdAt)); break;
      default: query = query.orderBy(desc(threads.isSticky), desc(threads.createdAt)); break;
    }
    return query as unknown as Promise<ThreadWithUser[]>; // Cast needed due to complex select
  }

  async getThread(id: number): Promise<ThreadWithUser | undefined> {
    const [thread] = await db.select({
      id: threads.id, title: threads.title, slug: threads.slug, categoryId: threads.categoryId, userId: threads.userId,
      isSticky: threads.isSticky, isLocked: threads.isLocked, isHidden: threads.isHidden, viewCount: threads.viewCount,
      postCount: sql<number>`${threads.postCount}`, lastPostId: threads.lastPostId, lastPostAt: threads.lastPostAt,
      prefixId: threads.prefixId, createdAt: threads.createdAt, updatedAt: threads.updatedAt, user: users,
    }).from(threads).innerJoin(users, eq(threads.userId, users.id)).where(eq(threads.id, id));
    return thread as ThreadWithUser | undefined; // Cast needed
  }

  async getThreadBySlug(slug: string): Promise<ThreadWithUser | undefined> {
    const [thread] = await db.select({
      id: threads.id, title: threads.title, slug: threads.slug, categoryId: threads.categoryId, userId: threads.userId,
      isSticky: threads.isSticky, isLocked: threads.isLocked, isHidden: threads.isHidden, viewCount: threads.viewCount,
      postCount: sql<number>`${threads.postCount}`, lastPostId: threads.lastPostId, lastPostAt: threads.lastPostAt,
      prefixId: threads.prefixId, createdAt: threads.createdAt, updatedAt: threads.updatedAt, user: users,
    }).from(threads).innerJoin(users, eq(threads.userId, users.id)).where(eq(threads.slug, slug));
    return thread as ThreadWithUser | undefined; // Cast needed
  }

  async createThread(threadData: InsertThread & { userId: number; content: string }): Promise<Thread> {
    const slugBase = (threadData.title || 'untitled').toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
    const uniqueSlug = `${slugBase}-${Date.now()}`;

    const [newThread] = await db.transaction(async (tx) => {
      const [createdThread] = await tx.insert(threads).values({
        title: threadData.title, slug: uniqueSlug, categoryId: threadData.categoryId, userId: threadData.userId,
        prefixId: threadData.prefixId, updatedAt: new Date(),
      }).returning();

      const [firstPost] = await tx.insert(posts).values({
        threadId: createdThread.id, userId: threadData.userId, content: threadData.content,
        isFirstPost: true, updatedAt: new Date(),
      }).returning();

      const [updatedThread] = await tx.update(threads).set({
        lastPostId: firstPost.id, lastPostAt: firstPost.createdAt, postCount: 1,
      }).where(eq(threads.id, createdThread.id)).returning();
      return [updatedThread];
    });
    return newThread;
  }

  async incrementThreadViewCount(id: number): Promise<void> {
    await db.update(threads).set({ viewCount: sql`${threads.viewCount} + 1` }).where(eq(threads.id, id));
  }

  // Implement other IStorage methods similarly...
  // For brevity, only a subset is fully implemented here.
  // Ensure all methods from IStorage are implemented.

  async getDraft(id: number): Promise<ThreadDraft | undefined> {
    const [draft] = await db.select().from(threadDrafts).where(eq(threadDrafts.id, id));
    return draft;
  }

  async getDraftsByUser(userId: number, categoryId?: number): Promise<ThreadDraft[]> {
    const conditions = [eq(threadDrafts.userId, userId), eq(threadDrafts.isPublished, false)];
    if (categoryId) conditions.push(eq(threadDrafts.categoryId, categoryId));
    return db.select().from(threadDrafts).where(and(...conditions)).orderBy(desc(threadDrafts.lastSavedAt));
  }

  async saveDraft(draft: InsertThreadDraft): Promise<ThreadDraft> {
    const [newDraft] = await db.insert(threadDrafts).values({ ...draft, lastSavedAt: new Date(), updatedAt: new Date() }).returning();
    return newDraft;
  }

  async updateDraft(id: number, data: Partial<ThreadDraft>): Promise<ThreadDraft> {
    const [updatedDraft] = await db.update(threadDrafts).set({ ...data, lastSavedAt: new Date(), updatedAt: new Date() }).where(eq(threadDrafts.id, id)).returning();
    return updatedDraft;
  }

  async deleteDraft(id: number): Promise<void> {
    await db.delete(threadDrafts).where(eq(threadDrafts.id, id));
  }

  async publishDraft(id: number): Promise<Thread> {
    return db.transaction(async (tx) => {
      const [draft] = await tx.select().from(threadDrafts).where(eq(threadDrafts.id, id));
      if (!draft) throw new Error("Draft not found");
      const slug = (draft.title || `thread-${Date.now()}`).toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
      const [thread] = await tx.insert(threads).values({
        title: draft.title || "Untitled Thread", slug: `${slug}-${Date.now()}`, categoryId: draft.categoryId,
        userId: draft.userId, prefixId: draft.prefixId || null, updatedAt: new Date(),
      }).returning();
      const [firstPost] = await tx.insert(posts).values({
        threadId: thread.id, userId: draft.userId, content: draft.content || "", contentHtml: draft.contentHtml,
        isFirstPost: true, updatedAt: new Date(),
      }).returning();
      const [updatedThread] = await tx.update(threads).set({
        lastPostId: firstPost.id, lastPostAt: firstPost.createdAt, postCount: 1,
      }).where(eq(threads.id, thread.id)).returning();
      await tx.update(threadDrafts).set({ isPublished: true, updatedAt: new Date() }).where(eq(threadDrafts.id, id));
      return updatedThread;
    });
  }

  async getThreadFeaturePermissions(): Promise<typeof threadFeaturePermissions.$inferSelect[]> {
    return db.select().from(threadFeaturePermissions).orderBy(threadFeaturePermissions.featureName);
  }

  async getThreadFeaturePermissionsForUser(userId: number): Promise<Record<string, boolean>> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return {};
    const permissions = await db.select().from(threadFeaturePermissions);
    const result: Record<string, boolean> = {};
    for (const perm of permissions) {
      const meetsLevel = user.level >= perm.minLevel;
      const canBypass = (perm.bypassRoles || []).includes(user.role || 'user');
      result[perm.featureName] = meetsLevel || canBypass;
    }
    return result;
  }

  async getPosts(threadId: number, limit = 20, offset = 0): Promise<PostWithUser[]> {
    return db.select({
      id: posts.id, threadId: posts.threadId, userId: posts.userId, content: posts.content, contentHtml: posts.contentHtml,
      isFirstPost: posts.isFirstPost, isHidden: posts.isHidden, isEdited: posts.isEdited, editedAt: posts.editedAt,
      editedBy: posts.editedBy, replyToPostId: posts.replyToPostId, likeCount: posts.likeCount,
      createdAt: posts.createdAt, updatedAt: posts.updatedAt, user: users,
    }).from(posts).innerJoin(users, eq(posts.userId, users.id))
      .where(and(eq(posts.threadId, threadId), eq(posts.isHidden, false)))
      .orderBy(posts.createdAt).limit(limit).offset(offset) as unknown as Promise<PostWithUser[]>; // Cast needed
  }

  async getPost(id: number): Promise<PostWithUser | undefined> {
    const [post] = await db.select({
      id: posts.id, threadId: posts.threadId, userId: posts.userId, content: posts.content, contentHtml: posts.contentHtml,
      isFirstPost: posts.isFirstPost, isHidden: posts.isHidden, isEdited: posts.isEdited, editedAt: posts.editedAt,
      editedBy: posts.editedBy, replyToPostId: posts.replyToPostId, likeCount: posts.likeCount,
      createdAt: posts.createdAt, updatedAt: posts.updatedAt, user: users,
    }).from(posts).innerJoin(users, eq(posts.userId, users.id)).where(eq(posts.id, id));
    return post as PostWithUser | undefined; // Cast needed
  }

  async createPost(postData: InsertPost & { userId: number; isFirstPost?: boolean }): Promise<Post> {
    const [newPost] = await db.transaction(async (tx) => {
      const [createdPost] = await tx.insert(posts).values({
        threadId: postData.threadId, userId: postData.userId, content: postData.content,
        replyToPostId: postData.replyToPostId, isFirstPost: postData.isFirstPost || false, updatedAt: new Date(),
      }).returning();
      await tx.update(threads).set({
        lastPostId: createdPost.id, lastPostAt: createdPost.createdAt, postCount: sql`${threads.postCount} + 1`,
        updatedAt: new Date(),
      }).where(eq(threads.id, postData.threadId));
      return [createdPost];
    });
    return newPost;
  }

  async updatePost(id: number, postData: Partial<Post> & { editorId: number }): Promise<Post> {
    const { editorId, ...updateData } = postData;
    const [updatedPost] = await db.transaction(async (tx) => {
      const [existingPost] = await tx.select().from(posts).where(eq(posts.id, id));
      if (!existingPost) throw new Error("Post not found");
      const [post] = await tx.update(posts).set({
        ...updateData, isEdited: true, editedAt: new Date(), editedBy: editorId, updatedAt: new Date(),
      }).where(eq(posts.id, id)).returning();
      const [thread] = await tx.select().from(threads).where(eq(threads.id, existingPost.threadId));
      if (thread && thread.lastPostId === id) {
        await tx.update(threads).set({ updatedAt: new Date() }).where(eq(threads.id, existingPost.threadId));
      }
      return [post];
    });
    return updatedPost;
  }

  async deletePost(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      const [post] = await tx.select().from(posts).where(eq(posts.id, id));
      if (!post) throw new Error("Post not found");
      if (post.isFirstPost) throw new Error("Cannot delete the first post of a thread. Delete the thread instead.");
      await tx.update(posts).set({ isHidden: true, updatedAt: new Date() }).where(eq(posts.id, id));
      await tx.update(threads).set({ postCount: sql`${threads.postCount} - 1`, updatedAt: new Date() }).where(eq(threads.id, post.threadId));
      const [thread] = await tx.select().from(threads).where(eq(threads.id, post.threadId));
      if (thread && thread.lastPostId === id) {
        const [previousPost] = await tx.select().from(posts)
          .where(and(eq(posts.threadId, post.threadId), eq(posts.isHidden, false), not(eq(posts.id, id))))
          .orderBy(desc(posts.createdAt)).limit(1);
        if (previousPost) {
          await tx.update(threads).set({ lastPostId: previousPost.id, lastPostAt: previousPost.createdAt }).where(eq(threads.id, post.threadId));
        }
      }
    });
  }

  async addReaction(userId: number, postId: number, reaction: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.insert(postReactions).values({ userId, postId, reaction: reaction as any, createdAt: new Date() }).onConflictDoNothing();
      if (reaction === 'like') {
        await tx.update(posts).set({ likeCount: sql`${posts.likeCount} + 1` }).where(eq(posts.id, postId));
      }
      const [post] = await tx.select().from(posts).where(eq(posts.id, postId));
      if (post && post.userId !== userId) {
        const actionKey = `REACTION_RECEIVE_${reaction.toUpperCase()}`;
        try { await xpCloutService.awardPoints(post.userId, actionKey); }
        catch (err) { logger.error('XpCloutService', `Error awarding points for reaction:`, err); }
      }
    });
  }

  async removeReaction(userId: number, postId: number, reaction: string): Promise<void> {
    await db.transaction(async (tx) => {
      const deleteResult = await tx.delete(postReactions).where(and(eq(postReactions.userId, userId), eq(postReactions.postId, postId), eq(postReactions.reaction, reaction as any)));
      if (reaction === 'like') {
        await tx.update(posts).set({ likeCount: sql`${posts.likeCount} - 1` }).where(eq(posts.id, postId));
      }
      const [post] = await tx.select().from(posts).where(eq(posts.id, postId));
      if (deleteResult.rowCount > 0 && post && post.userId !== userId) {
        const actionKey = `REACTION_RECEIVE_${reaction.toUpperCase()}`;
        const values = await xpCloutService.getActionValues(actionKey);
        if (values) {
          const [author] = await tx.select().from(users).where(eq(users.id, post.userId));
          const xpToRemove = Math.min(values.xpValue, author?.xp || 0);
          const cloutToRemove = Math.min(values.cloutValue, author?.clout || 0);
          try {
            await tx.update(users).set({ xp: sql`${users.xp} - ${xpToRemove}`, clout: sql`${users.clout} - ${cloutToRemove}`, updatedAt: new Date() }).where(eq(users.id, post.userId));
            logger.info('XpCloutService', `Subtracted ${xpToRemove} XP and ${cloutToRemove} Clout from user ${post.userId} for reaction removal ${actionKey}`);
          } catch (updateError) { logger.error('XpCloutService', `Error subtracting points from user ${post.userId}:`, updateError); }
        }
      }
    });
  }

  async getNotifications(userId: number, limit = 20, offset = 0): Promise<Notification[]> {
    return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(limit).offset(offset);
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db.update(notifications).set({ isRead: true, readAt: new Date() }).where(eq(notifications.id, id));
  }

  async getEmojis(category?: string): Promise<CustomEmoji[]> {
    let query = db.select().from(customEmojis).where(eq(customEmojis.isDeleted, false));
    if (category) query = query.where(eq(customEmojis.category, category));
    return query.orderBy(customEmojis.name);
  }

  async getEmoji(id: number): Promise<CustomEmoji | undefined> {
    const [emoji] = await db.select().from(customEmojis).where(and(eq(customEmojis.id, id), eq(customEmojis.isDeleted, false)));
    return emoji;
  }

  async createEmoji(emoji: InsertCustomEmoji): Promise<CustomEmoji> {
    const [newEmoji] = await db.insert(customEmojis).values({ ...emoji, updatedAt: new Date() }).returning();
    return newEmoji;
  }

  async updateEmoji(id: number, emoji: Partial<CustomEmoji>): Promise<CustomEmoji> {
    const [updatedEmoji] = await db.update(customEmojis).set({ ...emoji, updatedAt: new Date() }).where(eq(customEmojis.id, id)).returning();
    return updatedEmoji;
  }

  async deleteEmoji(id: number): Promise<void> {
    await db.update(customEmojis).set({ isDeleted: true, deletedAt: new Date() }).where(eq(customEmojis.id, id));
  }

  async getAvailableEmojisForUser(userId: number): Promise<EmojiWithAvailability[]> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error("User not found");
    const allEmojis = await db.select().from(customEmojis).where(eq(customEmojis.isDeleted, false));
    const unlockedEmojiIds = user.unlockedEmojis || [];
    return allEmojis.map(emoji => {
      let isAvailable = !emoji.isLocked || emoji.unlockType === 'free' || unlockedEmojiIds.includes(emoji.id);
      let unlockRequirement = '';
      if (!isAvailable) {
        if (emoji.unlockType === 'path_xp') unlockRequirement = `Requires ${emoji.requiredPathXP} XP in ${emoji.requiredPath || 'unknown'} path`;
        else if (emoji.unlockType === 'shop') unlockRequirement = 'Available in the shop';
      }
      return { ...emoji, isAvailable, unlockRequirement: isAvailable ? undefined : unlockRequirement };
    });
  }

  async unlockEmojiForUser(userId: number, emojiId: number): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const [emoji] = await db.select().from(customEmojis).where(eq(customEmojis.id, emojiId));
    if (!user || !emoji || !emoji.isLocked) return;
    const unlockedEmojis = user.unlockedEmojis || [];
    if (unlockedEmojis.includes(emojiId)) return;
    await db.update(users).set({ unlockedEmojis: [...unlockedEmojis, emojiId], updatedAt: new Date() }).where(eq(users.id, userId));
  }

  async getUsersInGroup(groupId: number): Promise<User[]> {
    return db.select().from(users).where(eq(users.groupId, groupId));
  }

  async getUserGroups(): Promise<typeof userGroups.$inferSelect[]> {
    return db.select().from(userGroups).orderBy(userGroups.staffPriority);
  }

  async getUserGroup(id: number): Promise<typeof userGroups.$inferSelect | undefined> {
    const [group] = await db.select().from(userGroups).where(eq(userGroups.id, id));
    return group;
  }

  async getForumRules(section?: string, status?: string): Promise<ForumRule[]> {
    let query = db.select().from(forumRules).orderBy(forumRules.position);
    if (section) query = query.where(eq(forumRules.section, section));
    query = query.where(eq(forumRules.status, status || 'published' as any));
    return query;
  }

  async getForumRule(id: number): Promise<ForumRule | undefined> {
    const [rule] = await db.select().from(forumRules).where(eq(forumRules.id, id));
    return rule;
  }

  async createForumRule(rule: InsertForumRule & { createdBy?: number }): Promise<ForumRule> {
    const versionHash = Buffer.from(rule.content).toString('base64').substring(0, 20);
    const [newRule] = await db.insert(forumRules).values({ ...rule, lastAgreedVersionHash: versionHash, createdAt: new Date(), updatedAt: new Date() }).returning();
    return newRule;
  }

  async updateForumRule(id: number, rule: Partial<ForumRule> & { updatedBy?: number }): Promise<ForumRule> {
    let versionHash = rule.content ? Buffer.from(rule.content).toString('base64').substring(0, 20) : undefined;
    const [updatedRule] = await db.update(forumRules).set({ ...rule, ...(versionHash && { lastAgreedVersionHash: versionHash }), updatedAt: new Date() }).where(eq(forumRules.id, id)).returning();
    return updatedRule;
  }

  async deleteForumRule(id: number): Promise<void> {
    await db.delete(forumRules).where(eq(forumRules.id, id));
  }

  async getUserRuleAgreements(userId: number): Promise<UserRulesAgreement[]> {
    return db.select().from(userRulesAgreements).where(eq(userRulesAgreements.userId, userId));
  }

  async agreeToRule(userId: number, ruleId: number, versionHash: string): Promise<void> {
    const [existingAgreement] = await db.select().from(userRulesAgreements).where(and(eq(userRulesAgreements.userId, userId), eq(userRulesAgreements.ruleId, ruleId)));
    if (existingAgreement) {
      await db.update(userRulesAgreements).set({ versionHash, agreedAt: new Date() }).where(and(eq(userRulesAgreements.userId, userId), eq(userRulesAgreements.ruleId, ruleId)));
    } else {
      await db.insert(userRulesAgreements).values({ userId, ruleId, versionHash, agreedAt: new Date() });
    }
  }

  async getSiteSettings(): Promise<SiteSetting[]> {
    return db.select().from(siteSettings);
  }

  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting;
  }

  async setSiteSetting(key: string, value: string, valueType = 'string', group = 'general', description = '', isPublic = false): Promise<SiteSetting> {
    const existingSetting = await this.getSiteSetting(key);
    if (existingSetting) {
      const [updatedSetting] = await db.update(siteSettings).set({ value, valueType, group, description, isPublic, updatedAt: new Date() }).where(eq(siteSettings.key, key)).returning();
      return updatedSetting;
    } else {
      const [newSetting] = await db.insert(siteSettings).values({ key, value, valueType, group, description, isPublic, updatedAt: new Date() }).returning();
      return newSetting;
    }
  }

  async getPublicSiteSettings(): Promise<Record<string, any>> {
    const settings = await db.select().from(siteSettings).where(eq(siteSettings.isPublic, true));
    const result: Record<string, any> = {};
    settings.forEach(s => {
      let val = s.value;
      if (s.valueType === 'number') val = Number(s.value);
      else if (s.valueType === 'boolean') val = s.value === 'true';
      else if (s.valueType === 'json') try { val = JSON.parse(s.value || '{}'); } catch (e) { console.error(`Error parsing JSON for setting ${s.key}:`, e); val = {}; }
      result[s.key] = val;
    });
    return result;
  }

  async createUserGroup(group: typeof userGroups.$inferInsert): Promise<typeof userGroups.$inferSelect> {
    const [newGroup] = await db.insert(userGroups).values({ ...group, updatedAt: new Date() }).returning();
    return newGroup;
  }

  async updateUserGroup(id: number, data: Partial<typeof userGroups.$inferSelect>): Promise<typeof userGroups.$inferSelect> {
    const [updatedGroup] = await db.update(userGroups).set({ ...data, updatedAt: new Date() }).where(eq(userGroups.id, id)).returning();
    return updatedGroup;
  }

  async deleteUserGroup(id: number): Promise<void> {
    const [group] = await db.select().from(userGroups).where(eq(userGroups.id, id));
    if (group && group.isDefault) throw new Error("Cannot delete a default user group");
    const [defaultGroup] = await db.select().from(userGroups).where(eq(userGroups.isDefault, true));
    if (defaultGroup) await db.update(users).set({ groupId: defaultGroup.id }).where(eq(users.groupId, id));
    await db.delete(userGroups).where(eq(userGroups.id, id));
  }

  async getProducts(category?: string): Promise<Product[]> {
    let query = db.select({
      id: products.id, name: products.name, description: products.description, price: products.price,
      pointsPrice: products.pointsPrice, stock: products.stock, isDeleted: products.isDeleted,
      categoryId: products.categoryId, availableFrom: products.availableFrom, availableUntil: products.availableUntil,
      stockLimit: products.stockLimit, status: products.status, featuredUntil: products.featuredUntil,
      promotionLabel: products.promotionLabel, metadata: products.metadata
    }).from(products).where(eq(products.isDeleted, false));
    if (category) {
      const [catObj] = await db.select().from(productCategories).where(eq(productCategories.name, category));
      if (catObj) query = query.where(eq(products.categoryId, catObj.id));
    }
    return query.orderBy(products.name) as unknown as Promise<Product[]>; // Cast needed
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select({
      id: products.id, name: products.name, description: products.description, price: products.price,
      pointsPrice: products.pointsPrice, stock: products.stock, isDeleted: products.isDeleted,
      categoryId: products.categoryId, availableFrom: products.availableFrom, availableUntil: products.availableUntil,
      stockLimit: products.stockLimit, status: products.status, featuredUntil: products.featuredUntil,
      promotionLabel: products.promotionLabel, metadata: products.metadata
    }).from(products).where(and(eq(products.id, id), eq(products.isDeleted, false)));
    return product as Product | undefined; // Cast needed
  }

  async createProduct(productData: typeof products.$inferInsert): Promise<Product> {
    const [newProduct] = await db.insert(products).values({ ...productData, updatedAt: new Date() }).returning();
    return newProduct;
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    const [updatedProduct] = await db.update(products).set({ ...data, updatedAt: new Date() }).where(eq(products.id, id)).returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.update(products).set({ isDeleted: true, deletedAt: new Date() }).where(eq(products.id, id));
  }

  async purchaseProduct(userId: number, productId: number, quantity = 1): Promise<Order> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const [product] = await db.select().from(products).where(eq(products.id, productId));
    if (!user || !product) throw new Error("User or product not found");
    if (product.stock !== null && product.stock < quantity) throw new Error("Not enough product in stock");
    const totalPrice = product.price * quantity;
    if (user.dgtWalletBalance < totalPrice) throw new Error("Insufficient wallet balance");

    return db.transaction(async (tx) => {
      await tx.update(users).set({ dgtWalletBalance: user.dgtWalletBalance - totalPrice, updatedAt: new Date() }).where(eq(users.id, userId));
      if (product.stock !== null) await tx.update(products).set({ stock: product.stock - quantity, updatedAt: new Date() }).where(eq(products.id, productId));
      const [order] = await tx.insert(orders).values({
        userId, status: 'completed', totalAmount: totalPrice, paymentMethod: 'wallet',
        notes: `Purchase of ${quantity} x ${product.name}`, updatedAt: new Date()
      }).returning();
      await tx.insert(orderItems).values({ orderId: order.id, productId, quantity, price: product.price, discount: 0 });
      await tx.insert(inventoryTransactions).values({
        productId, type: 'sale', quantity: -quantity, reference: `Order #${order.id}`, createdBy: userId
      });
      if (product.pluginReward) {
        if (product.pluginReward.emojiUnlocks) {
          const emojiIds = product.pluginReward.emojiUnlocks; const currentUnlocks = user.unlockedEmojis || [];
          await tx.update(users).set({ unlockedEmojis: [...new Set([...currentUnlocks, ...emojiIds])] }).where(eq(users.id, userId));
        }
        if (product.pluginReward.stickerUnlocks) {
          const stickerIds = product.pluginReward.stickerUnlocks; const currentUnlocks = user.unlockedStickers || [];
          await tx.update(users).set({ unlockedStickers: [...new Set([...currentUnlocks, ...stickerIds])] }).where(eq(users.id, userId));
        }
        if (product.pluginReward.badgeUnlocks) {
          const badgeIds = product.pluginReward.badgeUnlocks; const currentUnlocks = user.unlockedBadges || [];
          await tx.update(users).set({ unlockedBadges: [...new Set([...currentUnlocks, ...badgeIds])] }).where(eq(users.id, userId));
        }
        if (product.pluginReward.titleUnlocks) {
          const titleIds = product.pluginReward.titleUnlocks; const currentUnlocks = user.unlockedTitles || [];
          await tx.update(users).set({ unlockedTitles: [...new Set([...currentUnlocks, ...titleIds])] }).where(eq(users.id, userId));
        }
        if (product.pluginReward.xpGrant) {
          const xpAmount = product.pluginReward.xpGrant.amount || 0; const pathId = product.pluginReward.xpGrant.pathId;
          if (xpAmount > 0) await this.addUserXp(userId, xpAmount, pathId); // `this` might be an issue in tx, ensure context
        }
      }
      return order;
    });
  }

  async getConversations(userId: number): Promise<(Conversation & { participants: ConversationParticipant[] })[]> {
    const userConvoIds = (await db.select({ conversationId: conversationParticipants.conversationId }).from(conversationParticipants).where(and(eq(conversationParticipants.userId, userId), eq(conversationParticipants.isActive, true)))).map(c => c.conversationId);
    if (userConvoIds.length === 0) return [];
    const rows = await db.select({ conversation: conversations, participant: conversationParticipants, participantUser: users }).from(conversations)
      .innerJoin(conversationParticipants, eq(conversations.id, conversationParticipants.conversationId))
      .innerJoin(users, eq(conversationParticipants.userId, users.id))
      .where(inArray(conversations.id, userConvoIds)).orderBy(desc(conversations.lastMessageAt));
    const map = new Map<number, Conversation & { participants: ConversationParticipant[] }>();
    for (const row of rows) {
      if (!map.has(row.conversation.id)) map.set(row.conversation.id, { ...row.conversation, participants: [] });
      map.get(row.conversation.id)!.participants.push({ ...row.participant, user: row.participantUser } as unknown as ConversationParticipant);
    }
    return Array.from(map.values());
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  async createConversation(data: { title?: string, isGroup: boolean, createdBy: number, participants: number[] }): Promise<Conversation> {
    return db.transaction(async (tx) => {
      const [conversation] = await tx.insert(conversations).values({ title: data.title, isGroup: data.isGroup, createdBy: data.createdBy, updatedAt: new Date(), lastMessageAt: new Date() }).returning();
      const uniqueParticipants = [...new Set([data.createdBy, ...data.participants])];
      for (const userId of uniqueParticipants) {
        await tx.insert(conversationParticipants).values({ conversationId: conversation.id, userId, isAdmin: userId === data.createdBy, lastReadAt: new Date() });
      }
      if (data.isGroup) await tx.insert(messages).values({ conversationId: conversation.id, senderId: data.createdBy, content: 'Created this group conversation', systemMessageType: 'group_created' });
      return conversation;
    });
  }

  async getMessages(conversationId: number, limit = 20, offset = 0): Promise<(Message & { sender: User })[]> {
    return db.select({ ...messages, sender: users }).from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(and(eq(messages.conversationId, conversationId), eq(messages.isDeleted, false)))
      .orderBy(desc(messages.createdAt)).limit(limit).offset(offset) as unknown as Promise<(Message & { sender: User })[]>; // Cast needed
  }

  async sendMessage(data: { conversationId: number, senderId: number, content: string, attachmentUrl?: string, attachmentType?: string }): Promise<Message> {
    return db.transaction(async (tx) => {
      const [message] = await tx.insert(messages).values({ conversationId: data.conversationId, senderId: data.senderId, content: data.content, attachmentUrl: data.attachmentUrl, attachmentType: data.attachmentType }).returning();
      await tx.update(conversations).set({ lastMessageAt: message.createdAt, updatedAt: new Date() }).where(eq(conversations.id, data.conversationId));
      await tx.insert(messageReads).values({ messageId: message.id, userId: data.senderId });
      const participants = await tx.select().from(conversationParticipants).where(and(eq(conversationParticipants.conversationId, data.conversationId), ne(conversationParticipants.userId, data.senderId), eq(conversationParticipants.isActive, true), eq(conversationParticipants.isMuted, false)));
      const [sender] = await tx.select().from(users).where(eq(users.id, data.senderId));
      const [conversation] = await tx.select().from(conversations).where(eq(conversations.id, data.conversationId));
      for (const p of participants) {
        await tx.insert(notifications).values({
          userId: p.userId, type: 'private_message', title: conversation.isGroup ? `New message in ${conversation.title || 'group'}` : `New message from ${sender.username}`,
          body: data.content.substring(0, 100) + (data.content.length > 100 ? '...' : ''),
          data: { conversationId: data.conversationId, messageId: message.id, senderId: data.senderId }, isRead: false
        });
      }
      return message;
    });
  }

  async markMessagesAsRead(conversationId: number, userId: number): Promise<void> {
    await db.transaction(async (tx) => {
      const unread = await tx.select({ id: messages.id }).from(messages).leftJoin(messageReads, and(eq(messages.id, messageReads.messageId), eq(messageReads.userId, userId))).where(and(eq(messages.conversationId, conversationId), isNull(messageReads.messageId)));
      for (const msg of unread) await tx.insert(messageReads).values({ messageId: msg.id, userId }).onConflictDoNothing();
      await tx.update(conversationParticipants).set({ lastReadAt: new Date() }).where(and(eq(conversationParticipants.conversationId, conversationId), eq(conversationParticipants.userId, userId)));
    });
  }

  async addUserXp(userId: number, amount: number, path?: string): Promise<void> {
    if (amount <= 0) return;
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error("User not found");
    await db.transaction(async (tx) => {
      await tx.update(users).set({ xp: sql`${users.xp} + ${amount}` }).where(eq(users.id, userId));
      if (path) {
        const pathXp = user.pathXp || {}; const currentPathXp = pathXp[path] || 0;
        const multiplier = (user.pathMultipliers || {})[path] || 1;
        const adjustedAmount = Math.floor(amount * multiplier);
        const newPathXp = { ...pathXp, [path]: currentPathXp + adjustedAmount };
        await tx.update(users).set({ pathXp: newPathXp }).where(eq(users.id, userId));
        await this.recalculateUserPathMultipliers(userId); // `this` might be an issue in tx
        const emojiUnlocks = await tx.select().from(customEmojis).where(and(eq(customEmojis.isLocked, true), eq(customEmojis.unlockType, 'path_xp'), eq(customEmojis.requiredPath, path), lte(customEmojis.requiredPathXP, newPathXp[path])));
        if (emojiUnlocks.length > 0) {
          const currentUnlocks = user.unlockedEmojis || [];
          const newUnlocks = emojiUnlocks.map(e => e.id).filter(id => !currentUnlocks.includes(id));
          if (newUnlocks.length > 0) {
            await tx.update(users).set({ unlockedEmojis: [...currentUnlocks, ...newUnlocks] }).where(eq(users.id, userId));
            for (const emojiId of newUnlocks) {
              const emoji = emojiUnlocks.find(e => e.id === emojiId);
              if (emoji) await tx.insert(notifications).values({ userId, type: 'achievement', title: `New Emoji Unlocked: ${emoji.name}`, body: `You've unlocked ${emoji.name} by reaching ${newPathXp[path]} XP in ${path}!`, data: { emojiId }, isRead: false });
            }
          }
        }
      }
    });
  }

  async getUserPathXp(userId: number, path?: string): Promise<Record<string, number>> {
    const [user] = await db.select({ pathXp: users.pathXp }).from(users).where(eq(users.id, userId));
    if (!user) throw new Error("User not found");
    const pathXp = user.pathXp || {};
    return path ? { [path]: pathXp[path] || 0 } : pathXp;
  }

  async recalculateUserPathMultipliers(userId: number): Promise<Record<string, number>> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error("User not found");
    const pathXpData = user.pathXp || {}; const currentMultipliers = user.pathMultipliers || {};
    let newMultipliers = { ...currentMultipliers }; let multiplierChanged = false;
    Object.entries(pathXpData).forEach(([path, xpValue]) => {
      let newMultiplier = 1;
      if (typeof xpValue === 'number') {
        if (xpValue >= 5000) newMultiplier = 1.5;
        else if (xpValue >= 2500) newMultiplier = 1.3;
        else if (xpValue >= 1000) newMultiplier = 1.2;
      }
      if (newMultiplier !== (currentMultipliers[path] || 1)) {
        newMultipliers[path] = newMultiplier; multiplierChanged = true;
      }
    });
    if (multiplierChanged) {
      await db.update(users).set({ pathMultipliers: newMultipliers }).where(eq(users.id, userId));
      const changedPaths = Object.entries(newMultipliers).filter(([p, m]) => m !== (currentMultipliers[p] || 1)).map(([p, m]) => ({ path: p, multiplier: m }));
      for (const { path, multiplier } of changedPaths) {
        await db.insert(notifications).values({ userId, type: 'achievement', title: `XP Multiplier Increased for ${path}`, body: `You now earn ${multiplier}x XP in ${path}!`, data: { path, multiplier }, isRead: false });
      }
    }
    return newMultipliers;
  }

  async getUserInventory(userId: number): Promise<UserInventoryItem[]> {
    return db.select({
      id: userInventory.id, userId: userInventory.userId, productId: userInventory.productId, quantity: userInventory.quantity,
      isEquipped: userInventory.isEquipped, acquiredAt: userInventory.acquiredAt, expiresAt: userInventory.expiresAt,
      lastUsedAt: userInventory.lastUsedAt, transactionId: userInventory.transactionId, metadata: userInventory.metadata
    }).from(userInventory).where(eq(userInventory.userId, userId)).orderBy(userInventory.acquiredAt) as unknown as Promise<UserInventoryItem[]>; // Cast needed
  }

  async checkUserOwnsProduct(userId: number, productId: number): Promise<boolean> {
    const [item] = await db.select({ id: userInventory.id }).from(userInventory).where(and(eq(userInventory.userId, userId), eq(userInventory.productId, productId)));
    return !!item;
  }

  async addProductToUserInventory(item: InsertUserInventoryItem): Promise<UserInventoryItem> {
    let transactionId: number | null = item.transactionId === undefined ? (await db.insert(inventoryTransactions).values({ userId: item.userId, productId: item.productId, transactionType: 'PURCHASE', amount: item.quantity || 1, currency: 'DGT', currencyAmount: 0, status: 'completed' }).returning())[0].id : item.transactionId;
    const existingItem = await this.checkUserOwnsProduct(item.userId, item.productId);
    if (existingItem) {
      const [updatedItem] = await db.update(userInventory).set({ quantity: sql`${userInventory.quantity} + ${item.quantity || 1}`, lastUsedAt: new Date() }).where(and(eq(userInventory.userId, item.userId), eq(userInventory.productId, item.productId))).returning();
      return updatedItem;
    } else {
      const [inventoryItem] = await db.insert(userInventory).values({ ...item, transactionId, acquiredAt: new Date() }).returning();
      return inventoryItem;
    }
  }

  async updateUserInventoryItem(userId: number, productId: number, updates: Partial<UserInventoryItem>): Promise<UserInventoryItem | undefined> {
    const [updatedItem] = await db.update(userInventory).set(updates).where(and(eq(userInventory.userId, userId), eq(userInventory.productId, productId))).returning();
    return updatedItem;
  }

  async createInventoryTransaction(data: { userId: number; productId: number; transactionType: string; amount: number; currency: string; currencyAmount: number; status?: string; metadata?: Record<string, any>; }): Promise<typeof inventoryTransactions.$inferSelect> {
    const [transaction] = await db.insert(inventoryTransactions).values({ ...data, status: data.status || 'completed', metadata: data.metadata || {}, createdAt: new Date() }).returning();
    return transaction;
  }
}

export const storage = new DatabaseStorage();
