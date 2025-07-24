import React from 'react';
import { usePlaygroundControls } from '@app/stores/usePlaygroundControls';

interface DemoCardProps<T extends Record<string, any>> {
	id: string;
	title?: string;
	initialProps: T;
	render: (props: T) => React.ReactNode;
	className?: string;
}

export function DemoCard<T extends Record<string, any>>({
	id,
	title,
	initialProps,
	render,
	className = ''
}: DemoCardProps<T>) {
	const { selectedComponentId, props, selectComponent } = usePlaygroundControls((s) => ({
		selectedComponentId: s.selectedComponentId,
		props: s.props as T,
		selectComponent: s.selectComponent
	}));

	const isActive = selectedComponentId === id;
	const effectiveProps = (isActive ? { ...initialProps, ...props } : initialProps) as T;

	return (
		<div
			onClick={() => selectComponent(id, initialProps)}
			className={`relative border rounded-lg p-4 hover:border-emerald-500 transition cursor-pointer ${className}`}
		>
			{title && <h4 className="text-sm font-semibold mb-2">{title}</h4>}
			{render(effectiveProps)}
			{isActive && <span className="absolute top-2 right-2 text-emerald-400 text-xs">Active</span>}
		</div>
	);
}
