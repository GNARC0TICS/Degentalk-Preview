import React, { useEffect, useRef, useState } from 'react';

interface ChartMenuProps {
	isActive?: boolean;
	onClick?: () => void;
	className?: string;
	id?: string;
}

/**
 * Chart Menu Component
 *
 * An exact React implementation of the hamburger-to-candlestick menu from gist-clone
 * that transforms between hamburger menu state and various candlestick chart patterns.
 */
const ChartMenu: React.FC<ChartMenuProps> = ({
	isActive = false,
	onClick,
	className = '',
	id = 'chart-menu'
}) => {
	const [currentPattern, setCurrentPattern] = useState<string | null>(null);
	const previousPatternRef = useRef<string | null>(null);

	// Available candlestick patterns - matches gist-clone version exactly
	const patterns = [
		'pattern-three-inside-up',
		'pattern-white-soldiers',
		'pattern-bullish-engulfing',
		'pattern-three-outside-up'
	];

	// Clear all pattern classes
	const clearPatterns = () => {
		setCurrentPattern(null);
	};

	// Get a random pattern that is different from the previous one
	const getRandomPattern = () => {
		// Filter out the previous pattern to avoid repetition
		const availablePatterns = patterns.filter((pattern) => pattern !== previousPatternRef.current);

		// Select a random pattern from the available options
		const randomIndex = Math.floor(Math.random() * availablePatterns.length);
		const selectedPattern = availablePatterns[randomIndex];

		// Store this pattern as the previous pattern for next time
		previousPatternRef.current = selectedPattern || null;

		return selectedPattern;
	};

	// Update the pattern when active state changes
	useEffect(() => {
		if (isActive) {
			// Clear any existing pattern classes first
			clearPatterns();

			// Get a new pattern different from the previous one
			const newPattern = getRandomPattern();

			// Add a slight delay before adding the pattern class for better animation effect
			const timerId = setTimeout(() => {
				setCurrentPattern(newPattern || null);
			}, 50);

			return () => clearTimeout(timerId);
		} else {
			// Reset to hamburger state
			clearPatterns();
			return; // Explicit return for else branch
		}
	}, [isActive]);

	// Combine all class names
	const combinedClassName =
		`chart-menu ${isActive ? 'is-active' : ''} ${currentPattern || ''} ${className}`.trim();

	return (
		<div
			className={combinedClassName}
			id={id}
			onClick={onClick}
			aria-label={isActive ? 'Close main menu' : 'Open main menu'}
			role="button"
			tabIndex={0}
		>
			{/* Base hamburger elements */}
			<span className="line line-1">
				<span className="line-inner"></span>
			</span>
			<span className="line line-2">
				<span className="line-inner"></span>
			</span>
			<span className="line line-3">
				<span className="line-inner"></span>
			</span>

			{/* Additional elements for complex patterns */}
			<span className="line line-4">
				<span className="line-inner"></span>
			</span>
			<span className="line line-5">
				<span className="line-inner"></span>
			</span>

			{/* Wick elements */}
			<span className="wick wick-1"></span>
			<span className="wick wick-2"></span>
			<span className="wick wick-3"></span>
			<span className="wick wick-4"></span>
			<span className="wick wick-5"></span>
		</div>
	);
};

export default ChartMenu;
