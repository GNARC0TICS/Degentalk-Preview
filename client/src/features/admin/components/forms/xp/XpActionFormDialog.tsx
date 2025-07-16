import React from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { XpAction } from './services/xpActionsService';

export type XpActionFormData = Omit<XpAction, 'action'> & { action?: string };

interface XpActionFormDialogProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	isEdit: boolean;
	formData: XpActionFormData;
	setFormData: (formData: XpActionFormData) => void;
	handleSubmit: (e: React.FormEvent) => void;
	isSubmitting: boolean;
}

export function XpActionFormDialog({
	isOpen,
	setIsOpen,
	isEdit,
	formData,
	setFormData,
	handleSubmit,
	isSubmitting
}: XpActionFormDialogProps) {
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { id, value, type } = e.target;
		const isNumber = type === 'number';
		setFormData({ ...formData, [id]: isNumber ? Number(value) : value });
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="sm:max-w-[500px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>{isEdit ? 'Edit XP Action' : 'Create New XP Action'}</DialogTitle>
						<DialogDescription>
							{isEdit
								? 'Update the details for this XP action.'
								: 'Define a new action that can grant XP to users.'}
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="action">Action Key</Label>
							<Input
								id="action"
								value={formData.action || ''}
								onChange={handleInputChange}
								required
								disabled={isEdit}
								placeholder="e.g., post_created"
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={formData.description}
								onChange={handleInputChange}
								placeholder="Describe what this action is for."
								required
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="baseValue">Base XP Value</Label>
								<Input
									id="baseValue"
									type="number"
									value={formData.baseValue}
									onChange={handleInputChange}
									required
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="maxPerDay">Max Per Day (Optional)</Label>
								<Input
									id="maxPerDay"
									type="number"
									value={formData.maxPerDay || ''}
									onChange={handleInputChange}
									placeholder="e.g., 10"
								/>
							</div>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="cooldownSec">Cooldown (Seconds, Optional)</Label>
							<Input
								id="cooldownSec"
								type="number"
								value={formData.cooldownSec || ''}
								onChange={handleInputChange}
								placeholder="e.g., 3600 for 1 hour"
							/>
						</div>

						<div className="flex items-center space-x-2">
							<Switch
								id="enabled"
								checked={formData.enabled}
								onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
							/>
							<Label htmlFor="enabled">Enabled</Label>
						</div>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? 'Saving...' : isEdit ? 'Update Action' : 'Create Action'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
