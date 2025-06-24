import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ThreadCard from '../../ThreadCard';
import type { ThreadCardProps } from '../../ThreadCard';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
	motion: {
		div: ({ children, ...props }: any) => <div {...props}>{children}</div>
	},
	AnimatePresence: ({ children }: any) => <>{children}</>
}));

// Mock wouter
vi.mock('wouter', () => ({
	Link: ({ children, href }: any) => <a href={href}>{children}</a>
}));

describe('ThreadCard', () => {
	const mockThread: ThreadCardProps['thread'] = {
		id: '1',
		title: 'Test Thread: Crypto Market Analysis',
		slug: 'test-thread-crypto',
		excerpt: 'Deep dive into the current market trends...',
		createdAt: new Date().toISOString(),
		viewCount: 100,
		postCount: 25,
		isHot: true,
		hotScore: 15,
		user: {
			id: 'user1',
			username: 'CryptoTrader',
			avatarUrl: 'https://example.com/avatar.jpg',
			reputation: 850,
			isVerified: true
		},
		zone: {
			name: 'The Pit',
			slug: 'pit',
			colorTheme: 'pit'
		},
		tags: [
			{ id: 1, name: 'analysis', color: 'blue' },
			{ id: 2, name: 'bitcoin', color: 'orange' }
		],
		prefix: {
			name: 'Discussion',
			color: 'green'
		},
		engagement: {
			totalTips: 45,
			uniqueTippers: 8,
			bookmarks: 12,
			momentum: 'bullish'
		}
	};

	const mockOnTip = vi.fn();
	const mockOnBookmark = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders thread card with basic information', () => {
		render(<ThreadCard thread={mockThread} onTip={mockOnTip} onBookmark={mockOnBookmark} />);

		expect(screen.getByText('Test Thread: Crypto Market Analysis')).toBeInTheDocument();
		expect(screen.getByText('CryptoTrader')).toBeInTheDocument();
		expect(screen.getByText('100')).toBeInTheDocument(); // view count
		expect(screen.getByText('25')).toBeInTheDocument(); // post count
	});

	it('displays hot badge when thread is hot', () => {
		render(<ThreadCard thread={mockThread} onTip={mockOnTip} onBookmark={mockOnBookmark} />);

		expect(screen.getByText('HOT')).toBeInTheDocument();
	});

	it('shows engagement metrics when available', () => {
		render(<ThreadCard thread={mockThread} onTip={mockOnTip} onBookmark={mockOnBookmark} />);

		expect(screen.getByText('45 DGT')).toBeInTheDocument();
	});

	it('displays user verification badge', () => {
		render(<ThreadCard thread={mockThread} onTip={mockOnTip} onBookmark={mockOnBookmark} />);

		// Look for Crown icon (verified badge)
		const verifiedIcon = screen.getByRole('img', { hidden: true });
		expect(verifiedIcon).toBeInTheDocument();
	});

	it('shows excerpt on hover when showPreview is true', async () => {
		const { container } = render(
			<ThreadCard
				thread={mockThread}
				showPreview={true}
				onTip={mockOnTip}
				onBookmark={mockOnBookmark}
			/>
		);

		// Simulate hover
		const card = container.querySelector('.group');
		fireEvent.mouseEnter(card!);

		await waitFor(() => {
			expect(screen.getByText('Deep dive into the current market trends...')).toBeInTheDocument();
		});
	});

	it('displays tags when available', async () => {
		const { container } = render(
			<ThreadCard
				thread={mockThread}
				showPreview={true}
				onTip={mockOnTip}
				onBookmark={mockOnBookmark}
			/>
		);

		// Simulate hover to show tags
		const card = container.querySelector('.group');
		fireEvent.mouseEnter(card!);

		await waitFor(() => {
			expect(screen.getByText('analysis')).toBeInTheDocument();
			expect(screen.getByText('bitcoin')).toBeInTheDocument();
		});
	});

	it('handles tip button click', async () => {
		const { container } = render(
			<ThreadCard thread={mockThread} onTip={mockOnTip} onBookmark={mockOnBookmark} />
		);

		// Simulate hover to show actions
		const card = container.querySelector('.group');
		fireEvent.mouseEnter(card!);

		await waitFor(() => {
			const tipButton = screen.getByRole('button', { name: /tip/i });
			fireEvent.click(tipButton);
			expect(mockOnTip).toHaveBeenCalledWith('1', 10); // Default tip amount
		});
	});

	it('handles bookmark button click', async () => {
		const { container } = render(
			<ThreadCard thread={mockThread} onTip={mockOnTip} onBookmark={mockOnBookmark} />
		);

		// Simulate hover to show actions
		const card = container.querySelector('.group');
		fireEvent.mouseEnter(card!);

		await waitFor(() => {
			const bookmarkButtons = screen.getAllByRole('button');
			const bookmarkButton = bookmarkButtons.find((btn) => btn.querySelector('.w-4.h-4'));
			fireEvent.click(bookmarkButton!);
			expect(mockOnBookmark).toHaveBeenCalledWith('1');
		});
	});

	it('renders different variants correctly', () => {
		const { rerender } = render(
			<ThreadCard
				thread={mockThread}
				variant="compact"
				onTip={mockOnTip}
				onBookmark={mockOnBookmark}
			/>
		);

		// Check compact variant has appropriate classes
		let card = screen.getByRole('link').firstChild;
		expect(card).toHaveClass('p-3'); // compact padding

		// Test featured variant
		rerender(
			<ThreadCard
				thread={mockThread}
				variant="featured"
				onTip={mockOnTip}
				onBookmark={mockOnBookmark}
			/>
		);

		card = screen.getByRole('link').firstChild;
		expect(card).toHaveClass('p-6'); // featured padding
		expect(card).toHaveClass('border-2'); // featured border
	});

	it('applies zone-specific theme colors', () => {
		const { container } = render(
			<ThreadCard thread={mockThread} onTip={mockOnTip} onBookmark={mockOnBookmark} />
		);

		const card = container.querySelector('.group');
		expect(card).toHaveClass('border-red-500/30');
		expect(card).toHaveClass('hover:border-red-500/60');
	});

	it('displays prefix badge when available', () => {
		render(<ThreadCard thread={mockThread} onTip={mockOnTip} onBookmark={mockOnBookmark} />);

		expect(screen.getByText('Discussion')).toBeInTheDocument();
	});

	it('shows sticky and locked badges', () => {
		const stickyThread = {
			...mockThread,
			isSticky: true,
			isLocked: true
		};

		render(<ThreadCard thread={stickyThread} onTip={mockOnTip} onBookmark={mockOnBookmark} />);

		expect(screen.getByText('Pinned')).toBeInTheDocument();
		expect(screen.getByText('Locked')).toBeInTheDocument();
	});

	it('displays momentum indicator', () => {
		render(<ThreadCard thread={mockThread} onTip={mockOnTip} onBookmark={mockOnBookmark} />);

		expect(screen.getByText('Trending')).toBeInTheDocument();
	});

	it('does not show tip button when onTip is not provided', async () => {
		const { container } = render(<ThreadCard thread={mockThread} onBookmark={mockOnBookmark} />);

		// Simulate hover
		const card = container.querySelector('.group');
		fireEvent.mouseEnter(card!);

		await waitFor(() => {
			const tipButton = screen.queryByRole('button', { name: /tip/i });
			expect(tipButton).not.toBeInTheDocument();
		});
	});

	it('handles missing optional data gracefully', () => {
		const minimalThread = {
			id: '2',
			title: 'Minimal Thread',
			slug: 'minimal-thread',
			createdAt: new Date().toISOString(),
			viewCount: 0,
			postCount: 0,
			user: {
				id: 'user2',
				username: 'BasicUser'
			},
			zone: {
				name: 'General',
				slug: 'general',
				colorTheme: 'archive'
			}
		};

		render(<ThreadCard thread={minimalThread} onTip={mockOnTip} onBookmark={mockOnBookmark} />);

		expect(screen.getByText('Minimal Thread')).toBeInTheDocument();
		expect(screen.getByText('BasicUser')).toBeInTheDocument();
		expect(screen.queryByText('HOT')).not.toBeInTheDocument();
		expect(screen.queryByText('DGT')).not.toBeInTheDocument();
	});
});
