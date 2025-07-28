import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { z } from 'zod';
import { forumMap } from '@config/forumMap';
import type { RootForum as Zone } from '@config/forumMap';
import type { ForumId, GroupId } from '@shared/types/ids';
import { toId, parseId } from '@shared/types/index';
import { logger } from '@/lib/logger';

// ===========================================================
// ForumStructureContext v2.0  🛠️  (2025-06-16)
//
// Migration from v1:
// • "categories" layer removed – use zones[].forums directly.
// • getCategory() helper removed – use getForum().
// • New helpers: primaryZones/generalZones arrays, isFeaturedZone(),
//   isGeneralZone(), getForumsByType(), isUsingFallback flag.
// • Legacy shim (`legacy`) emits console warnings to ease migration.
// ===========================================================

// ---------------- Constants ----------------
// Flat forum structure endpoint (zones + forums)
const FORUM_STRUCTURE_API_PATH = '/api/forums/structure';
// Use positive IDs for fallback to avoid ID conflicts and enable mock functionality
let FALLBACK_ID_COUNTER = 9000; // Start from high number to avoid real ID conflicts
const FALLBACK_ZONE_ID = () => ++FALLBACK_ID_COUNTER;
const FALLBACK_FORUM_ID = () => ++FALLBACK_ID_COUNTER;

// ---------------- Zod Schemas --------------
const PluginDataSchema = z
	.object({
		bannerImage: z.string().nullish(),
		configZoneType: z.enum(['primary', 'general']).nullish(),
		features: z.union([z.array(z.string()), z.record(z.unknown())]).optional(),
		customComponents: z.array(z.string()).optional(),
		staffOnly: z.boolean().optional(),
		rules: z.object({
			allowPosting: z.boolean().optional(),
			xpEnabled: z.boolean().optional(),
			tippingEnabled: z.boolean().optional(),
			allowPolls: z.boolean().optional(),
			allowTags: z.boolean().optional(),
			accessLevel: z.string().optional(),
			minXpRequired: z.number().optional(),
			availablePrefixes: z.array(z.unknown()).optional(),
			requiredPrefix: z.boolean().optional()
		}).optional(),
		allowPosting: z.boolean().optional(),
		xpEnabled: z.boolean().optional(),
		allowPolls: z.boolean().optional(),
		allowTags: z.boolean().optional(),
		availablePrefixes: z.array(z.unknown()).optional(),
		requiredPrefix: z.boolean().optional(),
		prefixGrantRules: z.record(z.unknown()).optional(),
		xpChallenges: z
			.array(
				z.object({
					id: z.string(),
					name: z.string(),
					description: z.string(),
					xpReward: z.number()
				})
			)
			.optional(),
		zoneBadges: z
			.array(
				z.object({
					id: z.string(),
					name: z.string(),
					icon: z.string(),
					requirement: z.string()
				})
			)
			.optional(),
		isPopular: z.boolean().optional(),
		lastActivityAt: z.union([z.string(), z.date()]).optional().nullable()
	})
	.passthrough();

