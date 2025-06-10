import React from 'react';
import { Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useShoutbox, ShoutboxPosition } from '@/contexts/shoutbox-context';
import { useToast } from '@/hooks/use-toast';
import { useMobileDetector } from '@/hooks/use-media-query';

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

export function ShoutboxPositionSelector() {
	const { position, updatePosition } = useShoutbox();
	const [open, setOpen] = React.useState(false);
	const { toast } = useToast();
	const isMobile = useMobileDetector();

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
			<PopoverContent className="w-80 p-3" align="end">
				<div className="space-y-4">
					<h4 className="font-medium">Shoutbox Position</h4>
					<RadioGroup value={position} onValueChange={handlePositionChange} className="gap-2">
						{positionOptions.map((option) => (
							<div
								key={option.value}
								className="flex items-start space-x-2 rounded-md p-2 hover:bg-muted cursor-pointer transition-colors"
								onClick={() => handlePositionChange(option.value)}
							>
								<RadioGroupItem value={option.value} id={option.value} />
								<div className="grid gap-1">
									<Label htmlFor={option.value} className="font-medium cursor-pointer">
										{option.label}
									</Label>
									<p className="text-sm text-muted-foreground">{option.description}</p>
								</div>
							</div>
						))}
					</RadioGroup>
				</div>
			</PopoverContent>
		</Popover>
	);
}
