import type { UserId } from '@shared/types/ids';
import React from 'react';
import { EntityTable } from '@/components/admin/layout/EntityTable';

/**
 * Unified AdminDataTable – thin wrapper around existing EntityTable so we can
 * progressively migrate all pages without rewriting logic immediately.
 * Provides the same API surface but lives in a central location to stop duplication.
 */
export interface AdminDataTableProps<T extends { id: UserId }> {
	columns: Parameters<typeof EntityTable<T>>[0]['columns'];
	data: T[];
	isLoading: boolean;
	isError?: boolean;
	error?: unknown;
	emptyStateMessage?: string;
	renderActions?: (row: T) => React.ReactNode;
}

export function AdminDataTable<T extends { id: UserId }>(props: AdminDataTableProps<T>) {
	return <EntityTable<T> {...props} />;
}
