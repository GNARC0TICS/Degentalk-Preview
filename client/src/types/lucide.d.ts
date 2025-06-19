import type { ComponentType } from 'react';

declare module 'lucide-react' {
	export interface LucideProps {
		size?: number | string;
		strokeWidth?: number | string;
		absoluteStrokeWidth?: boolean;
		color?: string;
		className?: string;
		[key: string]: unknown;
	}

	export type LucideIcon = ComponentType<LucideProps>;
}
