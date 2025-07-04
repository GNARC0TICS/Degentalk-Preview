/**
 * Thread Service Batch Optimization Methods
 * N+1 query elimination for getZoneInfo calls
 */

import { db } from '@db';
import { forumStructure } from '@schema';
import { inArray } from 'drizzle-orm';
import { logger } from '@server/src/core/logger';
import type { StructureId } from '@shared/types';

/**
 * Batch fetch zone information for multiple structure IDs
 * Eliminates N+1 queries in thread listing operations
 */
export async function getZoneInfoBatch(
	structureIds: StructureId[]
): Promise<
	Map<
		StructureId,
		{ id: StructureId; name: string; slug: string; colorTheme: string; isPrimary?: boolean } | null
	>
> {
	logger.info('ThreadService', 'Starting getZoneInfoBatch', {
		structureIds,
		count: structureIds.length
	});

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
				pluginData: forumStructure.pluginData,
				colorTheme: forumStructure.colorTheme
			})
			.from(forumStructure)
			.where(inArray(forumStructure.id, structureIds));

		// Get all unique parent IDs to fetch zone data
		const parentIds = [
			...new Set(structures.map((s) => s.parentId).filter(Boolean))
		] as StructureId[];

		let parentStructures: typeof structures = [];
		if (parentIds.length > 0) {
			parentStructures = await db
				.select({
					id: forumStructure.id,
					name: forumStructure.name,
					slug: forumStructure.slug,
					parentId: forumStructure.parentId,
					type: forumStructure.type,
					pluginData: forumStructure.pluginData,
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
			StructureId,
			{
				id: StructureId;
				name: string;
				slug: string;
				colorTheme: string;
				isPrimary?: boolean;
			} | null
		>();

		for (const structureId of structureIds) {
			try {
				const structure = structureMap.get(structureId);
				if (!structure) {
					logger.warn('ThreadService', `Structure ${structureId} not found in map`);
					zoneInfoMap.set(structureId, null);
					continue;
				}

				logger.info('ThreadService', `Processing structure ${structureId}`, {
					id: structure.id,
					name: structure.name,
					type: structure.type,
					parentId: structure.parentId,
					hasPluginData: !!structure.pluginData,
					pluginDataType: typeof structure.pluginData
				});

				// If this structure is itself a zone
				const pluginData = (structure.pluginData || {}) as any;
				const configZoneType = pluginData?.configZoneType;

				if (configZoneType && configZoneType !== 'none') {
					const zoneData = {
						id: structure.id,
						slug: structure.slug,
						name: structure.name,
						colorTheme: structure.colorTheme || 'default',
						isPrimary: configZoneType === 'primary'
					};
					zoneInfoMap.set(structureId, zoneData);
					continue;
				}

				// If this structure has a parent, check if parent is a zone
				if (structure.parentId) {
					const parentStructure = structureMap.get(structure.parentId);
					if (parentStructure) {
						const parentPluginData = (parentStructure.pluginData || {}) as any;
						const parentConfigZoneType = parentPluginData?.configZoneType;

						if (parentConfigZoneType && parentConfigZoneType !== 'none') {
							const zoneData = {
								id: parentStructure.id,
								slug: parentStructure.slug,
								name: parentStructure.name,
								colorTheme: parentStructure.colorTheme || 'default',
								isPrimary: parentConfigZoneType === 'primary'
							};
							zoneInfoMap.set(structureId, zoneData);
							continue;
						}
					}
				}

				// No zone found
				zoneInfoMap.set(structureId, null);
			} catch (structureError) {
				logger.error('ThreadService', `Error processing structure ${structureId}`, {
					error: structureError.message,
					stack: structureError.stack
				});
				zoneInfoMap.set(structureId, null);
			}
		}

		try {
			const resultSummary = Object.fromEntries(
				Array.from(zoneInfoMap.entries()).map(([id, zone]) => [
					id,
					zone ? `${zone.name} (${zone.slug})` : 'null'
				])
			);

			logger.info('ThreadService', `Batch zone info results:`, {
				requested: structureIds,
				found: Array.from(zoneInfoMap.values()).filter(Boolean).length,
				results: resultSummary
			});
		} catch (summaryError) {
			logger.error('ThreadService', 'Error creating result summary', {
				error: summaryError.message,
				mapSize: zoneInfoMap.size,
				mapEntries: Array.from(zoneInfoMap.entries())
			});
		}

		return zoneInfoMap;
	} catch (error) {
		logger.error('ThreadService', 'Failed to batch fetch zone info', {
			structureIds: structureIds.length,
			error: (error as Error).message
		});

		// Throw error so caller can implement fallback strategy
		throw error;
	}
}
