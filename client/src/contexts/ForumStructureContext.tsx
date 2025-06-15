import React, { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { forumMap } from '@/config/forumMap.config';
import type { Zone, Forum, ForumRules as StaticForumRulesImport, ForumTheme as StaticForumTheme } from '@/config/forumMap.config';
import { getQueryFn } from '@/lib/queryClient';

// --- Updated Types ---

// Specific known structures within the 'pluginData' JSONB field from the database.
export interface PluginDataTheme {
  bannerImage?: string | null;
  // other theme-related pluginData fields can be added here
}

export interface PluginDataRules {
  prefixGrantRules?: any; // TODO: Define a more specific type for prefixGrantRules
  // other rules-related pluginData fields can be added here
}

// Represents the data structure for a category/forum/zone as fetched from the API.
// Aligned with db/schema/forum/categories.ts and includes aggregated counts.
export type ApiCategoryDataFromApi = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: number | null;
  type: 'zone' | 'category' | 'forum'; // Should be non-optional from API
  position?: number;
  isVip?: boolean;
  isLocked?: boolean;
  isHidden?: boolean;
  minXp?: number;
  color?: string | null;
  icon?: string | null;
  colorTheme?: string | null;
  minGroupIdRequired?: number | null;
  tippingEnabled?: boolean;
  xpMultiplier?: number; // 'real' in DB, so number in TS
  pluginData?: (PluginDataTheme & PluginDataRules & Record<string, any>) | null; // Typed to include known theme/rules fields
  parentForumSlug?: string | null; // Slug of the parent zone/category, added from schema
  // Aggregated by backend:
  threadCount: number; // Total threads in this category/forum
  postCount: number; // Total posts in this category/forum
  // Timestamps (ISO string format from API)
  createdAt?: string; // Added from schema
  updatedAt?: string; // Added from schema
};

export interface MergedTheme {
  icon?: string | null;
  color?: string | null;
  bannerImage?: string | null;
}

export interface MergedRules {
  allowPosting: boolean;
  xpEnabled: boolean;
  tippingEnabled: boolean;
  prefixGrantRules?: any; // From pluginData
  // Retain flexibility for other static rules
  allowPolls?: boolean;
  allowTags?: boolean;
}

// MergedForum: Combines static config (Forum) with live API data (ApiCategoryDataFromApi)
export type MergedForum = Omit<Forum, 'rules' | 'themeOverride' | 'name' | 'description' | 'slug' | 'id' | 'type'> &
  Pick<
    ApiCategoryDataFromApi,
    | 'id'
    | 'slug'
    | 'name'
    | 'description'
    | 'parentId'
    | 'type' // Will be 'forum'
    | 'position'
    | 'isVip'
    | 'isLocked'
    | 'isHidden'
    | 'minXp'
    | 'color'
    | 'icon'
    | 'colorTheme'
    | 'minGroupIdRequired'
    | 'tippingEnabled'
    | 'xpMultiplier'
    | 'pluginData'
    | 'parentForumSlug' // Added: Slug of the parent entity
    | 'threadCount'
    | 'postCount'
    | 'createdAt' // Added: Timestamp of creation
    | 'updatedAt' // Added: Timestamp of last update
  > & {
  theme: MergedTheme;
  rules: MergedRules;
  canHaveThreads: boolean; // Derived: true for type 'forum'
};

// MergedZone: Combines static config (Zone) with live API data (ApiCategoryDataFromApi)
export type MergedZone = Omit<Zone, 'forums' | 'theme' | 'name' | 'description' | 'slug' | 'id' | 'type'> &
  Pick<
    ApiCategoryDataFromApi,
    | 'id'
    | 'slug'
    | 'name'
    | 'description'
    // | 'parentId' // Zones typically don't have parentId in this merged structure
    | 'type' // Will be 'zone'
    | 'position'
    | 'isVip'
    | 'isLocked'
    | 'isHidden'
    // isZone and canonical will be derived
    | 'minXp'
    | 'color'
    | 'icon'
    | 'colorTheme'
    | 'minGroupIdRequired'
    | 'tippingEnabled'
    | 'xpMultiplier'
    | 'pluginData'
    // parentForumSlug is usually not directly on a Zone from API in this context
    | 'threadCount'
    | 'postCount'
    | 'createdAt' // Added: Timestamp of creation
    | 'updatedAt' // Added: Timestamp of last update
  > & {
  forums: MergedForum[];
  theme: MergedTheme;
  isZone: boolean; // Derived property
  canonical: boolean; // Derived property
  // rules?: MergedRules; // Optional: if zones have their own distinct rules
  hasXpBoost: boolean;
  boostMultiplier: number;
};

