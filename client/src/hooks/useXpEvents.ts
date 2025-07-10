import { useEffect } from 'react';
import { useToast } from './use-toast';
import { useLevelUp } from '@/contexts/LevelUpContext';

// Type for XP gain response
export interface XpGainResponse {
	xpGained?: boolean;
	xpAmount?: number;
	xpAction?: string;
	xpDescription?: string;
	levelUp?: boolean;
	newLevel?: number;
	levelTitle?: string;
	rewards?: Array<{
		type: 'badge' | 'title' | 'feature' | 'dgt';
		name: string;
		description?: string;
	}>;
}

export function useXpEvents() {
  const { toast } = useToast();
  const { showLevelUp } = useLevelUp();

  useEffect(() => {
    const handleXpGain = (event: CustomEvent<XpGainResponse>) => {
      const { xpAmount, xpAction, xpDescription, levelUp, newLevel } = event.detail;

      if (xpAmount && xpAction && xpDescription) {
        toast({
          title: `+${xpAmount} XP`,
          description: xpDescription,
        });
      }
    };

    const handleLevelUp = (
      event: CustomEvent<{
        level: number;
        title?: string;
        rewards?: any[];
      }>
    ) => {
      const { level, title, rewards } = event.detail;
      showLevelUp(level, title, rewards);
    };

    window.addEventListener('xp-gained', handleXpGain as EventListener);
    window.addEventListener('level-up', handleLevelUp as EventListener);

    return () => {
      window.removeEventListener('xp-gained', handleXpGain as EventListener);
      window.removeEventListener('level-up', handleLevelUp as EventListener);
    };
  }, [toast, showLevelUp]);
}
