import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { forumApi } from '@/features/forum/services/forumApi';
import { ForumCategoryWithStats } from '@shared/types';

export interface ForumStructure {
  primaryZones: ForumCategoryWithStats[];
  categories: Array<{
    id: number;
    name: string;
    slug: string;
    childForums: ForumCategoryWithStats[];
  }>;
}

export function useForumStructure() {
  return useQuery<ForumStructure, Error>({
    queryKey: ['forum-structure'],
    queryFn: async () => {
      const categories = await forumApi.getCategories();
      
      // Map categories to include child forums and all properties
      // Primary zones filtering will be handled in the component
      const topLevelCategories = categories.filter(c => c.type === 'category' && !c.parentId);
      
      const categoriesWithForums = topLevelCategories.map(category => ({
        ...category,
        childForums: categories.filter(f => 
          f.type === 'forum' && f.parentId === category.id
        )
      }));

      return {
        // primaryZones will be handled by constants in the component
        primaryZones: [], // Return empty array as primary zones are from constants
        categories: categoriesWithForums
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
