import React from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AdminUser, UserFormData } from '@/types/admin.types';

interface UserFormDialogProps {
	isOpen: boolean;
	onClose: () => void;
	user?: AdminUser;
	onSubmit: (data: UserFormData) => void;
}

const UserFormDialog: React.FC<UserFormDialogProps> = ({ isOpen, onClose, user, onSubmit }) => {
	// Form state and handlers will go here
	// For example, using react-hook-form

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Collect form data
		const formData: UserFormData = {
			username: user?.username || '',
			email: user?.email || '',
			role: user?.role || 'user',
			status: user?.status || 'active',
			permissions: user?.permissions || []
		};
		onSubmit(formData);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
					<DialogDescription>
						{user ? 'Update the details of this user.' : 'Fill in the form to create a new user.'}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4 py-4">
					<div>
						<Label htmlFor="username">Username</Label>
						<Input id="username" defaultValue={user?.username || ''} />
					</div>
					<div>
						<Label htmlFor="email">Email</Label>
						<Input id="email" type="email" defaultValue={user?.email || ''} />
					</div>
					{/* Add more fields for role, password (for new user), etc. */}
					<DialogFooter className="flex-wrap gap-2 sm:justify-end">
						{' '}
						{/* Ensure consistent justify-end and add wrap/gap */}
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit">{user ? 'Save Changes' : 'Create User'}</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default UserFormDialog;
