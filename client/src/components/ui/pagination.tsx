import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react';
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
  
  // Calculate totalPages if not directly provided
  const totalPages = 'totalPages' in props 
    ? props.totalPages 
    : Math.ceil((props.totalItems || 0) / (props.pageSize || 10));
  
  // Don't render pagination if there's only one page
  if (totalPages <= 1) {
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
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (currentPage < totalPages - 2) {
      pages.push(-2); // -2 represents ellipsis (different key than first ellipsis)
    }
    
    // Always show last page if not already included
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-center gap-4', className)}>
      {showSummary && 'totalItems' in props && 'pageSize' in props && (
        <div className="text-sm text-zinc-400 mr-4">
          Showing {Math.min((currentPage - 1) * props.pageSize + 1, props.totalItems)}-
          {Math.min(currentPage * props.pageSize, props.totalItems)} of {props.totalItems} items
        </div>
      )}
      
      <div className="flex items-center gap-1">
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
              variant={pageNumber === currentPage ? "default" : "outline"}
              className={cn(
                "h-8 w-8 p-0", 
                pageNumber === currentPage 
                  ? "bg-emerald-600 hover:bg-emerald-500 border-emerald-700"
                  : "bg-zinc-900 border-zinc-800"
              )}
              onClick={() => onPageChange(pageNumber)}
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
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRightIcon className="h-4 w-4" />
          <span className="sr-only">Next page</span>
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
  <div
    ref={ref}
    className={cn("flex flex-wrap items-center gap-1", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

export const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.LiHTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

export const PaginationLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a">
>(({ className, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "flex h-8 w-8 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 p-0",
      "hover:bg-zinc-800 hover:text-white",
      "focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2",
      className
    )}
    {...props}
  />
))
PaginationLink.displayName = "PaginationLink"

export const PaginationPrevious = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a">
>(({ className, ...props }, ref) => (
  <PaginationLink
    ref={ref}
    aria-label="Go to previous page"
    className={cn("gap-1 pl-2 pr-3", className)}
    {...props}
  >
    <ChevronLeftIcon className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
))
PaginationPrevious.displayName = "PaginationPrevious"

export const PaginationNext = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a">
>(({ className, ...props }, ref) => (
  <PaginationLink
    ref={ref}
    aria-label="Go to next page"
    className={cn("gap-1 pl-3 pr-2", className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRightIcon className="h-4 w-4" />
  </PaginationLink>
))
PaginationNext.displayName = "PaginationNext"

export const PaginationEllipsis = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    aria-hidden
    className={cn("flex h-8 w-8 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontalIcon className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
))
PaginationEllipsis.displayName = "PaginationEllipsis"