import React, { useState } from 'react';
import { widgetRegistry, type WidgetMetadata, type WidgetId } from '@/config/widgetRegistry';
import { useLayoutStore, type SlotId } from '@/stores/useLayoutStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Search, X } from 'lucide-react';
import { cn } from '@/utils/utils';
import { v4 as uuidv4 } from 'uuid';

interface WidgetGalleryProps {
	targetSlot?: SlotId;
	className?: string;
}

export const WidgetGallery: React.FC<WidgetGalleryProps> = ({ targetSlot, className }) => {
	const [open, setOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState<WidgetMetadata['category'] | 'all'>(
		'all'
	);

	const instances = useLayoutStore((s) => s.instances);
	const order = useLayoutStore((s) => s.order);

	// Get all installed widget IDs
	const installedWidgetIds = new Set(
		Object.values(instances).map((instance) => instance.componentId)
	);

	// Filter widgets based on search and category
	const filteredWidgets = Object.entries(widgetRegistry).filter(([id, config]) => {
		const metadata = config.metadata;

		// Filter by category
		if (selectedCategory !== 'all' && metadata.category !== selectedCategory) {
			return false;
		}

		// Filter by search query
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			return (
				metadata.name.toLowerCase().includes(query) ||
				metadata.description.toLowerCase().includes(query) ||
				metadata.category.toLowerCase().includes(query)
			);
		}

		// Filter by target slot compatibility
		if (targetSlot && !metadata.defaultSlots.includes(targetSlot)) {
			return false;
		}

		return true;
	});

	const categories: Array<{ value: WidgetMetadata['category'] | 'all'; label: string }> = [
		{ value: 'all', label: 'All Widgets' },
		{ value: 'navigation', label: 'Navigation' },
		{ value: 'social', label: 'Social' },
		{ value: 'data', label: 'Data & Stats' },
		{ value: 'interactive', label: 'Interactive' },
		{ value: 'economy', label: 'Economy' },
		{ value: 'forum', label: 'Forum' }
	];

	const handleAddWidget = (widgetId: WidgetId) => {
		const metadata = widgetRegistry[widgetId].metadata;
		const instanceId = `${widgetId}-${uuidv4().slice(0, 8)}`;

		// Add to instances
		useLayoutStore.setState((state) => ({
			instances: {
				...state.instances,
				[instanceId]: {
					instanceId,
					componentId: widgetId
				}
			}
		}));

		// Add to appropriate slot
		const slot = targetSlot || metadata.defaultSlots[0];
		if (slot) {
			// Update the order to include the new widget at the end of the slot list
			useLayoutStore.setState((state) => ({
				order: {
					...state.order,
					[slot]: [...(state.order[slot] || []), instanceId]
				}
			}));
		}

		setOpen(false);
	};

	const WidgetCard = ({ id, config }: { id: string; config: (typeof widgetRegistry)[string] }) => {
		const metadata = config.metadata;
		const Icon = metadata.icon;
		const isInstalled = installedWidgetIds.has(id);

		return (
			<div
				className={cn(
					'relative p-4 rounded-lg border bg-zinc-900/50 hover:bg-zinc-800/50 transition-all duration-200',
					isInstalled ? 'border-emerald-500/50' : 'border-zinc-700'
				)}
			>
				<div className="flex items-start justify-between mb-3">
					<div className="flex items-center gap-3">
						{Icon && (
							<div className="p-2 rounded-lg bg-zinc-800">
								<Icon className="h-5 w-5 text-zinc-400" />
							</div>
						)}
						<div>
							<h4 className="font-medium text-white">{metadata.name}</h4>
							<Badge variant="secondary" className="mt-1 text-xs">
								{metadata.category}
							</Badge>
						</div>
					</div>
					{isInstalled && (
						<Badge variant="default" className="bg-emerald-500/20 text-emerald-400">
							Installed
						</Badge>
					)}
				</div>

				<p className="text-sm text-zinc-400 mb-4">{metadata.description}</p>

				<div className="flex items-center justify-between">
					<div className="flex gap-2 flex-wrap">
						{metadata.defaultSlots.map((slot) => (
							<Badge key={slot} variant="outline" className="text-xs">
								{slot.replace('/', ' ')}
							</Badge>
						))}
					</div>

					<Button
						size="sm"
						variant={isInstalled ? 'secondary' : 'default'}
						onClick={() => handleAddWidget(id as WidgetId)}
						disabled={isInstalled && targetSlot === undefined}
					>
						<Plus className="h-4 w-4 mr-1" />
						{isInstalled ? 'Add Another' : 'Add Widget'}
					</Button>
				</div>

				{metadata.requiresAuth && (
					<div className="mt-2 text-xs text-amber-400">Requires authentication</div>
				)}
			</div>
		);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className={className}>
					<Plus className="h-4 w-4 mr-2" />
					Add Widget
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-4xl max-h-[80vh]">
				<DialogHeader>
					<DialogTitle>Widget Gallery</DialogTitle>
					<DialogDescription>
						Browse and add widgets to customize your layout
						{targetSlot && (
							<span className="ml-2 text-emerald-400">
								Adding to: {targetSlot.replace('/', ' ')}
							</span>
						)}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Search Bar */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
						<Input
							placeholder="Search widgets..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10 pr-10"
						/>
						{searchQuery && (
							<Button
								variant="ghost"
								size="icon"
								className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
								onClick={() => setSearchQuery('')}
							>
								<X className="h-4 w-4" />
							</Button>
						)}
					</div>

					{/* Category Tabs */}
					<Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
						<TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full">
							{categories.map((cat) => (
								<TabsTrigger key={cat.value} value={cat.value} className="text-xs">
									{cat.label}
								</TabsTrigger>
							))}
						</TabsList>

						<TabsContent value={selectedCategory} className="mt-4">
							<ScrollArea className="h-[50vh]">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
									{filteredWidgets.length === 0 ? (
										<div className="col-span-2 text-center py-12 text-zinc-500">
											<p className="text-lg font-medium mb-2">No widgets found</p>
											<p className="text-sm">Try adjusting your search or category filter</p>
										</div>
									) : (
										filteredWidgets.map(([id, config]) => (
											<WidgetCard key={id} id={id} config={config} />
										))
									)}
								</div>
							</ScrollArea>
						</TabsContent>
					</Tabs>
				</div>
			</DialogContent>
		</Dialog>
	);
};
