import React from 'react';
import { usePlaygroundControls } from '@/stores/usePlaygroundControls';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const ControlsDrawer: React.FC = () => {
	const { isDrawerOpen, closeDrawer, selectedComponentId, props, updateProp } =
		usePlaygroundControls();

	return (
		<div
			className={`fixed top-0 right-0 h-full w-[320px] bg-zinc-900 border-l border-zinc-800 shadow-lg z-40 transform transition-transform duration-300 ease-out ${
				isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
			}`}
		>
			<div className="flex items-center justify-between p-4 border-b border-zinc-800">
				<h3 className="text-sm font-semibold">Controls</h3>
				<button onClick={closeDrawer} className="text-zinc-400 hover:text-zinc-100">
					<X className="h-4 w-4" />
				</button>
			</div>

			<div className="p-4 space-y-4 overflow-y-auto h-full">
				{selectedComponentId ? (
					<>
						<p className="text-xs text-zinc-400 mb-2">Component: {selectedComponentId}</p>
						{Object.entries(props).map(([key, value]) => (
							<div key={key} className="space-y-1">
								<label className="text-xs text-zinc-300 capitalize" htmlFor={key}>
									{key}
								</label>
								<Input
									id={key}
									value={value as any}
									onChange={(e) => updateProp(key, e.target.value)}
									className="h-8 text-xs"
								/>
							</div>
						))}
						{Object.keys(props).length === 0 && (
							<p className="text-zinc-500 text-xs">This demo has no configurable props.</p>
						)}
					</>
				) : (
					<p className="text-zinc-500 text-xs">Select a demo card to adjust its props.</p>
				)}
				{selectedComponentId && (
					<Button size="sm" variant="outline" className="mt-4 w-full" onClick={closeDrawer}>
						Close
					</Button>
				)}
			</div>
		</div>
	);
};
