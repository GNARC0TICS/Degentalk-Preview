import React from 'react';
import { PlaygroundSection } from '@app/pages/dev';

export const ColorsSection: React.FC = () => (
	<PlaygroundSection id="colors" title="Brand Colors">
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
			{/* Primary */}
			<div className="space-y-2">
				<h3 className="font-semibold mb-3">Primary</h3>
				<div className="space-y-2">
					<ColorSwatch color="bg-emerald-500" name="Emerald" hex="#10B981" />
					<ColorSwatch color="bg-cyan-500" name="Cyan" hex="#06B6D4" />
				</div>
			</div>

			{/* Status */}
			<div className="space-y-2">
				<h3 className="font-semibold mb-3">Status</h3>
				<div className="space-y-2">
					<ColorSwatch color="bg-green-500" name="Success" hex="#22C55E" />
					<ColorSwatch color="bg-amber-500" name="Warning" hex="#F59E0B" />
					<ColorSwatch color="bg-red-500" name="Error" hex="#EF4444" />
				</div>
			</div>

			{/* XP / Rewards */}
			<div className="space-y-2">
				<h3 className="font-semibold mb-3">XP / Rewards</h3>
				<div className="space-y-2">
					<ColorSwatch color="bg-purple-500" name="XP Purple" hex="#8B5CF6" />
					<ColorSwatch color="bg-yellow-400" name="Gold" hex="#FACC15" />
				</div>
			</div>

			{/* Neutrals */}
			<div className="space-y-2">
				<h3 className="font-semibold mb-3">Neutrals</h3>
				<div className="space-y-2">
					<ColorSwatch color="bg-black border border-zinc-800" name="Black" hex="#0B0B0B" />
					<ColorSwatch color="bg-zinc-900 border border-zinc-800" name="Zinc 900" hex="#121212" />
					<ColorSwatch color="bg-zinc-800" name="Zinc 800" hex="#1E1E1E" />
				</div>
			</div>
		</div>
	</PlaygroundSection>
);

const ColorSwatch: React.FC<{ color: string; name: string; hex: string }> = ({
	color,
	name,
	hex
}) => (
	<div className="flex items-center gap-3">
		<div className={`w-12 h-12 rounded ${color}`} />
		<div>
			<p className="font-medium">{name}</p>
			<p className="text-xs text-zinc-400">{hex}</p>
		</div>
	</div>
);

export default ColorsSection;
