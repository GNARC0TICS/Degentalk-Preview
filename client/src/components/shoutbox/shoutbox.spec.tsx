import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HomePageWithProvider from '@/pages/home';
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
      isMobile: false,
      isLoading: false,
    }),
  };
});

// Mock the LayoutRenderer to avoid its complexity in this test
vi.mock('@/components/layout/LayoutRenderer', () => ({
  LayoutRenderer: () => <div data-testid="layout-renderer-mock" />,
}));

describe('HomePage Shoutbox', () => {
  it('should render exactly one shoutbox instance', () => {
    render(
      <ShoutboxProvider>
        <HomePageWithProvider />
      </ShoutboxProvider>
    );

    // The ShoutboxWidget contains a div with the class 'shoutbox-root'
    const shoutboxElements = screen.getAllByTestId('shoutbox-widget');
    expect(shoutboxElements.length).toBe(1);
  });
});
