import React from 'react';
import { Badge } from '@/components/ui/badge';

export const LevelBadge: React.FC<{ level: number; className?: string }> = ({ level, className }) => (
  <Badge variant="outline" className={className}>
    LVL {level}
  </Badge>
); 