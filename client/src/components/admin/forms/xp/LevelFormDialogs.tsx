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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TitleMediaInput } from '@/components/admin/forms/xp/TitleMediaInput';
import { UnlockMultiSelect } from '@/components/admin/inputs/UnlockMultiSelect';
// Assuming Level and LevelFormData types might be needed by the page as well
// If not, they can be kept internal to this file.

export interface LevelFormData {
	level: number;
	xpRequired: number;
	rewardDgt: number;
	rewardTitle: string;
	description: string;
	// Visual fields
	iconUrl?: string;
	frameUrl?: string;
	colorTheme?: string;
	animationEffect?: string;
	rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
	// Unlocks JSON (advanced)
	unlocks?: {
		titles?: number[];
		badges?: number[];
		frames?: number[];
		[extra: string]: any;
	};
}

export interface Level extends LevelFormData {
	id: number;
	// createdAt: string; // Not strictly needed for form dialogs
}

interface LevelFormDialogProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	isEdit: boolean;
	formData: LevelFormData;
	setFormData: React.Dispatch<React.SetStateAction<LevelFormData>>;
	handleSubmit: (e: React.FormEvent) => void;
	isSubmitting?: boolean;
	levelsData?: { levels?: Pick<Level, 'level' | 'xpRequired'>[] }; // For calculating XP diff
}

