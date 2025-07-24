import React from 'react';
import { PlaygroundSection } from '@app/pages/dev';
import ButtonPulseDemo from '../animations/ButtonPulseDemo';
import CardFlipDemo from '../animations/CardFlipDemo';
import FadeInListDemo from '../animations/FadeInListDemo';

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
