import { z } from 'zod';

// Widget type definitions
export type WidgetType = 'stats' | 'hotTopics' | 'recentActivity';

// Zod schema for validation
export const SidebarWidgetConfigSchema = z.object({
	default: z.array(z.enum(['stats', 'hotTopics', 'recentActivity'])),
	pit: z.array(z.enum(['stats', 'hotTopics', 'recentActivity'])).optional(),
	mission: z.array(z.enum(['stats', 'hotTopics', 'recentActivity'])).optional(),
	casino: z.array(z.enum(['stats', 'hotTopics', 'recentActivity'])).optional(),
	briefing: z.array(z.enum(['stats', 'hotTopics', 'recentActivity'])).optional(),
	archive: z.array(z.enum(['stats', 'hotTopics', 'recentActivity'])).optional(),
	shop: z.array(z.enum(['stats', 'hotTopics', 'recentActivity'])).optional(),
	general: z.array(z.enum(['stats', 'hotTopics', 'recentActivity'])).optional()
});

export type SidebarWidgetConfig = z.infer<typeof SidebarWidgetConfigSchema>;

// Widget configuration mapping
export const sidebarWidgets: SidebarWidgetConfig = {
	default: ['stats', 'hotTopics', 'recentActivity'],
	pit: ['stats', 'recentActivity'],
	mission: ['stats', 'hotTopics', 'recentActivity'],
	casino: ['stats', 'hotTopics'],
	briefing: ['stats', 'recentActivity'],
	archive: ['hotTopics', 'recentActivity'],
	shop: ['hotTopics'],
	general: ['stats', 'hotTopics', 'recentActivity']
} as const;

// Validate the configuration at compile time
const validatedConfig = SidebarWidgetConfigSchema.parse(sidebarWidgets);

export { validatedConfig as validatedSidebarWidgets };
