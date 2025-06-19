import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { DemoCard } from '@/pages/dev/DemoCard';

export const ButtonPulseDemo: React.FC = () => {
  const initial = useMemo(() => ({ label: 'Pulse', variant: 'default', disabled: false }), []);

  return (
    <DemoCard
      id="button-pulse"
      title="Button Pulse"
      initialProps={initial}
      render={({ label, variant, disabled }) => (
        <Button
          variant={variant as any}
          disabled={disabled}
          className="animate-[pulse-scale_var(--anim-slow)_ease-in-out_infinite]"
        >
          {label}
        </Button>
      )}
    />
  );
};

export default ButtonPulseDemo; 