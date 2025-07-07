import type { ComponentType } from 'react';
import { Suspense, useMemo, useState, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Settings, AlertCircle, Maximize2, Minimize2, GripVertical } from 'lucide-react';
import { useLayoutStore, type SlotId } from '@/stores/useLayoutStore';
import { widgetRegistry, getWidgetMetadata } from '@/config/widgetRegistry';
import { Skeleton } from '@/components/ui/skeleton';
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useShoutbox } from '@/contexts/shoutbox-context';
import { cn } from '@/lib/utils';

interface WidgetFrameProps {
	instanceId: string;
	className?: string;
}

export const WidgetFrame = ({ instanceId, className }: WidgetFrameProps) => {
	const instance = useLayoutStore((s) => s.instances[instanceId]);
	const order = useLayoutStore((s) => s.order);
	const moveWidget = useLayoutStore((s) => s.moveWidget);
	const removeWidget = useLayoutStore((s) => s.removeWidget);
	const { updatePosition } = useShoutbox();
	const [isExpanded, setIsExpanded] = useState(false);
	const [isDragging, setIsDragging] = useState(false);

	if (!instance) return null;

	// Get widget metadata
	const widgetConfig = widgetRegistry[instance.componentId];
	const metadata = getWidgetMetadata(instance.componentId);

	if (!widgetConfig) {
		return (
			<div className="p-4 bg-red-900/20 border border-red-800/50 rounded-lg text-red-400">
				<p className="text-sm">Widget not found: {instance.componentId}</p>
			</div>
		);
	}

	// Determine current slot
	const currentSlot = (Object.keys(order) as SlotId[]).find((slot) =>
		order[slot]?.includes(instanceId)
	) as SlotId | undefined;

	// User-friendly labels for slots
	const slotLabels: Partial<Record<SlotId, string>> = {
		'sidebar/left': 'Left Sidebar',
		'sidebar/right': 'Right Sidebar',
		'main/top': 'Main Top',
		'main/bottom': 'Main Bottom'
	};

	const availableDestinations = metadata?.defaultSlots.filter((slot) => slot !== currentSlot) || [];

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

	const componentId = instance.componentId as keyof typeof widgetRegistry;

	// Provide slot-aware default props for certain widgets
	const extraProps = useMemo(() => {
		if (componentId === 'hotThreads') {
			return {
				variant: currentSlot?.startsWith('sidebar/') ? 'widget' : 'feed'
			} as Record<string, unknown>;
		}
		return {} as Record<string, unknown>;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [componentId, currentSlot]);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const WidgetComponent = lazy(
		widgetConfig.component as () => Promise<{ default: ComponentType<any> }>
	);

	const WidgetError = ({ error }: { error: Error }) => (
		<div className="p-4 bg-red-900/20 border border-red-800/50 rounded-lg text-red-400">
			<div className="flex items-center font-semibold">
				<AlertCircle className="h-5 w-5 mr-2" />
				<span>Widget Error</span>
			</div>
			<p className="text-xs mt-2">{error.message}</p>
			<p className="text-xs mt-1 opacity-70">Component: {instance.componentId}</p>
		</div>
	);

	const shouldShowFrameMenu = instanceId !== 'shoutbox' || metadata?.id !== 'shoutbox';

	const gearClass = currentSlot?.startsWith('sidebar/left')
		? 'absolute top-1 right-1 h-6 w-6 z-20'
		: 'absolute top-1 right-1 h-6 w-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity';

	// Responsive wrapper styles
	const wrapperStyles = useMemo(() => {
		const baseStyles = 'relative group transition-all duration-200';
		const widthStyles = metadata?.responsive ? 'w-full' : '';
		const minWidthStyle = metadata?.minWidth ? `min-w-[${metadata.minWidth}px]` : '';
		const maxWidthStyle = metadata?.maxWidth ? `max-w-[${metadata.maxWidth}px]` : '';

		return cn(
			baseStyles,
			widthStyles,
			minWidthStyle,
			maxWidthStyle,
			isExpanded && 'z-50',
			isDragging && 'opacity-50 cursor-move',
			className
		);
	}, [metadata, isExpanded, isDragging, className]);

	// Loading skeleton with proper dimensions
	const LoadingSkeleton = () => {
		const height = currentSlot?.startsWith('main/') ? 'h-48' : 'h-32';
		return (
			<div className={cn('space-y-3', wrapperStyles)}>
				<Skeleton className={cn('w-full bg-zinc-800', height)} />
				{metadata?.name && (
					<div className="px-3">
						<Skeleton className="h-4 w-24 bg-zinc-800" />
					</div>
				)}
			</div>
		);
	};

	return (
		<div
			className={cn('widget-wrapper mb-4', wrapperStyles)}
			data-widget-id={instance.componentId}
			data-widget-slot={currentSlot}
		>
			{shouldShowFrameMenu && (
				<div className="widget-controls absolute top-0 right-0 flex items-center gap-1 p-1 z-30">
					{/* Drag Handle */}
					<Button
						size="icon"
						variant="ghost"
						className="h-6 w-6 cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
						onMouseDown={() => setIsDragging(true)}
						onMouseUp={() => setIsDragging(false)}
						onMouseLeave={() => setIsDragging(false)}
					>
						<GripVertical className="h-4 w-4" />
						<span className="sr-only">Drag widget</span>
					</Button>

					{/* Expand/Collapse for main slots */}
					{currentSlot?.startsWith('main/') && (
						<Button
							size="icon"
							variant="ghost"
							className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
							onClick={() => setIsExpanded(!isExpanded)}
						>
							{isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
							<span className="sr-only">{isExpanded ? 'Minimize' : 'Maximize'}</span>
						</Button>
					)}

					{/* Settings Menu */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button size="icon" variant="ghost" className={gearClass}>
								<Settings className="h-4 w-4" />
								<span className="sr-only">Widget options</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							{metadata && (
								<>
									<DropdownMenuLabel className="font-normal">
										<div className="flex flex-col space-y-1">
											<p className="text-sm font-medium leading-none">{metadata.name}</p>
											<p className="text-xs leading-none text-muted-foreground">
												{metadata.description}
											</p>
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
								</>
							)}

							{availableDestinations.length > 0 && (
								<>
									{availableDestinations.map((slot) => (
										<DropdownMenuItem key={slot} onClick={() => handleMove(slot)}>
											Move to {slotLabels[slot]}
										</DropdownMenuItem>
									))}
									<DropdownMenuSeparator />
								</>
							)}

							<DropdownMenuItem
								onClick={() => removeWidget(instanceId)}
								className="text-red-500 focus:text-red-600"
							>
								Remove Widget
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			)}

			<div
				className={cn(
					'widget-content transition-all duration-200',
					isExpanded && 'scale-110 shadow-2xl rounded-lg overflow-hidden'
				)}
			>
				<Suspense fallback={<LoadingSkeleton />}>
					<ErrorBoundary FallbackComponent={WidgetError}>
						<WidgetComponent
							instanceId={instanceId}
							slotId={currentSlot}
							{...extraProps}
							{...(instance as any).props}
						/>
					</ErrorBoundary>
				</Suspense>
			</div>
		</div>
	);
};