// These types can remain as aliases if ApiCategoryDataFromApi covers all fields
export type ApiZoneEntry = ApiCategoryDataFromApi;
export type ApiForumEntry = ApiCategoryDataFromApi;
// --- End of Updated Types ---

// Intermediate type for the hierarchical structure from API
type HierarchicalApiEntry = ApiCategoryDataFromApi & { forums?: ApiForumEntry[] };

export type ForumStructureApiResponse = {
  primaryZones: HierarchicalApiEntry[];
  categories: HierarchicalApiEntry[]; // Categories from API are also groupers with nested forums
};

interface ForumStructureContextType {
  zones: MergedZone[];
  forums: Record<string, MergedForum>;
  getForum: (slug: string) => MergedForum | undefined;
  getZone: (slug: string) => MergedZone | undefined;
  getZoneByForumSlug: (forumSlug: string) => MergedZone | undefined;
  isLoading: boolean;
  error: Error | null;
}

const ForumStructureContext = createContext<ForumStructureContextType | undefined>(undefined);
const FORUM_STRUCTURE_API_PATH = '/api/forum/structure';

const defaultMergedRules: MergedRules = {
  allowPosting: false,
  xpEnabled: false,
  tippingEnabled: false,
  allowPolls: false,
  allowTags: false,
  // prefixGrantRules will be undefined by default
};

