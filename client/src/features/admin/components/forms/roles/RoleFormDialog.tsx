import React from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

// Zod schema for role form (can be shared or defined here)
export const roleSchema = z.object({
	name: z.string().min(2, 'Name is required'),
	slug: z.string().min(2, 'Slug is required'),
	rank: z.number().int().min(0).default(0),
	isStaff: z.boolean().default(false),
	isModerator: z.boolean().default(false),
	isAdmin: z.boolean().default(false)
});

export type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleFormDialogProps {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	onSubmit: (values: RoleFormValues) => void;
	initialData?: RoleFormValues | null | undefined;
	isSubmitting?: boolean | undefined;
	form: UseFormReturn<RoleFormValues>; // Pass the form instance
	/** Optional dialog title override */
	title?: string;
	/** Optional dialog description override */
	description?: string;
	/** Show cancel button */
	showCancel?: boolean | undefined;
}

export function RoleFormDialog({
	isOpen,
	onOpenChange,
	onSubmit,
	initialData,
	isSubmitting,
	form
}: RoleFormDialogProps) {
	const dialogTitle = initialData ? 'Edit Role' : 'New Role';
	const dialogDescription = initialData ? 'Update role settings.' : 'Create a new role for users.';
	const submitButtonText = isSubmitting ? 'Saving...' : 'Save';

	// Reset form when initialData changes or dialog opens for new entry
	React.useEffect(() => {
		if (isOpen) {
			form.reset(
				initialData || {
					name: '',
					slug: '',
					rank: 0,
					isStaff: false,
					isModerator: false,
					isAdmin: false
				}
			);
		}
	}, [isOpen, initialData, form]);

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>{dialogTitle}</DialogTitle>
					<DialogDescription>{dialogDescription}</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Moderator" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="slug"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Slug</FormLabel>
									<FormControl>
										<Input placeholder="moderator" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="rank"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Rank</FormLabel>
									<FormControl>
										<Input
											type="number"
											min={0}
											{...field}
											onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="grid grid-cols-3 gap-4">
							<FormField
								control={form.control}
								name="isStaff"
								render={({ field }) => (
									<FormItem className="flex flex-col items-start space-y-1">
										<FormLabel>Staff</FormLabel>
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={field.onChange}
												aria-label="Is Staff"
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="isModerator"
								render={({ field }) => (
									<FormItem className="flex flex-col items-start space-y-1">
										<FormLabel>Moderator</FormLabel>
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={field.onChange}
												aria-label="Is Moderator"
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="isAdmin"
								render={({ field }) => (
									<FormItem className="flex flex-col items-start space-y-1">
										<FormLabel>Admin</FormLabel>
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={field.onChange}
												aria-label="Is Admin"
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</div>

						<DialogFooter className="flex-wrap gap-2 sm:justify-end">
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{submitButtonText}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
