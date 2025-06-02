import React from 'react';
import { Separator } from '@/components/ui/separator';

interface SettingsGroupProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * A component for grouping related preferences within a card
 */
export function PreferencesGroup({ title, description, children, className }: SettingsGroupProps) {
  return (
    <div className={`mb-6 ${className}`}>
      {(title || description) && (
        <div className="mb-3">
          {title && <h3 className="text-lg font-medium">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
      <Separator className="mt-6" />
    </div>
  );
} 