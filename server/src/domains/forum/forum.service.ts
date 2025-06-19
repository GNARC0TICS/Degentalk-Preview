// TODO: @syncSchema threads
// TODO: @syncSchema posts
// TODO: @syncSchema content_visibility_status_enum
import { db } from '@db';
import { logger } from '@server/src/core/logger';
import {
	forumCategories,
	threads,
	posts,
	users as usersTable, // Alias users
	threadPrefixes,
	tags,
	threadTags,
	postReactions, // Added import for postReactions
	// Removed 'users' as it's covered by usersTable alias
} from '@schema';
import { sql, desc, asc, and, eq, isNull, count, ilike, or, inArray, SQL } from 'drizzle-orm';
import type { ForumCategoryWithStats, ThreadWithUser, ThreadWithPostsAndUser, PostWithUser, ThreadWithUserAndCategory } from '../../../../db/types/forum.types.ts';
import type { User, ForumCategory as ForumCategorySchemaType, Post as PostSchemaType } from '@schema';
import type { InferSelectModel } from 'drizzle-orm'; // For inferring types
import { forumMap, type Forum as ConfigForum, type Zone as ConfigZone } from '@/config/forumMap.config';

// Helper to parse configZoneType from pluginData
const parseZoneType = (pluginData: unknown): 'primary' | 'general' => {
	if (pluginData && typeof pluginData === 'object' && pluginData !== null && 'configZoneType' in pluginData) {
		const t = (pluginData as { configZoneType?: string }).configZoneType;
		if (t === 'primary') {
			return 'primary';
		} else if (t === 'general') {
			return 'general';
		}
		logger.warn('ForumService', 'Malformed configZoneType in pluginData', { pluginDataValue: t, defaultingTo: 'general' });
		return 'general'; // Default for malformed but existing type
	}
	// Log missing configZoneType or entirely missing pluginData
	if (pluginData && typeof pluginData === 'object' && pluginData !== null && !('configZoneType' in pluginData)) {
		logger.warn('ForumService', 'Missing configZoneType in pluginData', { pluginDataKeys: Object.keys(pluginData), defaultingTo: 'general' });
	} else if (!pluginData || (typeof pluginData === 'object' && pluginData === null)) { // Check for null explicitly
		logger.warn('ForumService', 'Missing or null pluginData for zone', { defaultingTo: 'general' });
	}
	return 'general'; // Default to 'general' if missing or malformed
};

// Simple in-memory cache
const CACHE_DURATION_MS = 30 * 1000; // 30 seconds
let categoriesCache: {
	timestamp: number;
	data: ForumCategoryWithStats[];
} | null = null;

type ThreadPrefixType = InferSelectModel<typeof threadPrefixes>;

type CategoryWithCountsResult = {
	id: number;
	name: string;
	slug: string;
	description: string | null;
	parentForumSlug: string | null;
	parentId: number | null;
	type: string;
	position: number;
	isVip: boolean;
	isLocked: boolean;
	minXp: number;
	color: string;
	icon: string;
	colorTheme: string | null;
	isHidden: boolean;
	minGroupIdRequired: number | null;
	tippingEnabled: boolean;
	xpMultiplier: number;
	pluginData: unknown; // Changed to unknown to match Drizzle's jsonb inference
	createdAt: Date;
	updatedAt: Date;
	threadCount: number | null;
	postCount: number | null;
};

export interface ThreadSearchParams {
	categoryId?: number;
	prefix?: string;
	tag?: string;
	page?: number;
	limit?: number;
	sortBy?: 'latest' | 'hot' | 'staked' | 'popular' | 'recent';
	search?: string;
}

interface CategoriesTreeOptions {
	includeEmptyStats?: boolean;
	includeHidden?: boolean;
}

