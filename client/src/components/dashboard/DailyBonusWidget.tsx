import React, { useEffect } from 'react';
import { useDailyBonus } from '@app/hooks/useDailyBonus';
import { CheckCircle, Gift, Flame, Clock } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@app/components/ui/card';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Daily Login Bonus Widget
 * MVP engagement feature while missions are archived
 */
export default function DailyBonusWidget() {
  const { 
    streak, 
    streakLoading, 
    claimDailyBonus, 
    isClaimingBonus, 
    bonusData 
  } = useDailyBonus();

  // Auto-claim on mount if not claimed
  useEffect(() => {
    if (!bonusData && !isClaimingBonus && !streakLoading) {
      claimDailyBonus();
    }
  }, [bonusData, isClaimingBonus, streakLoading]);

  const hasClaimedToday = bonusData && !bonusData.awarded;

  return (
    <Card className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <Gift className="h-5 w-5 text-amber-500 mr-2" />
            Daily Login Bonus
          </div>
          {streak > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-orange-500" />
              {streak} day streak
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {hasClaimedToday ? (
            <motion.div
              key="claimed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-4"
            >
              <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
              <p className="text-zinc-400 mb-2">Daily bonus claimed!</p>
              <p className="text-sm text-zinc-500 flex items-center justify-center gap-1">
                <Clock className="h-4 w-4" />
                Come back tomorrow for more XP
              </p>
            </motion.div>
          ) : isClaimingBonus || streakLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="animate-pulse">
                <Gift className="h-12 w-12 text-amber-500/50 mx-auto mb-3" />
                <p className="text-zinc-500">Checking bonus...</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="claim"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <p className="text-sm text-zinc-400 mb-4">
                Login daily to earn XP and build your streak!
              </p>
              <Button 
                onClick={() => claimDailyBonus()}
                disabled={isClaimingBonus}
                className="w-full"
                variant="default"
              >
                <Gift className="h-4 w-4 mr-2" />
                Claim Daily Bonus
              </Button>
              {streak > 0 && (
                <p className="text-xs text-zinc-500 mt-3">
                  Keep your {streak} day streak going! 🔥
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}