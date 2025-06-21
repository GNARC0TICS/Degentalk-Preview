import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, TrendingUp, Sparkles } from 'lucide-react';
import { getPathDefinition, getDominantPath, availablePaths } from '@shared/path-config';

interface PathProgressProps {
	userId?: number;
	variant?: 'compact' | 'standard' | 'detailed';
	className?: string;
}

// ... existing code ... (omitted for brevity)
