import React from 'react';
import { Button } from '@/components/ui/button';

export const ButtonPulseDemo: React.FC = () => (
  <div className="space-y-4">
    <Button className="animate-[pulse-scale_var(--anim-slow)_ease-in-out_infinite]">Pulse</Button>
    <Button disabled className="animate-[pulse-scale_var(--anim-slow)_ease-in-out_infinite]">Disabled</Button>
    <Button variant="gradient" className="animate-[pulse-scale_var(--anim-slow)_ease-in-out_infinite]">Gradient Pulse</Button>
  </div>
);

export default ButtonPulseDemo; 