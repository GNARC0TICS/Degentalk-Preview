import React, { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod'; // Import Zod
import { forumMap } from '@/config/forumMap.config';
import type { Zone, Forum, ForumTheme as StaticForumTheme } from '@/config/forumMap.config';
import { getQueryFn } from '@/lib/queryClient';
// Removed logger import, will use console.error

// --- Zod Schemas for API Validation ---
const ApiCategoryDataSchema = z.object({
  id: z.number(),
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullish(),
  parentId: z.number().nullish(),
  type: z.enum(['zone', 'category', 'forum']),
  position: z.number().optional(),
  isVip: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  isHidden: z.boolean().optional(),
  minXp: z.number().optional(),
  minGroupIdRequired: z.number().nullish(),
  color: z.string().nullish(),
  icon: z.string().nullish(),
  colorTheme: z.string().nullish(),
  tippingEnabled: z.boolean().optional(),
  xpMultiplier: z.number().optional(),
  pluginData: z.record(z.string(), z.any()).nullish(), // Basic check for pluginData as object
  threadCount: z.number(),
  postCount: z.number(),
  parentForumSlug: z.string().nullish(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  isPrimary: z.boolean().optional(), // Crucial for zones
  features: z.array(z.string()).optional(),
  customComponents: z.array(z.string()).optional(),
  staffOnly: z.boolean().optional(),
});

const ForumStructureApiResponseSchema = z.object({
  zones: z.array(ApiCategoryDataSchema),
  categories: z.array(ApiCategoryDataSchema).optional().default([]),
  forums: z.array(ApiCategoryDataSchema).optional().default([]),
});


// --- Core Types ---

// Plugin data types for extensibility
export interface PluginDataTheme {
  bannerImage?: string | null;
  // Add other theme-related fields as needed
}

export interface PluginDataRules {
  prefixGrantRules?: Record<string, unknown>;
  // Add other rules-related fields as needed
}

// Plugin data for Primary Zone features
export interface PluginDataPrimaryZone {
  features?: string[]; // ['quests', 'airdrop', 'zoneShop', 'leaderboard']
  customComponents?: string[]; // ['LiveOddsWidget', 'CasinoLeaderboard']
  staffOnly?: boolean;
  xpChallenges?: Array<{
    id: string;
    name: string;
    description: string;
    xpReward: number;
  }>;
  zoneBadges?: Array<{
    id: string;
    name: string;
    icon: string;
    requirement: string;
  }>;
}
/* Duplicate PluginDataPrimaryZone interface removed */
// export interface PluginDataPrimaryZone {
// features?: string[]; // ['quests', 'airdrop', 'zoneShop', 'leaderboard']
// customComponents?: string[]; // ['LiveOddsWidget', 'CasinoLeaderboard']
// staffOnly?: boolean;
// xpChallenges?: Array<{
// id: string;
// name: string;
// description: string;
// xpReward: number;
// }>;
// zoneBadges?: Array<{
// id: string;
// name: string;
// icon: string;
// requirement: string;
// }>;
// }

// API response type matching backend schema
// --- The following lines were part of the duplicate interface and should be removed or fully commented ---
// xpChallenges?: Array<{
// id: string;
// name: string;
// description: string;
// xpReward: number;
// }>;
// zoneBadges?: Array<{
// id: string;
// name: string;
// icon: string;
// requirement: string;
// }>;
// } // This closing brace was also part of the duplicate

// API response type matching backend schema
export interface ApiCategoryData {
  // Identity
  id: number;
  slug: string;
  name: string;
  description?: string | null;

  // Hierarchy
  parentId?: number | null;
  type: 'zone' | 'category' | 'forum';
  position?: number;

  // Access control
  isVip?: boolean;
  isLocked?: boolean;
  isHidden?: boolean;
  minXp?: number;
  minGroupIdRequired?: number | null;

  // Appearance
  color?: string | null;
  icon?: string | null;
  colorTheme?: string | null;

  // Features
  tippingEnabled?: boolean;
  xpMultiplier?: number;
  
  // Extensibility
  pluginData?: (PluginDataTheme & PluginDataRules & PluginDataPrimaryZone & Record<string, unknown>) | null;
  
  // Stats (aggregated by backend)
  threadCount: number;
  postCount: number;
  
  // Metadata
  parentForumSlug?: string | null;
  createdAt?: string;
  updatedAt?: string;
  
  // Primary Zone fields (from backend enhancement)
  isPrimary?: boolean;
  features?: string[];
  customComponents?: string[];
  staffOnly?: boolean;
}

// Merged theme combining static config and API data
export interface MergedTheme {
  icon?: string | null;
  color?: string | null;
  bannerImage?: string | null;
  colorTheme?: string | null;
}

// Merged rules combining static config and API data
export interface MergedRules {
  allowPosting: boolean;
  xpEnabled: boolean;
  tippingEnabled: boolean;
  prefixGrantRules?: Record<string, unknown>;
  allowPolls?: boolean;
  allowTags?: boolean;
}

// Merged forum type (only forums can have threads)
export interface MergedForum extends Omit<ApiCategoryData, 'type'> {
  type: 'forum';
  theme: MergedTheme;
  rules: MergedRules;
  canHaveThreads: boolean;
  parentCategoryId?: number | null; // This will effectively become parentForumId if parent is a forum, or parentZoneId if parent is a zone.
                                   // The 'processApiData' logic will need to handle this distinction.
  
  // ADDED: Represents child subforums.
  // Only one level of subforum nesting is supported.
  forums?: MergedForum[];
}

// Merged category type (categories organize forums)
export interface MergedCategory extends Omit<ApiCategoryData, 'type'> {
  type: 'category';
  forums: MergedForum[];
  theme: MergedTheme;
  parentZoneId?: number | null;
}

// Merged zone type (zones are top-level groupings)
export interface MergedZone extends Omit<ApiCategoryData, 'type' | 'parentId'> {
  type: 'zone';
  categories: MergedCategory[];
  forums: MergedForum[]; // Direct forums (not in categories)
  theme: MergedTheme;
  isZone: true;
  canonical: boolean;
  hasXpBoost: boolean;
  boostMultiplier: number;
  // Primary Zone features
  isPrimary: boolean;
  features: string[];
  customComponents: string[];
  staffOnly: boolean;
  xpChallenges?: Array<{
    id: string;
    name: string;
    description: string;
    xpReward: number;
  }>;
  zoneBadges?: Array<{
    id: string;
    name: string;
    icon: string;
    requirement: string;
  }>;
}

// API response structure
export interface ForumStructureApiResponse {
  zones: ApiCategoryData[];
  categories: ApiCategoryData[];
  forums: ApiCategoryData[];
}

// Context type
export interface ForumStructureContextType {
  zones: MergedZone[];
  categories: Record<string, MergedCategory>;
  forums: Record<string, MergedForum>;
  getZone: (slug: string) => MergedZone | undefined;
  getCategory: (slug: string) => MergedCategory | undefined;
  getForum: (slug: string) => MergedForum | undefined;
  getParentZone: (forumOrCategorySlug: string) => MergedZone | undefined;
  isLoading: boolean;
  error: Error | null;
}

// --- Constants ---

const FORUM_STRUCTURE_API_PATH = '/api/forum/structure';

const DEFAULT_RULES: MergedRules = {
  allowPosting: false,
  xpEnabled: false,
  tippingEnabled: false,
  allowPolls: false,
  allowTags: false,
};

// --- Helper Functions ---

/**
 * Creates a fallback forum when API data is missing
 */
function createFallbackForum(
  staticForum: Forum,
  parentId: number,
  parentSlug: string,
  zoneTheme: Partial<StaticForumTheme> = {}
): MergedForum {
  const theme = staticForum.themeOverride || zoneTheme;
  const rules = staticForum.rules || {};

  return {
    // Identity
    id: -1,
    slug: staticForum.slug,
    name: staticForum.name,
    description: null,
    type: 'forum',

    // Hierarchy
    parentId,
    parentForumSlug: parentSlug,
    position: 0,

    // Access control
    isVip: false,
    isLocked: false,
    isHidden: false,
    minXp: 0,
    minGroupIdRequired: null,

    // Appearance
    color: theme.color || null,
    icon: theme.icon || null,
    colorTheme: theme.colorTheme || null,

    // Features
    tippingEnabled: false,
    xpMultiplier: 1,

    // Stats
    threadCount: 0,
    postCount: 0,
    
    // Merged data
    theme: {
      icon: theme.icon,
      color: theme.color,
      bannerImage: theme.bannerImage,
      colorTheme: theme.colorTheme,
    },
    rules: {
      allowPosting: rules.allowPosting ?? DEFAULT_RULES.allowPosting,
      xpEnabled: rules.xpEnabled ?? DEFAULT_RULES.xpEnabled,
      tippingEnabled: false,
      prefixGrantRules: undefined,
      allowPolls: false,
      allowTags: false,
    },
    canHaveThreads: true,
    
    // Metadata
    pluginData: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Creates a fallback zone when API data is missing
 */
function createFallbackZone(staticZone: Zone): MergedZone {
  const theme = staticZone.theme || {};
  
  return {
    // Identity
    id: -1,
    slug: staticZone.slug,
    name: staticZone.name,
    description: staticZone.description,
    type: 'zone',
    
    // Hierarchy
    position: 0,
    
    // Access control
    isVip: false,
    isLocked: false,
    isHidden: false,
    minXp: 0,
    minGroupIdRequired: null,
    
    // Appearance
    color: theme.color || null,
    icon: theme.icon || null,
    colorTheme: theme.colorTheme || null,
    
    // Features
    tippingEnabled: false,
    xpMultiplier: 1,
    
    // Stats
    threadCount: 0,
    postCount: 0,
    
    // Merged data
    theme: {
      icon: theme.icon,
      color: theme.color,
      bannerImage: theme.bannerImage,
      colorTheme: theme.colorTheme,
    },
    isZone: true,
    canonical: true,
    hasXpBoost: false,
    boostMultiplier: 1,
    categories: [],
    forums: staticZone.forums.map(f => 
      createFallbackForum(f, -1, staticZone.slug, theme)
    ),
    // Primary Zone features (defaults for fallback)
    isPrimary: staticZone.type === 'primary',
    features: [],
    customComponents: [],
    staffOnly: false,
    xpChallenges: undefined,
    zoneBadges: undefined,
    
    // Metadata
    pluginData: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Flattens hierarchical API response into a flat list
 */
function flattenApiResponse(response: ForumStructureApiResponse): ApiCategoryData[] {
  const flattened: ApiCategoryData[] = [];
  
  // Add all zones, categories, and forums
  if (response.zones) flattened.push(...response.zones);
  if (response.categories) flattened.push(...response.categories);
  if (response.forums) flattened.push(...response.forums);
  
  return flattened;
}

/**
 * Processes API data into the three-level hierarchy
 */
function processApiData(apiData: ApiCategoryData[]): { 
  zones: MergedZone[], 
  categories: Record<string, MergedCategory>, 
  forums: Record<string, MergedForum> 
} {
  const zones: MergedZone[] = [];
  const categories: Record<string, MergedCategory> = {};
  const forums: Record<string, MergedForum> = {};
  const forumById = new Map<number, MergedForum>();
  
  // First pass: Create all entities
  const zoneMap = new Map<number, MergedZone>();
  const categoryMap = new Map<number, MergedCategory>();
  
  // Process zones
  apiData.filter(item => item.type === 'zone').forEach(apiZone => {
    const zone: MergedZone = {
      ...apiZone,
      type: 'zone',
      categories: [],
      forums: [],
      theme: {
        icon: apiZone.icon,
        color: apiZone.color,
        bannerImage: apiZone.pluginData?.bannerImage,
        colorTheme: apiZone.colorTheme,
      },
      isZone: true,
      canonical: !apiZone.parentId, // Canonical zones have no parent
      hasXpBoost: (apiZone.xpMultiplier ?? 1) > 1,
      boostMultiplier: apiZone.xpMultiplier ?? 1,
      // Primary Zone features: rely on explicit isPrimary flag from API.
      // If backend omits this flag, default to false (treat as general zone).
      isPrimary: apiZone.isPrimary ?? false,
      features: apiZone.features ?? apiZone.pluginData?.features ?? [],
      customComponents: apiZone.customComponents ?? apiZone.pluginData?.customComponents ?? [],
      staffOnly: apiZone.staffOnly ?? apiZone.pluginData?.staffOnly ?? false,
      xpChallenges: apiZone.pluginData?.xpChallenges,
      zoneBadges: apiZone.pluginData?.zoneBadges,
    };
    zones.push(zone);
    zoneMap.set(zone.id, zone);
  });
  
  // Process categories
  apiData.filter(item => item.type === 'category').forEach(apiCategory => {
    const category: MergedCategory = {
      ...apiCategory,
      type: 'category',
      forums: [],
      theme: {
        icon: apiCategory.icon,
        color: apiCategory.color,
        bannerImage: apiCategory.pluginData?.bannerImage,
        colorTheme: apiCategory.colorTheme,
      },
      parentZoneId: apiCategory.parentId,
    };
    categories[category.slug] = category;
    categoryMap.set(category.id, category);
    
    // Add to parent zone if exists
    if (apiCategory.parentId && zoneMap.has(apiCategory.parentId)) {
      zoneMap.get(apiCategory.parentId)!.categories.push(category);
    }
  });
  
  // Process forums
  apiData.filter(item => item.type === 'forum').forEach(apiForum => {
    const forum: MergedForum = {
      ...apiForum,
      type: 'forum',
      theme: {
        icon: apiForum.icon,
        color: apiForum.color,
        bannerImage: apiForum.pluginData?.bannerImage,
        colorTheme: apiForum.colorTheme,
      },
      rules: {
        allowPosting: !apiForum.isLocked,
        xpEnabled: (apiForum.xpMultiplier ?? 1) > 0,
        tippingEnabled: apiForum.tippingEnabled ?? false,
        prefixGrantRules: apiForum.pluginData?.prefixGrantRules,
        allowPolls: DEFAULT_RULES.allowPolls,
        allowTags: DEFAULT_RULES.allowTags,
      },
      canHaveThreads: true,
      parentCategoryId: apiForum.parentId,
    };
    forums[forum.slug] = forum;
    forumById.set(forum.id, forum);
    
    // Add to parent container based on parentId
    if (apiForum.parentId) {
      if (categoryMap.has(apiForum.parentId)) {
        // Forum belongs to a category
        categoryMap.get(apiForum.parentId)!.forums.push(forum);
      } else if (zoneMap.has(apiForum.parentId)) {
        // Forum belongs directly to a zone
        zoneMap.get(apiForum.parentId)!.forums.push(forum);
      } else if (forumById.has(apiForum.parentId)) {
        // Forum is a subforum of another forum
        const parentForum = forumById.get(apiForum.parentId)!;
        if (!parentForum.forums) parentForum.forums = [];
        parentForum.canHaveThreads = parentForum.canHaveThreads && false; // parent forum becomes container only
        parentForum.forums.push(forum);
      }
    }
  });
  
  return { zones, categories, forums };
}

/**
 * Merges static config with API data - UPDATED for three-level hierarchy
 */
function mergeStaticAndApiData(
  staticZones: Zone[],
  apiData: ApiCategoryData[] | undefined
): { zones: MergedZone[], categories: Record<string, MergedCategory>, forums: Record<string, MergedForum> } {
  // If no API data, create fallback structure from static config
  if (!apiData) {
    const zones: MergedZone[] = [];
    const categories: Record<string, MergedCategory> = {};
    const forums: Record<string, MergedForum> = {};
    
    staticZones.forEach(staticZone => {
      const fallbackZone = createFallbackZone(staticZone);
      fallbackZone.forums.forEach(forum => {
        forums[forum.slug] = forum;
      });
      zones.push(fallbackZone);
    });
    
    return { zones, categories, forums };
  }
  
  // Process API data into three-level hierarchy
  return processApiData(apiData);
}

// --- Context Implementation ---

const ForumStructureContext = createContext<ForumStructureContextType | undefined>(undefined);

export const ForumStructureProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: rawApiResponse, isLoading, error: queryError } = useQuery<unknown | null, Error>({ // Fetch as unknown first
    queryKey: [FORUM_STRUCTURE_API_PATH],
    queryFn: getQueryFn({ on401: 'returnNull' }), // Reverted to original
    staleTime: 5 * 60 * 1000,
  });

  const [parsingError, setParsingError] = React.useState<Error | null>(null);

  const apiResponse = useMemo(() => {
    if (!rawApiResponse) return null;
    try {
      const parsed = ForumStructureApiResponseSchema.parse(rawApiResponse);
      setParsingError(null); // Clear previous errors
      return parsed as ForumStructureApiResponse; // Cast after successful parsing
    } catch (e) {
      console.error('[ForumStructureContext] API response validation failed:', e, 'Raw data:', rawApiResponse);
      setParsingError(e instanceof Error ? e : new Error('API response validation failed'));
      return null; // Or handle fallback more gracefully
    }
  }, [rawApiResponse]);
  
  const { zones, categories, forums } = useMemo(() => {
    // If API response is null (due to fetch error or parsing error), flatData will be undefined
    const flatData = apiResponse ? flattenApiResponse(apiResponse) : undefined;
    return mergeStaticAndApiData(forumMap.zones, flatData);
  }, [apiResponse]);

  const error = queryError || parsingError; // Combine fetch and parsing errors
  
  const contextValue = useMemo(() => ({
    zones,
    categories,
    forums,
    getZone: (slug: string) => zones.find(z => z.slug === slug),
    getCategory: (slug: string) => categories[slug],
    getForum: (slug: string) => forums[slug],
    getParentZone: (forumOrCategorySlug: string) => {
      // Check if it's a forum
      const forum = forums[forumOrCategorySlug];
      if (forum) {
        // If forum has a parent category, find the zone through the category
        if (forum.parentCategoryId) {
          const category = Object.values(categories).find(c => c.id === forum.parentCategoryId);
          if (category && category.parentZoneId) {
            return zones.find(z => z.id === category.parentZoneId);
          }
        }
        // If forum is directly in a zone
        return zones.find(z => z.id === forum.parentId);
      }
      
      // Check if it's a category
      const category = categories[forumOrCategorySlug];
      if (category && category.parentZoneId) {
        return zones.find(z => z.id === category.parentZoneId);
      }
      
      return undefined;
    },
    isLoading,
    error,
  }), [zones, categories, forums, isLoading, error]);
  
  return (
    <ForumStructureContext.Provider value={contextValue}>
      {children}
    </ForumStructureContext.Provider>
  );
};

// --- Hooks ---

export const useForumStructure = () => {
  const context = useContext(ForumStructureContext);
  if (!context) {
    throw new Error('useForumStructure must be used within ForumStructureProvider');
  }
  return context;
};

export const useZones = () => {
  const { zones, isLoading, error } = useForumStructure();
  return { zones, isLoading, error };
};

export const useForums = () => {
  const { forums, isLoading, error } = useForumStructure();
  return { forums, isLoading, error };
};
