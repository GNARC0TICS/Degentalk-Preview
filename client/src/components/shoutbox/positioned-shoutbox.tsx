import React, { useEffect, useState } from 'react';
import { useShoutbox } from '@app/contexts/shoutbox-context';
import type { ShoutboxEffectivePosition } from '@app/contexts/shoutbox-context';
import ShoutboxWidget from './shoutbox-widget';
import { createPortal } from 'react-dom';
import { MessageSquare } from 'lucide-react';

/**
 * PositionedShoutbox - Wrapper component that handles the positioning of the Shoutbox
 * Uses the position from ShoutboxContext to determine how to position and style the shoutbox
 * Includes smooth transitions between positions and responsive behavior
 */

interface PositionedShoutboxProps {
	instanceId?: string;
}

export function PositionedShoutbox({ instanceId }: PositionedShoutboxProps) {
	const { effectivePosition, expansionLevel, updateExpansionLevel, isMobile, isLoading } =
		useShoutbox();

	const [activePosition, setActivePosition] = useState<ShoutboxEffectivePosition>('sidebar-top');
	const [isTransitioning, setIsTransitioning] = useState(false);

	// Handle position changes with transition
	useEffect(() => {
		if (effectivePosition && !isLoading) {
			// If effective position has changed, trigger transition
			if (effectivePosition !== activePosition) {
				setIsTransitioning(true);

				// Small delay to allow the fade-out animation to complete
				const timer = setTimeout(() => {
					setActivePosition(effectivePosition);
					setIsTransitioning(false);
				}, 150);

				return () => clearTimeout(timer);
			}
		}
	}, [effectivePosition, activePosition, isLoading]);

	// Return loading state if position is being fetched
	if (isLoading) {
		return (
			<div className="flex items-center justify-center w-full h-32 bg-zinc-900/50 border border-zinc-800 rounded-lg">
				<span className="text-zinc-400">Loading shoutbox...</span>
			</div>
		);
	}

	// Position-specific container styling
	const getContainerStyle = () => {
		// Get position-specific styles
		let positionStyles = '';
		let expansionStyles = '';

		// Apply position styles
		switch (activePosition) {
			case 'mobile-top':
				positionStyles = 'w-full mb-4 ';
				break;
			case 'mobile-bottom':
				positionStyles = 'w-full mt-4 ';
				break;
			case 'sidebar-top':
				positionStyles = 'mb-4 ';
				break;
			case 'sidebar-bottom':
				positionStyles = 'mt-4 ';
				break;
			case 'main-top':
				positionStyles = 'mb-4 w-full ';
				break;
			case 'main-bottom':
				positionStyles = 'mt-4 w-full ';
				break;
			case 'floating':
				// Use a solid background for both mobile and desktop
				positionStyles =
					'fixed bottom-4 right-4 w-[calc(100%-32px)] md:w-96 z-50 shadow-lg bg-zinc-900 border border-zinc-800 ';
				break;
			case 'sticky':
				positionStyles = 'sticky bottom-4 w-full z-40 ';
				break;
			default:
				positionStyles = 'mb-4 ';
		}

		// Apply expansion styles
		switch (expansionLevel) {
			case 'collapsed':
				expansionStyles = 'shoutbox-collapsed ';
				break;
			case 'preview':
				expansionStyles = 'shoutbox-preview ';
				break;
			case 'expanded':
				expansionStyles = 'shoutbox-expanded ';
				break;
		}

		// Apply transition styles
		const transitionStyles = 'transition-all duration-300 ease-in-out ';
		const animationStyles = isTransitioning
			? 'opacity-0 transform scale-95 ' + (activePosition === 'floating' ? 'translate-y-4' : '')
			: 'opacity-100 transform scale-100 ' + (activePosition === 'floating' ? 'translate-y-0' : '');

		return positionStyles + expansionStyles + transitionStyles + animationStyles;
	};

	// Create shoutbox content element with all the transitions and styling
	const createShoutboxContent = () => {
		// For floating mode in collapsed state (mobile or desktop), show a chat bubble icon instead
		if (activePosition === 'floating' && expansionLevel === 'collapsed') {
			// Create a chat bubble that expands when clicked
			const handleBubbleClick = () => {
				if (typeof updateExpansionLevel === 'function') {
					updateExpansionLevel('preview');
				}
			};

			return (
				<div
					className="fixed bottom-4 right-4 z-50 w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all duration-300 hover:bg-emerald-500"
					onClick={handleBubbleClick}
					key={`shoutbox-${activePosition}-bubble`}
				>
					<MessageSquare className="h-6 w-6 text-white" />
				</div>
			);
		}

		// Normal shoutbox display
		return (
			<div
				className={getContainerStyle()}
				key={`shoutbox-${activePosition}`}
				style={activePosition === 'floating' ? { maxHeight: 'calc(100vh - 96px)' } : undefined}
			>
				<ShoutboxWidget instanceId={instanceId} />
			</div>
		);
	};

	// If the position is floating for desktop, we need to render it in a portal
	if (activePosition === 'floating' && !isMobile) {
		// Find or create the portal container
		let portalContainer = document.getElementById('floating-shoutbox-portal');
		if (!portalContainer) {
			portalContainer = document.createElement('div');
			portalContainer.id = 'floating-shoutbox-portal';
			document.body.appendChild(portalContainer);
		}
		return createPortal(createShoutboxContent(), portalContainer);
	}

	// If we shouldn't render in the current container, return null
	if (
		(activePosition === 'main-top' || activePosition === 'main-bottom') &&
		document.querySelector('.shoutbox-container-sidebar')
	) {
		return null;
	}

	if (
		(activePosition === 'sidebar-top' || activePosition === 'sidebar-bottom') &&
		document.querySelector('.shoutbox-container-main')
	) {
		return null;
	}

	// Otherwise render in-place
	return createShoutboxContent();
}

export default PositionedShoutbox;