const ApiEntitySchema: z.ZodSchema<any> = z.lazy(() => z
	.object({
		id: z.string(),
		slug: z.string().min(1),
		name: z.string().min(1),
		description: z.string().nullish(),
		parentId: z.custom<ForumId>().nullish(),
		type: z.enum(['zone', 'forum', 'category']),
		position: z.preprocess((v) => (v === null || v === undefined ? 0 : v), z.number()).optional(),
		isVip: z.boolean().default(false).optional(),
		isLocked: z.boolean().default(false).optional(),
		isHidden: z.boolean().default(false).optional(),
		minXp: z.preprocess((v) => (v === null || v === undefined ? 0 : v), z.number()).optional(),
		minGroupIdRequired: z.custom<GroupId>().optional().nullable(),
		color: z.string().optional().nullable(),
		icon: z.string().optional().nullable(),
		colorTheme: z.string().optional().nullable(),
		tippingEnabled: z.boolean().default(false).optional(),
		xpMultiplier: z
			.preprocess((v) => (v === null || v === undefined ? 1 : v), z.number())
			.optional(),
		threadCount: z
			.preprocess((v) => {
				if (v === null || v === undefined) return 0;
				if (typeof v === 'string') return Number(v) || 0;
				if (typeof v === 'number') return v;
				return 0;
			}, z.number())
			.optional(),
		postCount: z
			.preprocess((v) => {
				if (v === null || v === undefined) return 0;
				if (typeof v === 'string') return Number(v) || 0;
				if (typeof v === 'number') return v;
				return 0;
			}, z.number())
			.optional(),
		pluginData: z
			.preprocess((v) => {
				if (typeof v === 'string') {
					try {
						return JSON.parse(v as string);
					} catch {
						return {};
					}
				}
				if (v === null || v === undefined) return {};
				return v;
			}, PluginDataSchema)
			.optional(),
		createdAt: z.union([z.string(), z.date()]).optional().nullable(),
		updatedAt: z.union([z.string(), z.date()]).optional().nullable(),
		isPopular: z.boolean().optional().nullable(),
		lastActivityAt: z.union([z.string(), z.date()]).optional().nullable(),
		lastPostAt: z.union([z.string(), z.date()]).optional().nullable(),
		parentForumSlug: z.string().optional().nullable(),
		isFeatured: z.boolean().optional().nullable(),
		themePreset: z.string().optional().nullable(),
		// Support for hierarchical structure
		children: z.array(z.lazy(() => ApiEntitySchema)).optional()
	})
	.passthrough());

const ForumStructureApiResponseSchema = z.object({
	forums: z.array(ApiEntitySchema),
	featured: z.array(ApiEntitySchema),
	general: z.array(ApiEntitySchema),
	// Legacy support
	zones: z.array(ApiEntitySchema).optional()
});

// ---------------- Types --------------------
export type ApiEntity = z.infer<typeof ApiEntitySchema>;
export type PluginData = z.infer<typeof PluginDataSchema>;
export type ForumStructureApiResponse = z.infer<typeof ForumStructureApiResponseSchema>;
// Remove circular definition - use imported ForumId from @shared/types/ids

export interface MergedTheme {
	icon?: string | null;
	color?: string | null;
	bannerImage?: string | null;
	colorTheme?: string | null;
}

export interface MergedRules {
	allowPosting: boolean;
	xpEnabled: boolean;
	tippingEnabled: boolean;
	prefixGrantRules?: Record<string, unknown>;
	allowPolls: boolean;
	allowTags: boolean;
	accessLevel?: 'public' | 'registered' | 'level_10+' | 'vip' | 'moderator' | 'admin';
	minXpRequired?: number;
	availablePrefixes?: string[];
	requiredPrefix?: boolean;
}

export interface MergedForum {
	id: ForumId;
	slug: string;
	name: string;
	description?: string | null;
	type: 'forum';
	parentId?: string | null;
	parentForumId?: ForumId | null;
	isSubforum: boolean;
	subforums: MergedForum[];
	isVip: boolean;
	isLocked: boolean;
	isHidden: boolean;
	minXp: number;
	xpMultiplier: number;
	theme: MergedTheme;
	rules: MergedRules;
	threadCount: number;
	postCount: number;
	canHaveThreads?: boolean;
	isPopular?: boolean;
	lastActivityAt?: string;
	// Zone-specific properties
	isFeatured?: boolean;
	themePreset?: string;
	position?: number;
	forums?: MergedForum[];
	icon?: string | null;
	features?: string[] | Record<string, unknown>;
	customComponents?: string[];
	staffOnly?: boolean;
	hasXpBoost?: boolean;
	boostMultiplier?: number;
	xpChallenges?: PluginData['xpChallenges'];
	zoneBadges?: PluginData['zoneBadges'];
	updatedAt?: string;
	categories?: never[];
	// Permission and activity properties
	hasNewPosts?: boolean;
	requiresVip?: boolean;
	requiresModerator?: boolean;
	lastPost?: {
		id: string;
		title: string;
		authorName: string;
		authorId: string;
		createdAt: string;
		threadSlug?: string;
		threadTitle?: string;
	} | null;
}

