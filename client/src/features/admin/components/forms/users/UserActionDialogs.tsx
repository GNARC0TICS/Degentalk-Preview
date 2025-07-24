import React from 'react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@app/components/ui/alert-dialog';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter
} from '@app/components/ui/dialog';
import { Button } from '@app/components/ui/button';
import { Label } from '@app/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@app/components/ui/select'; // Assuming Select is available
import type { UserId } from '@shared/types/ids';

// Define a basic User type for props, replace with actual User type
interface User {
	id: UserId;
	username: string;
	role?: string; // Example, adjust as needed
}

interface BanUserDialogProps {
	isOpen: boolean;
	onClose: () => void;
	user: User | null;
	onConfirm: (userId: UserId) => void;
}

export const BanUserDialog: React.FC<BanUserDialogProps> = ({
	isOpen,
	onClose,
	user,
	onConfirm
}) => {
	if (!user) return null;
	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Ban User: {user.username}</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to ban this user? They will lose access to their account.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter className="flex-wrap gap-2 sm:justify-end">
					<AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={() => onConfirm(user.id)}>Ban User</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

interface UnbanUserDialogProps {
	isOpen: boolean;
	onClose: () => void;
	user: User | null;
	onConfirm: (userId: UserId) => void;
}

export const UnbanUserDialog: React.FC<UnbanUserDialogProps> = ({
	isOpen,
	onClose,
	user,
	onConfirm
}) => {
	if (!user) return null;
	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Unban User: {user.username}</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to unban this user? They will regain access to their account.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter className="flex-wrap gap-2 sm:justify-end">
					<AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={() => onConfirm(user.id)}>Unban User</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

interface DeleteUserDialogProps {
	isOpen: boolean;
	onClose: () => void;
	user: User | null;
	onConfirm: (userId: UserId) => void;
}

export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
	isOpen,
	onClose,
	user,
	onConfirm
}) => {
	if (!user) return null;
	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete User: {user.username}</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to permanently delete this user? This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter className="flex-wrap gap-2 sm:justify-end">
					<AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => onConfirm(user.id)}
						className="bg-red-600 hover:bg-red-700"
					>
						Delete User
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

interface ChangeUserRoleDialogProps {
	isOpen: boolean;
	onClose: () => void;
	user: User | null;
	roles: string[]; // Example: ['admin', 'moderator', 'user']
	onConfirm: (userId: UserId, newRole: string) => void;
}

export const ChangeUserRoleDialog: React.FC<ChangeUserRoleDialogProps> = ({
	isOpen,
	onClose,
	user,
	roles,
	onConfirm
}) => {
	const [selectedRole, setSelectedRole] = React.useState(user?.role || '');

	React.useEffect(() => {
		if (user) {
			setSelectedRole(user.role || '');
		}
	}, [user]);

	if (!user) return null;

	const handleSubmit = () => {
		if (selectedRole) {
			onConfirm(user.id, selectedRole);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Change Role for {user.username}</DialogTitle>
					<DialogDescription>Select a new role for this user.</DialogDescription>
				</DialogHeader>
				<div className="py-4">
					<Label htmlFor="role-select">Role</Label>
					<Select value={selectedRole} onValueChange={setSelectedRole}>
						<SelectTrigger id="role-select">
							<SelectValue placeholder="Select a role" />
						</SelectTrigger>
						<SelectContent>
							{roles.map((role) => (
								<SelectItem key={role} value={role}>
									{role.charAt(0).toUpperCase() + role.slice(1)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<DialogFooter className="flex-wrap gap-2 sm:justify-end">
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleSubmit}
						disabled={!selectedRole || selectedRole === user.role}
					>
						Save Changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
