import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * SafeTooltip - A wrapper component to safely handle tooltip rendering
 *
 * This component ensures that the TooltipTrigger with asChild always
 * receives a single valid React element as required by React.Children.only
 */
export function SafeTooltip({
	content,
	children,
	side = 'top',
	...props
}: {
	content: React.ReactNode;
	children: React.ReactElement;
	side?: 'top' | 'right' | 'bottom' | 'left';
	sideOffset?: number;
	collisionPadding?: number;
	hideOnMobile?: boolean;
	[key: string]: any;
}) {
	// Hide tooltips on very small screens if requested
	if (props.hideOnMobile && typeof window !== 'undefined' && window.innerWidth < 400) {
		return children;
	}

	if (!content || !React.isValidElement(children)) {
		return children || null;
	}

	const { sideOffset = 4, collisionPadding = 8, ...rest } = props;

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>{children}</TooltipTrigger>
				<TooltipContent
					side={side}
					sideOffset={sideOffset}
					collisionPadding={collisionPadding}
					{...rest}
				>
					{content}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

/**
 * ButtonTooltip - A safe tooltip specifically for button elements
 */
export function ButtonTooltip({
	content,
	children,
	side = 'top',
	...props
}: {
	content: React.ReactNode;
	children: React.ReactElement;
	side?: 'top' | 'right' | 'bottom' | 'left';
	sideOffset?: number;
	collisionPadding?: number;
	hideOnMobile?: boolean;
	[key: string]: any;
}) {
	// Hide tooltips on very small screens if requested
	if (props.hideOnMobile && typeof window !== 'undefined' && window.innerWidth < 400) {
		return children;
	}

	if (!content || !React.isValidElement(children)) {
		return children || null;
	}

	const { sideOffset = 4, collisionPadding = 8, ...rest } = props;

	// Make sure the child has necessary a11y attributes for buttons
	const enhancedChild = React.cloneElement(children, {
		role: children.props.role || 'button',
		tabIndex: children.props.tabIndex || 0
	});

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>{enhancedChild}</TooltipTrigger>
				<TooltipContent
					side={side}
					sideOffset={sideOffset}
					collisionPadding={collisionPadding}
					{...rest}
				>
					{content}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