export interface ForumStructureContextType {
	topLevelForums: MergedForum[]; // All top-level forums (was zones)
	forumsBySlug: Record<string, MergedForum>; // All forums indexed by slug (was forums)
	forumsById: Record<string, MergedForum>; // All forums indexed by ID
	featuredForums: MergedForum[]; // Featured top-level forums (was primaryZones)
	generalForums: MergedForum[]; // Non-featured top-level forums (was generalZones)
	getTopLevelForum: (slug: string) => MergedForum | undefined; // was getZone
	getTopLevelForumById: (id: string) => MergedForum | undefined; // was getZoneById
	getForum: (slug: string) => MergedForum | undefined;
	getForumById: (id: string) => MergedForum | undefined;
	getParentForum: (forumSlug: string) => MergedForum | undefined; // was getParentZone
	getThreadContext: (structureId: string) => {
		forum: MergedForum | undefined;
		parentForum: MergedForum | undefined; // was zone
	};
	isFeaturedForum: (slug: string) => boolean; // was isFeaturedZone
	isGeneralForum: (slug: string) => boolean; // was isGeneralZone
	getForumsByType: (type: 'featured' | 'general') => MergedForum[]; // updated type values
	isLoading: boolean;
	error: Error | null;
	isUsingFallback: boolean;
	// Legacy compatibility - will be removed
	zones: MergedForum[]; // @deprecated - use topLevelForums
	forums: Record<string, MergedForum>; // @deprecated - use forumsBySlug
}

// ---------------- Helper builders ----------
function buildRules(entity: ApiEntity): MergedRules {
	const p = entity.pluginData || {};
	const rules = p.rules || {};
	return {
		allowPosting: rules.allowPosting ?? p.allowPosting ?? !entity.isLocked,
		xpEnabled: rules.xpEnabled ?? p.xpEnabled ?? (entity.xpMultiplier ?? 1) > 0,
		tippingEnabled: rules.tippingEnabled ?? entity.tippingEnabled ?? false,
		prefixGrantRules: p.prefixGrantRules as Record<string, unknown> | undefined,
		allowPolls: rules.allowPolls ?? p.allowPolls ?? false,
		allowTags: rules.allowTags ?? p.allowTags ?? false,
		accessLevel: (rules.accessLevel || 'public') as 'public' | 'registered' | 'level_10+' | 'vip' | 'moderator' | 'admin',
		minXpRequired: rules.minXpRequired || entity.minXp || 0,
		availablePrefixes: (rules.availablePrefixes || p.availablePrefixes || []) as string[],
		requiredPrefix: rules.requiredPrefix ?? p.requiredPrefix ?? false
	};
}

function buildTheme(entity: ApiEntity): MergedTheme {
	return {
		icon: entity.icon,
		color: entity.color,
		bannerImage: entity.pluginData?.bannerImage,
		colorTheme: entity.colorTheme
	};
}

function makeMergedForum(api: ApiEntity, parentForumId: ForumId): MergedForum {
	return {
		id: parseId<'ForumId'>(api.id) || toId<'ForumId'>(api.id),
		slug: api.slug,
		name: api.name,
		description: api.description,
		type: 'forum',
		parentId: api.parentId,
		parentForumId,
		isSubforum: false,
		subforums: [],
		isVip: api.isVip ?? false,
		isLocked: api.isLocked ?? false,
		isHidden: api.isHidden ?? false,
		minXp: api.minXp ?? 0,
		xpMultiplier: api.xpMultiplier ?? 1,
		theme: buildTheme(api),
		rules: buildRules(api),
		threadCount: api.threadCount ?? 0,
		postCount: api.postCount ?? 0,
		canHaveThreads: true,
		isPopular: api.isPopular ?? false,
		lastActivityAt:
			api.lastActivityAt || api.lastPostAt
				? String(api.lastActivityAt || api.lastPostAt)
				: undefined
	};
}

