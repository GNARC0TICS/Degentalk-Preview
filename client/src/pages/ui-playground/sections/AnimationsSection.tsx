import React from 'react';
import { PlaygroundSection } from '@/pages/dev';
import ButtonPulseDemo from '../animations/ButtonPulseDemo.tsx';
import CardFlipDemo from '../animations/CardFlipDemo.tsx';
import FadeInListDemo from '../animations/FadeInListDemo.tsx';

export const AnimationsSection: React.FC = () => (
	<PlaygroundSection id="animations" title="Animations">
		<div className="space-y-8">
			<ButtonPulseDemo />
			<CardFlipDemo />
			<FadeInListDemo />
		</div>
	</PlaygroundSection>
);

export default AnimationsSection;
