import React from 'react';
import { useLayoutStore, type SlotId } from '@/stores/useLayoutStore';
import { pageSlotMap } from '@/config/pageSlotMap';
import { WidgetFrame } from './WidgetFrame';

export const LayoutRenderer: React.FC<{ page: 'home' | 'forum' | 'profile' }> = ({ page }) => {
  const order = useLayoutStore((s) => s.order);
  const sidebars = useLayoutStore((s) => s.sidebars);
  const slotsForPage = pageSlotMap[page];

  const getSidebarClass = (side: 'left' | 'right') => {
    const visibility = sidebars[side].isVisible ? 'block' : 'hidden';
    const width = sidebars[side].width === 'thin' ? 'lg:w-1/5' : 'lg:w-1/4';
    return `${visibility} ${width} w-full space-y-4`;
  };

  const leftSidebarOrder = sidebars.position === 'left-right' ? 'order-1' : 'order-3';
  const rightSidebarOrder = sidebars.position === 'left-right' ? 'order-3' : 'order-1';

  const renderSlot = (slotId: SlotId, className: string) => {
    if (!slotsForPage.includes(slotId)) return null;

    return (
      <aside className={className} data-slot={slotId}>
        {order[slotId]?.map((instanceId) => (
          <WidgetFrame key={instanceId} instanceId={instanceId} />
        ))}
      </aside>
    );
  };

  return (
    <>
      {renderSlot('sidebar/left', `${getSidebarClass('left')} ${leftSidebarOrder}`)}
      {/* Main content injected between sidebars */}
      {renderSlot('sidebar/right', `${getSidebarClass('right')} ${rightSidebarOrder}`)}
    </>
  );
};
