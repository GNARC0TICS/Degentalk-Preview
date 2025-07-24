import React from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@app/components/ui/dialog';
import { Button } from '@app/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	title?: string;
	description?: string;
	itemType?: 'post' | 'thread' | 'comment';
	isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
	isOpen,
	onOpenChange,
	onConfirm,
	title,
	description,
	itemType = 'post',
	isDeleting = false
}) => {
	const handleConfirm = () => {
		onConfirm();
		// Modal will be closed by parent component after successful deletion
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-red-500">
						<AlertTriangle className="h-5 w-5" />
						{title || `Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`}
					</DialogTitle>
					<DialogDescription className="text-zinc-400">
						{description ||
							`This action cannot be undone. The ${itemType} will be permanently deleted.`}
					</DialogDescription>
				</DialogHeader>

				<DialogFooter className="mt-6">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isDeleting}
						className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
					>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleConfirm}
						disabled={isDeleting}
						className="bg-red-600 hover:bg-red-700"
					>
						{isDeleting ? 'Deleting...' : 'Delete'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
