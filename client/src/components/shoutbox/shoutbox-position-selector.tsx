import React from 'react';
import { Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useShoutbox } from '@/contexts/shoutbox-context';
import type { ShoutboxPosition } from '@/contexts/shoutbox-context';
import { useToast } from '@/hooks/use-toast';
import { useMobileDetector } from '@/hooks/use-media-query';
import { useLayoutStore, type SlotId } from '@/stores/useLayoutStore';

// Desktop position options
const desktopPositionOptions: { value: ShoutboxPosition; label: string; description: string }[] = [
	{
		value: 'sidebar-top',
		label: 'Sidebar Top',
		description: 'Displayed at the top of the sidebar'
	},
	{
		value: 'sidebar-bottom',
		label: 'Sidebar Bottom',
		description: 'Displayed at the bottom of the sidebar'
	},
	{
		value: 'main-top',
		label: 'Main Top',
		description: 'Displayed at the top of the main content'
	},
	{
		value: 'main-bottom',
		label: 'Main Bottom',
		description: 'Displayed at the bottom of the main content'
	},
	{
		value: 'floating',
		label: 'Floating',
		description: 'Displayed as a floating window'
	}
];

// Mobile position options (simplified with only necessary options)
const mobilePositionOptions: { value: ShoutboxPosition; label: string; description: string }[] = [
	{
		value: 'main-top',
		label: 'Content Top',
		description: 'Displayed at the top of the content'
	},
	{
		value: 'main-bottom',
		label: 'Content Bottom',
		description: 'Displayed at the bottom of the page'
	},
	{
		value: 'floating',
		label: 'Floating Bubble',
		description: 'Displayed as a floating chat bubble'
	}
];

interface ShoutboxPositionSelectorProps {
	instanceId?: string;
}

