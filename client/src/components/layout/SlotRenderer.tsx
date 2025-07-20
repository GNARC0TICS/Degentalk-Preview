import { useLayoutStore, type SlotId } from '@/stores/useLayoutStore';
import { WidgetFrame } from './WidgetFrame.tsx';

interface SlotRendererProps {
	slotId: SlotId;
	className?: string;
}

export const SlotRenderer = ({ slotId, className }: SlotRendererProps) => {
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
