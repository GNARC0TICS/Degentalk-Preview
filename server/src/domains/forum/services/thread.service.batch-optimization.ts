/**
 * Thread Service Batch Optimization Methods
 * N+1 query elimination for getZoneInfo calls
 */

import { db } from '@/core/database';
import { forumStructure } from '@/db/schema';
import { inArray } from 'drizzle-orm';
import { logger } from '@/core/logger';

/**
 * Batch fetch zone information for multiple structure IDs
 * Eliminates N+1 queries in thread listing operations
 */
export async function getZoneInfoBatch(
	structureIds: number[]
): Promise<Map<number, { zone: { slug: string; name: string; colorTheme?: string } } | null>> {
	if (structureIds.length === 0) {
		return new Map();
	}

	try {
		// Batch query to get all parent zones for the given structure IDs
		const structures = await db
			.select({
				id: forumStructure.id,
				name: forumStructure.name,
				slug: forumStructure.slug,
				parentId: forumStructure.parentId,
				type: forumStructure.type,
				configZoneType: forumStructure.configZoneType,
				colorTheme: forumStructure.colorTheme
			})
			.from(forumStructure)
			.where(inArray(forumStructure.id, structureIds));

		// Get all unique parent IDs to fetch zone data
		const parentIds = [...new Set(structures.map((s) => s.parentId).filter(Boolean))] as number[];

		let parentStructures: typeof structures = [];
		if (parentIds.length > 0) {
			parentStructures = await db
				.select({
					id: forumStructure.id,
					name: forumStructure.name,
					slug: forumStructure.slug,
					parentId: forumStructure.parentId,
					type: forumStructure.type,
					configZoneType: forumStructure.configZoneType,
					colorTheme: forumStructure.colorTheme
				})
				.from(forumStructure)
				.where(inArray(forumStructure.id, parentIds));
		}

		// Create lookup map for all structures (including parents)
		const allStructures = [...structures, ...parentStructures];
		const structureMap = new Map(allStructures.map((s) => [s.id, s]));

		// Build zone info map
		const zoneInfoMap = new Map<
			number,
			{ zone: { slug: string; name: string; colorTheme?: string } } | null
		>();

		for (const structureId of structureIds) {
			const structure = structureMap.get(structureId);
			if (!structure) {
				zoneInfoMap.set(structureId, null);
				continue;
			}

			// If this structure is itself a zone
			if (structure.configZoneType && structure.configZoneType !== 'none') {
				zoneInfoMap.set(structureId, {
					zone: {
						slug: structure.slug,
						name: structure.name,
						colorTheme: structure.colorTheme || undefined
					}
				});
				continue;
			}

			// If this structure has a parent, check if parent is a zone
			if (structure.parentId) {
				const parentStructure = structureMap.get(structure.parentId);
				if (
					parentStructure &&
					parentStructure.configZoneType &&
					parentStructure.configZoneType !== 'none'
				) {
					zoneInfoMap.set(structureId, {
						zone: {
							slug: parentStructure.slug,
							name: parentStructure.name,
							colorTheme: parentStructure.colorTheme || undefined
						}
					});
					continue;
				}
			}

			// No zone found
			zoneInfoMap.set(structureId, null);
		}

		logger.debug('ThreadService', `Batch fetched zone info for ${structureIds.length} structures`, {
			structureIds: structureIds.length,
			foundZones: Array.from(zoneInfoMap.values()).filter(Boolean).length
		});

		return zoneInfoMap;
	} catch (error) {
		logger.error('ThreadService', 'Failed to batch fetch zone info', {
			structureIds: structureIds.length,
			error: (error as Error).message
		});

		// Return empty map to prevent errors, callers should handle null values
		const fallbackMap = new Map<
			number,
			{ zone: { slug: string; name: string; colorTheme?: string } } | null
		>();
		structureIds.forEach((id) => fallbackMap.set(id, null));
		return fallbackMap;
	}
}