function processApiData(resp: ForumStructureApiResponse) {
	const topLevelForums: MergedForum[] = [];
	const forumsBySlug: Record<string, MergedForum> = {};
	const forumsById: Record<string, MergedForum> = {};
	const topLevelForumById = new Map<string, MergedForum>();
	const forumById = new Map<string, MergedForum>();

	// Process all forums first
	const allApiForums = resp.forums || [];
	
	// Filter to get only top-level forums (no parentId)
	const apiTopLevelForums = allApiForums.filter(f => !f.parentId);
	
	// Helper to process forum and its children recursively
	const processForumRecursive = (apiEntity: ApiEntity, parentId: ForumId | null = null) => {
		const forum: MergedForum = {
			id: parseId<'ForumId'>(apiEntity.id) || toId<'ForumId'>(apiEntity.id),
			slug: apiEntity.slug,
			name: apiEntity.name,
			description: apiEntity.description,
			type: 'forum',
			parentId: apiEntity.parentId,
			parentForumId: parentId,
			isSubforum: parentId !== null,
			subforums: [],
			isVip: apiEntity.isVip ?? false,
			isLocked: apiEntity.isLocked ?? false,
			isHidden: apiEntity.isHidden ?? false,
			minXp: apiEntity.minXp ?? 0,
			xpMultiplier: apiEntity.xpMultiplier ?? 1,
			theme: buildTheme(apiEntity),
			rules: buildRules(apiEntity),
			threadCount: apiEntity.threadCount ?? 0,
			postCount: apiEntity.postCount ?? 0,
			canHaveThreads: true,
			isPopular: apiEntity.isPopular ?? false,
			lastActivityAt: apiEntity.lastActivityAt || apiEntity.lastPostAt
				? String(apiEntity.lastActivityAt || apiEntity.lastPostAt)
				: undefined,
			isFeatured: apiEntity.isFeatured || false,
			themePreset: apiEntity.themePreset || undefined,
			position: apiEntity.position ?? 0,
			forums: [],
			icon: apiEntity.icon,
			features: (apiEntity.pluginData as any)?.features || [],
			customComponents: (apiEntity.pluginData as any)?.customComponents || [],
			staffOnly: (apiEntity.pluginData as any)?.staffOnly || false
		};
		
		// Process children if they exist
		if (apiEntity.children && Array.isArray(apiEntity.children)) {
			apiEntity.children.forEach(child => {
				const childForum = processForumRecursive(child, forum.id);
				forum.forums.push(childForum);
				forum.subforums.push(childForum);
			});
		}
		
		// Register in lookups
		forumsBySlug[forum.slug] = forum;
		forumsById[forum.id] = forum;
		forumById.set(forum.id, forum);
		
		return forum;
	};
	
	// Process all top-level forums and their children
	apiTopLevelForums.forEach(topLevel => {
		const processed = processForumRecursive(topLevel);
		topLevelForums.push(processed);
		topLevelForumById.set(processed.id, processed);
	});

	return { topLevelForums, forumsBySlug, forumsById };
}

