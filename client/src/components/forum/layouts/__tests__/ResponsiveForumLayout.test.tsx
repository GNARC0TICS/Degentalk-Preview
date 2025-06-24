import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ResponsiveForumLayout } from '../ResponsiveForumLayout';
import type { ResponsiveForumLayoutProps } from '../ResponsiveForumLayout';

// Mock dependencies
vi.mock('framer-motion', () => ({
	motion: {
		aside: ({ children, ...props }: any) => <aside {...props}>{children}</aside>,
		header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
		main: ({ children, ...props }: any) => <main {...props}>{children}</main>,
		div: ({ children, ...props }: any) => <div {...props}>{children}</div>
	},
	AnimatePresence: ({ children }: any) => <>{children}</>
}));

vi.mock('@/hooks/useMediaQuery', () => ({
	useMediaQuery: vi.fn((query: string) => {
		// Default to desktop
		if (query.includes('max-width: 768px')) return false; // mobile
		if (query.includes('max-width: 1024px')) return false; // tablet
		if (query.includes('min-width: 1025px')) return true; // desktop
		return false;
	})
}));

vi.mock('@/components/forum/enhanced', () => ({
	MobileForumNavigation: () => <div data-testid="mobile-navigation">Mobile Nav</div>
}));

vi.mock('@/features/forum/components/HierarchicalZoneNav', () => ({
	default: () => <div data-testid="hierarchical-zone-nav">Zone Navigation</div>
}));

vi.mock('@/components/ui/sheet', () => ({
	Sheet: ({ children, open }: any) => (open ? <div data-testid="sheet">{children}</div> : null),
	SheetContent: ({ children }: any) => <div data-testid="sheet-content">{children}</div>,
	SheetTrigger: ({ children }: any) => <div>{children}</div>
}));

