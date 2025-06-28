import React from 'react';
import { DevPlaygroundLayout, PlaygroundSection } from '@/pages/dev';
import NotFoundPage from '@/pages/not-found';
import * as Primitives from '@/layout/primitives';
import { ButtonsSection } from '@/pages/ui-playground/sections/ButtonsSection';
import { CardsSection } from '@/pages/ui-playground/sections/CardsSection';
import { ColorsSection } from '@/pages/ui-playground/sections/ColorsSection';
import { AvatarBadgesSection } from '@/pages/ui-playground/sections/AvatarBadgesSection';
import { AnimationsSection } from '@/pages/ui-playground/sections/AnimationsSection';
import { FontsSection } from '@/pages/ui-playground/sections/FontsSection';

// Auto-import UI components in client/src/components/ui
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const uiModules = import.meta.glob('@/components/ui/*.tsx', { eager: true });

const uiComponents: Record<string, React.FC<any>> = {};
for (const [path, mod] of Object.entries(uiModules)) {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const Comp = mod.default as React.FC<any> | undefined;
	if (Comp) {
		const name =
			path
				.split('/')
				.pop()
				?.replace(/\.tsx?$/, '') ?? path;
		uiComponents[name] = Comp;
	}
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
	constructor(props: { children: React.ReactNode }) {
		super(props);
		this.state = { hasError: false };
	}
	static getDerivedStateFromError() {
		return { hasError: true };
	}
	componentDidCatch() {}
	render() {
		if (this.state.hasError) {
			return (
				<div className="p-4 rounded border border-red-500/40 bg-red-950/20 text-red-400 text-sm">
					Failed to render (requires app context).
				</div>
			);
		}
		return this.props.children;
	}
}

const ComponentCard: React.FC<{ name: string; Component: React.FC<any> }> = ({
	name,
	Component
}) => (
	<div className="space-y-2">
		<h4 className="text-sm font-mono text-emerald-400/70">{name}</h4>
		<ErrorBoundary>
			<div className="p-4 rounded border border-zinc-800 bg-zinc-900/40">
				<Component />
			</div>
		</ErrorBoundary>
	</div>
);

const UIPlaygroundPage: React.FC = () => {
	if (process.env.NODE_ENV === 'production') return <NotFoundPage />;

	return (
		<DevPlaygroundLayout>
			{/* <PlaygroundSection id="primitives" title="Primitives">
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{Object.entries(Primitives).map(([name, Comp]) => (
						<ComponentCard key={name} name={name} Component={Comp as any} />
					))}
				</div>
			</PlaygroundSection> */}
			<div>Primitives section temporarily disabled for debugging.</div>

			<PlaygroundSection id="ui" title="UI Components">
				{/* <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{Object.entries(uiComponents).map(([name, Comp]) => (
						<ComponentCard key={name} name={name} Component={Comp as any} />
					))}
				</div> */}
				<div>UI Components temporarily disabled for debugging.</div>
			</PlaygroundSection>

			<FontsSection />
			<ButtonsSection />
			<CardsSection />
			<ColorsSection />
			<AvatarBadgesSection />
			{/* <AnimationsSection /> */}
		</DevPlaygroundLayout>
	);
};

export default UIPlaygroundPage;
