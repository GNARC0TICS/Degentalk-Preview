import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';

interface Role {
	id?: string;
	name: string;
	slug: string;
	rank: number;
	description?: string;
	color?: string;
	permissions?: string[];
}

interface RoleFormProps {
	role?: Role;
	onSubmit: (role: Partial<Role>) => void;
	onCancel: () => void;
	isLoading?: boolean;
}

export function RoleForm({ role, onSubmit, onCancel, isLoading }: RoleFormProps) {
	const [formData, setFormData] = useState<Partial<Role>>({
		name: role?.name || '',
		slug: role?.slug || '',
		rank: role?.rank || 0,
		description: role?.description || '',
		color: role?.color || '#64748b',
		permissions: role?.permissions || []
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData);
	};

	const handleInputChange = (field: keyof Role, value: any) => {
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
					<Label htmlFor="color">Color</Label>
					<Input
						id="color"
						type="color"
						value={formData.color}
						onChange={(e) => handleInputChange('color', e.target.value)}
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
