import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AdminToggleProps {
	label: string;
	description?: string | undefined;
	checked: boolean;
	onChange: (value: boolean) => void;
	className?: string | undefined;
	/** Disabled state */
	disabled?: boolean | undefined;
	/** Required field */
	required?: boolean | undefined;
	/** Error message */
	error?: string | undefined;
	/** Helper text */
	helperText?: string | undefined;
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
