import React from 'react';
import { motion } from 'framer-motion';
import { brandConfig } from '@app/config/brand.config';
import { cn } from '@app/utils/utils';

export interface StatItem {
	icon: React.ReactNode;
	label: string;
	value: string | number;
	color?: 'primary' | 'secondary' | 'muted';
	animate?: boolean;
}

interface StatsBarProps {
	stats: StatItem[];
	className?: string;
	variant?: 'horizontal' | 'vertical';
	animated?: boolean;
}

export function StatsBar({
	stats,
	className = '',
	variant = 'horizontal',
	animated = true
}: StatsBarProps) {
	const getColorClass = (color: StatItem['color'] = 'muted') => {
		switch (color) {
			case 'primary':
				return brandConfig.stats.online.color;
			case 'secondary':
				return brandConfig.stats.secondary.color;
			default:
				return brandConfig.stats.muted.color;
		}
	};

	const containerClass =
		variant === 'horizontal'
			? `flex ${brandConfig.spacing.gap.md} text-sm`
			: `flex flex-col ${brandConfig.spacing.stack.sm}`;

	const StatComponent = animated ? motion.div : 'div';
	const animationProps = animated
		? {
				initial: brandConfig.animation.stagger.initial,
				animate: brandConfig.animation.stagger.animate,
				transition: { delay: brandConfig.animation.stagger.delay }
			}
		: {};

	return (
		<div className={cn(containerClass, className)}>
			{stats.map((stat, index) => (
				<StatComponent
					key={`${stat.label}-${index}`}
					className={cn('flex items-center gap-2', getColorClass(stat.color))}
					{...(animated
						? {
								...animationProps,
								transition: {
									...animationProps.transition,
									delay: index * 0.1
								}
							}
						: {})}
				>
					{stat.animate && stat.color === 'primary' ? (
						<div className={brandConfig.stats.online.icon} />
					) : (
						stat.icon
					)}
					<span className="font-medium">{stat.value}</span>
					<span className="text-sm">{stat.label}</span>
				</StatComponent>
			))}
		</div>
	);
}
