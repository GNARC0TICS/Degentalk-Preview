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
      
      // Filter zones and categories
      const primaryZones = categories.filter(c => c.type === 'zone');
      const topLevelCategories = categories.filter(c => c.type === 'category' && !c.parentId);
      
      // Map categories to include child forums and all properties
      const categoriesWithForums = topLevelCategories.map(category => ({
        ...category,
        childForums: categories.filter(f => 
          f.type === 'forum' && f.parentId === category.id
        )
      }));

      return {
        primaryZones,
        categories: categoriesWithForums
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