export const LevelFormDialogComponent: React.FC<LevelFormDialogProps> = ({
	isOpen,
	setIsOpen,
	isEdit,
	formData,
	setFormData,
	handleSubmit,
	isSubmitting,
	levelsData
}) => (
	<Dialog
		open={isOpen}
		onOpenChange={(open) => {
			setIsOpen(open);
			// Consider if resetForm logic should be here or passed in from the page
		}}
	>
		<DialogContent className="sm:max-w-[500px]">
			<form onSubmit={handleSubmit}>
				<DialogHeader>
					<DialogTitle>{isEdit ? 'Edit Level' : 'Create New Level'}</DialogTitle>
					<DialogDescription>
						{isEdit
							? 'Update the level details below.'
							: 'Define a new XP level with its requirements and rewards.'}
					</DialogDescription>
				</DialogHeader>

				<Tabs defaultValue="basics" className="max-h-[70vh] overflow-y-auto pr-2">
					<TabsList className="sticky top-0 bg-background z-10">
						<TabsTrigger value="basics">Basics</TabsTrigger>
						<TabsTrigger value="visuals">Visuals</TabsTrigger>
						<TabsTrigger value="unlocks">Unlocks</TabsTrigger>
					</TabsList>

					<TabsContent value="basics" className="grid gap-4 py-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="level">Level Number</Label>
								<Input
									id="level"
									type="number"
									min="1"
									value={formData.level}
									onChange={(e) =>
										setFormData({ ...formData, level: parseInt(e.target.value, 10) || 1 })
									}
									required
								/>
							</div>
							<div>
								<Label htmlFor="xpRequired">XP Required</Label>
								<Input
									id="xpRequired"
									type="number"
									min="0"
									value={formData.xpRequired}
									onChange={(e) =>
										setFormData({ ...formData, xpRequired: parseInt(e.target.value, 10) || 0 })
									}
									required
								/>
							</div>
						</div>

						<div>
							<Label htmlFor="description">Description (Optional)</Label>
							<Input
								id="description"
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								placeholder="Level up description"
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="rewardDgt">DGT Reward</Label>
								<Input
									id="rewardDgt"
									type="number"
									min="0"
									value={formData.rewardDgt}
									onChange={(e) =>
										setFormData({ ...formData, rewardDgt: parseInt(e.target.value, 10) || 0 })
									}
								/>
							</div>
							<div>
								<Label htmlFor="rewardTitle">Title Reward (Optional)</Label>
								<Input
									id="rewardTitle"
									value={formData.rewardTitle}
									onChange={(e) => setFormData({ ...formData, rewardTitle: e.target.value })}
									placeholder="e.g., Novice, Adept"
								/>
							</div>
						</div>

						{formData.level > 0 && ( // Show XP diff info if level is set
							<div className="text-sm text-muted-foreground">
								<p>
									Level {formData.level} will require {formData.xpRequired.toLocaleString()} XP.
								</p>
								{formData.level > 1 && levelsData?.levels && (
									<p className="mt-1">
										{(() => {
											const prevLevel = levelsData.levels.find(
												(l) => l.level === formData.level - 1
											);
											if (prevLevel) {
												const diff = formData.xpRequired - prevLevel.xpRequired;
												return `Difference from level ${prevLevel.level}: +${diff.toLocaleString()} XP`;
											}
											return null;
										})()}
									</p>
								)}
							</div>
						)}
					</TabsContent>

					<TabsContent value="visuals" className="grid gap-4 py-4">
						<TitleMediaInput
							iconUrl={formData.iconUrl || ''}
							onChange={(url) => setFormData({ ...formData, iconUrl: url })}
						/>

						<div className="grid gap-2">
							<Label>Color Theme</Label>
							<div className="flex gap-2">
								<Input
									type="color"
									value={formData.colorTheme || '#10b981'}
									onChange={(e) => setFormData({ ...formData, colorTheme: e.target.value })}
									className="w-12 h-10 p-1"
								/>
								<Input
									value={formData.colorTheme || ''}
									onChange={(e) => setFormData({ ...formData, colorTheme: e.target.value })}
									placeholder="#10b981"
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label>Rarity</Label>
								<Select
									value={formData.rarity || 'common'}
									onValueChange={(v) => setFormData({ ...formData, rarity: v as any })}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select rarity" />
									</SelectTrigger>
									<SelectContent>
										{['common', 'rare', 'epic', 'legendary', 'mythic'].map((r) => (
											<SelectItem key={r} value={r}>
												{r}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="grid gap-2">
								<Label>Animation Effect</Label>
								<Input
									placeholder="pulse | glow | chroma"
									value={formData.animationEffect || ''}
									onChange={(e) => setFormData({ ...formData, animationEffect: e.target.value })}
								/>
							</div>
						</div>

						<div className="grid gap-2">
							<Label>Frame URL</Label>
							<Input
								placeholder="https://.../frame.png"
								value={formData.frameUrl || ''}
								onChange={(e) => setFormData({ ...formData, frameUrl: e.target.value })}
							/>
						</div>
					</TabsContent>

					<TabsContent value="unlocks" className="grid gap-4 py-4">
						<UnlockMultiSelect
							label="Titles"
							endpoint="/api/admin/titles"
							selectedIds={formData.unlocks?.titles || []}
							onChange={(ids) =>
								setFormData({
									...formData,
									unlocks: { ...formData.unlocks, titles: ids }
								})
							}
						/>
						<UnlockMultiSelect
							label="Badges"
							endpoint="/api/admin/badges"
							selectedIds={formData.unlocks?.badges || []}
							onChange={(ids) =>
								setFormData({
									...formData,
									unlocks: { ...formData.unlocks, badges: ids }
								})
							}
						/>
						<UnlockMultiSelect
							label="Frames"
							endpoint="/api/admin/frames"
							selectedIds={formData.unlocks?.frames || []}
							onChange={(ids) =>
								setFormData({
									...formData,
									unlocks: { ...formData.unlocks, frames: ids }
								})
							}
						/>

						{/* Collapsible advanced JSON editor */}
						<div className="grid gap-2">
							<Label className="text-sm">Advanced JSON Editor</Label>
							<Textarea
								rows={6}
								value={JSON.stringify(formData.unlocks || {}, null, 2)}
								onChange={(e) => {
									try {
										const parsed = JSON.parse(e.target.value || '{}');
										setFormData({ ...formData, unlocks: parsed });
									} catch (_) {
										// ignore parse errors
									}
								}}
							/>
						</div>
					</TabsContent>
				</Tabs>

				<DialogFooter className="sticky bottom-0 bg-background py-4 border-t flex-wrap gap-2 sm:justify-end">
					<Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
						Cancel
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Saving...' : isEdit ? 'Update Level' : 'Create Level'}
					</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	</Dialog>
);

interface DeleteLevelConfirmationDialogProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	level: Pick<Level, 'level' | 'xpRequired' | 'description'> | null; // Only need a few fields for display
	onConfirmDelete: () => void;
	isDeleting?: boolean;
}

export const DeleteLevelConfirmationDialog: React.FC<DeleteLevelConfirmationDialogProps> = ({
	isOpen,
	setIsOpen,
	level,
	onConfirmDelete,
	isDeleting
}) => (
	<Dialog open={isOpen} onOpenChange={setIsOpen}>
		<DialogContent className="sm:max-w-[400px]">
			<DialogHeader>
				<DialogTitle>Delete Level</DialogTitle>
				<DialogDescription>
					Are you sure you want to delete this level? This action cannot be undone.
				</DialogDescription>
			</DialogHeader>

			{level && (
				<div className="py-4">
					<p className="font-medium">Level {level.level}</p>
					<p className="text-sm text-muted-foreground">
						Required XP: {level.xpRequired.toLocaleString()}
					</p>
					{level.description && <p className="text-sm mt-2">{level.description}</p>}
				</div>
			)}

			<DialogFooter className="flex-wrap gap-2 sm:justify-end">
				<Button variant="outline" onClick={() => setIsOpen(false)}>
					Cancel
				</Button>
				<Button variant="destructive" onClick={onConfirmDelete} disabled={isDeleting}>
					{isDeleting ? 'Deleting...' : 'Delete Level'}
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
);
