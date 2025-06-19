import React, { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { forumMap } from '@/config/forumMap.config';
import type { Zone } from '@/config/forumMap.config';
import { getQueryFn } from '@/lib/queryClient';

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
const FORUM_STRUCTURE_API_PATH = '/api/forum/structure';
const FALLBACK_ZONE_ID = -1;
const FALLBACK_FORUM_ID = -1;

// ---------------- Zod Schemas --------------
const PluginDataSchema = z
  .object({
    bannerImage: z.string().nullish(),
    configZoneType: z.enum(['primary', 'general']).nullish(),
    features: z
      .union([z.array(z.string()), z.record(z.unknown())])
      .optional(),
    customComponents: z.array(z.string()).optional(),
    staffOnly: z.boolean().optional(),
    xpChallenges: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          xpReward: z.number(),
        })
      )
      .optional(),
    zoneBadges: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          icon: z.string(),
          requirement: z.string(),
        })
      )
      .optional(),
    prefixGrantRules: z.record(z.unknown()).optional(),
    allowPosting: z.boolean().optional(),
    xpEnabled: z.boolean().optional(),
    allowPolls: z.boolean().optional(),
    allowTags: z.boolean().optional(),
  })
  .passthrough();

const ApiEntitySchema = z.object({
  id: z.number(),
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullish(),
  parentId: z.number().nullish(),
  type: z.enum(['zone', 'forum', 'category']),
  position: z.preprocess((v) => (v === null || v === undefined ? 0 : v), z.number()),
  isVip: z.boolean().default(false),
  isLocked: z.boolean().default(false),
  isHidden: z.boolean().default(false),
  minXp: z.preprocess((v) => (v === null || v === undefined ? 0 : v), z.number()),
  minGroupIdRequired: z.number().nullish(),
  color: z.string().nullish(),
  icon: z.string().nullish(),
  colorTheme: z.string().nullish(),
  tippingEnabled: z.boolean().default(false),
  xpMultiplier: z.preprocess((v) => (v === null || v === undefined ? 1 : v), z.number()),
  threadCount: z.preprocess((v) => (v === null || v === undefined ? 0 : v), z.number()),
  postCount: z.preprocess((v) => (v === null || v === undefined ? 0 : v), z.number()),
  pluginData: z
    .preprocess((v) => {
      if (typeof v === 'string') {
        try {
          return JSON.parse(v as string);
        } catch {
          return {};
        }
      }
      return v;
    }, PluginDataSchema)
    .nullish(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

const ForumStructureApiResponseSchema = z.object({
  zones: z.array(ApiEntitySchema),
  forums: z.array(ApiEntitySchema),
});

// ---------------- Types --------------------
export type ApiEntity = z.infer<typeof ApiEntitySchema>;
export type PluginData = z.infer<typeof PluginDataSchema>;
export type ForumStructureApiResponse = z.infer<
  typeof ForumStructureApiResponseSchema
>;

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
}

export interface MergedForum {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
  type: 'forum';
  parentId?: number | null;
  parentZoneId?: number | null;
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
  parentCategoryId?: number | null;
  canHaveThreads?: boolean;
}

export interface MergedZone {
  id: number;
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
  primaryZones: MergedZone[];
  generalZones: MergedZone[];
  getZone: (slug: string) => MergedZone | undefined;
  getForum: (slug: string) => MergedForum | undefined;
  getParentZone: (forumSlug: string) => MergedZone | undefined;
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
  return {
    allowPosting: p.allowPosting ?? !entity.isLocked,
    xpEnabled: p.xpEnabled ?? entity.xpMultiplier > 0,
    tippingEnabled: entity.tippingEnabled,
    prefixGrantRules: p.prefixGrantRules as Record<string, unknown> | undefined,
    allowPolls: p.allowPolls ?? false,
    allowTags: p.allowTags ?? false,
  };
}

function buildTheme(entity: ApiEntity): MergedTheme {
  return {
    icon: entity.icon,
    color: entity.color,
    bannerImage: entity.pluginData?.bannerImage,
    colorTheme: entity.colorTheme,
  };
}

function makeMergedForum(api: ApiEntity, parentZoneId: number): MergedForum {
  return {
    id: api.id,
    slug: api.slug,
    name: api.name,
    description: api.description,
    type: 'forum',
    parentId: api.parentId,
    parentZoneId,
    isSubforum: false,
    subforums: [],
    isVip: api.isVip,
    isLocked: api.isLocked,
    isHidden: api.isHidden,
    minXp: api.minXp,
    xpMultiplier: api.xpMultiplier,
    theme: buildTheme(api),
    rules: buildRules(api),
    threadCount: api.threadCount,
    postCount: api.postCount,
    parentCategoryId: null,
    canHaveThreads: true,
  };
}

function processApiData(resp: ForumStructureApiResponse) {
  const zones: MergedZone[] = [];
  const forums: Record<string, MergedForum> = {};
  const zoneById = new Map<number, MergedZone>();
  const forumById = new Map<number, MergedForum>();
  const handled = new Set<number>();

  // Zones first
  resp.zones.forEach((z) => {
    const zone: MergedZone = {
      id: z.id,
      slug: z.slug,
      name: z.name,
      description: z.description,
      type: 'zone',
      isPrimary: z.pluginData?.configZoneType === 'primary',
      position: z.position,
      forums: [],
      theme: buildTheme(z),
      icon: z.icon,
      features: z.pluginData?.features || [],
      customComponents: z.pluginData?.customComponents || [],
      staffOnly: z.pluginData?.staffOnly || false,
      hasXpBoost: z.xpMultiplier > 1,
      boostMultiplier: z.xpMultiplier,
      xpChallenges: z.pluginData?.xpChallenges,
      zoneBadges: z.pluginData?.zoneBadges,
      threadCount: z.threadCount,
      postCount: z.postCount,
      updatedAt: z.updatedAt,
      categories: [],
    };
    zones.push(zone);
    zoneById.set(zone.id, zone);
  });

  // Forums tier 1
  resp.forums.forEach((f) => {
    if (f.parentId && zoneById.has(f.parentId)) {
      const m = makeMergedForum(f, f.parentId);
      forums[m.slug] = m;
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
      forumById.set(sub.id, sub);
      parent.subforums.push(sub);
    }
  });

  return { zones, forums };
}

function fallbackStructure(staticZones: Zone[]) {
  const zones: MergedZone[] = [];
  const forums: Record<string, MergedForum> = {};

  staticZones.forEach((z) => {
    const mz: MergedZone = {
      id: FALLBACK_ZONE_ID,
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
        colorTheme: z.theme?.colorTheme,
      },
      features: [],
      customComponents: [],
      staffOnly: false,
      threadCount: 0,
      postCount: 0,
      categories: [],
    };

    z.forums.forEach((f) => {
      const mf: MergedForum = {
        id: FALLBACK_FORUM_ID,
        slug: f.slug,
        name: f.name,
        description: f.description,
        type: 'forum',
        parentId: FALLBACK_ZONE_ID,
        parentZoneId: FALLBACK_ZONE_ID,
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
          colorTheme: f.themeOverride?.colorTheme || mz.theme.colorTheme,
        },
        rules: {
          allowPosting: f.rules?.allowPosting ?? true,
          xpEnabled: f.rules?.xpEnabled ?? false,
          tippingEnabled: false,
          allowPolls: false,
          allowTags: false,
          prefixGrantRules: undefined,
        },
        threadCount: 0,
        postCount: 0,
        parentCategoryId: null,
        canHaveThreads: true,
      };
      forums[mf.slug] = mf;
      mz.forums.push(mf);
    });

    zones.push(mz);
  });

  return { zones, forums };
}