export function ShoutboxPositionSelector({ instanceId }: ShoutboxPositionSelectorProps) {
	const { position, updatePosition } = useShoutbox();
	const [open, setOpen] = React.useState(false);
	const { toast } = useToast();
	const isMobile = useMobileDetector();

	// Layout store hooks if instanceId is provided
	const order = useLayoutStore((s) => s.order);
	const moveWidget = useLayoutStore((s) => s.moveWidget);

	const currentSlot = instanceId
		? (Object.keys(order) as SlotId[]).find((slot) => order[slot]?.includes(instanceId))
		: undefined;

	const slotOptions: { value: SlotId; label: string }[] = [
		{ value: 'sidebar/left', label: 'Left Sidebar' },
		{ value: 'sidebar/right', label: 'Right Sidebar' },
		{ value: 'main/top', label: 'Main Top' },
		{ value: 'main/bottom', label: 'Main Bottom' }
	];

	// Select the correct position options based on viewport
	const positionOptions = isMobile ? mobilePositionOptions : desktopPositionOptions;

	const handlePositionChange = async (value: string) => {
		try {
			const newPosition = value as ShoutboxPosition;
			await updatePosition(newPosition);
			toast({
				title: 'Position updated',
				description: `Shoutbox position set to ${getPositionLabel(newPosition)}`
			});
			setOpen(false);
		} catch (error) {
			console.error('Error updating position:', error);
			toast({
				title: 'Error',
				description: 'Failed to update shoutbox position',
				variant: 'destructive'
			});
		}
	};

	const handleSlotChange = (destSlot: SlotId, destIndex: number) => {
		if (!instanceId || !currentSlot) return;
		const sourceIndex = order[currentSlot].indexOf(instanceId);
		moveWidget(currentSlot, destSlot, sourceIndex, destIndex);
	};

	// Map from column + position to slot/position strings
	const getSlotForColumnPos = (
		column: 'sidebar-left' | 'sidebar-right' | 'main',
		pos: 'top' | 'bottom'
	): SlotId => {
		if (column === 'sidebar-left') return 'sidebar/left';
		if (column === 'sidebar-right') return 'sidebar/right';
		// column === 'main'
		return pos === 'top' ? 'main/top' : 'main/bottom';
	};

	// UI selections
	const [columnSelection, setColumnSelection] = React.useState<
		'sidebar-left' | 'sidebar-right' | 'main'
	>(
		currentSlot?.startsWith('sidebar/left')
			? 'sidebar-left'
			: currentSlot?.startsWith('sidebar/right')
				? 'sidebar-right'
				: 'main'
	);

	const [positionSelection, setPositionSelection] = React.useState<
		'top' | 'bottom' | 'floating' | 'sticky'
	>(position.includes('bottom') ? 'bottom' : position.includes('top') ? 'top' : (position as any));

	// Keep column selection in sync if widget is moved externally (e.g., gear-menu)
	React.useEffect(() => {
		const updatedColumn: 'sidebar-left' | 'sidebar-right' | 'main' = currentSlot?.startsWith(
			'sidebar/left'
		)
			? 'sidebar-left'
			: currentSlot?.startsWith('sidebar/right')
				? 'sidebar-right'
				: 'main';

		setColumnSelection((prev) => (prev !== updatedColumn ? updatedColumn : prev));
	}, [currentSlot]);

	// Keep position selection in sync with context updates that may have happened elsewhere
	React.useEffect(() => {
		const updatedPos: 'top' | 'bottom' | 'floating' | 'sticky' = position.includes('bottom')
			? 'bottom'
			: position.includes('top')
				? 'top'
				: (position as any);

		setPositionSelection((prev) => (prev !== updatedPos ? updatedPos : prev));
	}, [position]);

	const applySelections = async (col: typeof columnSelection, pos: typeof positionSelection) => {
		if (pos === 'floating' || pos === 'sticky') {
			// Only preference needs changing; widget stays where it is visually (floating handled by PositionedShoutbox)
			await updatePosition(pos as ShoutboxPosition);
			return;
		}

		const destSlot = getSlotForColumnPos(col, pos);

		// Determine desired index (top = 0, bottom = end). After removal, length may shrink by 1 if same slot.
		const destListLength = order[destSlot]?.length ?? 0;
		const destIndex = pos === 'top' ? 0 : destListLength;

		handleSlotChange(destSlot, destIndex);

		// Sync context preference (sidebar-top / sidebar-bottom / main-top / main-bottom)
		const newPref: ShoutboxPosition = destSlot.startsWith('sidebar')
			? `sidebar-${pos}`
			: `main-${pos}`;

		await updatePosition(newPref);
	};

	React.useEffect(() => {
		applySelections(columnSelection, positionSelection).catch(console.error);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [columnSelection, positionSelection]);

	const getPositionLabel = (pos: ShoutboxPosition) => {
		// Return label based on current viewport (mobile/desktop)
		return positionOptions.find((option) => option.value === pos)?.label || 'Unknown';
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="h-6 w-6 rounded-md hover:bg-accent hover:text-accent-foreground"
					title="Change shoutbox position"
				>
					<Settings className="h-4 w-4" />
					<span className="sr-only">Change shoutbox position</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-96 p-4" align="end">
				<div className="grid grid-cols-2 gap-4">
					{/* Column Selector */}
					<div>
						<h4 className="font-medium mb-2">@column</h4>
						<RadioGroup
							value={columnSelection}
							onValueChange={(v) => setColumnSelection(v as any)}
							className="gap-2"
						>
							{[
								{ value: 'sidebar-left', label: 'Sidebar Left' },
								{ value: 'sidebar-right', label: 'Sidebar Right' },
								{ value: 'main', label: 'Main' }
							].map((opt) => (
								<div
									key={opt.value}
									className="flex items-center space-x-2 p-1 hover:bg-muted rounded cursor-pointer"
									onClick={() => setColumnSelection(opt.value as any)}
								>
									<RadioGroupItem value={opt.value} id={opt.value} />
									<Label htmlFor={opt.value}>{opt.label}</Label>
								</div>
							))}
						</RadioGroup>
					</div>

					{/* Position Selector */}
					<div>
						<h4 className="font-medium mb-2">Position</h4>
						<RadioGroup
							value={positionSelection}
							onValueChange={(v) => setPositionSelection(v as any)}
							className="gap-2"
						>
							{[
								{ value: 'top', label: 'Top' },
								{ value: 'bottom', label: 'Bottom' },
								{ value: 'floating', label: 'Floating' },
								{ value: 'sticky', label: 'Sticky' }
							].map((opt) => (
								<div
									key={opt.value}
									className="flex items-center space-x-2 p-1 hover:bg-muted rounded cursor-pointer"
									onClick={() => setPositionSelection(opt.value as any)}
								>
									<RadioGroupItem value={opt.value} id={opt.value} />
									<Label htmlFor={opt.value}>{opt.label}</Label>
								</div>
							))}
						</RadioGroup>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