// Helper function to get all descendant leaf forum IDs for a given category ID
async function getAllDescendantLeafForumIds(startCategoryId: number): Promise<number[]> {
	const allCategories = await db.select({
		id: forumCategories.id,
		parentId: forumCategories.parentId,
		type: forumCategories.type
	}).from(forumCategories);

	const categoryMap = new Map<number, { id: number; parentId: number | null; type: string; children: number[] }>();
	allCategories.forEach(c => {
		categoryMap.set(c.id, { ...c, children: [] });
	});
	allCategories.forEach(c => {
		if (c.parentId && categoryMap.has(c.parentId)) {
			categoryMap.get(c.parentId)?.children.push(c.id);
		}
	});

	const leafForumIds: number[] = [];
	const queue: number[] = [startCategoryId];
	const visited = new Set<number>();

	while (queue.length > 0) {
		const currentId = queue.shift()!;
		if (visited.has(currentId)) continue;
		visited.add(currentId);

		const categoryNode = categoryMap.get(currentId);
		if (!categoryNode) continue;

		const isLeafForum = categoryNode.type === 'forum' &&
			!categoryNode.children.some(childId => categoryMap.get(childId)?.type === 'forum');

		if (isLeafForum) {
			leafForumIds.push(currentId);
		} else {
			categoryNode.children.forEach(childId => {
				if (!visited.has(childId)) {
					queue.push(childId);
				}
			});
		}
	}
	const startCategoryNode = categoryMap.get(startCategoryId);
	if (startCategoryNode && startCategoryNode.type === 'forum' && startCategoryNode.children.length === 0 && !leafForumIds.includes(startCategoryId)) {
		leafForumIds.push(startCategoryId);
	}

	return [...new Set(leafForumIds)]; // Ensure unique IDs
}


