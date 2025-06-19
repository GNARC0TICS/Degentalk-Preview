import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Settings, AlertCircle } from 'lucide-react';
import { useLayoutStore, type SlotId } from '@/stores/useLayoutStore';
import { componentRegistry } from '@/config/componentRegistry';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useShoutbox } from '@/contexts/shoutbox-context';

interface WidgetFrameProps {
  instanceId: string;
}

export const WidgetFrame: React.FC<WidgetFrameProps> = ({ instanceId }) => {
  const instance = useLayoutStore((s) => s.instances[instanceId]);
  const order = useLayoutStore((s) => s.order);
  const moveWidget = useLayoutStore((s) => s.moveWidget);
  const removeWidget = useLayoutStore((s) => s.removeWidget);
  const { updatePosition } = useShoutbox();

  if (!instance) return null;

  // Determine current slot
  const currentSlot = (Object.keys(order) as SlotId[]).find((slot) =>
    order[slot]?.includes(instanceId)
  ) as SlotId | undefined;

  // User-friendly labels for slots
  const slotLabels: Partial<Record<SlotId, string>> = {
    'sidebar/left': 'Left Sidebar',
    'sidebar/right': 'Right Sidebar',
    'main/top': 'Main Top',
    'main/bottom': 'Main Bottom',
  };

  const availableDestinations = (Object.keys(slotLabels) as SlotId[]).filter(
    (slot) => slot !== currentSlot
  );

  const handleMove = (destSlot: SlotId) => {
    if (!currentSlot) return;
    const sourceIndex = order[currentSlot].indexOf(instanceId);
    moveWidget(currentSlot, destSlot, sourceIndex, 0);

    // Keep shoutbox position preference in sync when it is moved via the gear menu
    if (instanceId === 'shoutbox') {
      let newPref: string;
      if (destSlot.startsWith('sidebar')) {
        // Default to top when moving between sidebars
        newPref = destSlot.startsWith('sidebar') ? 'sidebar-top' : 'sidebar-top';
      } else if (destSlot === 'main/top') {
        newPref = 'main-top';
      } else if (destSlot === 'main/bottom') {
        newPref = 'main-bottom';
      } else {
        newPref = 'floating';
      }

      // Fire and forget – context handles optimistic update
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      updatePosition(newPref as any);
    }
  };

  const componentId = instance.componentId as keyof typeof componentRegistry;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const WidgetComponent = React.lazy(
    componentRegistry[componentId] as () => Promise<{ default: React.ComponentType<any> }>
  );

  const WidgetError = ({ error }: { error: Error }) => (
    <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-lg text-red-400">
      <div className="flex items-center font-semibold">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>Widget Error</span>
      </div>
      <p className="text-xs mt-2">{error.message}</p>
    </div>
  );

  const shouldShowFrameMenu = instanceId !== 'shoutbox';

  const gearClass = currentSlot?.startsWith('sidebar/left')
    ? 'absolute top-1 right-1 h-6 w-6 z-20'
    : 'absolute top-1 right-1 h-6 w-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity';

  return (
    <div className="widget-wrapper relative group mb-4">
      {shouldShowFrameMenu && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className={gearClass}
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Widget options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {availableDestinations.map((slot) => (
              <DropdownMenuItem key={slot} onClick={() => handleMove(slot)}>
                Move to {slotLabels[slot]}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem
              onClick={() => removeWidget(instanceId)}
              className="text-red-500 focus:text-red-600"
            >
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Suspense fallback={<Skeleton className="h-32 w-full bg-zinc-800" />}>
        <ErrorBoundary FallbackComponent={WidgetError}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <WidgetComponent instanceId={instanceId} {...(instance as any).props} />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}; 