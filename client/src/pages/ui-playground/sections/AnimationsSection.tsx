import React from 'react';
import { PlaygroundSection } from '@/pages/dev';
import ButtonPulseDemo from '../animations/ButtonPulseDemo';
import CardFlipDemo from '../animations/CardFlipDemo';
import FadeInListDemo from '../animations/FadeInListDemo';

export const AnimationsSection: React.FC = () => (
  <PlaygroundSection id="animations" title="Animations">
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold mb-2">Button Pulse</h3>
        <ButtonPulseDemo />
      </div>
      <div>
        <h3 className="font-semibold mb-2">Card Flip</h3>
        <CardFlipDemo />
      </div>
      <div>
        <h3 className="font-semibold mb-2">Fade-in List</h3>
        <FadeInListDemo />
      </div>
    </div>
  </PlaygroundSection>
);

export default AnimationsSection; 