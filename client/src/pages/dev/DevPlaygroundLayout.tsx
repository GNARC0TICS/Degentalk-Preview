import React, { useState } from 'react';
import { cn } from '@/utils/utils';
import { ControlsDrawer } from './ControlsDrawer.tsx';
import { usePlaygroundControls } from '@/stores/usePlaygroundControls';

interface DevPlaygroundLayoutProps {
	children: React.ReactNode;
}

const VIEWPORTS = [
	{ label: '320', width: 320 },
	{ label: '768', width: 768 },
	{ label: '1024', width: 1024 },
	{ label: '1440', width: 1440 },
	{ label: 'Full', width: '100%' }
] as const;

export const DevPlaygroundLayout: React.FC<DevPlaygroundLayoutProps> = ({ children }) => {
	const [viewport, setViewport] = useState<string | number>('100%');
	const containerStyle: React.CSSProperties = {
		width: typeof viewport === 'number' ? `${viewport}px` : '100%'
	};

	return (
		<div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100">
			{/* sidebar */}
			<aside className="hidden md:block w-56 bg-zinc-900/60 border-r border-zinc-800 overflow-y-auto">
				{/* TOC links generated via JS – anchor <a href="#id"> */}
				<nav className="p-4 space-y-2 text-sm">
					{React.Children.map(children, (child: any) => {
						if (!React.isValidElement(child)) return null;
						const { title, id } = child.props;
						return (
							<a key={id} href={`#${id}`} className="block px-3 py-2 rounded hover:bg-zinc-800">
								{title}
							</a>
						);
					})}
				</nav>
			</aside>

			<div className="flex-1 flex flex-col overflow-hidden">
				{/* top bar */}
				<header className="sticky top-0 z-20 bg-zinc-900/70 backdrop-blur border-b border-zinc-800">
					<div className="flex items-center justify-between px-4 h-12">
						<h1 className="font-semibold text-sm">UI Playground</h1>
						<div className="flex gap-2 text-xs items-center">
							{VIEWPORTS.map((v) => (
								<button
									key={v.label}
									onClick={() => setViewport(v.width)}
									className={cn(
										'px-2 py-1 rounded border border-zinc-700',
										viewport === v.width ? 'bg-emerald-600 text-white' : 'hover:bg-zinc-800'
									)}
								>
									{v.label}
								</button>
							))}
							{/* Controls toggle */}
							<button
								onClick={() => usePlaygroundControls.getState().toggleDrawer()}
								className="ml-4 px-2 py-1 rounded border border-zinc-700 hover:bg-zinc-800"
							>
								Controls
							</button>
						</div>
					</div>
				</header>

				{/* preview scroll area */}
				<main className="flex-1 overflow-y-auto p-6">
					<div style={containerStyle} className="mx-auto space-y-16">
						{children}
					</div>
				</main>
			</div>
			<ControlsDrawer />
		</div>
	);
};

interface PlaygroundSectionProps {
	title: string;
	id: string;
	children: React.ReactNode;
}

export const PlaygroundSection: React.FC<PlaygroundSectionProps> = ({ title, id, children }) => {
	return (
		<section id={id} title={title} className="space-y-6">
			<h2 className="text-xl font-bold border-b border-zinc-700 pb-1">{title}</h2>
			{children}
		</section>
	);
};
