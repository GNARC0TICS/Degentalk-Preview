import React from 'react';
import { PlaygroundSection } from '@app/pages/dev';
import { Button } from '@app/components/ui/button';
import { Rocket, Trophy, MessageSquare, Zap, Lock, DollarSign, Wallet } from 'lucide-react';

export const ButtonsSection: React.FC = () => (
	<PlaygroundSection id="buttons" title="Buttons">
		<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
			{/* Primary Buttons */}
			<div className="space-y-4">
				<h3 className="font-semibold">Primary</h3>
				<Button variant="default">Default</Button>
				<Button variant="default" size="lg">
					Large
				</Button>
				<Button variant="default" size="sm">
					Small
				</Button>
				<Button variant="default" disabled>
					Disabled
				</Button>
				<Button variant="default" isLoading>
					Loading
				</Button>
			</div>

			{/* Gradient Buttons */}
			<div className="space-y-4">
				<h3 className="font-semibold">Gradient</h3>
				<Button variant="gradient">Gradient</Button>
				<Button variant="gradient" leftIcon={<Rocket className="h-4 w-4" />}>
					To the Moon
				</Button>
				<Button variant="gradient-outline">Gradient Outline</Button>
				<Button variant="gradient" animation="pulse">
					Pulsing
				</Button>
			</div>

			{/* Destructive Buttons */}
			<div className="space-y-4">
				<h3 className="font-semibold">Destructive</h3>
				<Button variant="destructive">Delete</Button>
				<Button variant="destructive" leftIcon={<Lock className="h-4 w-4" />}>
					Lock Account
				</Button>
				<Button variant="destructive" size="sm">
					Remove
				</Button>
			</div>

			{/* Ghost */}
			<div className="space-y-4">
				<h3 className="font-semibold">Ghost</h3>
				<Button variant="ghost">Ghost</Button>
				<Button variant="ghost" leftIcon={<MessageSquare className="h-4 w-4" />}>
					Reply
				</Button>
				<Button variant="ghost" size="icon">
					<Trophy className="h-4 w-4" />
				</Button>
			</div>

			{/* Glow */}
			<div className="space-y-4">
				<h3 className="font-semibold">Glow</h3>
				<Button variant="glow">Glow</Button>
				<Button variant="glow" animation="glow">
					Animated
				</Button>
				<Button variant="glow" leftIcon={<Zap className="h-4 w-4" />}>
					Power Up
				</Button>
			</div>

			{/* Special */}
			<div className="space-y-4">
				<h3 className="font-semibold">Special</h3>
				<Button variant="wallet" leftIcon={<Wallet className="h-4 w-4" />}>
					Connect Wallet
				</Button>
				<Button variant="xp" leftIcon={<Trophy className="h-4 w-4" />}>
					Claim XP
				</Button>
				<Button variant="outline" rightIcon={<DollarSign className="h-4 w-4" />}>
					Buy DGT
				</Button>
			</div>
		</div>
	</PlaygroundSection>
);

export default ButtonsSection;