function fallbackStructure(staticForums: Zone[]) {
	const topLevelForums: MergedForum[] = [];
	const forumsBySlug: Record<string, MergedForum> = {};
	const forumsById: Record<string, MergedForum> = {};

	staticForums.forEach((z) => {
		const zoneIdNum = FALLBACK_ZONE_ID();
		const zoneId = toId<'ForumId'>(`550e8400-e29b-41d4-a716-${String(zoneIdNum).padStart(12, '0')}`);
		const mz: MergedForum = {
			id: zoneId,
			slug: z.slug,
			name: z.name,
			description: z.description,
			type: 'forum',
			isFeatured: z.isFeatured === true,
			position: z.position ?? 0,
			forums: [],
			theme: {
				icon: z.theme?.icon,
				color: z.theme?.color,
				bannerImage: z.theme?.bannerImage,
				colorTheme: z.theme?.colorTheme
			},
			features: [],
			customComponents: [],
			staffOnly: false,
			threadCount: 0,
			postCount: 0,
			categories: []
		};

		z.forums.forEach((f) => {
			const forumIdNum = FALLBACK_FORUM_ID();
			const forumId = toId<'ForumId'>(
				`550e8400-e29b-41d4-a716-${String(forumIdNum).padStart(12, '0')}`
			);
			const mf: MergedForum = {
				id: forumId,
				slug: f.slug,
				name: f.name,
				description: f.description,
				type: 'forum',
				parentId: zoneId,
				parentForumId: zoneId,
				isSubforum: false,
				subforums: [],
				isVip: false,
				isLocked: f.rules?.allowPosting === false,
				isHidden: false,
				minXp: 0,
				xpMultiplier: 1,
				theme: {
					icon: f.themeOverride?.icon || mz.theme.icon,
					color: f.themeOverride?.color || mz.theme.color,
					bannerImage: f.themeOverride?.bannerImage || mz.theme.bannerImage,
					colorTheme: f.themeOverride?.colorTheme || mz.theme.colorTheme
				},
				rules: {
					allowPosting: f.rules?.allowPosting ?? true,
					xpEnabled: f.rules?.xpEnabled ?? false,
					tippingEnabled: false,
					allowPolls: false,
					allowTags: false,
					prefixGrantRules: undefined,
					availablePrefixes: f.rules?.availablePrefixes || []
				},
				threadCount: 0,
				postCount: 0,
				canHaveThreads: true,
				isPopular: false,
				lastActivityAt: undefined
			};
			forumsBySlug[mf.slug] = mf;
			forumsById[forumId] = mf;
			mz.forums.push(mf);

			// Process subforums if they exist
			if (f.forums && f.forums.length > 0) {
				f.forums.forEach((subforum) => {
					const subforumIdNum = FALLBACK_FORUM_ID();
					const subforumId = toId<'ForumId'>(
						`550e8400-e29b-41d4-a716-${String(subforumIdNum).padStart(12, '0')}`
					);
					const sub: MergedForum = {
						id: subforumId,
						slug: subforum.slug,
						name: subforum.name,
						description: subforum.description,
						type: 'forum',
						parentId: forumId,
						parentForumId: zoneId,
						isSubforum: true,
						subforums: [],
						isVip: false,
						isLocked: subforum.rules?.allowPosting === false,
						isHidden: false,
						minXp: 0,
						xpMultiplier: subforum.rules?.xpMultiplier || 1,
						theme: {
							icon: subforum.themeOverride?.icon || mf.theme.icon,
							color: subforum.themeOverride?.color || mf.theme.color,
							bannerImage: subforum.themeOverride?.bannerImage || mf.theme.bannerImage,
							colorTheme: subforum.themeOverride?.colorTheme || mf.theme.colorTheme
						},
						rules: {
							allowPosting: subforum.rules?.allowPosting ?? true,
							xpEnabled: subforum.rules?.xpEnabled ?? false,
							tippingEnabled: subforum.rules?.tippingEnabled ?? false,
							allowPolls: subforum.rules?.allowPolls ?? false,
							allowTags: subforum.rules?.allowTags ?? false,
							prefixGrantRules: undefined,
							availablePrefixes: subforum.rules?.availablePrefixes || []
						},
						threadCount: 0,
						postCount: 0,
						canHaveThreads: true,
						isPopular: false,
						lastActivityAt: undefined
					};
					forumsBySlug[sub.slug] = sub;
					forumsById[subforumId] = sub;
					mf.subforums.push(sub);
				});
			}
		});

		topLevelForums.push(mz);
	});

	return { topLevelForums, forumsBySlug, forumsById };
}

// ---------------- Context ------------------
const ForumStructureContext = createContext<ForumStructureContextType | undefined>(undefined);