// ---------------- Context ------------------
const ForumStructureContext = createContext<ForumStructureContextType | undefined>(
  undefined
);

export const ForumStructureProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: raw, isLoading, error: netErr } = useQuery({
    queryKey: [FORUM_STRUCTURE_API_PATH],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const { zones, forums, isUsingFallback, parseError } = useMemo(() => {
    if (raw) {
      try {
        const parsed = ForumStructureApiResponseSchema.parse(raw);
        const processed = processApiData(parsed);
        return { ...processed, isUsingFallback: false, parseError: null };
      } catch (e) {
        console.error('[ForumStructureContext] invalid API payload', e);
      }
    }
    const fb = fallbackStructure(forumMap.zones);
    return { ...fb, isUsingFallback: true, parseError: raw ? new Error('Invalid API format') : null };
  }, [raw]);

  const primaryZones = useMemo(() => zones.filter((z) => z.isPrimary), [zones]);
  const generalZones = useMemo(() => zones.filter((z) => !z.isPrimary), [zones]);

  const value = useMemo<ForumStructureContextType>(() => ({
    zones,
    forums,
    primaryZones,
    generalZones,
    getZone: (s) => zones.find((z) => z.slug === s),
    getForum: (s) => forums[s],
    getParentZone: (forumSlug) => {
      const f = forums[forumSlug];
      if (!f) return undefined;
      return zones.find((z) => z.id === f.parentZoneId);
    },
    isPrimaryZone: (s) => primaryZones.some((z) => z.slug === s),
    isGeneralZone: (s) => generalZones.some((z) => z.slug === s),
    getZonesByType: (t) => (t === 'primary' ? primaryZones : generalZones),
    isLoading,
    error: netErr || parseError || null,
    isUsingFallback,
  }), [zones, forums, primaryZones, generalZones, isLoading, netErr, parseError, isUsingFallback]);

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
    console.warn('[DEPRECATION] Use generalZones instead of categories');
    return {} as Record<string, unknown>;
  },
  getCategory: (slug: string) => {
    console.warn(`[DEPRECATION] getCategory(${slug}) removed – use getForum()`);
    return undefined;
  },
};