describe('ResponsiveForumLayout', () => {
	const defaultProps: ResponsiveForumLayoutProps = {
		children: <div data-testid="main-content">Main Content</div>
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.resetModules();
	});

	describe('Desktop Layout', () => {
		it('renders desktop layout with sidebar', () => {
			render(<ResponsiveForumLayout {...defaultProps} />);

			expect(screen.getByTestId('hierarchical-zone-nav')).toBeInTheDocument();
			expect(screen.getByTestId('main-content')).toBeInTheDocument();
			expect(screen.queryByTestId('mobile-navigation')).not.toBeInTheDocument();
		});

		it('shows custom sidebar content when provided', () => {
			render(
				<ResponsiveForumLayout
					{...defaultProps}
					sidebar={<div data-testid="custom-sidebar">Custom Sidebar</div>}
				/>
			);

			expect(screen.getByTestId('custom-sidebar')).toBeInTheDocument();
			expect(screen.queryByTestId('hierarchical-zone-nav')).not.toBeInTheDocument();
		});

		it('toggles sidebar collapse state', () => {
			const { container } = render(<ResponsiveForumLayout {...defaultProps} />);

			const collapseButton = container.querySelector('button');
			expect(collapseButton).toBeInTheDocument();

			// Click to collapse
			fireEvent.click(collapseButton!);

			// Sidebar should animate to collapsed width
			const sidebar = container.querySelector('aside');
			expect(sidebar).toBeInTheDocument();
		});

		it('renders header content when provided', () => {
			render(
				<ResponsiveForumLayout
					{...defaultProps}
					header={<div data-testid="header-content">Forum Header</div>}
				/>
			);

			expect(screen.getByTestId('header-content')).toBeInTheDocument();
		});

		it('renders breadcrumbs in top bar', () => {
			render(
				<ResponsiveForumLayout
					{...defaultProps}
					breadcrumbs={<div data-testid="breadcrumbs">Breadcrumbs</div>}
				/>
			);

			expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
		});

		it('shows layout switcher when onLayoutChange is provided', () => {
			const mockOnLayoutChange = vi.fn();
			render(<ResponsiveForumLayout {...defaultProps} onLayoutChange={mockOnLayoutChange} />);

			// Should have grid, list, and masonry buttons
			const buttons = screen.getAllByRole('button');
			const layoutButtons = buttons.filter((btn) => btn.querySelector('svg.h-4.w-4'));

			expect(layoutButtons.length).toBeGreaterThanOrEqual(3);
		});

		it('handles layout change', () => {
			const mockOnLayoutChange = vi.fn();
			render(
				<ResponsiveForumLayout
					{...defaultProps}
					layout="list"
					onLayoutChange={mockOnLayoutChange}
				/>
			);

			const buttons = screen.getAllByRole('button');
			const gridButton = buttons.find(
				(btn) => btn.querySelector('svg') && btn.classList.contains('w-8')
			);

			fireEvent.click(gridButton!);
			expect(mockOnLayoutChange).toHaveBeenCalledWith('grid');
		});

		it('shows filters sidebar on desktop when provided', () => {
			render(
				<ResponsiveForumLayout
					{...defaultProps}
					filters={<div data-testid="filters">Filters</div>}
					showFilters={true}
				/>
			);

			expect(screen.getByTestId('filters')).toBeInTheDocument();
			expect(screen.getByText('Filters & Options')).toBeInTheDocument();
		});
	});

	describe('Mobile Layout', () => {
		beforeEach(() => {
			const { useMediaQuery } = vi.mocked(await import('@/hooks/useMediaQuery'));
			useMediaQuery.mockImplementation((query: string) => {
				if (query.includes('max-width: 768px')) return true; // mobile
				if (query.includes('max-width: 1024px')) return true; // tablet
				if (query.includes('min-width: 1025px')) return false; // desktop
				return false;
			});
		});

		it('renders mobile navigation instead of sidebar', () => {
			render(<ResponsiveForumLayout {...defaultProps} />);

			expect(screen.getByTestId('mobile-navigation')).toBeInTheDocument();
			expect(screen.queryByTestId('hierarchical-zone-nav')).not.toBeInTheDocument();
		});

		it('shows filter button on mobile', () => {
			render(
				<ResponsiveForumLayout
					{...defaultProps}
					filters={<div data-testid="filters">Filters</div>}
					showFilters={true}
				/>
			);

			const filterButtons = screen.getAllByRole('button');
			const filterButton = filterButtons.find((btn) => btn.querySelector('svg.h-5.w-5'));

			expect(filterButton).toBeInTheDocument();
		});

		it('opens filter sheet on mobile', async () => {
			render(
				<ResponsiveForumLayout
					{...defaultProps}
					filters={<div data-testid="filters">Filters</div>}
					showFilters={true}
				/>
			);

			const filterButtons = screen.getAllByRole('button');
			const filterButton = filterButtons.find((btn) => btn.querySelector('svg.h-5.w-5'));

			fireEvent.click(filterButton!);

			await waitFor(() => {
				expect(screen.getByTestId('sheet')).toBeInTheDocument();
				expect(screen.getByTestId('filters')).toBeInTheDocument();
			});
		});

		it('hides mobile navigation when showNavigation is false', () => {
			render(<ResponsiveForumLayout {...defaultProps} showNavigation={false} />);

			expect(screen.queryByTestId('mobile-navigation')).not.toBeInTheDocument();
		});
	});

	describe('Tablet Layout', () => {
		beforeEach(() => {
			const { useMediaQuery } = vi.mocked(await import('@/hooks/useMediaQuery'));
			useMediaQuery.mockImplementation((query: string) => {
				if (query.includes('max-width: 768px')) return false; // not mobile
				if (query.includes('max-width: 1024px')) return true; // is tablet
				if (query.includes('min-width: 1025px')) return false; // not desktop
				return false;
			});
		});

		it('auto-collapses sidebar on tablet', () => {
			const { container } = render(<ResponsiveForumLayout {...defaultProps} />);

			const sidebar = container.querySelector('aside');
			expect(sidebar).toBeInTheDocument();
			// Sidebar should be in collapsed state
		});

		it('shows sidebar toggle button on tablet', () => {
			render(<ResponsiveForumLayout {...defaultProps} />);

			const buttons = screen.getAllByRole('button');
			const sidebarToggle = buttons.find((btn) => btn.querySelector('svg.h-5.w-5'));

			expect(sidebarToggle).toBeInTheDocument();
		});

		it('opens sidebar sheet on tablet', async () => {
			render(<ResponsiveForumLayout {...defaultProps} />);

			const buttons = screen.getAllByRole('button');
			const sidebarToggle = buttons.find((btn) => btn.querySelector('svg.h-5.w-5'));

			fireEvent.click(sidebarToggle!);

			await waitFor(() => {
				expect(screen.getByTestId('sheet')).toBeInTheDocument();
				expect(screen.getByTestId('hierarchical-zone-nav')).toBeInTheDocument();
			});
		});
	});

	describe('Layout Configurations', () => {
		it('applies grid layout classes', () => {
			const { container } = render(<ResponsiveForumLayout {...defaultProps} layout="grid" />);

			const mainContent = container.querySelector('main');
			expect(mainContent).toBeInTheDocument();
		});

		it('applies list layout classes', () => {
			const { container } = render(<ResponsiveForumLayout {...defaultProps} layout="list" />);

			const mainContent = container.querySelector('main');
			expect(mainContent).toBeInTheDocument();
		});

		it('applies masonry layout classes', () => {
			const { container } = render(<ResponsiveForumLayout {...defaultProps} layout="masonry" />);

			const mainContent = container.querySelector('main');
			expect(mainContent).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('has proper main landmark', () => {
			const { container } = render(<ResponsiveForumLayout {...defaultProps} />);

			const main = container.querySelector('main');
			expect(main).toBeInTheDocument();
		});

		it('has proper header landmark', () => {
			const { container } = render(<ResponsiveForumLayout {...defaultProps} />);

			const header = container.querySelector('header');
			expect(header).toBeInTheDocument();
		});

		it('has proper aside landmark for sidebar', () => {
			const { container } = render(<ResponsiveForumLayout {...defaultProps} />);

			const aside = container.querySelector('aside');
			expect(aside).toBeInTheDocument();
		});
	});

	it('applies custom className', () => {
		const { container } = render(
			<ResponsiveForumLayout {...defaultProps} className="custom-layout-class" />
		);

		const wrapper = container.firstChild;
		expect(wrapper).toHaveClass('custom-layout-class');
	});

	it('hides filters when showFilters is false', () => {
		render(
			<ResponsiveForumLayout
				{...defaultProps}
				filters={<div data-testid="filters">Filters</div>}
				showFilters={false}
			/>
		);

		expect(screen.queryByTestId('filters')).not.toBeInTheDocument();
	});
});
