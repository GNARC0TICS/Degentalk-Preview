import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/utils/utils';

interface AdminToggleProps {
	label: string;
	description?: string;
	checked: boolean;
	onChange: (value: boolean) => void;
	className?: string;
	/** Disabled state */
	disabled?: boolean | undefined;
	/** Required field */
	required?: boolean | undefined;
	/** Error message */
	error?: string;
	/** Helper text */
	helperText?: string;
}

/**
 * AdminToggle
 *
 * Shared toggle component (label + description) built on shadcn/ui Switch.
 * Keeps admin forms consistent.
 */
export const AdminToggle: React.FC<AdminToggleProps> = ({
	label,
	description,
	checked,
	onChange,
	className
}) => {
	return (
		<div className={cn('flex items-start gap-3', className)}>
			<div className="space-y-0.5 flex-1">
				<Label className="text-sm font-medium">{label}</Label>
				{description && <p className="text-xs text-muted-foreground">{description}</p>}
			</div>
			<Switch checked={checked} onCheckedChange={onChange} />
		</div>
	);
};
