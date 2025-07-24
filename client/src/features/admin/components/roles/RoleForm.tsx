import { useState } from 'react';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { Textarea } from '@app/components/ui/textarea';
import {
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@app/components/ui/dialog';
import type { Role } from '@shared/types/entities/role.types';

interface RoleFormProps {
	role?: Role | undefined;
	onSubmit: (role: Partial<Role>) => void;
	onCancel: () => void;
	isLoading?: boolean | undefined;
}

export function RoleForm({ role, onSubmit, onCancel, isLoading }: RoleFormProps) {
	const [formData, setFormData] = useState<Partial<Role>>({
		name: role?.name || '',
		slug: role?.slug || '',
		rank: role?.rank || 0,
		description: role?.description || '',
		textColor: role?.textColor || '#64748b',
		backgroundColor: role?.backgroundColor || undefined,
		permissions: Array.isArray(role?.permissions) ? role.permissions : []
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData);
	};

	const handleInputChange = (field: keyof Role, value: string | number | boolean) => {
		setFormData((prev) => ({
			...prev,
			[field]: value
		}));
	};

	return (
		<DialogContent className="sm:max-w-md">
			<DialogHeader>
				<DialogTitle>{role ? 'Edit Role' : 'Create Role'}</DialogTitle>
				<DialogDescription>
					{role ? 'Modify the role details below.' : 'Create a new role with the details below.'}
				</DialogDescription>
			</DialogHeader>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="name">Name</Label>
					<Input
						id="name"
						value={formData.name}
						onChange={(e) => handleInputChange('name', e.target.value)}
						placeholder="Role name"
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="slug">Slug</Label>
					<Input
						id="slug"
						value={formData.slug}
						onChange={(e) => handleInputChange('slug', e.target.value)}
						placeholder="role-slug"
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="rank">Rank</Label>
					<Input
						id="rank"
						type="number"
						value={formData.rank}
						onChange={(e) => handleInputChange('rank', parseInt(e.target.value) || 0)}
						placeholder="0"
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="description">Description</Label>
					<Textarea
						id="description"
						value={formData.description}
						onChange={(e) => handleInputChange('description', e.target.value)}
						placeholder="Role description"
						rows={3}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="textColor">Text Color</Label>
					<Input
						id="textColor"
						type="color"
						value={formData.textColor || '#64748b'}
						onChange={(e) => handleInputChange('textColor', e.target.value)}
					/>
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
						Cancel
					</Button>
					<Button type="submit" disabled={isLoading}>
						{isLoading ? 'Saving...' : role ? 'Update Role' : 'Create Role'}
					</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	);
}
