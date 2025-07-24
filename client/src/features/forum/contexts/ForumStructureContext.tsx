import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { z } from 'zod';
import { forumMap } from '@app/config/forumMap.config';
import type { Zone } from '@app/config/forumMap.config';
import type { CategoryId, ForumId, GroupId, ParentZoneId, ZoneId } from '@shared/types/ids';
import { toId, parseId, toParentZoneId } from '@shared/types/index';
import { logger } from '@app/lib/logger';

// ===========================================================
// ForumStructureContext v2.0  🛠️  (2025-06-16)
//
// Migration from v1:
// • "categories" layer removed – use zones[].forums directly.
// • getCategory() helper removed – use getForum().
// • New helpers: primaryZones/generalZones arrays, isPrimaryZone(),
//   isGeneralZone(), getZonesByType(), isUsingFallback flag.
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

const ApiEntitySchema = z
	.object({
		id: z.string(),
		slug: z.string().min(1),
		name: z.string().min(1),
		description: z.string().nullish(),
		parentId: z.custom<CategoryId>().nullish(),
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
		parentForumSlug: z.string().optional().nullable()
	})
	.passthrough();

const ForumStructureApiResponseSchema = z.object({
	zones: z.array(ApiEntitySchema),
	forums: z.array(ApiEntitySchema)
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
	parentZoneId?: ParentZoneId | null;
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
	parentCategoryId?: CategoryId | null;
	canHaveThreads?: boolean;
	isPopular?: boolean;
	lastActivityAt?: string;
}

export interface MergedZone {
	id: string;
	slug: string;
	name: string;
	description?: string | null;
	type: 'zone';
	isPrimary: boolean;
	position: number;
	forums: MergedForum[];
	theme: MergedTheme;
	icon?: string | null;
	features: string[] | Record<string, unknown>;
	customComponents: string[];
	staffOnly: boolean;
	hasXpBoost?: boolean;
	boostMultiplier?: number;
	xpChallenges?: PluginData['xpChallenges'];
	zoneBadges?: PluginData['zoneBadges'];
	threadCount: number;
	postCount: number;
	updatedAt?: string;
	categories?: never[];
}

export interface ForumStructureContextType {
	zones: MergedZone[];
	forums: Record<string, MergedForum>;
	forumsById: Record<string, MergedForum>;
	primaryZones: MergedZone[];
	generalZones: MergedZone[];
	getZone: (slug: string) => MergedZone | undefined;
	getZoneById: (id: string) => MergedZone | undefined;
	getForum: (slug: string) => MergedForum | undefined;
	getForumById: (id: string) => MergedForum | undefined;
	getParentZone: (forumSlug: string) => MergedZone | undefined;
	getThreadContext: (structureId: string) => {
		forum: MergedForum | undefined;
		zone: MergedZone | undefined;
	};
	isPrimaryZone: (slug: string) => boolean;
	isGeneralZone: (slug: string) => boolean;
	getZonesByType: (type: 'primary' | 'general') => MergedZone[];
	isLoading: boolean;
	error: Error | null;
	isUsingFallback: boolean;
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

function makeMergedForum(api: ApiEntity, parentZoneId: ParentZoneId): MergedForum {
	return {
		id: parseId<'ForumId'>(api.id) || toId<'ForumId'>(api.id),
		slug: api.slug,
		name: api.name,
		description: api.description,
		type: 'forum',
		parentId: api.parentId,
		parentZoneId,
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
		parentCategoryId: null,
		canHaveThreads: true,
		isPopular: api.isPopular ?? false,
		lastActivityAt:
			api.lastActivityAt || api.lastPostAt
				? String(api.lastActivityAt || api.lastPostAt)
				: undefined
	};
}

function processApiData(resp: ForumStructureApiResponse) {
	const zones: MergedZone[] = [];
	const forums: Record<string, MergedForum> = {};
	const forumsById: Record<string, MergedForum> = {};
	const zoneById = new Map<string, MergedZone>();
	const forumById = new Map<string, MergedForum>();
	const handled = new Set<string>();

	// Zones first
	resp.zones.forEach((z) => {
		const zone: MergedZone = {
			id: z.id,
			slug: z.slug,
			name: z.name,
			description: z.description,
			type: 'zone',
			isPrimary: z.pluginData?.configZoneType === 'primary',
			position: z.position ?? 0,
			forums: [],
			theme: buildTheme(z),
			icon: z.icon,
			features: z.pluginData?.features || [],
			customComponents: z.pluginData?.customComponents || [],
			staffOnly: z.pluginData?.staffOnly || false,
			hasXpBoost: (z.xpMultiplier ?? 1) > 1,
			boostMultiplier: z.xpMultiplier ?? 1,
			xpChallenges: z.pluginData?.xpChallenges,
			zoneBadges: z.pluginData?.zoneBadges,
			threadCount: z.threadCount ?? 0,
			postCount: z.postCount ?? 0,
			updatedAt: z.updatedAt ? String(z.updatedAt) : undefined,
			categories: []
		};
		zones.push(zone);
		zoneById.set(zone.id, zone);
	});

	// Forums tier 1
	resp.forums.forEach((f) => {
		if (f.parentId && zoneById.has(f.parentId)) {
			const m = makeMergedForum(f, f.parentId as unknown as ParentZoneId);
			forums[m.slug] = m;
			forumsById[m.id] = m;
			forumById.set(m.id, m);
			zoneById.get(f.parentId)!.forums.push(m);
			handled.add(m.id);
		}
	});

	// Subforums
	resp.forums.forEach((f) => {
		if (!handled.has(f.id) && f.parentId && forumById.has(f.parentId)) {
			const parent = forumById.get(f.parentId)!;
			const sub = makeMergedForum(f, parent.parentZoneId!);
			sub.isSubforum = true;
			forums[sub.slug] = sub;
			forumsById[sub.id] = sub;
			forumById.set(sub.id, sub);
			parent.subforums.push(sub);
		}
	});

	return { zones, forums, forumsById };
}

function fallbackStructure(staticZones: Zone[]) {
	const zones: MergedZone[] = [];
	const forums: Record<string, MergedForum> = {};
	const forumsById: Record<string, MergedForum> = {};

	staticZones.forEach((z) => {
		const zoneIdNum = FALLBACK_ZONE_ID();
		const zoneId = toId<'ZoneId'>(`550e8400-e29b-41d4-a716-${String(zoneIdNum).padStart(12, '0')}`);
		const mz: MergedZone = {
			id: zoneId,
			slug: z.slug,
			name: z.name,
			description: z.description,
			type: 'zone',
			isPrimary: z.type === 'primary',
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
				parentZoneId: toParentZoneId(zoneId),
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
				parentCategoryId: null,
				canHaveThreads: true,
				isPopular: false,
				lastActivityAt: undefined
			};
			forums[mf.slug] = mf;
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
						parentZoneId: toParentZoneId(zoneId),
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
						parentCategoryId: null,
						canHaveThreads: true,
						isPopular: false,
						lastActivityAt: undefined
					};
					forums[sub.slug] = sub;
					forumsById[subforumId] = sub;
					mf.subforums.push(sub);
				});
			}
		});

		zones.push(mz);
	});

	return { zones, forums, forumsById };
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
				const data = await resp.json();
				setRaw(data);
			} catch (e: unknown) {
				logger.info('ForumStructureContext', '[ForumStructureContext] API unavailable - using fallback forum structure');
				// Don't set network error when we have fallback data
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const { zones, forums, forumsById, isUsingFallback, parseError } = useMemo(() => {
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
					const zones = raw.filter((s: Record<string, unknown>) => s.type === 'zone'); // FIXME: any → safe record
					const forums = raw.filter((s: Record<string, unknown>) => s.type === 'forum'); // FIXME: any → safe record
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
		const fb = fallbackStructure(forumMap.zones);
		return {
			...fb,
			isUsingFallback: true,
			parseError: null // Don't set error when we have fallback data
		};
	}, [raw]);

	const primaryZones = useMemo(() => zones.filter((z) => z.isPrimary), [zones]);
	const generalZones = useMemo(() => zones.filter((z) => !z.isPrimary), [zones]);

	const value = useMemo<ForumStructureContextType>(
		() => ({
			zones,
			forums,
			forumsById,
			primaryZones,
			generalZones,
			getZone: (s) => zones.find((z) => z.slug === s),
			getZoneById: (id) => zones.find((z) => z.id === id),
			getForum: (s) => forums[s],
			getForumById: (id) => forumsById[id],
			getParentZone: (forumSlug) => {
				const f = forums[forumSlug];
				if (!f) return undefined;
				return zones.find((z) => z.id === f.parentZoneId);
			},
			getThreadContext: (structureId) => {
				const forum = forumsById[structureId];
				if (!forum) return { forum: undefined, zone: undefined };
				const zone = zones.find((z) => z.id === forum.parentZoneId);
				return { forum, zone };
			},
			isPrimaryZone: (s) => primaryZones.some((z) => z.slug === s),
			isGeneralZone: (s) => generalZones.some((z) => z.slug === s),
			getZonesByType: (t) => (t === 'primary' ? primaryZones : generalZones),
			isLoading,
			error: null, // Always return null error when we have fallback data
			isUsingFallback
		}),
		[
			zones,
			forums,
			forumsById,
			primaryZones,
			generalZones,
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

export const useZones = () => {
	const { zones, isLoading, error } = useForumStructure();
	return { zones, isLoading, error };
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
