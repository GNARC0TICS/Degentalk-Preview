import * as React from 'react';
import type { FrameId } from '@shared/types/ids';

/**
 * Animates a number change from start to end value.
 *
 * @param {number} startValue - The initial number value
 * @param {number} endValue - The target number value
 * @param {number} duration - Duration of animation in milliseconds
 * @param {function} onUpdate - Callback function that receives the current animated value
 * @param {function} onComplete - Optional callback function called when animation completes
 */
export function animateNumber(
	startValue: number,
	endValue: number,
	duration: number = 800,
	onUpdate: (value: number) => void,
	onComplete?: () => void
): { cancel: () => void } {
	const startTime = performance.now();
	const difference = endValue - startValue;
	let animationFrameId: Id<'animationFrame'>;

	// Check for reduced motion preference
	const prefersReducedMotion =
		typeof window !== 'undefined' &&
		window.matchMedia &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	// For users who prefer reduced motion, skip animation
	if (prefersReducedMotion) {
		onUpdate(endValue);
		if (onComplete) onComplete();
		return { cancel: () => {} };
	}

	const animateFrame = (currentTime: number) => {
		const elapsedTime = currentTime - startTime;

		if (elapsedTime >= duration) {
			onUpdate(endValue);
			if (onComplete) onComplete();
			return;
		}

		const progress = elapsedTime / duration;
		// Use easeOutQuad easing function for smoother animation
		const easing = 1 - Math.pow(1 - progress, 2);
		const currentValue = Math.round(startValue + difference * easing);

		onUpdate(currentValue);
		animationFrameId = requestAnimationFrame(animateFrame);
	};

	animationFrameId = requestAnimationFrame(animateFrame);

	// Return a cancel function
	return {
		cancel: () => {
			if (animationFrameId) {
				cancelAnimationFrame(animationFrameId);
			}
		}
	};
}

/**
 * React hook version of animateNumber for use in components
 *
 * @param {number} targetValue - The target number value to animate to
 * @param {object} options - Animation options
 * @returns {number} The current animated value
 *
 * @example
 * const animatedCount = useAnimatedNumber(totalCount, { duration: 1000 });
 * return <div>{animatedCount}</div>;
 */
export function useAnimatedNumber(
	targetValue: number,
	options: {
		duration?: number;
		delay?: number;
		immediate?: boolean;
	} = {}
): number {
	const [currentValue, setCurrentValue] = React.useState(options.immediate ? targetValue : 0);
	const prevValueRef = React.useRef(currentValue);
	const animationRef = React.useRef<{ cancel: () => void } | null>(null);

	React.useEffect(() => {
		// Clear any existing animation
		if (animationRef.current) {
			animationRef.current.cancel();
		}

		const startAnimation = () => {
			animationRef.current = animateNumber(
				prevValueRef.current,
				targetValue,
				options.duration || 800,
				(value) => {
					setCurrentValue(value);
					prevValueRef.current = value;
				}
			);
		};

		if (options.delay) {
			const timeoutId = setTimeout(startAnimation, options.delay);
			return () => clearTimeout(timeoutId);
		} else {
			startAnimation();
		}

		return () => {
			if (animationRef.current) {
				animationRef.current.cancel();
			}
		};
	}, [targetValue, options.duration, options.delay]);

	return currentValue;
}
