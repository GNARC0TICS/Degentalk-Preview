import type { UserId } from '@shared/types/ids';
import React from 'react';
import { EntityTable } from '@/features/admin/layout/layout/EntityTable';

/**
 * Unified AdminDataTable – thin wrapper around existing EntityTable so we can
 * progressively migrate all pages without rewriting logic immediately.
 * Provides the same API surface but lives in a central location to stop duplication.
 */
export interface AdminDataTableProps<T extends { id: UserId }> {
	columns: Parameters<typeof EntityTable<T>>[0]['columns'];
	data: T[];
	isLoading: boolean;
	isError?: boolean | undefined;
	error?: unknown | undefined;
	emptyStateMessage?: string;
	renderActions?: ((row: T) => React.ReactNode) | undefined;
	// Common props that admin pages often pass
	loading?: boolean | undefined;
	searchPlaceholder?: string;
	searchTerm?: string;
	onSearchChange?: ((newSearchTerm: string) => void) | undefined;
	className?: string;
	tableClassName?: string;
	renderRow?:
		| ((row: T, columns: Parameters<typeof EntityTable<T>>[0]['columns']) => React.ReactNode)
		| undefined;
	pagination?: { page: number; pageSize: number; total: number } | undefined;
	onPageChange?: ((page: number) => void) | undefined;
	onPageSizeChange?: ((pageSize: number) => void) | undefined;
}

export function AdminDataTable<T extends { id: UserId }>(props: AdminDataTableProps<T>) {
	// Map AdminDataTable props to EntityTable props
	const { loading, pagination, onPageChange, onPageSizeChange, ...entityTableProps } = props;

	// Use loading or isLoading, with loading taking precedence
	const finalLoading = loading ?? props.isLoading;

	return (
		<>
			<EntityTable<T> {...entityTableProps} isLoading={finalLoading} />
			{pagination && (
				<div className="flex items-center justify-between px-2 py-4">
					<div className="text-sm text-admin-text-secondary">
						Showing {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)} to{' '}
						{Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
						{pagination.total} results
					</div>
					<div className="flex gap-2">
						{onPageChange && (
							<>
								<button
									disabled={pagination.page <= 1}
									onClick={() => onPageChange(pagination.page - 1)}
									className="px-3 py-1 text-sm border rounded disabled:opacity-50"
								>
									Previous
								</button>
								<span className="px-3 py-1 text-sm">
									Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
								</span>
								<button
									disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
									onClick={() => onPageChange(pagination.page + 1)}
									className="px-3 py-1 text-sm border rounded disabled:opacity-50"
								>
									Next
								</button>
							</>
						)}
					</div>
				</div>
			)}
		</>
	);
}
