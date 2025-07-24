import { useLayoutStore, type SlotId } from '@app/stores/useLayoutStore';
import { pageSlotMap } from '@app/config/pageSlotMap';
import { SlotRenderer } from './SlotRenderer';

export const LayoutRenderer = ({ page }: { page: 'home' | 'forum' | 'profile' }) => {
	const sidebars = useLayoutStore((s) => s.sidebars);
	const slotsForPage = pageSlotMap[page];

	const getSidebarClass = (side: 'left' | 'right') => {
		const visibility = sidebars[side].isVisible ? 'block' : 'hidden';
		const width = sidebars[side].width === 'thin' ? 'lg:w-1/5' : 'lg:w-1/4';
		return `${visibility} ${width} w-full space-y-4`;
	};

	const leftSidebarOrder = sidebars.position === 'left-right' ? 'order-1' : 'order-3';
	const rightSidebarOrder = sidebars.position === 'left-right' ? 'order-3' : 'order-1';

	const renderSidebarSlot = (slotId: SlotId, className: string) => {
		if (!slotsForPage.includes(slotId)) return null;

		return (
			<aside className={className}>
				<SlotRenderer slotId={slotId} />
			</aside>
		);
	};

	return (
		<>
			{renderSidebarSlot('sidebar/left', `${getSidebarClass('left')} ${leftSidebarOrder}`)}
			{/* Main content injected between sidebars */}
			{renderSidebarSlot('sidebar/right', `${getSidebarClass('right')} ${rightSidebarOrder}`)}
		</>
	);
};
