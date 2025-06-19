import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface ThreadPaginationProps {
	currentPage: number;
	totalPages: number;
	postsPerPage?: number;
	totalPosts: number;
	onPageChange: (page: number) => void;
	showPostCount?: boolean;
	className?: string;
}

export function ThreadPagination({
	currentPage,
	totalPages,
	postsPerPage = 20,
	totalPosts,
	onPageChange,
	showPostCount = true,
	className = ''
}: ThreadPaginationProps) {
	const startPost = (currentPage - 1) * postsPerPage + 1;
	const endPost = Math.min(currentPage * postsPerPage, totalPosts);

	// Generate page numbers to show
	const getPageNumbers = () => {
		const pages: (number | 'ellipsis')[] = [];
		const maxVisiblePages = 7;

		if (totalPages <= maxVisiblePages) {
			// Show all pages if total is small
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Always show first page
			pages.push(1);

			if (currentPage > 3) {
				pages.push('ellipsis');
			}

			// Show pages around current page
			const start = Math.max(2, currentPage - 1);
			const end = Math.min(totalPages - 1, currentPage + 1);

			for (let i = start; i <= end; i++) {
				if (!pages.includes(i)) {
					pages.push(i);
				}
			}

			if (currentPage < totalPages - 2) {
				pages.push('ellipsis');
			}

			// Always show last page if not already included
			if (!pages.includes(totalPages)) {
				pages.push(totalPages);
			}
		}

		return pages;
	};

	if (totalPages <= 1) {
		return null;
	}

	const pageNumbers = getPageNumbers();

	return (
		<div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 ${className}`}>
			{/* Post count info */}
			{showPostCount && (
				<div className="text-sm text-zinc-400">
					Showing posts {startPost.toLocaleString()} - {endPost.toLocaleString()} of {totalPosts.toLocaleString()}
				</div>
			)}

			{/* Pagination controls */}
			<div className="flex items-center space-x-1">
				{/* Previous button */}
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
				>
					<ChevronLeft className="h-4 w-4 mr-1" />
					Previous
				</Button>

				{/* Page numbers */}
				<div className="flex items-center space-x-1">
					{pageNumbers.map((page, index) => {
						if (page === 'ellipsis') {
							return (
								<div key={`ellipsis-${index}`} className="px-3 py-2">
									<MoreHorizontal className="h-4 w-4 text-zinc-500" />
								</div>
							);
						}

						const isCurrentPage = page === currentPage;

						return (
							<Button
								key={page}
								variant={isCurrentPage ? "default" : "outline"}
								size="sm"
								onClick={() => onPageChange(page)}
								className={
									isCurrentPage
										? "bg-emerald-600 hover:bg-emerald-700 text-white"
										: "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
								}
							>
								{page}
							</Button>
						);
					})}
				</div>

				{/* Next button */}
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
				>
					Next
					<ChevronRight className="h-4 w-4 ml-1" />
				</Button>
			</div>

			{/* Jump to page input (optional for large threads) */}
			{totalPages > 10 && (
				<div className="flex items-center space-x-2 text-sm">
					<span className="text-zinc-400">Go to page:</span>
					<input
						type="number"
						min={1}
						max={totalPages}
						placeholder={currentPage.toString()}
						className="w-16 px-2 py-1 text-center bg-zinc-800 border border-zinc-700 rounded text-zinc-300 text-sm"
						onKeyPress={(e) => {
							if (e.key === 'Enter') {
								const value = parseInt((e.target as HTMLInputElement).value);
								if (value >= 1 && value <= totalPages) {
									onPageChange(value);
									(e.target as HTMLInputElement).value = '';
								}
							}
						}}
					/>
				</div>
			)}
		</div>
	);
}