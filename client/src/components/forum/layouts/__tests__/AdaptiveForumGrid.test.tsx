import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdaptiveForumGrid } from '../AdaptiveForumGrid';
import type { AdaptiveForumGridProps } from '../AdaptiveForumGrid';

// Mock dependencies
vi.mock('framer-motion', () => ({
	motion: {
		div: ({ children, ...props }: any) => <div {...props}>{children}</div>
	},
	AnimatePresence: ({ children }: any) => <>{children}</>
}));

vi.mock('@tanstack/react-virtual', () => ({
	useVirtualizer: vi.fn(() => ({
		getTotalSize: () => 1000,
		getVirtualItems: () => [
			{ key: '0', index: 0, start: 0, size: 400 },
			{ key: '1', index: 1, start: 400, size: 400 }
		]
	}))
}));

vi.mock('@/hooks/useMediaQuery', () => ({
	useBreakpoint: () => ({
		isMobile: false,
		isTablet: false,
		isDesktop: true,
		isLarge: false,
		isXLarge: false,
		isMobileOrTablet: false,
		isTabletOrDesktop: true,
		current: 'desktop'
	})
}));

interface TestItem {
	id: string;
	title: string;
	content: string;
}

describe('AdaptiveForumGrid', () => {
	const mockItems: TestItem[] = [
		{ id: '1', title: 'Item 1', content: 'Content 1' },
		{ id: '2', title: 'Item 2', content: 'Content 2' },
		{ id: '3', title: 'Item 3', content: 'Content 3' },
		{ id: '4', title: 'Item 4', content: 'Content 4' }
	];

	const mockRenderItem = (item: TestItem, index: number) => (
		<div data-testid={`item-${item.id}`} key={item.id}>
			<h3>{item.title}</h3>
			<p>{item.content}</p>
			<span>Index: {index}</span>
		</div>
	);

	const defaultProps: AdaptiveForumGridProps<TestItem> = {
		items: mockItems,
		renderItem: mockRenderItem
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders all items in default list layout', () => {
		render(<AdaptiveForumGrid {...defaultProps} />);

		mockItems.forEach((item) => {
			expect(screen.getByTestId(`item-${item.id}`)).toBeInTheDocument();
			expect(screen.getByText(item.title)).toBeInTheDocument();
			expect(screen.getByText(item.content)).toBeInTheDocument();
		});
	});

	it('shows item count and column information', () => {
		render(<AdaptiveForumGrid {...defaultProps} />);

		expect(screen.getByText('4 items • 3 columns')).toBeInTheDocument();
	});

	it('renders layout switcher when onLayoutChange is provided', () => {
		const mockOnLayoutChange = vi.fn();
		render(<AdaptiveForumGrid {...defaultProps} onLayoutChange={mockOnLayoutChange} />);

		// Should have grid, list, and masonry buttons
		const layoutButtons = screen
			.getAllByRole('button')
			.filter((btn) => btn.classList.contains('w-8'));
		expect(layoutButtons).toHaveLength(3);
	});

	it('switches between layouts', () => {
		const mockOnLayoutChange = vi.fn();
		const { container } = render(
			<AdaptiveForumGrid {...defaultProps} layout="list" onLayoutChange={mockOnLayoutChange} />
		);

		// Click grid button
		const buttons = screen.getAllByRole('button');
		const gridButton = buttons.find(
			(btn) => btn.querySelector('svg') && btn.classList.contains('w-8')
		);

		fireEvent.click(gridButton!);
		expect(mockOnLayoutChange).toHaveBeenCalledWith('grid');
	});

	it('applies correct layout classes for grid', () => {
		const { container } = render(<AdaptiveForumGrid {...defaultProps} layout="grid" />);

		const gridContainer = container.querySelector('.grid');
		expect(gridContainer).toBeInTheDocument();
	});

	it('applies correct layout classes for list', () => {
		const { container } = render(<AdaptiveForumGrid {...defaultProps} layout="list" />);

		const listContainer = container.querySelector('.space-y-4');
		expect(listContainer).toBeInTheDocument();
	});

	it('renders sort dropdown when sort options provided', () => {
		const mockOnSortChange = vi.fn();
		const sortOptions = [
			{ value: 'latest', label: 'Latest' },
			{ value: 'popular', label: 'Most Popular' }
		];

		render(
			<AdaptiveForumGrid
				{...defaultProps}
				sortOptions={sortOptions}
				onSortChange={mockOnSortChange}
				currentSort="latest"
			/>
		);

		// Should show sort trigger
		const sortTrigger = screen.getByRole('combobox');
		expect(sortTrigger).toBeInTheDocument();
	});

	it('handles sort change', () => {
		const mockOnSortChange = vi.fn();
		const sortOptions = [
			{ value: 'latest', label: 'Latest' },
			{ value: 'popular', label: 'Most Popular' }
		];

		render(
			<AdaptiveForumGrid
				{...defaultProps}
				sortOptions={sortOptions}
				onSortChange={mockOnSortChange}
				currentSort="latest"
			/>
		);

		const sortTrigger = screen.getByRole('combobox');
		fireEvent.click(sortTrigger);

		// Select "Most Popular"
		const popularOption = screen.getByText('Most Popular');
		fireEvent.click(popularOption);

		expect(mockOnSortChange).toHaveBeenCalledWith('popular');
	});

	it('shows loading skeletons when isLoading is true', () => {
		render(<AdaptiveForumGrid {...defaultProps} isLoading={true} loadingSkeletons={3} />);

		const skeletons = screen
			.getAllByRole('generic')
			.filter((el) => el.classList.contains('animate-pulse'));
		expect(skeletons).toHaveLength(3);
	});

	it('applies custom gap spacing', () => {
		const { container } = render(<AdaptiveForumGrid {...defaultProps} layout="grid" gap={6} />);

		const gridContainer = container.querySelector('.grid');
		expect(gridContainer).toHaveClass('gap-6');
	});

	it('uses custom column configuration', () => {
		const { useBreakpoint } = vi.mocked(await import('@/hooks/useMediaQuery'));
		useBreakpoint.mockReturnValue({
			isMobile: true,
			isTablet: false,
			isDesktop: false,
			isLarge: false,
			isXLarge: false,
			isMobileOrTablet: true,
			isTabletOrDesktop: false,
			current: 'mobile'
		});

		render(
			<AdaptiveForumGrid
				{...defaultProps}
				columns={{
					mobile: 1,
					tablet: 2,
					desktop: 3,
					large: 4
				}}
			/>
		);

		expect(screen.getByText('4 items • 1 columns')).toBeInTheDocument();
	});

	it('enables virtualization for list layout', () => {
		const { useVirtualizer } = vi.mocked(await import('@tanstack/react-virtual'));

		render(
			<AdaptiveForumGrid {...defaultProps} layout="list" virtualized={true} estimateSize={300} />
		);

		expect(useVirtualizer).toHaveBeenCalledWith(
			expect.objectContaining({
				count: 4,
				estimateSize: expect.any(Function),
				enabled: true
			})
		);
	});

	it('disables virtualization for non-list layouts', () => {
		const { useVirtualizer } = vi.mocked(await import('@tanstack/react-virtual'));

		render(<AdaptiveForumGrid {...defaultProps} layout="grid" virtualized={true} />);

		expect(useVirtualizer).toHaveBeenCalledWith(
			expect.objectContaining({
				enabled: false
			})
		);
	});

	it('handles masonry layout columns', async () => {
		render(
			<AdaptiveForumGrid
				{...defaultProps}
				layout="masonry"
				columns={{
					mobile: 1,
					tablet: 2,
					desktop: 3,
					large: 4
				}}
			/>
		);

		// Wait for masonry calculation
		await waitFor(() => {
			const masonryColumns = screen
				.getAllByRole('generic')
				.filter((el) => el.classList.contains('flex-1'));
			expect(masonryColumns.length).toBeGreaterThan(0);
		});
	});

	it('auto-adjusts layout based on screen size', () => {
		const { useBreakpoint } = vi.mocked(await import('@/hooks/useMediaQuery'));
		useBreakpoint.mockReturnValue({
			isMobile: true,
			isTablet: false,
			isDesktop: false,
			isLarge: false,
			isXLarge: false,
			isMobileOrTablet: true,
			isTabletOrDesktop: false,
			current: 'mobile'
		});

		const { container } = render(<AdaptiveForumGrid {...defaultProps} layout="auto" />);

		// Should default to list on mobile
		const listContainer = container.querySelector('.space-y-4');
		expect(listContainer).toBeInTheDocument();
	});

	it('applies custom className', () => {
		const { container } = render(
			<AdaptiveForumGrid {...defaultProps} className="custom-grid-class" />
		);

		const wrapper = container.querySelector('.custom-grid-class');
		expect(wrapper).toBeInTheDocument();
	});

	it('handles empty items array', () => {
		render(<AdaptiveForumGrid {...defaultProps} items={[]} />);

		expect(screen.getByText('0 items • 3 columns')).toBeInTheDocument();
	});

	it('updates when window resizes', async () => {
		const { container } = render(<AdaptiveForumGrid {...defaultProps} layout="masonry" />);

		// Trigger resize event
		global.dispatchEvent(new Event('resize'));

		await waitFor(() => {
			// Masonry should recalculate
			const masonryContainer = container.querySelector('.flex.gap-4');
			expect(masonryContainer).toBeInTheDocument();
		});
	});

	it('animates item appearance', () => {
		const { container } = render(<AdaptiveForumGrid {...defaultProps} layout="grid" />);

		const items = container.querySelectorAll('[data-testid^="item-"]');
		items.forEach((item) => {
			const parent = item.parentElement;
			expect(parent).toHaveStyle({ opacity: '1' });
		});
	});
});
