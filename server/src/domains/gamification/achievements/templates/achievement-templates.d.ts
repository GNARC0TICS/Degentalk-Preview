/**
 * Achievement Templates
 *
 * Pre-built achievement configurations for common degen culture achievements.
 * Templates can be imported into the admin panel for quick setup.
 */
import type { InsertAchievement } from '@schema/gamification/achievements';
export interface AchievementTemplate extends Omit<InsertAchievement, 'id' | 'createdAt' | 'updatedAt'> {
    templateId: string;
    templateName: string;
    templateDescription: string;
    tags: string[];
}
export declare const CORE_ACHIEVEMENT_TEMPLATES: AchievementTemplate[];
export declare const CULTURAL_ACHIEVEMENT_TEMPLATES: AchievementTemplate[];
/**
 * Get all achievement templates organized by category
 */
export declare function getAllAchievementTemplates(): Record<string, AchievementTemplate[]>;
/**
 * Get template by ID
 */
export declare function getTemplateById(templateId: string): AchievementTemplate | null;
/**
 * Get templates by tags
 */
export declare function getTemplatesByTags(tags: string[]): AchievementTemplate[];
/**
 * Get templates by category
 */
export declare function getTemplatesByCategory(category: string): AchievementTemplate[];