const mergeStaticAndApiData = (
  staticZonesConfig: Zone[],
  apiCategories: ForumStructureApiResponse['categories'] | undefined,
  defaultRulesToMerge: MergedRules
): { mergedZones: MergedZone[], flatForums: Record<string, MergedForum> } => {
  const flatForumsResult: Record<string, MergedForum> = {};

  if (!apiCategories) {
    // Fallback logic: Use static config with placeholder IDs and new types
    const fallbackZones: MergedZone[] = staticZonesConfig.map(zoneConfig => {
      const staticTheme: Partial<StaticForumTheme> = zoneConfig.theme || {};
      const mergedTheme: MergedTheme = {
        icon: staticTheme.icon,
        color: staticTheme.color,
        bannerImage: staticTheme.bannerImage,
      };
      const staticZoneRules = (zoneConfig as any).rules as Partial<StaticForumRulesImport> | undefined;

      return {
        slug: zoneConfig.slug,
        id: -1,
        name: zoneConfig.name,
        description: zoneConfig.description,
        type: 'zone',
        threadCount: 0,
        postCount: 0,
        theme: mergedTheme,
        hasXpBoost: false,
        boostMultiplier: 1,
        position: (zoneConfig as any).position || 0,
        isVip: false,
        isLocked: false,
        isHidden: false,
        // isZone and canonical derived below
        minXp: 0,
        color: staticTheme.color,
        icon: staticTheme.icon,
        colorTheme: (staticTheme as any).colorTheme,
        minGroupIdRequired: undefined,
        tippingEnabled: false,
        xpMultiplier: 1,
        pluginData: null,
        isZone: true, // Fallback zones are zones
        canonical: true, // Static config zones are treated as canonical
        forums: zoneConfig.forums.map(forumConfig => {
          const forumStaticTheme: Partial<StaticForumTheme> = forumConfig.themeOverride || staticTheme;
          const forumMergedTheme: MergedTheme = {
            icon: forumStaticTheme.icon,
            color: forumStaticTheme.color,
            bannerImage: forumStaticTheme.bannerImage,
          };
          const forumStaticRules: Partial<StaticForumRulesImport> = forumConfig.rules || staticZoneRules || {};
          const fallbackMergedForum: MergedForum = {
            slug: forumConfig.slug,
            id: -1,
            name: forumConfig.name,
            description: (forumConfig as any).description || null,
            type: 'forum',
            threadCount: 0,
            postCount: 0,
            parentId: -1,
            theme: forumMergedTheme,
            rules: {
              allowPosting: forumStaticRules.allowPosting ?? defaultRulesToMerge.allowPosting,
              xpEnabled: forumStaticRules.xpEnabled ?? defaultRulesToMerge.xpEnabled,
              tippingEnabled: (forumStaticRules as any).tippingEnabled ?? defaultRulesToMerge.tippingEnabled,
              prefixGrantRules: (forumStaticRules as any).prefixGrantRules,
              allowPolls: (forumStaticRules as any).allowPolls ?? defaultRulesToMerge.allowPolls,
              allowTags: (forumStaticRules as any).allowTags ?? defaultRulesToMerge.allowTags,
            },
            canHaveThreads: true,
            position: (forumConfig as any).position || 0,
            isVip: false,
            isLocked: false,
            isHidden: false,
            minXp: 0,
            color: forumStaticTheme.color,
            icon: forumStaticTheme.icon,
            colorTheme: (forumStaticTheme as any).colorTheme,
            minGroupIdRequired: undefined,
            pluginData: null, // Fallback: no specific plugin data
            parentForumSlug: undefined, // Fallback: unknown parent slug
            createdAt: new Date().toISOString(), // Fallback: current time
            updatedAt: new Date().toISOString(), // Fallback: current time
          };
          flatForumsResult[forumConfig.slug] = fallbackMergedForum;
          return fallbackMergedForum;
        }),
      };
    });
    return { mergedZones: fallbackZones, flatForums: flatForumsResult };
  }

  // Create lookup maps from API categories
  const apiZonesBySlug = new Map<string, ApiZoneEntry>();
  const apiForumsByParentIdAndSlug = new Map<number, Map<string, ApiForumEntry>>();

  apiCategories.forEach(cat => {
    const isZone = cat.type === 'zone' || (!cat.type && !cat.parentId);
    if (isZone) {
      apiZonesBySlug.set(cat.slug, cat as ApiZoneEntry);
    } else if (cat.parentId != null) {
      if (!apiForumsByParentIdAndSlug.has(cat.parentId)) {
        apiForumsByParentIdAndSlug.set(cat.parentId, new Map<string, ApiForumEntry>());
      }
      apiForumsByParentIdAndSlug.get(cat.parentId)!.set(cat.slug, cat as ApiForumEntry);
    }
  });

  const finalMergedZones: MergedZone[] = staticZonesConfig.map(staticZone => {
    const apiZone = apiZonesBySlug.get(staticZone.slug);

    if (!apiZone) {
      const staticTheme: Partial<StaticForumTheme> = staticZone.theme || {};
      const fallbackTheme: MergedTheme = {
        icon: staticTheme.icon,
        color: staticTheme.color,
        bannerImage: staticTheme.bannerImage,
      };
      const fallbackZone: MergedZone = {
        slug: staticZone.slug,
        id: -1,
        name: staticZone.name,
        description: staticZone.description,
        type: 'zone',
        threadCount: 0,
        postCount: 0,
        theme: fallbackTheme,
        hasXpBoost: false,
        boostMultiplier: 1,
        position: (staticZone as any).position || 0,
        isVip: false,
        isLocked: false,
        isHidden: false,
        // isZone and canonical derived below
        minXp: 0,
        color: staticTheme.color,
        icon: staticTheme.icon,
        colorTheme: (staticTheme as any).colorTheme,
        minGroupIdRequired: undefined,
        tippingEnabled: false,
        xpMultiplier: 1,
        pluginData: null, // Fallback: no specific plugin data
        isZone: true, // Fallback zones are zones
        canonical: true, // Static config zones are treated as canonical
        createdAt: new Date().toISOString(), // Fallback: current time
        updatedAt: new Date().toISOString(), // Fallback: current time
        forums: staticZone.forums.map(sf => {
           const sfTheme = sf.themeOverride || staticTheme;
           const sfMergedTheme: MergedTheme = { icon: sfTheme.icon, color: sfTheme.color, bannerImage: sfTheme.bannerImage };
           const sfStaticRules = sf.rules || {};
           const mergedFBRules: MergedRules = {
             allowPosting: sfStaticRules.allowPosting ?? defaultRulesToMerge.allowPosting,
             xpEnabled: sfStaticRules.xpEnabled ?? defaultRulesToMerge.xpEnabled,
             tippingEnabled: (sfStaticRules as any).tippingEnabled ?? defaultRulesToMerge.tippingEnabled,
             prefixGrantRules: (sfStaticRules as any).prefixGrantRules,
             allowPolls: (sfStaticRules as any).allowPolls ?? defaultRulesToMerge.allowPolls,
             allowTags: (sfStaticRules as any).allowTags ?? defaultRulesToMerge.allowTags,
           };
           const fbForum: MergedForum = {
                slug: sf.slug,
                id: -1,
                name: sf.name,
                description: (sf as any).description || null,
                type: 'forum',
                threadCount: 0, postCount: 0, parentId: -1,
                theme: sfMergedTheme, rules: mergedFBRules, canHaveThreads: true,
                position: (sf as any).position || 0,
                isVip: false, isLocked: false, isHidden: false, minXp: 0,
                color: sfMergedTheme.color, icon: sfMergedTheme.icon, colorTheme: (sfTheme as any).colorTheme,
                minGroupIdRequired: undefined,
                pluginData: null, // Fallback: no specific plugin data
                parentForumSlug: staticZone.slug, // Fallback: parent is the current static zone
                createdAt: new Date().toISOString(), // Fallback: current time
                updatedAt: new Date().toISOString(), // Fallback: current time
           };
           flatForumsResult[sf.slug] = fbForum;
           return fbForum;
        }),
      };
      return fallbackZone;
    }

    // API data found for the zone
    const mergedTheme: MergedTheme = {
      icon: apiZone.icon || staticZone.theme?.icon,
      color: apiZone.color || staticZone.theme?.color,
      bannerImage: apiZone.pluginData?.bannerImage || staticZone.theme?.bannerImage,
    };

    const mergedZoneForums: MergedForum[] = staticZone.forums.map(staticForum => {
      const forumsInApiZone = apiForumsByParentIdAndSlug.get(apiZone.id);
      const apiForum = forumsInApiZone ? forumsInApiZone.get(staticForum.slug) : undefined;

      if (!apiForum) {
        const sfTheme = staticForum.themeOverride || staticZone.theme || {};
        const fbForumTheme: MergedTheme = { icon: sfTheme.icon, color: sfTheme.color, bannerImage: sfTheme.bannerImage };
        const sfStaticRules = staticForum.rules || {};
        const fbForumRules: MergedRules = {
             allowPosting: sfStaticRules.allowPosting ?? defaultRulesToMerge.allowPosting,
             xpEnabled: sfStaticRules.xpEnabled ?? defaultRulesToMerge.xpEnabled,
             tippingEnabled: (sfStaticRules as any).tippingEnabled ?? defaultRulesToMerge.tippingEnabled,
             prefixGrantRules: (sfStaticRules as any).prefixGrantRules,
             allowPolls: (sfStaticRules as any).allowPolls ?? defaultRulesToMerge.allowPolls,
             allowTags: (sfStaticRules as any).allowTags ?? defaultRulesToMerge.allowTags,
        };
        const fbForum: MergedForum = {
            slug: staticForum.slug,
            id: -1,
            name: staticForum.name,
            description: (staticForum as any).description || null,
            type: 'forum',
            threadCount: 0, postCount: 0, parentId: apiZone.id, theme: fbForumTheme, rules: fbForumRules, canHaveThreads: true,
            position: (staticForum as any).position || 0,
            isVip: false, isLocked: false, isHidden: false, minXp: 0,
            color: fbForumTheme.color, icon: fbForumTheme.icon, colorTheme: (sfTheme as any).colorTheme,
            minGroupIdRequired: undefined,
            pluginData: null, // Fallback: no specific plugin data
            parentForumSlug: apiZone.slug, // Fallback: parent is the current API zone
            createdAt: new Date().toISOString(), // Fallback: current time
            updatedAt: new Date().toISOString(), // Fallback: current time
        };
        flatForumsResult[staticForum.slug] = fbForum;
        return fbForum;
      }

      // API data found for the forum
      const forumTheme: MergedTheme = {
        icon: apiForum.icon || staticForum.themeOverride?.icon || mergedTheme.icon,
        color: apiForum.color || staticForum.themeOverride?.color || mergedTheme.color,
        bannerImage: apiForum.pluginData?.bannerImage || staticForum.themeOverride?.bannerImage || mergedTheme.bannerImage,
      };

      const forumRules: MergedRules = {
        allowPosting: !(apiForum.isLocked ?? false),
        xpEnabled: (apiForum.xpMultiplier ?? 1) > 0,
        tippingEnabled: apiForum.tippingEnabled ?? false,
        prefixGrantRules: apiForum.pluginData?.prefixGrantRules,
        allowPolls: (staticForum.rules as any)?.allowPolls ?? defaultRulesToMerge.allowPolls,
        allowTags: (staticForum.rules as any)?.allowTags ?? defaultRulesToMerge.allowTags,
      };
      
      const currentApiForum = apiForum as ApiCategoryDataFromApi;

      const mergedForum: MergedForum = {
        slug: staticForum.slug, 
        id: currentApiForum.id,
        name: currentApiForum.name,
        description: currentApiForum.description,
        parentId: apiZone.id,
        type: 'forum',
        position: currentApiForum.position,
        isVip: currentApiForum.isVip,
        isLocked: currentApiForum.isLocked,
        isHidden: currentApiForum.isHidden,
        minXp: currentApiForum.minXp,
        color: currentApiForum.color,
        icon: currentApiForum.icon,
        colorTheme: currentApiForum.colorTheme,
        minGroupIdRequired: currentApiForum.minGroupIdRequired,
        tippingEnabled: currentApiForum.tippingEnabled,
        xpMultiplier: currentApiForum.xpMultiplier,
        pluginData: currentApiForum.pluginData, // Data from API
        parentForumSlug: apiZone.slug, // Parent is the current API zone
        threadCount: currentApiForum.threadCount, // Data from API
        postCount: currentApiForum.postCount, // Data from API
        createdAt: currentApiForum.createdAt, // Data from API
        updatedAt: currentApiForum.updatedAt, // Data from API
        theme: forumTheme,
        rules: forumRules,
        canHaveThreads: true,
      };
      flatForumsResult[staticForum.slug] = mergedForum;
      return mergedForum;
    });
    
    const currentApiZoneTyped = apiZone as ApiCategoryDataFromApi;

    return {
      slug: staticZone.slug, 
      id: currentApiZoneTyped.id,
      name: currentApiZoneTyped.name,
      description: currentApiZoneTyped.description,
      type: currentApiZoneTyped.type as 'zone' | 'category' | 'forum', // Ensure type is correctly passed
      position: currentApiZoneTyped.position,
      isVip: currentApiZoneTyped.isVip,
      isLocked: currentApiZoneTyped.isLocked,
      isHidden: currentApiZoneTyped.isHidden,
      isZone: currentApiZoneTyped.type === 'zone', // Derive isZone
      canonical: currentApiZoneTyped.type === 'zone' && !currentApiZoneTyped.parentId, // Derive canonical
      minXp: currentApiZoneTyped.minXp,
      color: currentApiZoneTyped.color,
      icon: currentApiZoneTyped.icon,
      colorTheme: currentApiZoneTyped.colorTheme,
      minGroupIdRequired: currentApiZoneTyped.minGroupIdRequired,
      tippingEnabled: currentApiZoneTyped.tippingEnabled, 
      xpMultiplier: currentApiZoneTyped.xpMultiplier,   
      pluginData: currentApiZoneTyped.pluginData,
      threadCount: currentApiZoneTyped.threadCount,
      postCount: currentApiZoneTyped.postCount,
      forums: mergedZoneForums,
      theme: mergedTheme,
      hasXpBoost: (currentApiZoneTyped.xpMultiplier ?? 1) > 1,
      boostMultiplier: currentApiZoneTyped.xpMultiplier ?? 1,
      createdAt: currentApiZoneTyped.createdAt, // Data from API
      updatedAt: currentApiZoneTyped.updatedAt, // Data from API
    };
  }).filter(zone => zone !== null) as MergedZone[];

  return { mergedZones: finalMergedZones, flatForums: flatForumsResult };
};

