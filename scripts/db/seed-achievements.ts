/**
 * Achievement Seeder
 * 
 * Seeds the database with initial achievement templates for the degen culture
 * and general participation achievements.
 */

import { db } from '@db';
import { achievements } from '../db/schema';
import { 
	CORE_ACHIEVEMENT_TEMPLATES, 
	CULTURAL_ACHIEVEMENT_TEMPLATES 
} from '@server/src/domains/gamification/achievements/templates/achievement-templates';

export async function seedAchievements() {
	console.log('🏆 Seeding achievements...');
	
	const allTemplates = [...CORE_ACHIEVEMENT_TEMPLATES, ...CULTURAL_ACHIEVEMENT_TEMPLATES];
	let createdCount = 0;
	let skippedCount = 0;
	
	for (const template of allTemplates) {
		try {
			// Extract template-specific fields and create achievement data
			const { templateId, templateName, templateDescription, tags, ...achievementData } = template;
			
			// Insert achievement, skipping if it already exists (by name)
			const result = await db
				.insert(achievements)
				.values({
					...achievementData,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.onConflictDoNothing({ target: achievements.name });
			
			if (result.rowCount && result.rowCount > 0) {
				createdCount++;
				console.log(`✅ Created achievement: ${achievementData.name}`);
			} else {
				skippedCount++;
				console.log(`⏭️  Skipped existing achievement: ${achievementData.name}`);
			}
			
		} catch (error) {
			console.error(`❌ Failed to create achievement from template ${template.templateId}:`, error);
		}
	}
	
	console.log(`🎯 Achievement seeding complete!`);
	console.log(`   📊 Created: ${createdCount} achievements`);
	console.log(`   ⏭️  Skipped: ${skippedCount} existing achievements`);
	console.log(`   📈 Total templates processed: ${allTemplates.length}`);
}

// Run seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	seedAchievements()
		.then(() => {
			console.log('✅ Achievement seeding finished successfully');
			process.exit(0);
		})
		.catch(error => {
			console.error('❌ Achievement seeding failed:', error);
			process.exit(1);
		});
}