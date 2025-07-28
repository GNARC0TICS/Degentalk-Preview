/**
 * UserTitle Component
 * 
 * Displays a single user title with proper CSS styling based on database properties
 */

import React from 'react';
import { cn } from '@/utils/utils';
import { getTitleClasses, generateTitleStyles } from '@shared/utils/title-utils';
import type { Title } from '@shared/types/entities/title.types';

interface UserTitleProps {
  /** Title data from database */
  title: Title;
  /** Whether the title should be clickable */
  clickable?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show as a link */
  href?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

/**
 * UserTitle component that renders a title with proper CSS styling
 */
export function UserTitle({ 
  title, 
  clickable = false, 
  onClick, 
  className, 
  href,
  style = {} 
}: UserTitleProps) {
  // Generate CSS classes and styles
  const titleClasses = getTitleClasses(title);
  const titleStyles = generateTitleStyles(title);
  
  // Combine database styles with custom styles
  const combinedStyles = {
    ...titleStyles,
    ...style
  };

  // Add CSS variables for custom styling
  if (title.gradientStart) {
    combinedStyles['--title-gradient-start'] = title.gradientStart;
  }
  if (title.gradientEnd) {
    combinedStyles['--title-gradient-end'] = title.gradientEnd;
  }
  if (title.textColor) {
    combinedStyles['--title-text-color'] = title.textColor;
  }
  if (title.borderColor) {
    combinedStyles['--title-border-color'] = title.borderColor;
  }
  if (title.glowColor) {
    combinedStyles['--title-glow-color'] = title.glowColor;
  }

  // Combine all CSS classes
  const finalClasses = cn(
    titleClasses,
    clickable && 'clickable',
    className
  );

  // Get display text (prioritize displayText, fallback to name)
  const displayText = title.displayText || title.name;
  const finalDisplayText = title.emoji ? `${title.emoji} ${displayText}` : displayText;

  // If href is provided, render as a link
  if (href) {
    return (
      <a
        href={href}
        className={cn(finalClasses, 'clickable')}
        style={combinedStyles}
        onClick={onClick}
      >
        {finalDisplayText}
      </a>
    );
  }

  // Otherwise render as span or button
  const Component = clickable ? 'button' : 'span';
  
  return (
    <Component
      className={finalClasses}
      style={combinedStyles}
      onClick={clickable ? onClick : undefined}
      type={clickable ? 'button' : undefined}
    >
      {finalDisplayText}
    </Component>
  );
}

/**
 * UserTitleDisplay - Simple wrapper for non-interactive display
 */
export function UserTitleDisplay({ title, className }: { title: Title; className?: string }) {
  return <UserTitle title={title} className={className} />;
}

/**
 * UserTitleButton - Interactive title that can be clicked
 */
export function UserTitleButton({ 
  title, 
  onClick, 
  className 
}: { 
  title: Title; 
  onClick: () => void; 
  className?: string 
}) {
  return (
    <UserTitle 
      title={title} 
      clickable={true} 
      onClick={onClick} 
      className={className} 
    />
  );
}

/**
 * UserTitleLink - Title that renders as a link
 */
export function UserTitleLink({ 
  title, 
  href, 
  onClick, 
  className 
}: { 
  title: Title; 
  href: string; 
  onClick?: () => void; 
  className?: string 
}) {
  return (
    <UserTitle 
      title={title} 
      href={href} 
      onClick={onClick} 
      className={className} 
    />
  );
}