export const forumService = {
	async getForumStructure(): Promise<{
		zones: ForumCategoryWithStats[];
	}> {
		try {
			const allItemsFlat: ForumCategoryWithStats[] = await this.getCategoriesWithStats(true);

			const zoneEntities = allItemsFlat.filter(item => item.type === 'zone');
			const allForumLikeEntities = allItemsFlat.filter(item => item.type === 'forum');

			type MappedForum = ForumCategoryWithStats & {
				ownThreadCount?: number;
				ownPostCount?: number;
			};
			const forumMap = new Map<number, MappedForum>();

			allForumLikeEntities.forEach(f => {
				forumMap.set(f.id, {
					...f,
					childForums: [],
					ownThreadCount: f.threadCount,
					ownPostCount: f.postCount
				});
			});

			allForumLikeEntities.forEach(potentialSubForum => {
				if (potentialSubForum.parentId) {
					const parentForumFromMap = forumMap.get(potentialSubForum.parentId);
					const parentEntityInFlatList = allItemsFlat.find(item => item.id === potentialSubForum.parentId);

					if (parentForumFromMap && parentEntityInFlatList && parentEntityInFlatList.type === 'forum') {
						if (!parentForumFromMap.childForums) {
							parentForumFromMap.childForums = [];
						}
						parentForumFromMap.childForums.push(forumMap.get(potentialSubForum.id)! as ForumCategoryWithStats);
					}
				}
			});

			Array.from(forumMap.values()).forEach(parentForum => {
				if (parentForum.childForums && parentForum.childForums.length > 0) {
					let aggregatedThreadCount = parentForum.ownThreadCount || 0;
					let aggregatedPostCount = parentForum.ownPostCount || 0;

					parentForum.childForums.forEach(subForum => {
						aggregatedThreadCount += subForum.threadCount || 0;
						aggregatedPostCount += subForum.postCount || 0;
					});
					parentForum.threadCount = aggregatedThreadCount;
					parentForum.postCount = aggregatedPostCount;
				}
			});

			const structuredZones = zoneEntities.map(zone => {
				const determinedType = parseZoneType(zone.pluginData);
				const isActuallyPrimary = determinedType === 'primary';

				const pd = zone.pluginData && typeof zone.pluginData === 'object' ? zone.pluginData : {};
				const features = Array.isArray(pd.features) ? pd.features : [];
				const customComponents = Array.isArray(pd.customComponents) ? pd.customComponents : [];
				const staffOnly = typeof pd.staffOnly === 'boolean' ? pd.staffOnly : false;

				const topLevelForumsForZone = Array.from(forumMap.values()).filter(
					forumInMap => forumInMap.parentId === zone.id
				);

				let zoneThreadCount = 0;
				let zonePostCount = 0;
				topLevelForumsForZone.forEach(forum => {
					zoneThreadCount += forum.threadCount || 0;
					zonePostCount += forum.postCount || 0;
				});

				return {
					...zone,
					isPrimary: isActuallyPrimary,
					features,
					customComponents,
					staffOnly,
					forums: topLevelForumsForZone,
					childForums: topLevelForumsForZone,
					threadCount: zoneThreadCount,
					postCount: zonePostCount,
				};
			});

			return {
				zones: structuredZones,
			};
		} catch (error) {
			logger.error('ForumService', 'Error in getForumStructure', { err: error });
			throw error;
		}
	},

	async getCategoriesWithStats(includeCounts: boolean = true): Promise<ForumCategoryWithStats[]> {
		try {
			if (includeCounts && categoriesCache && (Date.now() - categoriesCache.timestamp < CACHE_DURATION_MS) && categoriesCache.data.length > 0) {
				return categoriesCache.data;
			}

			let categoriesDataRaw: CategoryWithCountsResult[];

			if (includeCounts) {
				const threadCountsSubquery = db.$with('thread_counts').as(
					db.select({
						categoryId: threads.categoryId,
						count: sql<number>`count(DISTINCT ${threads.id})`.as('thread_count')
					}).from(threads)
						.where(eq(threads.isDeleted, false))
						.groupBy(threads.categoryId)
				);

				const postCountsSubquery = db.$with('post_counts').as(
					db.select({
						categoryId: threads.categoryId,
						count: sql<number>`count(${posts.id})`.as('post_count')
					}).from(posts)
						.innerJoin(threads, eq(posts.threadId, threads.id))
						.where(and(eq(posts.isDeleted, false), eq(threads.isDeleted, false)))
						.groupBy(threads.categoryId)
				);

				categoriesDataRaw = await db
					.with(threadCountsSubquery, postCountsSubquery)
					.select({
						id: forumCategories.id,
						name: forumCategories.name,
						slug: forumCategories.slug,
						description: forumCategories.description,
						parentForumSlug: forumCategories.parentForumSlug,
						parentId: forumCategories.parentId,
						type: forumCategories.type,
						position: forumCategories.position,
						isVip: forumCategories.isVip,
						isLocked: forumCategories.isLocked,
						minXp: forumCategories.minXp,
						color: forumCategories.color,
						icon: forumCategories.icon,
						colorTheme: forumCategories.colorTheme,
						isHidden: forumCategories.isHidden,
						minGroupIdRequired: forumCategories.minGroupIdRequired,
						tippingEnabled: forumCategories.tippingEnabled,
						xpMultiplier: forumCategories.xpMultiplier,
						pluginData: forumCategories.pluginData,
						createdAt: forumCategories.createdAt,
						updatedAt: forumCategories.updatedAt,
						threadCount: threadCountsSubquery.count,
						postCount: postCountsSubquery.count
					})
					.from(forumCategories)
					.leftJoin(threadCountsSubquery, eq(forumCategories.id, threadCountsSubquery.categoryId))
					.leftJoin(postCountsSubquery, eq(forumCategories.id, postCountsSubquery.categoryId))
					.orderBy(asc(forumCategories.position));

			} else {
				categoriesDataRaw = await db
					.select({
						id: forumCategories.id,
						name: forumCategories.name,
						slug: forumCategories.slug,
						description: forumCategories.description,
						parentForumSlug: forumCategories.parentForumSlug,
						parentId: forumCategories.parentId,
						type: forumCategories.type,
						position: forumCategories.position,
						isVip: forumCategories.isVip,
						isLocked: forumCategories.isLocked,
						minXp: forumCategories.minXp,
						color: forumCategories.color,
						icon: forumCategories.icon,
						colorTheme: forumCategories.colorTheme,
						isHidden: forumCategories.isHidden,
						minGroupIdRequired: forumCategories.minGroupIdRequired,
						tippingEnabled: forumCategories.tippingEnabled,
						xpMultiplier: forumCategories.xpMultiplier,
						pluginData: forumCategories.pluginData,
						createdAt: forumCategories.createdAt,
						updatedAt: forumCategories.updatedAt,
						threadCount: sql<null>`null`.as('threadCount'),
						postCount: sql<null>`null`.as('postCount')
					})
					.from(forumCategories)
					.orderBy(asc(forumCategories.position));
			}

			const categories: ForumCategoryWithStats[] = categoriesDataRaw.map(
				(c: CategoryWithCountsResult): ForumCategoryWithStats => ({
					...c,
					description: c.description ?? null,
					parentForumSlug: c.parentForumSlug ?? null,
					colorTheme: c.colorTheme ?? null,
					pluginData: (c.pluginData && typeof c.pluginData === 'object' ? c.pluginData : {}) as Record<string, unknown>,
					threadCount: includeCounts ? Number(c.threadCount || 0) : 0,
					postCount: includeCounts ? Number(c.postCount || 0) : 0,
					isZone: c.type === 'zone',
					canonical: c.type === 'zone' && !c.parentId,
					lastThread: undefined,
					canHaveThreads: c.type === 'forum',
					childForums: [],
				})
			);

			if (includeCounts && categories.length > 0) {
				categoriesCache = {
					timestamp: Date.now(),
					data: categories,
				};
			}
			return categories;
		} catch (error) {
			logger.error('ForumService', 'Error in getCategoriesWithStats', { err: error, includeCounts });
			throw error;
		}
	},

	async getCategoriesTree(options: CategoriesTreeOptions = {}): Promise<Array<ForumCategoryWithStats & { children: Array<ForumCategoryWithStats & { children: unknown[] }> }>> {
		const { includeEmptyStats = false, includeHidden = false } = options;
		const allCategories = await this.getCategoriesWithStats(true);
		if (!allCategories || !Array.isArray(allCategories)) { return []; }

		let processedCategories = allCategories.filter(cat => cat && typeof cat === 'object' && cat.id !== undefined);

		if (!includeHidden) {
			processedCategories = processedCategories.filter(cat => !cat.isHidden);
		}

		const categoriesWithStats = includeEmptyStats
			? processedCategories.map(cat => ({ ...cat, threadCount: Number(cat.threadCount || 0), postCount: Number(cat.postCount || 0) }))
			: processedCategories;

		const categoryMap = new Map<number, ForumCategoryWithStats & { children: Array<ForumCategoryWithStats & { children: unknown[] }> }>();
		const tree: Array<ForumCategoryWithStats & { children: Array<ForumCategoryWithStats & { children: unknown[] }> }> = [];

		categoriesWithStats.forEach(category => {
			categoryMap.set(category.id, { ...category, children: [] });
		});

		categoriesWithStats.forEach(category => {
			const mappedCategory = categoryMap.get(category.id);
			if (!mappedCategory) return;

			if (category.parentId && categoryMap.has(category.parentId)) {
				const parent = categoryMap.get(category.parentId);
				if (parent) {
					parent.children.push(mappedCategory);
				}
			} else if (!category.parentId) {
				tree.push(mappedCategory);
			}
		});
		return tree;
	},

	async getForumBySlug(slug: string): Promise<ForumCategoryWithStats | null> {
		// --- CONFIG-FIRST ENFORCEMENT ----------------------------------
		const entry = forumMap.getForumBySlug?.(slug);
		if (!entry) {
			return null;
		}
		const { forum, zone } = entry as { forum: ConfigForum; zone: ConfigZone };
		// Map minimal fields expected by legacy consumers. Values not present in
		// the static config are filled with sensible defaults so downstream DB-heavy
		// code continues to compile while we migrate.
		const baseColor = forum.themeOverride?.color || zone.theme.color;
		const baseIcon = zone.theme.icon;
		const baseColorTheme = forum.themeOverride?.colorTheme || zone.theme.colorTheme;

		const mapForum = (f: ConfigForum, parentId: number | null = null): ForumCategoryWithStats => ({
			id: 0, // 0 indicates config-only entity (no DB row)
			name: f.name,
			slug: f.slug,
			description: f.description ?? null,
			parentForumSlug: parentId ? (forum.slug) : null,
			parentId,
			type: 'forum',
			position: f.position ?? 0,
			isVip: false,
			isLocked: false,
			minXp: f.rules.minXpRequired ?? 0,
			color: f.themeOverride?.color || baseColor,
			icon: baseIcon,
			colorTheme: f.themeOverride?.colorTheme || baseColorTheme,
			isHidden: false,
			minGroupIdRequired: null,
			tippingEnabled: f.rules.tippingEnabled,
			xpMultiplier: f.rules.xpMultiplier ?? 1,
			pluginData: f.rules,
			createdAt: new Date(),
			updatedAt: new Date(),
			threadCount: 0,
			postCount: 0,
			childForums: Array.isArray(f.forums) ? f.forums.map(sf => mapForum(sf, 0)) : [],
		});

		return mapForum(forum);
	},

	async getForumAndItsSubForumsBySlug(slug: string): Promise<{
		forum: ForumCategoryWithStats | null;
	}> {
		const forum = await this.getForumBySlug(slug);
		return { forum };
	},

	async getForumById(id: number): Promise<ForumCategoryWithStats | null> {
		const { zones } = await this.getForumStructure();
		for (const zone of zones) {
			for (const parentForum of zone.childForums || []) {
				if (parentForum.id === id) {
					return parentForum;
				}
				if (parentForum.childForums) {
					const subForum = parentForum.childForums.find(sf => sf.id === id);
					if (subForum) {
						return subForum;
					}
				}
			}
		}
		return null;
	},

	async getSubForumsByParentForumId(parentForumId: number): Promise<ForumCategoryWithStats[]> {
		const parentForum = await this.getForumById(parentForumId);
		return parentForum?.childForums || [];
	},

	async debugForumRelationships(): Promise<{
		zones: Array<{
			id: number; name: string; slug: string; isPrimary: boolean;
			forums: Array<{
				id: number; name: string; slug: string; parentId: number | null;
				subForums: Array<{ id: number; name: string; slug: string; parentId: number | null; }>
			}>
		}>;
	}> {
		try {
			const { zones: structuredZones } = await this.getForumStructure();
			const result = structuredZones.map(zone => ({
				id: zone.id,
				name: zone.name,
				slug: zone.slug,
				isPrimary: zone.isPrimary || false,
				forums: (zone.childForums || []).map(parentForum => ({
					id: parentForum.id,
					name: parentForum.name,
					slug: parentForum.slug,
					parentId: parentForum.parentId,
					subForums: (parentForum.childForums || []).map(subForum => ({
						id: subForum.id,
						name: subForum.name,
						slug: subForum.slug,
						parentId: subForum.parentId,
					})),
				})),
			}));
			return { zones: result };
		} catch (error) {
			logger.error('ForumService', 'Error in debugForumRelationships', { err: error });
			throw error;
		}
	},

	async getPrefixes(forumId?: number): Promise<ThreadPrefixType[]> {
		if (forumId) {
			return db.select().from(threadPrefixes).where(and(eq(threadPrefixes.isActive, true), or(isNull(threadPrefixes.categoryId), eq(threadPrefixes.categoryId, forumId)))).orderBy(asc(threadPrefixes.position));
		} else {
			return db.select().from(threadPrefixes).where(eq(threadPrefixes.isActive, true)).orderBy(asc(threadPrefixes.position));
		}
	},
	async getTags(): Promise<Array<typeof tags.$inferSelect>> { return db.select().from(tags).orderBy(asc(tags.name)); },

	async searchThreads(params: ThreadSearchParams): Promise<{
		threads: ThreadWithUser[];
		pagination: { page: number; limit: number; totalThreads: number; totalPages: number };
	}> {
		const { categoryId, prefix, tag, page = 1, limit: requestedLimitParam = 10, sortBy = 'latest', search } = params;
		const currentThreadLimit = requestedLimitParam;
		const offset = (page - 1) * currentThreadLimit;
		const conditions: (SQL<unknown> | undefined)[] = [eq(threads.isDeleted, false), eq(threads.isHidden, false)];

		if (categoryId) {
			const descendantLeafForumIds = await getAllDescendantLeafForumIds(categoryId);
			if (descendantLeafForumIds.length > 0) {
				conditions.push(inArray(threads.categoryId, descendantLeafForumIds));
			} else {
				conditions.push(sql`1 = 0`); // No threads if no leaf forums
			}
		}

		if (prefix) { const prefixResult = await db.select({ id: threadPrefixes.id }).from(threadPrefixes).where(eq(threadPrefixes.name, prefix)).limit(1); if (prefixResult.length > 0) conditions.push(eq(threads.prefixId, prefixResult[0].id)); }
		let tagIdNum: number | undefined;
		if (tag) { const tagResult = await db.select({ id: tags.id }).from(tags).where(eq(tags.name, tag)).limit(1); if (tagResult.length > 0) tagIdNum = tagResult[0].id; }
		if (search) conditions.push(or(ilike(threads.title, `%${search}%`)));
		let orderByClause: (SQL<unknown> | SQL.Aliased<unknown>)[] = [desc(threads.isSticky), desc(threads.createdAt)];
		switch (sortBy) { case 'hot': orderByClause = [desc(threads.isSticky), desc(threads.hotScore), desc(threads.lastPostAt)]; break; case 'staked': orderByClause = [desc(threads.isSticky), desc(threads.dgtStaked), desc(threads.lastPostAt)]; break; case 'popular': orderByClause = [desc(threads.isSticky), desc(threads.postCount), desc(threads.lastPostAt)]; break; case 'recent': orderByClause = [desc(threads.isSticky), desc(threads.lastPostAt)]; break; case 'latest': orderByClause = [desc(threads.isSticky), desc(threads.createdAt)]; break; }

		const selectFields = { threadData: threads, userData: usersTable };
		const validConditions = conditions.filter((c) => c !== undefined) as SQL<unknown>[];

		let rawResults: Array<{ threadData: typeof threads.$inferSelect; userData: User }>;
		if (tagIdNum) {
			rawResults = await db.select(selectFields).from(threads).innerJoin(usersTable, eq(threads.userId, usersTable.id)).innerJoin(threadTags, and(eq(threadTags.threadId, threads.id), eq(threadTags.tagId, tagIdNum))).where(and(...validConditions)).orderBy(...orderByClause).limit(currentThreadLimit).offset(offset);
		} else {
			rawResults = await db.select(selectFields).from(threads).innerJoin(usersTable, eq(threads.userId, usersTable.id)).where(and(...validConditions)).orderBy(...orderByClause).limit(currentThreadLimit).offset(offset);
		}

		const processedThreads = rawResults.map(r => ({ ...r.threadData, user: r.userData, postCount: r.threadData.postCount || 0 }));

		let totalThreads = 0;
		const countQueryBase = db.select({ count: count() }).from(threads);
		if (tagIdNum) { const countResult = await countQueryBase.innerJoin(threadTags, and(eq(threadTags.threadId, threads.id), eq(threadTags.tagId, tagIdNum))).where(and(...validConditions)); totalThreads = countResult[0]?.count || 0; }
		else { const countResult = await countQueryBase.where(and(...validConditions)); totalThreads = countResult[0]?.count || 0; }

		const prefixIds = processedThreads.map((t) => t.prefixId).filter(id => id != null) as number[];
		const prefixesMap: Record<number, ThreadPrefixType> = {};
		if (prefixIds.length > 0) { const prefixResults = await db.select().from(threadPrefixes).where(inArray(threadPrefixes.id, prefixIds)); prefixResults.forEach((p: ThreadPrefixType) => { prefixesMap[p.id] = p; }); }

		const threadsWithPrefixAndUser = processedThreads.map((thread) => ({ ...thread, prefix: thread.prefixId ? prefixesMap[thread.prefixId] : null })) as ThreadWithUser[];

		return { threads: threadsWithPrefixAndUser, pagination: { page, limit: currentThreadLimit, totalThreads, totalPages: Math.ceil(totalThreads / currentThreadLimit) } };
	},

	async getThreadDetails(
		slugOrId: string | number,
		page: number = 1,
		requestedLimit: number = 20,
		currentUserId?: string
	): Promise<ThreadWithPostsAndUser | null> {
		try {
			const MAX_LIMIT = 100;
			const currentLimit = Math.min(requestedLimit, MAX_LIMIT);

			let threadCondition: SQL<unknown>;

			if (typeof slugOrId === 'string' && isNaN(Number(slugOrId))) {
				threadCondition = eq(threads.slug, slugOrId);
			} else {
				threadCondition = eq(threads.id, Number(slugOrId));
			}

			const threadResult = await db
				.select({
					thread: threads,
					user: usersTable,
					categoryRaw: forumCategories,
				})
				.from(threads)
				.innerJoin(usersTable, eq(threads.userId, usersTable.id))
				.innerJoin(forumCategories, eq(threads.categoryId, forumCategories.id))
				.where(threadCondition)
				.limit(1);

			if (threadResult.length === 0) return null;

			const rawThreadData = threadResult[0];
			const actualThreadId = rawThreadData.thread.id;

			const threadTagResults = await db
				.select({
					id: tags.id,
					name: tags.name,
					slug: tags.slug,
					description: tags.description,
					createdAt: tags.createdAt
				})
				.from(threadTags)
				.innerJoin(tags, eq(threadTags.tagId, tags.id))
				.where(eq(threadTags.threadId, actualThreadId));

			await db.update(threads).set({ viewCount: sql`${threads.viewCount} + 1` }).where(eq(threads.id, actualThreadId));

			const hasBookmarked = false; 

			const categoryDataFromDb = rawThreadData.categoryRaw;

			const categoryForResponse: ForumCategorySchemaType = {
				id: categoryDataFromDb.id,
				name: categoryDataFromDb.name,
				slug: categoryDataFromDb.slug,
				description: categoryDataFromDb.description ?? null,
				parentForumSlug: categoryDataFromDb.parentForumSlug ?? null,
				parentId: categoryDataFromDb.parentId ?? null,
				type: categoryDataFromDb.type,
				position: categoryDataFromDb.position,
				isVip: categoryDataFromDb.isVip,
				isLocked: categoryDataFromDb.isLocked,
				minXp: categoryDataFromDb.minXp,
				color: categoryDataFromDb.color,
				icon: categoryDataFromDb.icon,
				colorTheme: categoryDataFromDb.colorTheme ?? null,
				isHidden: categoryDataFromDb.isHidden,
				minGroupIdRequired: categoryDataFromDb.minGroupIdRequired ?? null,
				tippingEnabled: categoryDataFromDb.tippingEnabled,
				xpMultiplier: categoryDataFromDb.xpMultiplier,
				pluginData: categoryDataFromDb.pluginData || {},
				createdAt: categoryDataFromDb.createdAt,
				updatedAt: categoryDataFromDb.updatedAt,
			};

			const { thread, user } = rawThreadData;

			const threadForResponse: ThreadWithUserAndCategory = {
				...(thread as typeof threads.$inferSelect),
				user: user as User,
				category: categoryForResponse,
				tags: threadTagResults.map(t => ({
					...t,
					description: t.description ?? null
				})),
				hasBookmarked,
				lastPost: undefined,
				parentForumSlug: categoryForResponse.slug, // Immediate parent's slug
				zoneSlug: null, // Placeholder, will be populated below
			};
			
			// Determine zoneSlug by traversing up from the thread's direct category
			let currentCategoryForZoneLookup: ForumCategorySchemaType | null = categoryForResponse;
			let determinedZoneSlug: string | null = null;
			const visitedCategoryIds = new Set<number>();

			while (currentCategoryForZoneLookup && !visitedCategoryIds.has(currentCategoryForZoneLookup.id)) {
				visitedCategoryIds.add(currentCategoryForZoneLookup.id);
				if (currentCategoryForZoneLookup.type === 'zone') {
					determinedZoneSlug = currentCategoryForZoneLookup.slug;
					break;
				}
				if (!currentCategoryForZoneLookup.parentId) {
					// This is a top-level category but not a zone, or bad data.
					// If it's supposed to be a zone, use its slug. Otherwise, log warning.
					if (currentCategoryForZoneLookup.type !== 'zone') {
						logger.warn('ForumService', 'getThreadDetails: Top-level category is not type="zone"', { category: currentCategoryForZoneLookup });
					}
					determinedZoneSlug = currentCategoryForZoneLookup.slug; // Fallback
					break;
				}

				const parentCategoryData = await db
					.select()
					.from(forumCategories)
					.where(eq(forumCategories.id, currentCategoryForZoneLookup.parentId))
					.limit(1);
				
				currentCategoryForZoneLookup = parentCategoryData.length > 0 ? parentCategoryData[0] as ForumCategorySchemaType : null;
			}
			
			threadForResponse.zoneSlug = determinedZoneSlug;


			const offset = (page - 1) * currentLimit;
			const postConditions = [
				eq(posts.threadId, actualThreadId),
				eq(posts.isDeleted, false),
			];

			const userReactionSubquery = db.$with('user_reactions').as(
				db.select({
					postId: postReactions.postId,
					liked: sql<boolean>`true`.as('liked')
				})
				.from(postReactions)
				.where(and(
					eq(postReactions.userId, currentUserId || '00000000-0000-0000-0000-000000000000'),
					eq(postReactions.reactionType, 'like')
				))
			);

			const postListRaw = await db
				.with(userReactionSubquery)
				.select({
					id: posts.id, uuid: posts.uuid, threadId: posts.threadId, userId: posts.userId, content: posts.content,
					editorState: posts.editorState, likeCount: posts.likeCount, tipCount: posts.tipCount, totalTips: posts.totalTips,
					isFirstPost: posts.isFirstPost, isHidden: posts.isHidden, isEdited: posts.isEdited, editedAt: posts.editedAt,
					createdAt: posts.createdAt, updatedAt: posts.updatedAt, replyToPostId: posts.replyToPostId, pluginData: posts.pluginData,
					isDeleted: posts.isDeleted, deletedAt: posts.deletedAt, moderationReason: posts.moderationReason,
					visibilityStatus: posts.visibilityStatus, editedBy: posts.editedBy,
					user: usersTable,
					hasLiked: userReactionSubquery.liked
				})
				.from(posts)
				.innerJoin(usersTable, eq(posts.userId, usersTable.id))
				.leftJoin(userReactionSubquery, eq(posts.id, userReactionSubquery.postId))
				.where(and(...postConditions))
				.orderBy(asc(posts.createdAt))
				.limit(currentLimit)
				.offset(offset);

			const totalPostsResult = await db.select({ count: count() }).from(posts).where(and(...postConditions));
			const totalPosts = totalPostsResult[0]?.count || 0;

			const postsForResponse: PostWithUser[] = postListRaw.map(p => {
				const { user: postUser, hasLiked, ...postDataFields } = p;
				const finalPostData = {
					...postDataFields,
					pluginData: postDataFields.pluginData || {},
				};
				return {
					...(finalPostData as PostSchemaType),
					user: postUser as User,
					hasLiked: !!hasLiked,
				};
			});

			return {
				thread: threadForResponse,
				posts: postsForResponse,
				pagination: {
					page,
					pageSize: currentLimit,
					totalItems: totalPosts,
					totalPages: Math.ceil(totalPosts / currentLimit),
				},
			};

		} catch (error) {
			logger.error('ForumService', 'Error in getThreadDetails', { err: error, slugOrId, page, requestedLimit, currentUserId });
			throw error;
		}
	},

	async updateThreadSolvedStatus({
		threadId,
		solvingPostId
	}: {
		threadId: number;
		solvingPostId?: number | null;
	}): Promise<{ id: number; title: string; isSolved: boolean; solvingPostId: number | null; updatedAt: Date; } | null> {
		try {
			if (solvingPostId !== null && solvingPostId !== undefined) {
				const [postCheck] = await db.select({ id: posts.id }).from(posts)
					.where(and(eq(posts.id, solvingPostId), eq(posts.threadId, threadId), eq(posts.isDeleted, false)))
					.limit(1);
				if (!postCheck) throw new Error('Invalid solving post ID or post does not belong to the thread.');
			}
			const [updatedThread] = await db.update(threads)
				.set({
					isSolved: solvingPostId !== null && solvingPostId !== undefined,
					solvingPostId: solvingPostId === undefined ? null : solvingPostId,
					updatedAt: new Date()
				})
				.where(eq(threads.id, threadId))
				.returning({
					id: threads.id,
					title: threads.title,
					isSolved: threads.isSolved,
					solvingPostId: threads.solvingPostId,
					updatedAt: threads.updatedAt
				});
			return updatedThread || null;
		} catch (error) {
			logger.error('ForumService', 'Error in updateThreadSolvedStatus', { err: error, threadId, solvingPostId });
			throw error;
		}
	},

	// Validate slug against static config and ensure it's a leaf forum (no sub-forums)
	ensureValidLeafForum(slug: string) {
		const entry = forumMap.getForumBySlug?.(slug);
		if (!entry) {
			throw new Error(`Invalid forum slug: ${slug}`);
		}
		const { forum } = entry;
		if (forum.forums && forum.forums.length > 0) {
			throw new Error(`Cannot fetch threads from a parent forum: ${slug}`);
		}
		return forum;
	},

	// New: Thread list retrieval using slug with config enforcement
	async getThreadsInForum(slug: string) {
		// Will throw if invalid or parent
		this.ensureValidLeafForum(slug);

		// Resolve the corresponding category ID in the database
		const [categoryRow] = await db
			.select({ id: forumCategories.id })
			.from(forumCategories)
			.where(eq(forumCategories.slug, slug))
			.limit(1);

		if (!categoryRow) {
			throw new Error(`Forum with slug '${slug}' not found in database after validation. Did you run sync:forums?`);
		}

		return db
			.select()
			.from(threads)
			.where(eq(threads.categoryId, categoryRow.id))
			.orderBy(desc(threads.createdAt));
	}
};

export default forumService;
