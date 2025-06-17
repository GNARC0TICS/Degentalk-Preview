import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface ColumnDef<T> {
  key: string; // Corresponds to a key in the data object T
  header: string;
  render?: (row: T) => React.ReactNode; // Custom render function for the cell
}

interface EntityTableProps<T extends { id: string | number }> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading: boolean;
  isError?: boolean;
  error?: unknown; // Error object or message
  emptyStateMessage?: string;
  // For basic search functionality directly within the table component
  searchPlaceholder?: string;
  searchTerm?: string;
  onSearchChange?: (newSearchTerm: string) => void;
  // For custom row rendering logic if needed, though columns[].render should cover most cases
  renderRow?: (row: T, columns: ColumnDef<T>[]) => React.ReactNode;
  // For action buttons (e.g., Edit, Delete) per row
  renderActions?: (row: T) => React.ReactNode;
  className?: string;
  tableClassName?: string;
}

export function EntityTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading,
  isError,
  error,
  emptyStateMessage = 'No items found.',
  searchPlaceholder,
  searchTerm,
  onSearchChange,
  renderRow,
  renderActions,
  className,
  tableClassName,
}: EntityTableProps<T>) {
  const numColumns = columns.length + (renderActions ? 1 : 0);

  return (
    <div className={cn('space-y-4', className)}>
      {searchPlaceholder && onSearchChange && (
        <div className="flex justify-start">
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={searchTerm || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-xs bg-admin-input-bg border-admin-input-border focus:border-admin-input-focus-border"
          />
        </div>
      )}
      <div className="overflow-x-auto rounded-md border border-admin-subtle">
        <Table className={cn('min-w-[840px]', tableClassName)}>
          <TableHeader>
            <TableRow className="hover:bg-admin-surface-hover">
              {columns.map((col) => (
                <TableHead key={col.key} className="text-admin-text-secondary">
                  {col.header}
                </TableHead>
              ))}
              {renderActions && <TableHead className="text-right text-admin-text-secondary">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`} className="hover:bg-admin-surface-hover">
                  {columns.map((col) => (
                    <TableCell key={`${col.key}-skeleton-${rowIndex}`}>
                      <Skeleton className="h-5 w-full bg-admin-bg-element" />
                    </TableCell>
                  ))}
                  {renderActions && (
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-20 bg-admin-bg-element inline-block" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={numColumns} className="text-center text-admin-text-destructive py-8">
                  Error loading data: {error instanceof Error ? error.message : 'An unexpected error occurred.'}
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={numColumns} className="text-center text-admin-text-secondary py-8">
                  {emptyStateMessage}
                </TableCell>
              </TableRow>
            ) : renderRow ? (
              data.map((row) => renderRow(row, columns))
            ) : (
              data.map((row) => (
                <TableRow key={row.id} className="hover:bg-admin-surface-hover">
                  {columns.map((col) => (
                    <TableCell key={`${row.id}-${col.key}`} className="text-admin-text-primary">
                      {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '')}
                    </TableCell>
                  ))}
                  {renderActions && (
                    <TableCell className="text-right space-x-2">
                      {renderActions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