export const ForumStructureProvider = ({ children }: { children: ReactNode }) => {
	const [raw, setRaw] = useState<ForumStructureApiResponse | null>(null);
	const [isLoading, setLoading] = useState(true);
	const [netErr, setNetErr] = useState<Error | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const resp = await fetch(FORUM_STRUCTURE_API_PATH);
				if (!resp.ok) {
					logger.warn('ForumStructureContext', '[ForumStructureContext] HTTP error:', { data: [resp.status, resp.statusText] });
					logger.info('ForumStructureContext', '[ForumStructureContext] Using fallback forum structure for development');
					// Don't throw - let fallback handle it
					return;
				}
				const response = await resp.json();
				// Extract the data from the API response wrapper
				const data = response.data || response;
				setRaw(data);
			} catch (e: unknown) {
				logger.info('ForumStructureContext', '[ForumStructureContext] API unavailable - using fallback forum structure');
				// Don't set network error when we have fallback data
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const { topLevelForums, forumsBySlug, forumsById, isUsingFallback, parseError } = useMemo(() => {
		if (raw) {
			// If backend already returns the flat object shape
			try {
				const parsed = ForumStructureApiResponseSchema.parse(raw);
				const processed = processApiData(parsed);
				return { ...processed, isUsingFallback: false, parseError: null };
			} catch (e) {
				logger.error('ForumStructureContext', '[ForumStructureContext] ❌ Structure parsing FAILED:', {
                					error: e,
                					rawData: raw,
                					errorDetails: e instanceof Error ? e.message : 'Unknown error'
                				});

				// Fallback: some environments may still send an *array* of structures
				// (mixing zones & forums).  We coerce that into the expected object.
				if (Array.isArray(raw)) {
					const zones = raw.filter((s: Record<string, unknown>) => s.parentId === null); // Top-level forums are now "zones"
					const forums = raw.filter((s: Record<string, unknown>) => s.type === 'forum'); // All forums
					const coerced = { zones, forums };
					try {
						const parsed = ForumStructureApiResponseSchema.parse(coerced);
						const processed = processApiData(parsed);
						return { ...processed, isUsingFallback: false, parseError: null };
					} catch (inner) {
						logger.error('ForumStructureContext', '[ForumStructureContext] ❌ Array coercion FAILED:', inner);
					}
				} else {
					// Fallback structure conversion failed; will use config fallback below
				}
			}
		}

		logger.info('ForumStructureContext', '[ForumStructureContext] Using fallback forum structure');
		const fb = fallbackStructure(forumMap.forums);
		return {
			...fb,
			isUsingFallback: true,
			parseError: null // Don't set error when we have fallback data
		};
	}, [raw]);

	const featuredForums = useMemo(() => topLevelForums.filter((f) => f.isFeatured), [topLevelForums]);
	const generalForums = useMemo(() => topLevelForums.filter((f) => !f.isFeatured), [topLevelForums]);

	const value = useMemo<ForumStructureContextType>(
		() => ({
			// New naming
			topLevelForums,
			forumsBySlug,
			forumsById,
			featuredForums,
			generalForums,
			getTopLevelForum: (s) => topLevelForums.find((f) => f.slug === s),
			getTopLevelForumById: (id) => topLevelForums.find((f) => f.id === id),
			getForum: (s) => forumsBySlug[s],
			getForumById: (id) => forumsById[id],
			getParentForum: (forumSlug) => {
				const f = forumsBySlug[forumSlug];
				if (!f) return undefined;
				return topLevelForums.find((tf) => tf.id === f.parentForumId);
			},
			getThreadContext: (structureId) => {
				const forum = forumsById[structureId];
				if (!forum) return { forum: undefined, parentForum: undefined };
				const parentForum = topLevelForums.find((f) => f.id === forum.parentForumId);
				return { forum, parentForum };
			},
			isFeaturedForum: (s) => featuredForums.some((f) => f.slug === s),
			isGeneralForum: (s) => generalForums.some((f) => f.slug === s),
			getForumsByType: (t) => (t === 'featured' ? featuredForums : generalForums),
			isLoading,
			error: null, // Always return null error when we have fallback data
			isUsingFallback,
			// Legacy compatibility - @deprecated
			zones: topLevelForums,
			forums: forumsBySlug
		}),
		[
			topLevelForums,
			forumsBySlug,
			forumsById,
			featuredForums,
			generalForums,
			isLoading,
			netErr,
			parseError,
			isUsingFallback
		]
	);

	return <ForumStructureContext.Provider value={value}>{children}</ForumStructureContext.Provider>;
};

// ---------------- Hooks --------------------
export const useForumStructure = () => {
	const ctx = useContext(ForumStructureContext);
	if (!ctx) throw new Error('useForumStructure must be used within ForumStructureProvider');
	return ctx;
};

export const useForums = () => {
	const { forums, isLoading, error } = useForumStructure();
	return { forums, isLoading, error };
};

// ---------------- Legacy Shim --------------
export const legacy = {
	get categories() {
		logger.warn('ForumStructureContext', '[DEPRECATION] Use generalZones instead of categories');
		return {} as Record<string, unknown>;
	},
	getCategory: (slug: string) => {
		logger.warn('ForumStructureContext', `[DEPRECATION] getCategory(${slug}) removed – use getForum()`);
		return undefined;
	}
};
