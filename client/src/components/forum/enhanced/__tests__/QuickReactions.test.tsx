import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuickReactions } from '../QuickReactions';
import type { Reaction } from '../QuickReactions';

// Mock framer-motion
vi.mock('framer-motion', () => ({
	motion: {
		div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
		button: ({ children, ...props }: any) => <button {...props}>{children}</button>
	},
	AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('QuickReactions', () => {
	const mockReactions: Reaction[] = [
		{
			id: '1',
			type: 'diamond_hands',
			emoji: '💎',
			label: 'Diamond Hands',
			count: 24,
			hasReacted: true,
			color: 'text-cyan-400',
			bgColor: 'bg-cyan-900/20',
			borderColor: 'border-cyan-500/30'
		},
		{
			id: '2',
			type: 'bullish',
			emoji: '📈',
			label: 'Bullish',
			count: 18,
			hasReacted: false,
			color: 'text-green-400',
			bgColor: 'bg-green-900/20',
			borderColor: 'border-green-500/30'
		},
		{
			id: '3',
			type: 'fire',
			emoji: '🔥',
			label: 'Fire',
			count: 12,
			hasReacted: false,
			color: 'text-orange-400',
			bgColor: 'bg-orange-900/20',
			borderColor: 'border-orange-500/30'
		},
		{
			id: '4',
			type: 'bearish',
			emoji: '📉',
			label: 'Bearish',
			count: 5,
			hasReacted: false,
			color: 'text-red-400',
			bgColor: 'bg-red-900/20',
			borderColor: 'border-red-500/30'
		},
		{
			id: '5',
			type: 'hodl',
			emoji: '🚀',
			label: 'HODL',
			count: 0,
			hasReacted: false,
			color: 'text-emerald-400',
			bgColor: 'bg-emerald-900/20',
			borderColor: 'border-emerald-500/30'
		}
	];

	const mockOnReact = vi.fn();
	const mockOnTip = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders all reactions', () => {
		render(<QuickReactions reactions={mockReactions} onReact={mockOnReact} />);

		expect(screen.getByText('💎')).toBeInTheDocument();
		expect(screen.getByText('📈')).toBeInTheDocument();
		expect(screen.getByText('🔥')).toBeInTheDocument();
		expect(screen.getByText('📉')).toBeInTheDocument();
		expect(screen.getByText('🚀')).toBeInTheDocument();
	});

	it('displays reaction counts correctly', () => {
		render(<QuickReactions reactions={mockReactions} onReact={mockOnReact} />);

		expect(screen.getByText('24')).toBeInTheDocument();
		expect(screen.getByText('18')).toBeInTheDocument();
		expect(screen.getByText('12')).toBeInTheDocument();
		expect(screen.getByText('5')).toBeInTheDocument();
		expect(screen.getByText('HODL')).toBeInTheDocument(); // Shows label when count is 0
	});

	it('shows total reaction count', () => {
		render(<QuickReactions reactions={mockReactions} onReact={mockOnReact} />);

		const totalCount = 24 + 18 + 12 + 5; // 59
		expect(screen.getByText(`• ${totalCount} total`)).toBeInTheDocument();
	});

	it('highlights user reactions', () => {
		render(<QuickReactions reactions={mockReactions} onReact={mockOnReact} />);

		const diamondHandsButton = screen.getByRole('button', { name: /💎.*24/i });
		expect(diamondHandsButton).toHaveClass('bg-cyan-900/20');
		expect(diamondHandsButton).toHaveClass('border-cyan-500/30');
		expect(diamondHandsButton).toHaveClass('text-cyan-400');
	});

	it('handles reaction click', () => {
		render(<QuickReactions reactions={mockReactions} onReact={mockOnReact} />);

		const bullishButton = screen.getByRole('button', { name: /📈.*18/i });
		fireEvent.click(bullishButton);

		expect(mockOnReact).toHaveBeenCalledWith('bullish');
	});

	it('shows user reactions summary', () => {
		render(<QuickReactions reactions={mockReactions} onReact={mockOnReact} />);

		expect(screen.getByText('You reacted:')).toBeInTheDocument();
		expect(screen.getByText('Diamond Hands')).toBeInTheDocument();
	});

	it('shows limited reactions in compact mode', () => {
		render(<QuickReactions reactions={mockReactions} onReact={mockOnReact} compact={true} />);

		// Should show top 4 reactions
		expect(screen.getByText('💎')).toBeInTheDocument();
		expect(screen.getByText('📈')).toBeInTheDocument();
		expect(screen.getByText('🔥')).toBeInTheDocument();
		expect(screen.getByText('📉')).toBeInTheDocument();

		// Should show "+1 more" button
		expect(screen.getByText('+1 more')).toBeInTheDocument();
	});

	it('expands to show all reactions when clicked', () => {
		render(<QuickReactions reactions={mockReactions} onReact={mockOnReact} compact={true} />);

		const moreButton = screen.getByText('+1 more');
		fireEvent.click(moreButton);

		// Now all reactions should be visible
		expect(screen.getByText('🚀')).toBeInTheDocument();
		expect(screen.getByText('Show Less')).toBeInTheDocument();
	});

	it('shows tip integration when enabled', () => {
		render(
			<QuickReactions
				reactions={mockReactions}
				onReact={mockOnReact}
				onTip={mockOnTip}
				showTipIntegration={true}
			/>
		);

		expect(screen.getByText('Show appreciation with DGT')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Tip DGT/i })).toBeInTheDocument();
	});

	it('opens tip modal on tip button click', async () => {
		render(
			<QuickReactions
				reactions={mockReactions}
				onReact={mockOnReact}
				onTip={mockOnTip}
				showTipIntegration={true}
			/>
		);

		const tipButton = screen.getByRole('button', { name: /Tip DGT/i });
		fireEvent.click(tipButton);

		await waitFor(() => {
			expect(screen.getByText('Quick Tip')).toBeInTheDocument();
			expect(screen.getByText('5 DGT')).toBeInTheDocument();
			expect(screen.getByText('10 DGT')).toBeInTheDocument();
			expect(screen.getByText('25 DGT')).toBeInTheDocument();
			expect(screen.getByText('50 DGT')).toBeInTheDocument();
		});
	});

	it('handles tip amount selection', async () => {
		render(
			<QuickReactions
				reactions={mockReactions}
				onReact={mockOnReact}
				onTip={mockOnTip}
				showTipIntegration={true}
			/>
		);

		const tipButton = screen.getByRole('button', { name: /Tip DGT/i });
		fireEvent.click(tipButton);

		await waitFor(() => {
			const tip25Button = screen.getByRole('button', { name: '25 DGT' });
			fireEvent.click(tip25Button);
			expect(mockOnTip).toHaveBeenCalledWith(25);
		});
	});

	it('hides tip integration when disabled', () => {
		render(
			<QuickReactions
				reactions={mockReactions}
				onReact={mockOnReact}
				onTip={mockOnTip}
				showTipIntegration={false}
			/>
		);

		expect(screen.queryByText('Show appreciation with DGT')).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: /Tip DGT/i })).not.toBeInTheDocument();
	});

	it('sorts reactions by count', () => {
		render(<QuickReactions reactions={mockReactions} onReact={mockOnReact} />);

		const buttons = screen.getAllByRole('button');
		const reactionButtons = buttons.filter(
			(btn) =>
				btn.textContent?.includes('💎') ||
				btn.textContent?.includes('📈') ||
				btn.textContent?.includes('🔥') ||
				btn.textContent?.includes('📉') ||
				btn.textContent?.includes('🚀')
		);

		// Check order - should be sorted by count descending
		expect(reactionButtons[0]).toHaveTextContent('💎');
		expect(reactionButtons[0]).toHaveTextContent('24');
		expect(reactionButtons[1]).toHaveTextContent('📈');
		expect(reactionButtons[1]).toHaveTextContent('18');
		expect(reactionButtons[2]).toHaveTextContent('🔥');
		expect(reactionButtons[2]).toHaveTextContent('12');
	});

	it('applies hover effects', () => {
		render(<QuickReactions reactions={mockReactions} onReact={mockOnReact} />);

		const bullishButton = screen.getByRole('button', { name: /📈.*18/i });
		expect(bullishButton).toHaveClass('hover:scale-105');
		expect(bullishButton).toHaveClass('active:scale-95');
	});

	it('handles empty reactions list', () => {
		render(<QuickReactions reactions={[]} onReact={mockOnReact} />);

		expect(screen.getByText('Community Reactions')).toBeInTheDocument();
		expect(screen.queryByText('• 0 total')).not.toBeInTheDocument();
	});

	it('displays custom reaction types correctly', () => {
		const customReactions: Reaction[] = [
			{
				id: '6',
				type: 'paper_hands',
				emoji: '🧻',
				label: 'Paper Hands',
				count: 3,
				hasReacted: false,
				color: 'text-red-400',
				bgColor: 'bg-red-900/20',
				borderColor: 'border-red-500/30'
			},
			{
				id: '7',
				type: 'ngmi',
				emoji: '💀',
				label: 'NGMI',
				count: 2,
				hasReacted: false,
				color: 'text-zinc-400',
				bgColor: 'bg-zinc-800/20',
				borderColor: 'border-zinc-600/30'
			}
		];

		render(<QuickReactions reactions={customReactions} onReact={mockOnReact} />);

		expect(screen.getByText('🧻')).toBeInTheDocument();
		expect(screen.getByText('💀')).toBeInTheDocument();
		expect(screen.getByText('3')).toBeInTheDocument();
		expect(screen.getByText('2')).toBeInTheDocument();
	});
});
