import React from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Upload } from 'lucide-react';

// Badge types (can be shared from a types file if available)
export interface BadgeFormData {
	name: string;
	description: string;
	iconUrl: string;
	rarity: string;
}

export interface Badge extends BadgeFormData {
	id: number;
	// createdAt: string; // Not strictly needed for form dialogs
}

// Badge rarity options
export const RARITIES = [
	{ value: 'common', label: 'Common', color: 'bg-slate-500' },
	{ value: 'uncommon', label: 'Uncommon', color: 'bg-green-500' },
	{ value: 'rare', label: 'Rare', color: 'bg-blue-500' },
	{ value: 'epic', label: 'Epic', color: 'bg-purple-500' },
	{ value: 'legendary', label: 'Legendary', color: 'bg-amber-500' },
	{ value: 'mythic', label: 'Mythic', color: 'bg-red-500' }
];

// Get badge color based on rarity
export const getBadgeRarityDisplay = (rarityValue: string) => {
	const rarity = RARITIES.find((r) => r.value === rarityValue);
	return rarity
		? { label: rarity.label, colorClass: rarity.color }
		: { label: rarityValue, colorClass: 'bg-slate-500' };
};

interface BadgeFormDialogProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	isEdit: boolean;
	formData: BadgeFormData;
	setFormData: React.Dispatch<React.SetStateAction<BadgeFormData>>;
	handleSubmit: (e: React.FormEvent) => void;
	isSubmitting?: boolean;
}

export const BadgeFormDialogComponent: React.FC<BadgeFormDialogProps> = ({
	isOpen,
	setIsOpen,
	isEdit,
	formData,
	setFormData,
	handleSubmit,
	isSubmitting
}) => (
	<Dialog
		open={isOpen}
		onOpenChange={(open) => {
			setIsOpen(open);
			// Consider if resetForm logic should be here or passed in
		}}
	>
		<DialogContent className="sm:max-w-[500px]">
			<form onSubmit={handleSubmit}>
				<DialogHeader>
					<DialogTitle>{isEdit ? 'Edit Badge' : 'Create New Badge'}</DialogTitle>
					<DialogDescription>
						{isEdit ? 'Update the badge details below.' : 'Add a new badge to reward users.'}
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
					<div className="grid gap-2">
						<Label htmlFor="name">Badge Name</Label>
						<Input
							id="name"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							required
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							placeholder="Describe what this badge is for..."
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="iconUrl">Icon URL</Label>
						<div className="flex gap-2">
							<Input
								id="iconUrl"
								value={formData.iconUrl}
								onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
								placeholder="https://example.com/badge-icon.png"
								required
								className="flex-1"
							/>
							<Button
								type="button"
								variant="outline"
								size="icon"
								aria-label="Upload Icon (Placeholder)"
							>
								<Upload className="h-4 w-4" />
							</Button>
						</div>
						{formData.iconUrl && (
							<div className="mt-2 flex items-center gap-2">
								<img
									src={formData.iconUrl}
									alt="Badge Preview"
									className="w-10 h-10 object-contain border border-slate-700 rounded"
									onError={(e) =>
										((e.target as HTMLImageElement).src = 'https://placehold.co/40x40?text=Err')
									}
								/>
								<span className="text-xs text-muted-foreground">Preview</span>
							</div>
						)}
					</div>

					<div className="grid gap-2">
						<Label htmlFor="rarity">Rarity</Label>
						<Select
							value={formData.rarity}
							onValueChange={(value) => setFormData({ ...formData, rarity: value })}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select rarity" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Badge Rarity</SelectLabel>
									{RARITIES.map((rarity) => (
										<SelectItem key={rarity.value} value={rarity.value}>
											<div className="flex items-center gap-2">
												<div className={`w-3 h-3 rounded-full ${rarity.color}`} />
												<span>{rarity.label}</span>
											</div>
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</div>

				<DialogFooter className="sticky bottom-0 bg-background py-4 border-t flex-wrap gap-2 sm:justify-end">
					<Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
						Cancel
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Saving...' : isEdit ? 'Update Badge' : 'Create Badge'}
					</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	</Dialog>
);

interface DeleteBadgeConfirmationDialogProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	badge: Badge | null;
	onConfirmDelete: () => void;
	isDeleting?: boolean;
}

export const DeleteBadgeConfirmationDialog: React.FC<DeleteBadgeConfirmationDialogProps> = ({
	isOpen,
	setIsOpen,
	badge,
	onConfirmDelete,
	isDeleting
}) => (
	<Dialog open={isOpen} onOpenChange={setIsOpen}>
		<DialogContent className="sm:max-w-[400px]">
			<DialogHeader>
				<DialogTitle>Delete Badge</DialogTitle>
				<DialogDescription>
					Are you sure you want to delete this badge? This action cannot be undone.
				</DialogDescription>
			</DialogHeader>

			{badge && (
				<div className="flex items-center gap-3 py-4">
					<img
						src={badge.iconUrl}
						alt={badge.name}
						className="w-12 h-12 object-contain border border-slate-700 rounded"
						onError={(e) =>
							((e.target as HTMLImageElement).src = 'https://placehold.co/48x48?text=Err')
						}
					/>
					<div>
						<h4 className="font-medium">{badge.name}</h4>
						<p className="text-sm text-muted-foreground">{badge.description}</p>
					</div>
				</div>
			)}

			<DialogFooter className="flex-wrap gap-2 sm:justify-end">
				<Button variant="outline" onClick={() => setIsOpen(false)}>
					Cancel
				</Button>
				<Button variant="destructive" onClick={onConfirmDelete} disabled={isDeleting}>
					{isDeleting ? 'Deleting...' : 'Delete Badge'}
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
);
