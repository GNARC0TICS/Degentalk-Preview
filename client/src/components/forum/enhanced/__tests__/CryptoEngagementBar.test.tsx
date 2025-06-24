import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CryptoEngagementBar } from '../CryptoEngagementBar';
import type { CryptoEngagementBarProps } from '../CryptoEngagementBar';

// Mock framer-motion
vi.mock('framer-motion', () => ({
	motion: {
		div: ({ children, ...props }: any) => <div {...props}>{children}</div>
	},
	AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('CryptoEngagementBar', () => {
	const mockEngagement: CryptoEngagementBarProps['engagement'] = {
		totalTips: 150,
		uniqueTippers: 12,
		tipLeaderboard: [
			{ username: 'WhaleUser', amount: 50, avatarUrl: 'https://example.com/whale.jpg' },
			{ username: 'BigTipper', amount: 30, avatarUrl: 'https://example.com/big.jpg' },
			{ username: 'GenerosoAnon', amount: 20 }
		],
		momentum: 'bullish',
		reputationScore: 850,
		qualityScore: 92,
		hotScore: 25,
		bookmarks: 45,
		shares: 15
	};

	const mockOnTip = vi.fn();
	const mockOnBookmark = vi.fn();
	const mockOnShare = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders basic engagement stats', () => {
		render(
			<CryptoEngagementBar
				engagement={mockEngagement}
				onTip={mockOnTip}
				onBookmark={mockOnBookmark}
			/>
		);

		expect(screen.getByText('150 DGT')).toBeInTheDocument();
		expect(screen.getByText('12 tippers')).toBeInTheDocument();
	});

	it('displays momentum indicator correctly', () => {
		const { rerender } = render(
			<CryptoEngagementBar engagement={mockEngagement} onTip={mockOnTip} />
		);

		expect(screen.getByText('Bullish')).toBeInTheDocument();
		const bullishIndicator = screen.getByText('Bullish').parentElement;
		expect(bullishIndicator).toHaveClass('text-emerald-400');
		expect(bullishIndicator).toHaveClass('bg-emerald-900/20');

		// Test bearish momentum
		rerender(
			<CryptoEngagementBar
				engagement={{ ...mockEngagement, momentum: 'bearish' }}
				onTip={mockOnTip}
			/>
		);

		expect(screen.getByText('Bearish')).toBeInTheDocument();
		const bearishIndicator = screen.getByText('Bearish').parentElement;
		expect(bearishIndicator).toHaveClass('text-red-400');
		expect(bearishIndicator).toHaveClass('bg-red-900/20');

		// Test neutral momentum
		rerender(
			<CryptoEngagementBar
				engagement={{ ...mockEngagement, momentum: 'neutral' }}
				onTip={mockOnTip}
			/>
		);

		expect(screen.getByText('Neutral')).toBeInTheDocument();
		const neutralIndicator = screen.getByText('Neutral').parentElement;
		expect(neutralIndicator).toHaveClass('text-zinc-400');
		expect(neutralIndicator).toHaveClass('bg-zinc-800/30');
	});

	it('shows quality badges based on score', () => {
		const { rerender } = render(
			<CryptoEngagementBar engagement={mockEngagement} onTip={mockOnTip} />
		);

		// Legendary badge (score >= 90)
		expect(screen.getByText('Legendary')).toBeInTheDocument();

		// Quality badge (score >= 75)
		rerender(
			<CryptoEngagementBar engagement={{ ...mockEngagement, qualityScore: 80 }} onTip={mockOnTip} />
		);
		expect(screen.getByText('Quality')).toBeInTheDocument();

		// No badge (score < 75)
		rerender(
			<CryptoEngagementBar engagement={{ ...mockEngagement, qualityScore: 60 }} onTip={mockOnTip} />
		);
		expect(screen.queryByText('Legendary')).not.toBeInTheDocument();
		expect(screen.queryByText('Quality')).not.toBeInTheDocument();
	});

	it('displays hot badge when hot score is high', () => {
		render(<CryptoEngagementBar engagement={mockEngagement} onTip={mockOnTip} />);

		expect(screen.getByText('HOT')).toBeInTheDocument();
	});

	it('opens tip modal on tip button click', async () => {
		render(<CryptoEngagementBar engagement={mockEngagement} onTip={mockOnTip} />);

		const tipButton = screen.getByRole('button', { name: /Tip/i });
		fireEvent.click(tipButton);

		await waitFor(() => {
			expect(screen.getByText('Quick Tip')).toBeInTheDocument();
			expect(screen.getByRole('button', { name: '5 DGT' })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: '10 DGT' })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: '25 DGT' })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: '50 DGT' })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: '100 DGT' })).toBeInTheDocument();
		});
	});

	it('handles tip amount selection', async () => {
		render(<CryptoEngagementBar engagement={mockEngagement} onTip={mockOnTip} />);

		const tipButton = screen.getByRole('button', { name: /Tip/i });
		fireEvent.click(tipButton);

		await waitFor(() => {
			const tip25Button = screen.getByRole('button', { name: '25 DGT' });
			fireEvent.click(tip25Button);
			expect(mockOnTip).toHaveBeenCalledWith(25);
		});
	});

	it('handles bookmark button click', () => {
		render(
			<CryptoEngagementBar
				engagement={mockEngagement}
				onTip={mockOnTip}
				onBookmark={mockOnBookmark}
				isBookmarked={false}
			/>
		);

		const bookmarkButton = screen
			.getAllByRole('button')
			.find((btn) => btn.querySelector('svg.w-4.h-4'));
		fireEvent.click(bookmarkButton!);

		expect(mockOnBookmark).toHaveBeenCalled();
	});

	it('shows bookmarked state', () => {
		render(
			<CryptoEngagementBar
				engagement={mockEngagement}
				onTip={mockOnTip}
				onBookmark={mockOnBookmark}
				isBookmarked={true}
			/>
		);

		const bookmarkButton = screen
			.getAllByRole('button')
			.find((btn) => btn.querySelector('svg.w-4.h-4'));
		expect(bookmarkButton).toHaveClass('text-amber-400');
	});

	it('shows detailed engagement info when enabled', () => {
		render(
			<CryptoEngagementBar engagement={mockEngagement} onTip={mockOnTip} showDetailed={true} />
		);

		// Tip leaderboard
		expect(screen.getByText('Top Tippers')).toBeInTheDocument();
		expect(screen.getByText('WhaleUser')).toBeInTheDocument();
		expect(screen.getByText('50 DGT')).toBeInTheDocument();
		expect(screen.getByText('BigTipper')).toBeInTheDocument();
		expect(screen.getByText('30 DGT')).toBeInTheDocument();
		expect(screen.getByText('GenerosoAnon')).toBeInTheDocument();
		expect(screen.getByText('20 DGT')).toBeInTheDocument();

		// Engagement metrics
		expect(screen.getByText('Reputation')).toBeInTheDocument();
		expect(screen.getByText('850')).toBeInTheDocument();
		expect(screen.getByText('Bookmarks')).toBeInTheDocument();
		expect(screen.getByText('45')).toBeInTheDocument();
	});

	it('hides detailed info when disabled', () => {
		render(
			<CryptoEngagementBar engagement={mockEngagement} onTip={mockOnTip} showDetailed={false} />
		);

		expect(screen.queryByText('Top Tippers')).not.toBeInTheDocument();
		expect(screen.queryByText('Reputation')).not.toBeInTheDocument();
	});

	it('displays leaderboard badges correctly', () => {
		render(
			<CryptoEngagementBar engagement={mockEngagement} onTip={mockOnTip} showDetailed={true} />
		);

		const badges = screen.getAllByText(/[123]/);
		const firstPlaceBadge = badges.find((el) => el.textContent === '1');
		const secondPlaceBadge = badges.find((el) => el.textContent === '2');
		const thirdPlaceBadge = badges.find((el) => el.textContent === '3');

		expect(firstPlaceBadge?.parentElement).toHaveClass('bg-amber-500/20');
		expect(secondPlaceBadge?.parentElement).toHaveClass('bg-zinc-500/20');
		expect(thirdPlaceBadge?.parentElement).toHaveClass('bg-orange-500/20');
	});

	it('handles missing optional data gracefully', () => {
		const minimalEngagement = {
			totalTips: 0,
			uniqueTippers: 0,
			momentum: 'neutral' as const,
			bookmarks: 0
		};

		render(<CryptoEngagementBar engagement={minimalEngagement} onTip={mockOnTip} />);

		expect(screen.queryByText('DGT')).not.toBeInTheDocument();
		expect(screen.queryByText('tippers')).not.toBeInTheDocument();
		expect(screen.getByText('Neutral')).toBeInTheDocument();
		expect(screen.queryByText('HOT')).not.toBeInTheDocument();
		expect(screen.queryByText('Legendary')).not.toBeInTheDocument();
	});

	it('closes tip modal after selection', async () => {
		render(<CryptoEngagementBar engagement={mockEngagement} onTip={mockOnTip} />);

		const tipButton = screen.getByRole('button', { name: /Tip/i });
		fireEvent.click(tipButton);

		await waitFor(() => {
			expect(screen.getByText('Quick Tip')).toBeInTheDocument();
		});

		const tip10Button = screen.getByRole('button', { name: '10 DGT' });
		fireEvent.click(tip10Button);

		await waitFor(() => {
			expect(screen.queryByText('Quick Tip')).not.toBeInTheDocument();
		});
	});

	it('shows correct number of leaderboard entries', () => {
		const manyTippers = {
			...mockEngagement,
			tipLeaderboard: [
				{ username: 'User1', amount: 100 },
				{ username: 'User2', amount: 80 },
				{ username: 'User3', amount: 60 },
				{ username: 'User4', amount: 40 },
				{ username: 'User5', amount: 20 }
			]
		};

		render(<CryptoEngagementBar engagement={manyTippers} onTip={mockOnTip} showDetailed={true} />);

		// Should only show top 3
		expect(screen.getByText('User1')).toBeInTheDocument();
		expect(screen.getByText('User2')).toBeInTheDocument();
		expect(screen.getByText('User3')).toBeInTheDocument();
		expect(screen.queryByText('User4')).not.toBeInTheDocument();
		expect(screen.queryByText('User5')).not.toBeInTheDocument();
	});

	it('applies custom className', () => {
		const { container } = render(
			<CryptoEngagementBar engagement={mockEngagement} onTip={mockOnTip} className="custom-class" />
		);

		const wrapper = container.firstChild;
		expect(wrapper).toHaveClass('custom-class');
	});
});
