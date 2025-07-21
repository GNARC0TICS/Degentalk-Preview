import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/utils/api-request';
import { useAuth } from '@/hooks/use-auth';
import { motion, AnimatePresence } from 'framer-motion';

// UI Components
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Icons
import { Smile, Lock, Sparkles, Star, Zap, Trophy, Diamond } from 'lucide-react';

interface CustomEmoji {
  id: string;
  code: string;
  name: string;
  imageUrl: string;
  category: 'standard' | 'rare' | 'epic' | 'legendary' | 'vip';
  unlockType: 'level' | 'purchase' | 'achievement' | 'ownership';
  requiredLevel?: number;
  requiredAchievement?: string;
  isOwned: boolean;
  isUnlocked: boolean;
}

interface EmojiCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  { id: 'all', name: 'All', icon: <Smile className="h-4 w-4" />, color: 'text-foreground' },
  { id: 'standard', name: 'Standard', icon: <Star className="h-4 w-4" />, color: 'text-gray-400' },
  { id: 'rare', name: 'Rare', icon: <Zap className="h-4 w-4" />, color: 'text-blue-400' },
  { id: 'epic', name: 'Epic', icon: <Trophy className="h-4 w-4" />, color: 'text-purple-400' },
  { id: 'legendary', name: 'Legendary', icon: <Diamond className="h-4 w-4" />, color: 'text-yellow-400' },
  { id: 'vip', name: 'VIP', icon: <Sparkles className="h-4 w-4" />, color: 'text-orange-400' },
];

// Default emoji set for fallback
const DEFAULT_EMOJIS = ['😀', '😎', '🚀', '💎', '🔥', '👍', '🎉', '💯', '🤝', '❤️'];

interface EmojiPanelProps {
  onEmojiSelect: (emoji: string) => void;
  onClose?: () => void;
}

export function EmojiPanel({ onEmojiSelect, onClose }: EmojiPanelProps) {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch custom emojis with ownership data
  const { data: emojis = [], isLoading } = useQuery<unknown>({
    queryKey: ['emojis', 'owned', user?.id],
    queryFn: async () => {
      const response = await apiRequest<CustomEmoji[]>({
        url: '/api/chat/emojis/available',
        method: 'GET'
      });
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter emojis by category
  const filteredEmojis = selectedCategory === 'all' 
    ? emojis 
    : emojis.filter(emoji => emoji.category === selectedCategory);

  // Group emojis by unlock status
  const { unlocked, locked } = filteredEmojis.reduce(
    (acc, emoji) => {
      if (emoji.isUnlocked || emoji.isOwned) {
        acc.unlocked.push(emoji);
      } else {
        acc.locked.push(emoji);
      }
      return acc;
    },
    { unlocked: [] as CustomEmoji[], locked: [] as CustomEmoji[] }
  );

  const handleEmojiClick = (emoji: CustomEmoji | string) => {
    if (typeof emoji === 'string') {
      onEmojiSelect(emoji);
    } else if (emoji.isUnlocked || emoji.isOwned) {
      onEmojiSelect(emoji.code);
    }
  };

  const getUnlockDescription = (emoji: CustomEmoji) => {
    switch (emoji.unlockType) {
      case 'level':
        return `Reach Level ${emoji.requiredLevel}`;
      case 'purchase':
        return 'Available in Shop';
      case 'achievement':
        return `Unlock "${emoji.requiredAchievement}" achievement`;
      case 'ownership':
        return 'Purchase from Shop';
      default:
        return 'Locked';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="bg-popover border rounded-lg shadow-lg p-3 w-80"
    >
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid grid-cols-3 gap-1 h-auto p-1 mb-3">
          {EMOJI_CATEGORIES.slice(0, 3).map(category => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="data-[state=active]:bg-primary/20 px-2 py-1"
            >
              <span className={category.color}>{category.icon}</span>
              <span className="ml-1 text-xs">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        <div className="flex gap-1 mb-3">
          {EMOJI_CATEGORIES.slice(3).map(category => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="data-[state=active]:bg-primary/20 px-2 py-1 flex-1"
            >
              <span className={category.color}>{category.icon}</span>
              <span className="ml-1 text-xs">{category.name}</span>
            </TabsTrigger>
          ))}
        </div>

        <ScrollArea className="h-64">
          {isLoading ? (
            <div className="grid grid-cols-8 gap-1 p-2">
              {[...Array(24)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-8 rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Default Emojis */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">Default</h4>
                <div className="grid grid-cols-8 gap-1">
                  {DEFAULT_EMOJIS.map(emoji => (
                    <TooltipProvider key={emoji}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-accent"
                            onClick={() => handleEmojiClick(emoji)}
                          >
                            {emoji}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Click to use</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>

              {/* Unlocked Custom Emojis */}
              {unlocked.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    Available
                    {user && (
                      <Badge variant="secondary" className="text-xs">
                        {unlocked.filter(e => e.isOwned).length} owned
                      </Badge>
                    )}
                  </h4>
                  <div className="grid grid-cols-8 gap-1">
                    {unlocked.map(emoji => (
                      <TooltipProvider key={emoji.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-8 w-8 p-0 hover:bg-accent relative ${
                                emoji.isOwned ? 'ring-1 ring-primary ring-offset-1' : ''
                              }`}
                              onClick={() => handleEmojiClick(emoji)}
                            >
                              <img 
                                src={emoji.imageUrl} 
                                alt={emoji.name}
                                className="h-6 w-6"
                              />
                              {emoji.isOwned && (
                                <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-center">
                              <p className="font-medium">{emoji.name}</p>
                              <p className="text-xs text-muted-foreground">{emoji.code}</p>
                              {emoji.isOwned && (
                                <Badge variant="default" className="text-xs mt-1">
                                  Owned
                                </Badge>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              )}

              {/* Locked Custom Emojis */}
              {locked.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    Locked
                    <Lock className="h-3 w-3" />
                  </h4>
                  <div className="grid grid-cols-8 gap-1">
                    {locked.map(emoji => (
                      <TooltipProvider key={emoji.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="relative">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 opacity-50 grayscale cursor-not-allowed"
                                disabled
                              >
                                <img 
                                  src={emoji.imageUrl} 
                                  alt={emoji.name}
                                  className="h-6 w-6"
                                />
                              </Button>
                              <Lock className="absolute top-0 right-0 h-3 w-3 text-muted-foreground" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-center">
                              <p className="font-medium">{emoji.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {getUnlockDescription(emoji)}
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </Tabs>

      {onClose && (
        <div className="mt-3 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      )}
    </motion.div>
  );
}