import React from 'react';
import type { LucideIcon } from 'lucide-react';
import Player from 'react-lottie-player';
import { iconMap, type IconKey } from './iconMap.config';
import type { Theme } from './types';

export interface IconRendererProps extends React.SVGProps<SVGSVGElement> {
	icon: IconKey;
	size?: number;
	theme?: Theme;
}

// Type predicate to distinguish Lucide components from string paths
const isLucideIcon = (candidate: unknown): candidate is LucideIcon =>
	typeof candidate === 'function';

export const IconRenderer: React.FC<IconRendererProps> = ({
	icon,
	size = 24,
	theme = 'light',
	...rest
}) => {
	const config = iconMap[icon];

	if (!config) {
		console.warn(`IconRenderer: icon "${icon}" not found in iconMap`);
		return null;
	}

	// 1. Theme variant or default lucide icon
	const variant = config.themeVariants?.[theme];
	if (variant) {
		if (isLucideIcon(variant)) {
			const Lucide = variant;
			return <Lucide width={size} height={size} {...rest} />;
		}
		if (typeof variant === 'string') {
			return <img src={variant} width={size} height={size} alt={`${icon}-icon`} {...rest} />;
		}
	}

	if (config.lucide) {
		const Lucide = config.lucide;
		return <Lucide width={size} height={size} {...rest} />;
	}

	// 2. Lottie animation (requires lottie-player web component globally available)
	if (config.lottie) {
		return (
			<Player
				autoplay
				loop
				src={config.lottie}
				style={{ width: size, height: size }}
				{...(rest as any)}
			/>
		);
	}

	// 3. SVG fallback
	if (config.fallbackSvg) {
		return (
			<img src={config.fallbackSvg} width={size} height={size} alt={`${icon}-icon`} {...rest} />
		);
	}

	// 4. PNG fallback
	if (config.fallbackPng) {
		return (
			<img src={config.fallbackPng} width={size} height={size} alt={`${icon}-icon`} {...rest} />
		);
	}

	return null;
};

export default IconRenderer;
