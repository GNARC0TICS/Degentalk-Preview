import React from 'react';
import { useLayoutStore, type SlotId } from '@/stores/useLayoutStore';
import { WidgetFrame } from './WidgetFrame';

interface SlotRendererProps {
  slotId: SlotId;
  className?: string;
}

/**
 * SlotRenderer is a lightweight utility component that renders all widget instances
 * for the given slotId using the ordering from the global layout store. This allows
 * any page or layout container to embed dynamic widget areas without re-implementing
 * the mapping logic each time.
 */
export const SlotRenderer: React.FC<SlotRendererProps> = ({ slotId, className }) => {
  const order = useLayoutStore((s) => s.order);
  const hasHydrated = useLayoutStore((s) => s._hasHydrated);

  // Avoid rendering until hydration is done on the client to prevent SSR mismatch flashes.
  // On the server (no window) we allow rendering so SSR markup shows up.
  if (typeof window !== 'undefined' && !hasHydrated) return null;

  const instances = order[slotId] ?? [];

  // If the slot is empty we avoid rendering an extra wrapper to keep the DOM clean.
  if (instances.length === 0) return null;

  return (
    <div className={className} data-slot={slotId}>
      {instances.map((instanceId) => (
        <WidgetFrame key={instanceId} instanceId={instanceId} />
      ))}
    </div>
  );
}; 