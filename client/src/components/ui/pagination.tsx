import React from 'react';
import { Button } from '@/components/ui/button';
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsLeftIcon,
	ChevronsRightIcon,
	MoreHorizontalIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BasePaginationProps {
	currentPage: number;
	onPageChange: (page: number) => void;
	showSummary?: boolean;
	className?: string;
}

interface ItemBasedPaginationProps extends BasePaginationProps {
	totalItems: number;
	pageSize: number;
	totalPages?: never;
}

interface PageBasedPaginationProps extends BasePaginationProps {
	totalPages: number;
	totalItems?: never;
	pageSize?: never;
}

type PaginationProps = ItemBasedPaginationProps | PageBasedPaginationProps;

export function Pagination(props: PaginationProps) {
	const { currentPage, onPageChange, showSummary = false, className } = props;

	// Calculate totalPages and ensure it's a number for the component's scope
	const finalTotalPages: number =
		'totalPages' in props && props.totalPages !== undefined
			? props.totalPages
			: Math.ceil(
					('totalItems' in props && props.totalItems !== undefined ? props.totalItems : 0) /
						('pageSize' in props && props.pageSize !== undefined ? props.pageSize : 10)
				);

	// Don't render pagination if there's only one page
	if (finalTotalPages <= 1) {
		return null;
	}

	// Create array of page numbers to display
	const getPageNumbers = () => {
		const pages = [];

		// Always show first page
		pages.push(1);

		// Add ellipsis after first page if needed
		if (currentPage > 3) {
			pages.push(-1); // -1 represents ellipsis
		}

		// Add pages around current page
		for (
			let i = Math.max(2, currentPage - 1);
			i <= Math.min(finalTotalPages - 1, currentPage + 1);
			i++
		) {
			pages.push(i);
		}

		// Add ellipsis before last page if needed
		if (currentPage < finalTotalPages - 2) {
			pages.push(-2); // -2 represents ellipsis (different key than first ellipsis)
		}

		// Always show last page if not already included
		if (finalTotalPages > 1) {
			pages.push(finalTotalPages);
		}

		return pages;
	};

	const pageNumbers = getPageNumbers();

	let summaryContent = null;
	if (
		showSummary &&
		'totalItems' in props &&
		props.totalItems !== undefined &&
		'pageSize' in props &&
		props.pageSize !== undefined
	) {
		// Type guard ensures props.totalItems and props.pageSize are numbers here
		const { totalItems, pageSize } = props;
		summaryContent = (
			<div className="text-sm text-zinc-400 mr-4">
				Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)}-
				{Math.min(currentPage * pageSize, totalItems)} of {totalItems} items
			</div>
		);
	}

	return (
		<div className={cn('flex flex-col sm:flex-row items-center justify-center gap-4', className)}>
			{summaryContent}

			<div className="flex items-center gap-1">
				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8 p-0 bg-zinc-900 border-zinc-800"
					onClick={() => onPageChange(1)}
					disabled={currentPage === 1}
				>
					<ChevronsLeftIcon className="h-4 w-4" />
					<span className="sr-only">First page</span>
				</Button>
				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8 p-0 bg-zinc-900 border-zinc-800"
					onClick={() => onPageChange(Math.max(1, currentPage - 1))}
					disabled={currentPage === 1}
				>
					<ChevronLeftIcon className="h-4 w-4" />
					<span className="sr-only">Previous page</span>
				</Button>

				{pageNumbers.map((pageNumber, i) => {
					// Render ellipsis
					if (pageNumber < 0) {
						return (
							<Button
								key={`ellipsis-${pageNumber}`}
								variant="ghost"
								className="h-8 w-8 p-0 text-zinc-500"
								disabled
							>
								<MoreHorizontalIcon className="h-4 w-4" />
								<span className="sr-only">More pages</span>
							</Button>
						);
					}

					// Render page numbers
					return (
						<Button
							key={pageNumber}
							variant={pageNumber === currentPage ? 'default' : 'outline'}
							className={cn(
								'h-8 w-8 p-0',
								pageNumber === currentPage
									? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-700'
									: 'bg-zinc-900 border-zinc-800'
							)}
							onClick={() => onPageChange(pageNumber!)} // pageNumber from map is guaranteed
						>
							<span>{pageNumber}</span>
							<span className="sr-only">Page {pageNumber}</span>
						</Button>
					);
				})}

				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8 p-0 bg-zinc-900 border-zinc-800"
					onClick={() => onPageChange(Math.min(finalTotalPages, currentPage + 1))}
					disabled={currentPage === finalTotalPages}
				>
					<ChevronRightIcon className="h-4 w-4" />
					<span className="sr-only">Next page</span>
				</Button>
				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8 p-0 bg-zinc-900 border-zinc-800"
					onClick={() => onPageChange(finalTotalPages)}
					disabled={currentPage === finalTotalPages}
				>
					<ChevronsRightIcon className="h-4 w-4" />
					<span className="sr-only">Last page</span>
				</Button>
			</div>
		</div>
	);
}

// Create primitives for those that need them
export const PaginationContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn('flex flex-wrap items-center gap-1', className)} {...props} />
));
PaginationContent.displayName = 'PaginationContent';

export const PaginationItem = React.forwardRef<
	HTMLLIElement,
	React.LiHTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => <li ref={ref} className={cn('', className)} {...props} />);
PaginationItem.displayName = 'PaginationItem';

export const PaginationLink = React.forwardRef<
	HTMLAnchorElement,
	React.ComponentPropsWithoutRef<'a'>
>(({ className, ...props }, ref) => (
	<a
		ref={ref}
		className={cn(
			'flex h-8 w-8 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 p-0',
			'hover:bg-zinc-800 hover:text-white',
			'focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2',
			className
		)}
		{...props}
	/>
));
PaginationLink.displayName = 'PaginationLink';

export const PaginationPrevious = React.forwardRef<
	HTMLAnchorElement,
	React.ComponentPropsWithoutRef<'a'>
>(({ className, ...props }, ref) => (
	<PaginationLink
		ref={ref}
		aria-label="Go to previous page"
		className={cn('gap-1 pl-2 pr-3', className)}
		{...props}
	>
		<ChevronLeftIcon className="h-4 w-4" />
		<span>Previous</span>
	</PaginationLink>
));
PaginationPrevious.displayName = 'PaginationPrevious';

export const PaginationNext = React.forwardRef<
	HTMLAnchorElement,
	React.ComponentPropsWithoutRef<'a'>
>(({ className, ...props }, ref) => (
	<PaginationLink
		ref={ref}
		aria-label="Go to next page"
		className={cn('gap-1 pl-3 pr-2', className)}
		{...props}
	>
		<span>Next</span>
		<ChevronRightIcon className="h-4 w-4" />
	</PaginationLink>
));
PaginationNext.displayName = 'PaginationNext';

export const PaginationEllipsis = React.forwardRef<
	HTMLSpanElement,
	React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
	<span
		ref={ref}
		aria-hidden
		className={cn('flex h-8 w-8 items-center justify-center', className)}
		{...props}
	>
		<MoreHorizontalIcon className="h-4 w-4" />
		<span className="sr-only">More pages</span>
	</span>
));
PaginationEllipsis.displayName = 'PaginationEllipsis';
