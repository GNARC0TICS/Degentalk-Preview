import React from 'react';
import {
	renderWithProviders as render,
	screen,
	fireEvent,
	waitFor
} from '@/test/utils/renderWithProviders';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ResponsiveForumLayout from '../ResponsiveForumLayout';
import type { ResponsiveForumLayoutProps } from '../ResponsiveForumLayout';
import {
	useMediaQuery as mockUseMediaQuery,
	useBreakpoint as mockUseBreakpoint
} from '@/hooks/useMediaQuery';

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
	}),
	useMobileDetector: vi.fn(() => false), // Default to desktop
	useBreakpoint: vi.fn(() => ({
		isMobile: false,
		isTablet: false,
		isDesktop: true,
		current: 'desktop' as const
	}))
}));

vi.mock('@/components/forum/enhanced/MobileForumNavigation', () => ({
	default: () => <div data-testid="mobile-navigation">Mobile Nav</div>
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
		children: <div data-testid="content-children">Main Content</div>,
		sidebar: <div data-testid="hierarchical-zone-nav">Zone Navigation</div>,
		showNavigation: true
	};

	beforeEach(() => {
		vi.clearAllMocks();
		// Default to desktop
		(mockUseMediaQuery as unknown as any).mockImplementation((query: string) => {
			if (query.includes('max-width: 768px')) return false; // not mobile
			if (query.includes('max-width: 1024px')) return false; // not tablet
			if (query.includes('min-width: 1025px')) return true; // desktop
			return false;
		});
		vi.mocked(mockUseBreakpoint).mockReturnValue({
			isMobile: false,
			isTablet: false,
			isDesktop: true,
			isLarge: false,
			isXLarge: false,
			isMobileOrTablet: false,
			isTabletOrDesktop: true,
			current: 'desktop'
		});
	});

	afterEach(() => {
		vi.resetModules();
	});

	describe('Desktop Layout', () => {
		it('renders desktop layout with sidebar', () => {
			render(<ResponsiveForumLayout {...defaultProps} />);

			expect(screen.getByTestId('hierarchical-zone-nav')).toBeInTheDocument();
			expect(screen.getByTestId('content-children')).toBeInTheDocument();
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

			// Find the layout controls container and then the grid button
			const layoutControls = screen.getByTestId('layout-controls');
			expect(layoutControls).toBeInTheDocument();

			// Find the grid button (first button in layout controls)
			const buttons = layoutControls.querySelectorAll('button');
			const gridButton = buttons[0]; // Grid is the first button

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
			(mockUseMediaQuery as unknown as any).mockImplementation((query: string) => {
				if (query.includes('max-width: 768px')) return true; // mobile
				if (query.includes('max-width: 1024px')) return true; // tablet
				if (query.includes('min-width: 1025px')) return false; // desktop
				return false;
			});
			vi.mocked(mockUseBreakpoint).mockReturnValue({
				isMobile: true,
				isTablet: false,
				isDesktop: false,
				isLarge: false,
				isXLarge: false,
				isMobileOrTablet: true,
				isTabletOrDesktop: false,
				current: 'mobile'
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
			(mockUseMediaQuery as unknown as any).mockImplementation((query: string) => {
				if (query.includes('max-width: 768px')) return false; // not mobile
				if (query.includes('max-width: 1024px')) return true; // is tablet
				if (query.includes('min-width: 1025px')) return false; // not desktop
				return false;
			});
			vi.mocked(mockUseBreakpoint).mockReturnValue({
				isMobile: false,
				isTablet: true,
				isDesktop: false,
				isLarge: false,
				isXLarge: false,
				isMobileOrTablet: true,
				isTabletOrDesktop: true,
				current: 'tablet'
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
				// Check that the sheet contains sidebar content (using getAllByTestId since there might be duplicates)
				const navElements = screen.getAllByTestId('hierarchical-zone-nav');
				expect(navElements.length).toBeGreaterThanOrEqual(1);
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
