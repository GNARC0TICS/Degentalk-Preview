import React from 'react';
import type { LucideIcon } from 'lucide-react';
import Player from 'react-lottie-player';
import { iconMap, type IconKey } from './iconMap.config';
import type { Theme } from './types';
import { logger } from '@/lib/logger';

export interface IconRendererProps extends React.SVGProps<SVGSVGElement> {
	icon: IconKey;
	size?: number;
	theme?: Theme;
}

// Extract valid HTML img attributes from props
const getImgProps = (props: any) => {
	const {
		suppressHydrationWarning,
		className,
		style,
		...restProps
	} = props;
	
	// Return only props that are valid for img elements
	return {
		className,
		style,
		// Add other valid img attributes as needed
		alt: restProps.alt,
		title: restProps.title,
		loading: restProps.loading,
		crossOrigin: restProps.crossOrigin,
		decoding: restProps.decoding,
		referrerPolicy: restProps.referrerPolicy,
		sizes: restProps.sizes,
		srcSet: restProps.srcSet,
		useMap: restProps.useMap
	};
};

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
		logger.warn('IconRenderer', `IconRenderer: icon "${icon}" not found in iconMap`);
		return null;
	}

	// 1. Theme variant or default lucide icon
	const variant = (config as any).themeVariants?.[theme];
	if (variant) {
		if (isLucideIcon(variant)) {
			const Lucide = variant;
			return <Lucide width={size} height={size} {...rest} />;
		}
		if (typeof variant === 'string') {
			const { alt, ...imgProps } = getImgProps(rest);
			return <img src={variant} width={size} height={size} alt={alt || `${icon}-icon`} {...imgProps} />;
		}
	}

	if ((config as any).lucide) {
		const Lucide = (config as any).lucide;
		return <Lucide width={size} height={size} {...rest} />;
	}

	// 2. Lottie animation (requires lottie-player web component globally available)
	if ((config as any).lottie) {
		return (
			<Player
				autoplay
				loop
				src={(config as any).lottie}
				style={{ width: size, height: size }}
				{...(rest as any)}
			/>
		);
	}

	// 3. SVG fallback
	if ((config as any).fallbackSvg) {
		const { alt, ...imgProps } = getImgProps(rest);
		return (
			<img src={(config as any).fallbackSvg} width={size} height={size} alt={alt || `${icon}-icon`} {...imgProps} />
		);
	}

	// 4. PNG fallback
	if ((config as any).fallbackPng) {
		const { alt, ...imgProps } = getImgProps(rest);
		return (
			<img src={(config as any).fallbackPng} width={size} height={size} alt={alt || `${icon}-icon`} {...imgProps} />
		);
	}

	return null;
};

export default IconRenderer;
