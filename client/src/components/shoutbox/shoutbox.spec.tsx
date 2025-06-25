import { renderWithProviders as render, screen } from '@/test/utils/renderWithProviders';
import { describe, it, expect, vi } from 'vitest';
import ShoutboxWidget from './shoutbox-widget';
import { ShoutboxProvider } from '@/contexts/shoutbox-context';

// Mock the useShoutbox hook
vi.mock('@/contexts/shoutbox-context', async () => {
	const actual = await vi.importActual('@/contexts/shoutbox-context');
	return {
		...actual,
		useShoutbox: () => ({
			position: 'floating',
			effectivePosition: 'floating',
			expansionLevel: 'preview',
			updateExpansionLevel: vi.fn(),
			updatePosition: vi.fn(),
			isMobile: false,
			isLoading: false
		})
	};
});

describe('ShoutboxWidget', () => {
	it('should render exactly one shoutbox instance', () => {
		render(
			<ShoutboxProvider>
				<ShoutboxWidget instanceId="test" />
			</ShoutboxProvider>
		);

		// The ShoutboxWidget contains a div with data-testid="shoutbox-widget"
		const shoutboxElements = screen.getAllByTestId('shoutbox-widget');
		expect(shoutboxElements.length).toBe(1);
	});
});
