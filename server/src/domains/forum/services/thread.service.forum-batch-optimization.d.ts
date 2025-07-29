/**
 * Thread Service Batch Optimization Methods
 * N+1 query elimination for getForumInfo calls
 */
import type { StructureId } from '@shared/types/ids';
/**
 * Batch fetch forum information for multiple structure IDs
 * Eliminates N+1 queries in thread listing operations
 */
export declare function getForumInfoBatch(structureIds: StructureId[]): Promise<Map<StructureId, {
    id: StructureId;
    name: string;
    slug: string;
    colorTheme: string;
    isPrimary?: boolean;
} | null>>;
