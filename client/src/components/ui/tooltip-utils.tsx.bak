import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

/**
 * SafeTooltip - A wrapper component to safely handle tooltip rendering
 * 
 * This component ensures that the TooltipTrigger with asChild always 
 * receives a single valid React element as required by React.Children.only
 */
export function SafeTooltip({
  content,
  children,
  side = "top",
  ...props
}: {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: "top" | "right" | "bottom" | "left";
  [key: string]: any;
}) {
  // Only render the tooltip if we have both content and a valid trigger element
  if (!content || !React.isValidElement(children)) {
    return children || null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side} {...props}>
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
  side = "top",
  ...props
}: {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: "top" | "right" | "bottom" | "left";
  [key: string]: any;
}) {
  // If no content or invalid element, just return the children
  if (!content || !React.isValidElement(children)) {
    return children || null;
  }

  // Make sure the child has necessary a11y attributes for buttons
  const enhancedChild = React.cloneElement(children, {
    role: children.props.role || "button",
    tabIndex: children.props.tabIndex || 0,
  });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {enhancedChild}
        </TooltipTrigger>
        <TooltipContent side={side} {...props}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 