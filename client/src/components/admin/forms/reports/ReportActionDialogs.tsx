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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';

interface ReportActionDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	actionType: 'resolve' | 'dismiss';
	notes: string;
	setNotes: (notes: string) => void;
	onSubmit: () => void;
	isSubmitting?: boolean;
}

export const ReportActionDialog: React.FC<ReportActionDialogProps> = ({
	isOpen,
	onOpenChange,
	actionType,
	notes,
	setNotes,
	onSubmit,
	isSubmitting
}) => {
	const title = actionType === 'resolve' ? 'Resolve Report' : 'Dismiss Report';
	const submitButtonText = actionType === 'resolve' ? 'Resolve Report' : 'Dismiss Report';

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>
						Add notes to explain your decision. This will be logged for audit purposes.
					</DialogDescription>
				</DialogHeader>
				<div className="mt-4 space-y-4">
					<div className="space-y-2">
						<Label htmlFor="actionNotes">Notes</Label>
						<Textarea
							id="actionNotes"
							placeholder="Enter your notes here..."
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							className="h-24"
						/>
					</div>
				</div>
				<DialogFooter className="mt-4 flex-wrap gap-2 sm:justify-end">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						variant={actionType === 'resolve' ? 'default' : 'secondary'}
						onClick={onSubmit}
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Processing...' : submitButtonText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

interface BanUserDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	reportedUsername?: string;
	banReason: string;
	setBanReason: (reason: string) => void;
	banDuration: string;
	setBanDuration: (duration: string) => void;
	onSubmit: () => void;
	isSubmitting?: boolean;
}

export const BanUserDialog: React.FC<BanUserDialogProps> = ({
	isOpen,
	onOpenChange,
	reportedUsername,
	banReason,
	setBanReason,
	banDuration,
	setBanDuration,
	onSubmit,
	isSubmitting
}) => {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Ban User</DialogTitle>
					<DialogDescription>
						This will ban {reportedUsername || 'the user'} from the platform. Specify the reason and
						duration.
					</DialogDescription>
				</DialogHeader>
				<div className="mt-4 space-y-4">
					<div className="space-y-2">
						<Label htmlFor="banReason">Reason for Ban</Label>
						<Textarea
							id="banReason"
							placeholder="Enter the reason for banning this user..."
							value={banReason}
							onChange={(e) => setBanReason(e.target.value)}
							className="h-24"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="banDuration">Ban Duration</Label>
						<Select value={banDuration} onValueChange={setBanDuration}>
							<SelectTrigger id="banDuration">
								<SelectValue placeholder="Select duration" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="1d">1 Day</SelectItem>
								<SelectItem value="3d">3 Days</SelectItem>
								<SelectItem value="7d">7 Days</SelectItem>
								<SelectItem value="30d">30 Days</SelectItem>
								<SelectItem value="permanent">Permanent</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<DialogFooter className="mt-4 flex-wrap gap-2 sm:justify-end">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button variant="destructive" onClick={onSubmit} disabled={isSubmitting || !banReason}>
						{isSubmitting ? 'Banning User...' : 'Ban User'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