export const ForumStructureProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: apiResponse, isLoading, error } = useQuery<ForumStructureApiResponse | null, Error>({
    queryKey: [FORUM_STRUCTURE_API_PATH],
    queryFn: async () => {
      const fetchFn = getQueryFn({ on401: 'returnNull' });
      const response = await fetchFn({ queryKey: [FORUM_STRUCTURE_API_PATH], meta: undefined as unknown } as any);
      return response as ForumStructureApiResponse | null;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (!isLoading && error) { 
    console.error("[ForumStructureContext] API Error:", error);
  }

  const mergedData = useMemo(() => {
    // Call the shim function to flatten the API response
    const flatApiEntities = apiResponse ? flattenApiResponse(apiResponse) : undefined;
    // The existing mergeStaticAndApiData function now receives the flattened list
    const result = mergeStaticAndApiData(forumMap.zones, flatApiEntities, defaultMergedRules);
    return result;
  }, [apiResponse]); 

  const getForum = (slug: string) => mergedData.flatForums[slug];
  const getZone = (slug: string) => mergedData.mergedZones.find(zone => zone.slug === slug);

  const getZoneByForumSlug = (forumSlug: string): MergedZone | undefined => {
    const forum = getForum(forumSlug);
    if (forum && forum.parentId !== undefined && forum.parentId !== -1) {
      return mergedData.mergedZones.find(zone => zone.id === forum.parentId);
    }
    return undefined;
  };

  const contextValue = useMemo(() => ({
    zones: mergedData.mergedZones,
    forums: mergedData.flatForums,
    getForum,
    getZone,
    getZoneByForumSlug,
    isLoading,
    error,
  }), [mergedData, isLoading, error, getZoneByForumSlug]); // Added getZoneByForumSlug to dependencies

  return (
    <ForumStructureContext.Provider value={contextValue}>
      {children}
    </ForumStructureContext.Provider>
  );
};

export const useForumStructure = () => {
  const context = useContext(ForumStructureContext);
  if (context === undefined) {
    throw new Error('useForumStructure must be used within a ForumStructureProvider');
  }
  return context;
};

// Selector hook for zones
export const useZones = () => {
  const { zones, isLoading, error } = useForumStructure();
  return { zones, isLoading, error };
};

// Selector hook for all forums (flat record)
export const useForums = () => {
  const { forums, isLoading, error } = useForumStructure();
  return { forums, isLoading, error };
};

// Shim function to flatten the hierarchical API response
function flattenApiResponse(
  hierarchicalResponse: ForumStructureApiResponse
): (ApiZoneEntry | ApiForumEntry)[] {
  const allEntities: (ApiZoneEntry | ApiForumEntry)[] = [];

  // Process primaryZones
  if (hierarchicalResponse.primaryZones) {
    hierarchicalResponse.primaryZones.forEach(zoneWithForums => {
      // Add the zone itself
      const { forums, ...zoneData } = zoneWithForums;
      const zoneType = zoneData.type || 'zone';
      allEntities.push({
        ...(zoneData as ApiZoneEntry), // Cast to ensure base properties
        type: zoneType,
        isZone: zoneType === 'zone', 
        canonical: zoneType === 'zone' && !zoneData.parentId, 
        position: zoneData.position ?? 0,
        isVip: zoneData.isVip ?? false,
        isLocked: zoneData.isLocked ?? false,
        isHidden: zoneData.isHidden ?? false,
        minXp: zoneData.minXp ?? 0,
        color: zoneData.color ?? null,
        icon: zoneData.icon ?? null,
        colorTheme: zoneData.colorTheme ?? null,
        minGroupIdRequired: zoneData.minGroupIdRequired ?? null,
        tippingEnabled: zoneData.tippingEnabled ?? false,
        xpMultiplier: zoneData.xpMultiplier ?? 1.0,
        pluginData: zoneData.pluginData ?? {},
        threadCount: zoneData.threadCount ?? 0,
        postCount: zoneData.postCount ?? 0,
        createdAt: zoneData.createdAt ?? new Date().toISOString(),
        updatedAt: zoneData.updatedAt ?? new Date().toISOString(),
      } as ApiZoneEntry);

      // Add its forums
      if (forums) {
        forums.forEach((forum: ApiForumEntry) => { // Explicitly type forum
          allEntities.push({
            ...forum,
            type: forum.type || 'forum', // Default type
            isZone: false, 
            canonical: false, 
            parentId: forum.parentId ?? zoneData.id, // Ensure parentId is set
            position: forum.position ?? 0,
            isVip: forum.isVip ?? false,
            isLocked: forum.isLocked ?? false,
            isHidden: forum.isHidden ?? false,
            minXp: forum.minXp ?? 0,
            color: forum.color ?? null,
            icon: forum.icon ?? null,
            colorTheme: forum.colorTheme ?? null,
            minGroupIdRequired: forum.minGroupIdRequired ?? null,
            tippingEnabled: forum.tippingEnabled ?? false,
            xpMultiplier: forum.xpMultiplier ?? 1.0,
            pluginData: forum.pluginData ?? {},
            threadCount: forum.threadCount ?? 0,
            postCount: forum.postCount ?? 0,
            createdAt: forum.createdAt ?? new Date().toISOString(),
            updatedAt: forum.updatedAt ?? new Date().toISOString(),
          } as ApiForumEntry);
        });
      }
    });
  }

  // Process categories (which are zone-like entities grouping forums)
  if (hierarchicalResponse.categories) {
    hierarchicalResponse.categories.forEach(categoryWithForums => {
      // Add the category (zone-like group) itself
      const { forums, ...categoryData } = categoryWithForums;
      const categoryType = categoryData.type || 'zone';
      allEntities.push({
        ...(categoryData as ApiZoneEntry), // Cast to ensure base properties
        type: categoryType, 
        isZone: categoryType === 'zone' || categoryType === 'category', // Treat 'category' type as zone-like for grouping
        canonical: categoryType === 'zone' && !categoryData.parentId, // Only true zones without parents are canonical
        position: categoryData.position ?? 0,
        isVip: categoryData.isVip ?? false,
        isLocked: categoryData.isLocked ?? false,
        isHidden: categoryData.isHidden ?? false,
        minXp: categoryData.minXp ?? 0,
        color: categoryData.color ?? null,
        icon: categoryData.icon ?? null,
        colorTheme: categoryData.colorTheme ?? null,
        minGroupIdRequired: categoryData.minGroupIdRequired ?? null,
        tippingEnabled: categoryData.tippingEnabled ?? false,
        xpMultiplier: categoryData.xpMultiplier ?? 1.0,
        pluginData: categoryData.pluginData ?? {},
        threadCount: categoryData.threadCount ?? 0,
        postCount: categoryData.postCount ?? 0,
        createdAt: categoryData.createdAt ?? new Date().toISOString(),
        updatedAt: categoryData.updatedAt ?? new Date().toISOString(),
      } as ApiZoneEntry);

      // Add its forums
      if (forums) {
        forums.forEach((forum: ApiForumEntry) => { // Explicitly type forum
          allEntities.push({
            ...forum,
            type: forum.type || 'forum',
            isZone: false,
            canonical: false,
            parentId: forum.parentId ?? categoryData.id, // Ensure parentId is set
            position: forum.position ?? 0,
            isVip: forum.isVip ?? false,
            isLocked: forum.isLocked ?? false,
            isHidden: forum.isHidden ?? false,
            minXp: forum.minXp ?? 0,
            color: forum.color ?? null,
            icon: forum.icon ?? null,
            colorTheme: forum.colorTheme ?? null,
            minGroupIdRequired: forum.minGroupIdRequired ?? null,
            tippingEnabled: forum.tippingEnabled ?? false,
            xpMultiplier: forum.xpMultiplier ?? 1.0,
            pluginData: forum.pluginData ?? {},
            threadCount: forum.threadCount ?? 0,
            postCount: forum.postCount ?? 0,
            createdAt: forum.createdAt ?? new Date().toISOString(),
            updatedAt: forum.updatedAt ?? new Date().toISOString(),
          } as ApiForumEntry);
        });
      }
    });
  }
  return allEntities;
}
